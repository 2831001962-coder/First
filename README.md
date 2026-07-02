# cine MRI motion/static segmentation with RPCA

This repository includes a runnable script for robust PCA (RPCA) on cine MRI
sequences to separate mostly static structure from motion:

`D = L + S`

- `L` (low-rank): mostly static / slowly varying content
- `S` (sparse): motion-heavy content and outliers

## Script

`scripts/rpca_cine_mri.py`

Supports:
- input `.npy` (3D array)
- input `.nii` / `.nii.gz` (NIfTI, requires `nibabel`)

Expected data shape is 3D with one time axis. If not obvious, pass
`--time-axis`.

## Quick start

```bash
python scripts/rpca_cine_mri.py \
  --input /path/to/cine_mri.nii.gz \
  --output-dir outputs/case01 \
  --time-axis 2
```

If your input is `.npy`:

```bash
python scripts/rpca_cine_mri.py \
  --input /path/to/cine.npy \
  --output-dir outputs/case01
```

## Main outputs

- `low_rank.npy`: low-rank component `L`
- `sparse.npy`: sparse component `S`
- `motion_mask.npy`: binary motion mask from `|S|`
- `frame_motion_scores.csv`: per-frame motion score and label
- `summary.json`: thresholds and RPCA convergence info

## Useful options

- `--lambda-rpca`: override RPCA lambda (default: `1/sqrt(max(m,n))`)
- `--pixel-k`: pixel threshold multiplier for `|S|` (`median + k*MAD`)
- `--frame-k`: frame threshold multiplier on frame scores
- `--smooth-window`: odd smoothing window for frame scores

## Notes for cine MRI

- If patient/respiratory motion is large, pre-registration can improve results.
- Running on a cropped cardiac ROI often improves separation quality.
