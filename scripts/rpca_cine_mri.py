#!/usr/bin/env python3
"""RPCA-based motion/static segmentation for cine MRI and ACDC."""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple

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
    if not np.all(np.isfinite(d)):
        raise ValueError("Input matrix contains non-finite values (NaN or inf).")
    if lam is None:
        lam = 1.0 / np.sqrt(max(m, n))

    l = np.zeros_like(d)
    s = np.zeros_like(d)

    norm_two = np.linalg.norm(d, 2)
    norm_inf = np.linalg.norm(d.ravel(), ord=np.inf) / lam
    dual_norm = max(norm_two, norm_inf)
    if dual_norm <= 1e-12:
        return l, s, 0, 0.0
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


def strip_known_ext(filename: str) -> str:
    """Strip known extensions from a file name."""
    for suffix in (".nii.gz", ".nii", ".npy"):
        if filename.endswith(suffix):
            return filename[: -len(suffix)]
    return Path(filename).stem


def case_id_from_path(path: Path) -> str:
    """Build a stable case ID from path (friendly for ACDC)."""
    if path.parent.name.lower().startswith("patient"):
        return path.parent.name
    return strip_known_ext(path.name)


def infer_time_axis_3d(shape: Tuple[int, ...]) -> int:
    """Infer time axis in 3D by choosing smallest non-singleton axis."""
    candidates = [i for i, size in enumerate(shape) if size > 1]
    if not candidates:
        raise ValueError(f"Invalid cine shape {shape}: all dimensions are 1.")
    return min(candidates, key=lambda idx: shape[idx])


def load_array(path: Path) -> np.ndarray:
    """Load cine MRI array from .npy or NIfTI (.nii/.nii.gz)."""
    suffixes = "".join(path.suffixes).lower()
    if suffixes.endswith(".npy"):
        return np.load(path)
    if suffixes.endswith(".nii") or suffixes.endswith(".nii.gz"):
        try:
            import nibabel as nib
        except ImportError as exc:
            raise ImportError(
                "Loading NIfTI requires nibabel. Install with: pip install nibabel"
            ) from exc
        return np.asanyarray(nib.load(str(path)).get_fdata())
    raise ValueError("Unsupported file format. Use .npy, .nii, or .nii.gz.")


