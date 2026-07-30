"""Tests for the ONNX YOLOv10 layout detector."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import numpy as np
import pytest
from PIL import Image

from pdf_remediation.adapters.layout_onnx_yolo import OnnxYoloLayoutDetector
from pdf_remediation.ports.layout import FigureDetection


class TestOnnxYoloLayoutDetector:
    """Unit tests using mocked ONNX session."""

    def _make_detector_with_mock(self, predictions: np.ndarray):
        """Create a detector with a mocked ONNX session returning given predictions."""
        detector = OnnxYoloLayoutDetector(confidence_threshold=0.3)

        mock_session = MagicMock()
        mock_input = MagicMock()
        mock_input.name = "images"
        mock_session.get_inputs.return_value = [mock_input]
        mock_session.run.return_value = [predictions.reshape(1, -1, 6)]

        detector._session = mock_session
        return detector

    def test_detects_picture_class(self):
        """Picture (class_id=6) detections are returned."""
        # One detection: Picture at center of 640x640, high confidence
        preds = np.array([[100, 100, 400, 400, 0.9, 6]], dtype=np.float32)
        detector = self._make_detector_with_mock(preds)

        img = Image.new("RGB", (1224, 1584))
        results = detector.detect_figures(img, 612.0, 792.0)

        assert len(results) == 1
        assert results[0].label == "Picture"
        assert results[0].confidence == pytest.approx(0.9)
        # bbox should be scaled from 640 to PDF points (612x792)
        assert results[0].bbox[0] == pytest.approx(100 * 612 / 640, abs=1)
        assert results[0].bbox[1] == pytest.approx(100 * 792 / 640, abs=1)

    def test_filters_non_picture_classes(self):
        """Only Picture class is returned; Table, Text, etc. are filtered."""
        preds = np.array([
            [100, 100, 400, 400, 0.9, 6],   # Picture ✓
            [100, 100, 400, 400, 0.95, 8],   # Table ✗
            [100, 100, 400, 400, 0.99, 9],   # Text ✗
            [100, 100, 400, 400, 0.8, 10],   # Title ✗
        ], dtype=np.float32)
        detector = self._make_detector_with_mock(preds)

        img = Image.new("RGB", (1224, 1584))
        results = detector.detect_figures(img, 612.0, 792.0)

        assert len(results) == 1
        assert results[0].label == "Picture"

    def test_filters_below_confidence_threshold(self):
        """Low-confidence detections are filtered out."""
        preds = np.array([
            [100, 100, 400, 400, 0.1, 6],   # Below threshold
            [100, 100, 400, 400, 0.5, 6],   # Above threshold
        ], dtype=np.float32)
        detector = self._make_detector_with_mock(preds)

        img = Image.new("RGB", (1224, 1584))
        results = detector.detect_figures(img, 612.0, 792.0)

        assert len(results) == 1
        assert results[0].confidence == pytest.approx(0.5)

    def test_filters_tiny_detections(self):
        """Detections smaller than 30pt in either dimension are filtered."""
        preds = np.array([
            # Very thin horizontal strip (wide but short)
            [0, 300, 640, 310, 0.9, 6],  # 640px wide, 10px tall -> ~12pt tall
            # Normal sized figure
            [100, 100, 400, 400, 0.8, 6],
        ], dtype=np.float32)
        detector = self._make_detector_with_mock(preds)

        img = Image.new("RGB", (1224, 1584))
        results = detector.detect_figures(img, 612.0, 792.0)

        # Only the normal-sized figure should pass
        assert len(results) == 1
        assert results[0].confidence == pytest.approx(0.8)

    def test_empty_predictions(self):
        """No detections returns empty list."""
        preds = np.array([], dtype=np.float32).reshape(0, 6)
        detector = self._make_detector_with_mock(preds)

        img = Image.new("RGB", (1224, 1584))
        results = detector.detect_figures(img, 612.0, 792.0)

        assert results == []

    def test_coordinate_conversion_us_letter(self):
        """Coordinates are correctly converted from 640x640 to PDF points."""
        # Detection at exact center of the 640x640 space
        preds = np.array([[160, 160, 480, 480, 0.9, 6]], dtype=np.float32)
        detector = self._make_detector_with_mock(preds)

        img = Image.new("RGB", (1224, 1584))
        results = detector.detect_figures(img, 612.0, 792.0)

        assert len(results) == 1
        bbox = results[0].bbox
        # x: 160/640 * 612 = 153, 480/640 * 612 = 459
        assert bbox[0] == pytest.approx(153.0, abs=1)
        assert bbox[2] == pytest.approx(459.0, abs=1)
        # y: 160/640 * 792 = 198, 480/640 * 792 = 594
        assert bbox[1] == pytest.approx(198.0, abs=1)
        assert bbox[3] == pytest.approx(594.0, abs=1)

    def test_lazy_model_loading(self):
        """Model is not loaded until first detect_figures call."""
        detector = OnnxYoloLayoutDetector(model_path="/nonexistent/path.onnx")
        # No error yet — model hasn't been loaded
        assert detector._session is None
