# cine MRI / ACDC motion-static segmentation with RPCA

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
- ACDC batch mode (`patient*/patient*_4d.nii.gz`)

Expected data shape:
- 3D cine: one time axis (can pass `--time-axis`)
- 4D cine (e.g. ACDC `H x W x Z x T`): script extracts one slice to 2D+T for RPCA
  (`--slice-axis` / `--slice-index`, defaults to inferred stack axis + middle slice)

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

## ACDC batch usage

Run all ACDC cine files (`patient*/patient*_4d.nii.gz`) under a root:

```bash
python scripts/rpca_cine_mri.py \
  --acdc-root /path/to/ACDC/training \
  --output-dir outputs/acdc_rpca
```

Common ACDC setting (explicitly set last axis as time, z-axis as slice stack):

```bash
python scripts/rpca_cine_mri.py \
  --acdc-root /path/to/ACDC/training \
  --output-dir outputs/acdc_rpca \
  --time-axis 3 \
  --slice-axis 2
```

Limit processed cases for quick experiments:

```bash
python scripts/rpca_cine_mri.py \
  --acdc-root /path/to/ACDC/training \
  --output-dir outputs/acdc_debug \
  --patient-limit 5
```

## Main outputs

- `low_rank.npy`: low-rank component `L`
- `sparse.npy`: sparse component `S`
- `motion_mask.npy`: binary motion mask from `|S|`
- `frame_motion_scores.csv`: per-frame motion score and label
- `summary.json`: thresholds and RPCA convergence info

In ACDC batch mode, each case gets its own subfolder and batch-level files:
- `acdc_batch_summary.csv`
- `acdc_batch_summary.json`

## Useful options

- `--lambda-rpca`: override RPCA lambda (default: `1/sqrt(max(m,n))`)
- `--pixel-k`: pixel threshold multiplier for `|S|` (`median + k*MAD`)
- `--frame-k`: frame threshold multiplier on frame scores
- `--smooth-window`: odd smoothing window for frame scores
- `--slice-axis` / `--slice-index`: how to select a 2D slice from 4D cine

## Notes for cine MRI

- If patient/respiratory motion is large, pre-registration can improve results.
- Running on a cropped cardiac ROI often improves separation quality.