def extract_cine_3d(
    arr: np.ndarray,
    time_axis: Optional[int],
    slice_axis: Optional[int],
    slice_index: Optional[int],
) -> Tuple[np.ndarray, Dict[str, Optional[int]]]:
    """Convert loaded array into 3D cine (H, W, T)."""
    if arr.ndim < 3:
        raise ValueError(f"Expected at least 3D cine data, got shape {arr.shape}.")
    if arr.ndim > 4:
        raise ValueError(
            f"Expected 3D/4D cine data, got shape {arr.shape}. Please preprocess first."
        )

    if arr.ndim == 3:
        used_t = infer_time_axis_3d(arr.shape) if time_axis is None else time_axis
        if used_t < 0 or used_t >= arr.ndim:
            raise ValueError(f"Invalid --time-axis={used_t} for shape {arr.shape}.")
        cine = np.moveaxis(arr, used_t, -1).astype(np.float32)
        return cine, {
            "time_axis_used_in_input": int(used_t),
            "slice_axis_used_in_input": None,
            "slice_index_used": None,
        }

    used_t = arr.ndim - 1 if time_axis is None else time_axis
    if used_t < 0 or used_t >= arr.ndim:
        raise ValueError(f"Invalid --time-axis={used_t} for shape {arr.shape}.")

    if slice_axis is None:
        candidate_axes = [i for i in range(arr.ndim) if i != used_t]
        used_slice_axis = min(candidate_axes, key=lambda idx: arr.shape[idx])
    else:
        used_slice_axis = slice_axis
    if used_slice_axis == used_t:
        raise ValueError("--slice-axis must be different from --time-axis.")
    if used_slice_axis < 0 or used_slice_axis >= arr.ndim:
        raise ValueError(
            f"Invalid --slice-axis={used_slice_axis} for shape {arr.shape}."
        )

    arr_t_last = np.moveaxis(arr, used_t, -1)
    mapped_slice_axis = used_slice_axis if used_slice_axis < used_t else used_slice_axis - 1
    num_slices = int(arr_t_last.shape[mapped_slice_axis])
    used_slice_index = (num_slices // 2) if slice_index is None else slice_index
    if used_slice_index < 0 or used_slice_index >= num_slices:
        raise ValueError(
            f"Invalid --slice-index={used_slice_index} for axis size {num_slices}."
        )

    cine = np.take(arr_t_last, indices=used_slice_index, axis=mapped_slice_axis)
    if cine.ndim != 3:
        raise ValueError(
            f"Slice extraction expected 3D cine result, got shape {cine.shape}."
        )

    return cine.astype(np.float32), {
        "time_axis_used_in_input": int(used_t),
        "slice_axis_used_in_input": int(used_slice_axis),
        "slice_index_used": int(used_slice_index),
    }


def load_cine(
    path: Path,
    time_axis: Optional[int],
    slice_axis: Optional[int],
    slice_index: Optional[int],
) -> Tuple[np.ndarray, Dict[str, object]]:
    """Load cine and return 3D HWT array plus metadata."""
    arr = load_array(path)
    cine, axis_meta = extract_cine_3d(
        arr=arr,
        time_axis=time_axis,
        slice_axis=slice_axis,
        slice_index=slice_index,
    )
    meta: Dict[str, object] = {
        "input_shape": list(arr.shape),
        "input_ndim": int(arr.ndim),
    }
    meta.update(axis_meta)
    return cine, meta


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


def write_case_outputs(output_dir: Path, result: dict, summary: dict) -> None:
    """Save all outputs for one case."""
    output_dir.mkdir(parents=True, exist_ok=True)
    np.save(output_dir / "low_rank.npy", result["low_rank"])
    np.save(output_dir / "sparse.npy", result["sparse"])
    np.save(output_dir / "motion_mask.npy", result["motion_mask"])

    csv_path = output_dir / "frame_motion_scores.csv"
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

    with (output_dir / "summary.json").open("w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)


def build_case_summary(
    input_path: Path,
    cine: np.ndarray,
    args: argparse.Namespace,
    result: dict,
    load_meta: Dict[str, object],
) -> dict:
    """Build JSON-serializable summary for one case."""
    num_motion = int(np.sum(result["frame_is_motion"]))
    num_frames = int(len(result["frame_is_motion"]))
    return {
        "case_id": case_id_from_path(input_path),
        "input_path": str(input_path),
        "input_shape_hwt": list(cine.shape),
        "input_shape_raw": load_meta["input_shape"],
        "input_ndim_raw": int(load_meta["input_ndim"]),
        "time_axis_used_in_input": load_meta["time_axis_used_in_input"],
        "slice_axis_used_in_input": load_meta["slice_axis_used_in_input"],
        "slice_index_used": load_meta["slice_index_used"],
        "rpca_lambda": (
            float(args.lambda_rpca)
            if args.lambda_rpca is not None
            else "default(1/sqrt(max(m,n)))"
        ),
        "rpca_tol": float(args.tol),
        "rpca_max_iter": int(args.max_iter),
        "rpca_iters": int(result["rpca_iters"]),
        "rpca_final_error": float(result["rpca_final_error"]),
        "pixel_threshold_abs_sparse": float(result["pixel_threshold"]),
        "frame_threshold_score": float(result["frame_threshold"]),
        "num_motion_frames": num_motion,
        "num_static_frames": int(num_frames - num_motion),
        "has_scipy_morphology": bool(HAS_SCIPY),
    }


def run_single_case(
    input_path: Path,
    output_dir: Path,
    args: argparse.Namespace,
) -> dict:
    """Run RPCA pipeline for a single cine file and write outputs."""
    cine, load_meta = load_cine(
        path=input_path,
        time_axis=args.time_axis,
        slice_axis=args.slice_axis,
        slice_index=args.slice_index,
    )
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
    summary = build_case_summary(
        input_path=input_path,
        cine=cine,
        args=args,
        result=result,
        load_meta=load_meta,
    )
    write_case_outputs(output_dir=output_dir, result=result, summary=summary)
    return summary


def discover_acdc_cases(
    acdc_root: Path,
    acdc_glob: str,
    patient_limit: Optional[int],
) -> List[Path]:
    """Find ACDC cine files from root directory."""
    if not acdc_root.exists():
        raise FileNotFoundError(f"ACDC root does not exist: {acdc_root}")
    candidates = sorted(acdc_root.glob(acdc_glob))
    if not candidates:
        raise FileNotFoundError(
            f"No files matched ACDC pattern '{acdc_glob}' in {acdc_root}"
        )
    if patient_limit is not None:
        candidates = candidates[:patient_limit]
    return candidates


def run_acdc_batch(args: argparse.Namespace) -> None:
    """Run RPCA over all discovered ACDC patients."""
    cases = discover_acdc_cases(args.acdc_root, args.acdc_glob, args.patient_limit)
    args.output_dir.mkdir(parents=True, exist_ok=True)

    batch_rows: List[dict] = []
    for idx, case_path in enumerate(cases, start=1):
        case_id = case_id_from_path(case_path)
        case_out = args.output_dir / case_id
        print(f"[{idx}/{len(cases)}] Processing {case_id}: {case_path}")
        summary = run_single_case(input_path=case_path, output_dir=case_out, args=args)
        batch_rows.append(summary)

    csv_path = args.output_dir / "acdc_batch_summary.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "case_id",
                "input_path",
                "num_motion_frames",
                "num_static_frames",
                "rpca_iters",
                "rpca_final_error",
                "pixel_threshold_abs_sparse",
                "frame_threshold_score",
                "time_axis_used_in_input",
                "slice_axis_used_in_input",
                "slice_index_used",
            ]
        )
        for row in batch_rows:
            writer.writerow(
                [
                    row["case_id"],
                    row["input_path"],
                    row["num_motion_frames"],
                    row["num_static_frames"],
                    row["rpca_iters"],
                    row["rpca_final_error"],
                    row["pixel_threshold_abs_sparse"],
                    row["frame_threshold_score"],
                    row["time_axis_used_in_input"],
                    row["slice_axis_used_in_input"],
                    row["slice_index_used"],
                ]
            )

    with (args.output_dir / "acdc_batch_summary.json").open("w", encoding="utf-8") as f:
        json.dump(batch_rows, f, indent=2)

    print("Done.")
    print(f"Processed cases: {len(cases)}")
    print(f"Batch summary CSV: {csv_path}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="RPCA-based motion/static segmentation for cine MRI / ACDC."
    )
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--input", type=Path, help="Path to one cine MRI file.")
    mode.add_argument(
        "--acdc-root",
        type=Path,
        help="ACDC root path, e.g. /data/ACDC/training.",
    )
    parser.add_argument(
        "--acdc-glob",
        type=str,
        default="patient*/patient*_4d.nii.gz",
        help="Glob pattern under --acdc-root for cine files.",
    )
    parser.add_argument(
        "--patient-limit",
        type=int,
        default=None,
        help="Optional max number of ACDC cases to process.",
    )
    parser.add_argument(
        "--output-dir", type=Path, default=Path("outputs"), help="Output folder."
    )
    parser.add_argument(
        "--time-axis",
        type=int,
        default=None,
        help="Time axis index in raw input (4D default: last axis).",
    )
    parser.add_argument(
        "--slice-axis",
        type=int,
        default=None,
        help="For 4D input, axis used as slice-stack before RPCA.",
    )
    parser.add_argument(
        "--slice-index",
        type=int,
        default=None,
        help="For 4D input, slice index on --slice-axis (default: middle slice).",
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
    if args.input is not None:
        summary = run_single_case(
            input_path=args.input,
            output_dir=args.output_dir,
            args=args,
        )
        print("Done.")
        print(f"Output directory: {args.output_dir}")
        print(f"Case: {summary['case_id']}")
        print(f"RPCA iterations: {summary['rpca_iters']}")
        print(f"RPCA final error: {summary['rpca_final_error']:.3e}")
        print(
            f"Motion frames: {summary['num_motion_frames']} / "
            f"{summary['num_motion_frames'] + summary['num_static_frames']}"
        )
    else:
        run_acdc_batch(args)


if __name__ == "__main__":
    main()
