#!/usr/bin/env python3
"""RPCA-based motion/static segmentation for cine MRI sequences.

This script decomposes a cine MRI sequence D into:
    D = L + S
where L is low-rank (mostly static structure) and S is sparse (motion/outliers).

Outputs include:
  - low-rank component (L)
  - sparse component (S)
  - binary motion mask per frame derived from |S|
  - per-frame motion scores and binary moving/static labels
"""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import Optional, Tuple

import numpy as np

try:
    import scipy.ndimage as ndi

    HAS_SCIPY = True
except Exception:
    HAS_SCIPY = False


def soft_threshold(x: np.ndarray, tau: float) -> np.ndarray:
    """Element-wise soft-threshold."""
    return np.sign(x) * np.maximum(np.abs(x) - tau, 0.0)


def singular_value_threshold(x: np.ndarray, tau: float) -> np.ndarray:
    """Apply soft-thresholding to singular values."""
    u, s, vt = np.linalg.svd(x, full_matrices=False)
    s_shrunk = np.maximum(s - tau, 0.0)
    if np.count_nonzero(s_shrunk) == 0:
        return np.zeros_like(x)
    return (u * s_shrunk) @ vt


def rpca_ialm(
    d: np.ndarray,
    lam: Optional[float] = None,
    tol: float = 1e-7,
    max_iter: int = 1000,
    rho: float = 1.5,
) -> Tuple[np.ndarray, np.ndarray, int, float]:
    """Robust PCA via inexact augmented Lagrange multiplier (IALM)."""
    m, n = d.shape
    if lam is None:
        lam = 1.0 / np.sqrt(max(m, n))

    l = np.zeros_like(d)
    s = np.zeros_like(d)

    norm_two = np.linalg.norm(d, 2)
    norm_inf = np.linalg.norm(d.ravel(), ord=np.inf) / lam
    dual_norm = max(norm_two, norm_inf)
    y = d / dual_norm

    mu = 1.25 / (norm_two + 1e-12)
    mu_bar = mu * 1e7
    d_fro = np.linalg.norm(d, ord="fro") + 1e-12

    err = np.inf
    it = 0
    for it in range(1, max_iter + 1):
        l = singular_value_threshold(d - s + (1.0 / mu) * y, 1.0 / mu)
        s = soft_threshold(d - l + (1.0 / mu) * y, lam / mu)
        z = d - l - s
        y = y + mu * z
        mu = min(mu * rho, mu_bar)
        err = np.linalg.norm(z, ord="fro") / d_fro
        if err < tol:
            break

    return l, s, it, err


def infer_time_axis(shape: Tuple[int, ...]) -> int:
    """Infer time axis by picking the smallest non-singleton axis."""
    candidates = [i for i, size in enumerate(shape) if size > 1]
    if not candidates:
        raise ValueError(f"Invalid cine shape {shape}: all dimensions are 1.")
    return min(candidates, key=lambda idx: shape[idx])


def load_cine(path: Path, time_axis: Optional[int]) -> Tuple[np.ndarray, int]:
    """Load cine MRI array from .npy or NIfTI (.nii/.nii.gz)."""
    suffixes = "".join(path.suffixes).lower()
    if suffixes.endswith(".npy"):
        cine = np.load(path)
    elif suffixes.endswith(".nii") or suffixes.endswith(".nii.gz"):
        try:
            import nibabel as nib
        except ImportError as exc:
            raise ImportError(
                "Loading NIfTI requires nibabel. Install with: pip install nibabel"
            ) from exc
        cine = np.asanyarray(nib.load(str(path)).get_fdata())
    else:
        raise ValueError(
            "Unsupported file format. Use .npy, .nii, or .nii.gz cine MRI data."
        )

    if cine.ndim < 3:
        raise ValueError(f"Expected at least 3D cine data, got shape {cine.shape}.")

    # If a channel dimension exists (e.g. H, W, T, C), collapse channels.
    if cine.ndim == 4:
        possible_channels = [i for i, size in enumerate(cine.shape) if size <= 4]
        if possible_channels:
            ch_axis = possible_channels[-1]
            cine = cine.mean(axis=ch_axis)

    if cine.ndim != 3:
        raise ValueError(
            f"After channel handling expected 3D cine data, got shape {cine.shape}."
        )

    t_axis = infer_time_axis(cine.shape) if time_axis is None else time_axis
    if t_axis < 0 or t_axis >= cine.ndim:
        raise ValueError(f"Invalid --time-axis={t_axis} for shape {cine.shape}.")

    cine = np.moveaxis(cine, t_axis, -1).astype(np.float32)
    return cine, t_axis


def normalize_cine(cine: np.ndarray) -> np.ndarray:
    """Robust intensity normalization for cine MRI."""
    lo, hi = np.percentile(cine, [1, 99])
    cine = np.clip(cine, lo, hi)
    return (cine - lo) / (hi - lo + 1e-12)


def moving_average(x: np.ndarray, window: int) -> np.ndarray:
    """Centered moving average with reflection padding."""
    if window <= 1:
        return x.copy()
    if window % 2 == 0:
        raise ValueError("Smoothing window must be odd.")
    pad = window // 2
    xp = np.pad(x, (pad, pad), mode="reflect")
    kernel = np.ones(window, dtype=np.float32) / float(window)
    return np.convolve(xp, kernel, mode="valid")


def mad_threshold(x: np.ndarray, k: float) -> float:
    """Median + k*MAD threshold."""
    med = float(np.median(x))
    mad = float(np.median(np.abs(x - med)))
    return med + k * 1.4826 * mad


