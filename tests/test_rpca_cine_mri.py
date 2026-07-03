import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import rpca_cine_mri as rpca  # noqa: E402


class RpcaStabilityTests(unittest.TestCase):
    def test_rpca_ialm_zero_input_returns_zero_components(self) -> None:
        d = np.zeros((16, 5), dtype=np.float32)
        l, s, n_iter, err = rpca.rpca_ialm(d)

        self.assertEqual(n_iter, 0)
        self.assertEqual(err, 0.0)
        self.assertTrue(np.array_equal(l, np.zeros_like(d)))
        self.assertTrue(np.array_equal(s, np.zeros_like(d)))

    def test_pipeline_zero_cine_stays_finite(self) -> None:
        cine = np.zeros((8, 8, 6), dtype=np.float32)
        result = rpca.run_pipeline(
            cine=cine,
            lam=None,
            tol=1e-7,
            max_iter=1000,
            pixel_k=3.0,
            frame_k=2.5,
            smooth_window=3,
        )

        self.assertTrue(np.isfinite(result["low_rank"]).all())
        self.assertTrue(np.isfinite(result["sparse"]).all())
        self.assertTrue(np.isfinite(result["frame_scores"]).all())
        self.assertTrue(np.isfinite(result["frame_scores_smoothed"]).all())
        self.assertEqual(int(result["motion_mask"].sum()), 0)
        self.assertEqual(int(result["frame_is_motion"].sum()), 0)


if __name__ == "__main__":
    unittest.main()