def postprocess_mask(mask: np.ndarray) -> np.ndarray:
    """Optional spatial denoising with morphology if scipy is available."""
    if not HAS_SCIPY:
        return mask
    structure = np.ones((3, 3), dtype=bool)
    out = np.empty_like(mask, dtype=bool)
    for t in range(mask.shape[-1]):
        m = ndi.binary_opening(mask[..., t], structure=structure)
        m = ndi.binary_closing(m, structure=structure)
        out[..., t] = m
    return out


def run_pipeline(
    cine: np.ndarray,
    lam: Optional[float],
    tol: float,
    max_iter: int,
    pixel_k: float,
    frame_k: float,
    smooth_window: int,
) -> dict:
    """Execute RPCA and derive motion/static segmentation."""
    h, w, t = cine.shape
    d = cine.reshape(h * w, t)
    l, s, n_iter, final_err = rpca_ialm(d=d, lam=lam, tol=tol, max_iter=max_iter)

    l_cube = l.reshape(h, w, t)
    s_cube = s.reshape(h, w, t)
    s_abs = np.abs(s_cube)

    pixel_thr = mad_threshold(s_abs.ravel(), pixel_k)
    motion_mask = s_abs > pixel_thr
    motion_mask = postprocess_mask(motion_mask)

    frame_scores = s_abs.mean(axis=(0, 1))
    frame_scores_smoothed = moving_average(frame_scores, smooth_window)
    frame_thr = mad_threshold(frame_scores_smoothed, frame_k)
    frame_is_motion = frame_scores_smoothed > frame_thr

    return {
        "low_rank": l_cube.astype(np.float32),
        "sparse": s_cube.astype(np.float32),
        "motion_mask": motion_mask.astype(np.uint8),
        "frame_scores": frame_scores.astype(np.float32),
        "frame_scores_smoothed": frame_scores_smoothed.astype(np.float32),
        "frame_is_motion": frame_is_motion.astype(np.uint8),
        "pixel_threshold": float(pixel_thr),
        "frame_threshold": float(frame_thr),
        "rpca_iters": int(n_iter),
        "rpca_final_error": float(final_err),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="RPCA-based motion/static segmentation for cine MRI."
    )
    parser.add_argument("--input", type=Path, required=True, help="Path to cine MRI.")
    parser.add_argument(
        "--output-dir", type=Path, default=Path("outputs"), help="Output folder."
    )
    parser.add_argument(
        "--time-axis",
        type=int,
        default=None,
        help="Time axis index in input (default: auto infer).",
    )
    parser.add_argument(
        "--lambda-rpca",
        type=float,
        default=None,
        help="RPCA lambda (default: 1/sqrt(max(m,n))).",
    )
    parser.add_argument("--tol", type=float, default=1e-7, help="RPCA tolerance.")
    parser.add_argument(
        "--max-iter", type=int, default=1000, help="Max iterations for RPCA."
    )
    parser.add_argument(
        "--pixel-k",
        type=float,
        default=3.0,
        help="Pixel threshold = median + pixel_k*MAD on |S|.",
    )
    parser.add_argument(
        "--frame-k",
        type=float,
        default=2.5,
        help="Frame threshold = median + frame_k*MAD on frame scores.",
    )
    parser.add_argument(
        "--smooth-window",
        type=int,
        default=3,
        help="Odd window size for frame score smoothing.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    cine, used_axis = load_cine(args.input, args.time_axis)
    cine = normalize_cine(cine)

    result = run_pipeline(
        cine=cine,
        lam=args.lambda_rpca,
        tol=args.tol,
        max_iter=args.max_iter,
        pixel_k=args.pixel_k,
        frame_k=args.frame_k,
        smooth_window=args.smooth_window,
    )

    args.output_dir.mkdir(parents=True, exist_ok=True)
    np.save(args.output_dir / "low_rank.npy", result["low_rank"])
    np.save(args.output_dir / "sparse.npy", result["sparse"])
    np.save(args.output_dir / "motion_mask.npy", result["motion_mask"])

    csv_path = args.output_dir / "frame_motion_scores.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["frame", "score", "score_smoothed", "is_motion"])
        for i, (s1, s2, flag) in enumerate(
            zip(
                result["frame_scores"],
                result["frame_scores_smoothed"],
                result["frame_is_motion"],
            )
        ):
            writer.writerow([i, float(s1), float(s2), int(flag)])

    summary = {
        "input_shape_hwt": list(cine.shape),
        "input_path": str(args.input),
        "time_axis_used_in_input": int(used_axis),
        "rpca_lambda": (
            float(args.lambda_rpca)
            if args.lambda_rpca is not None
            else "default(1/sqrt(max(m,n)))"
        ),
        "rpca_tol": float(args.tol),
        "rpca_max_iter": int(args.max_iter),
        "rpca_iters": result["rpca_iters"],
        "rpca_final_error": result["rpca_final_error"],
        "pixel_threshold_abs_sparse": result["pixel_threshold"],
        "frame_threshold_score": result["frame_threshold"],
        "num_motion_frames": int(np.sum(result["frame_is_motion"])),
        "num_static_frames": int(len(result["frame_is_motion"]) - np.sum(result["frame_is_motion"])),
        "has_scipy_morphology": HAS_SCIPY,
    }
    with (args.output_dir / "summary.json").open("w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print("Done.")
    print(f"Output directory: {args.output_dir}")
    print(f"RPCA iterations: {result['rpca_iters']}")
    print(f"RPCA final error: {result['rpca_final_error']:.3e}")
    print(f"Pixel threshold on |S|: {result['pixel_threshold']:.6f}")
    print(f"Frame threshold: {result['frame_threshold']:.6f}")


if __name__ == "__main__":
    main()
