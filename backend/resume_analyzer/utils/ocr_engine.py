"""
CAMSPHER-AI — OCR engine (pytesseract + EasyOCR) with OpenCV preprocessing.
Lazy-loads heavy deps; never raises to callers — returns (text, confidence, engine_name).
"""

from __future__ import annotations

import io
import logging
import os
import platform
import re
import shutil
from typing import List, Optional, Tuple

logger = logging.getLogger(__name__)

MIN_OCR_CONFIDENCE = 35.0
TESSERACT_WIN_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
]

_tesseract_ready = False
_easyocr_reader = None

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

try:
    import pytesseract
    PYTESSERACT_AVAILABLE = True
except ImportError:
    PYTESSERACT_AVAILABLE = False

try:
    import easyocr
    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False


def configure_tesseract() -> bool:
    """Configure pytesseract binary (Windows). Returns True if usable."""
    global _tesseract_ready
    if not PYTESSERACT_AVAILABLE:
        return False
    if _tesseract_ready:
        return True

    if shutil.which("tesseract"):
        _tesseract_ready = True
        return True

    if platform.system() == "Windows":
        for path in TESSERACT_WIN_PATHS:
            if os.path.isfile(path):
                pytesseract.pytesseract.tesseract_cmd = path
                _tesseract_ready = True
                return True

    logger.warning(
        "Tesseract OCR not found. Install from https://github.com/UB-Mannheim/tesseract/wiki "
        "(Windows) or `apt install tesseract-ocr` (Linux). EasyOCR will be used if available."
    )
    return False


def get_easyocr_reader():
    global _easyocr_reader
    if not EASYOCR_AVAILABLE:
        return None
    if _easyocr_reader is None:
        try:
            _easyocr_reader = easyocr.Reader(["en"], gpu=False, verbose=False)
        except Exception as e:
            logger.warning("EasyOCR init failed: %s", e)
            return None
    return _easyocr_reader


def pil_to_cv2(img: "Image.Image") -> Optional["np.ndarray"]:
    if not CV2_AVAILABLE or not NUMPY_AVAILABLE or not PIL_AVAILABLE:
        return None
    rgb = img.convert("RGB")
    return cv2.cvtColor(np.array(rgb), cv2.COLOR_RGB2BGR)


def cv2_to_pil(arr: "np.ndarray") -> Optional["Image.Image"]:
    if not PIL_AVAILABLE or arr is None:
        return None
    if CV2_AVAILABLE and len(arr.shape) == 3:
        rgb = cv2.cvtColor(arr, cv2.COLOR_BGR2RGB)
        return Image.fromarray(rgb)
    return Image.fromarray(arr)


def preprocess_image(
    img: "Image.Image",
    aggressive: bool = False,
) -> "Image.Image":
    """Grayscale, denoise, contrast, adaptive threshold, deskew, resize."""
    if not PIL_AVAILABLE:
        return img

    if not CV2_AVAILABLE or not NUMPY_AVAILABLE:
        gray = img.convert("L")
        if aggressive:
            from PIL import ImageEnhance
            gray = ImageEnhance.Contrast(gray).enhance(2.0)
            gray = ImageEnhance.Sharpness(gray).enhance(2.0)
        return gray

    bgr = pil_to_cv2(img)
    if bgr is None:
        return img.convert("L")

    h, w = bgr.shape[:2]
    scale = 2.0 if aggressive else 1.5
    if max(h, w) < 1200:
        bgr = cv2.resize(bgr, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)

    clahe = cv2.createCLAHE(clipLimit=3.0 if aggressive else 2.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)

    block = 15 if aggressive else 11
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, block, 2
    )

    coords = np.column_stack(np.where(thresh > 0))
    if len(coords) > 100:
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = 90 + angle
        if abs(angle) > 0.5:
            (ch, cw) = thresh.shape
            M = cv2.getRotationMatrix2D((cw // 2, ch // 2), angle, 1.0)
            thresh = cv2.warpAffine(
                thresh, M, (cw, ch),
                flags=cv2.INTER_CUBIC,
                borderMode=cv2.BORDER_REPLICATE,
            )

    result = cv2_to_pil(thresh)
    return result if result is not None else img.convert("L")


def _tesseract_ocr(img: "Image.Image") -> Tuple[str, float]:
    if not configure_tesseract() or not PIL_AVAILABLE:
        return "", 0.0
    try:
        data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT, lang="eng")
        words = []
        confs = []
        for word, conf in zip(data.get("text", []), data.get("conf", [])):
            try:
                c = float(conf)
            except (TypeError, ValueError):
                continue
            if c >= 0 and str(word).strip():
                words.append(str(word))
                confs.append(c)
        text = " ".join(words)
        avg_conf = sum(confs) / len(confs) if confs else 0.0
        if not text.strip():
            text = pytesseract.image_to_string(img, lang="eng") or ""
            avg_conf = 50.0 if text.strip() else 0.0
        return text.strip(), avg_conf
    except Exception as e:
        logger.debug("Tesseract OCR error: %s", e)
        return "", 0.0


def _easyocr_ocr(img: "Image.Image") -> Tuple[str, float]:
    reader = get_easyocr_reader()
    if reader is None or not NUMPY_AVAILABLE or not PIL_AVAILABLE:
        return "", 0.0
    try:
        arr = np.array(img.convert("RGB"))
        results = reader.readtext(arr, detail=1, paragraph=True)
        parts = []
        confs = []
        for item in results:
            if len(item) >= 3:
                bbox, text, conf = item[0], item[1], item[2]
            elif len(item) == 2:
                text, conf = item[0], item[1]
            else:
                continue
            if str(text).strip():
                parts.append(str(text))
                confs.append(float(conf) * 100.0)
        text = "\n".join(parts)
        avg = sum(confs) / len(confs) if confs else 0.0
        return text.strip(), avg
    except Exception as e:
        logger.debug("EasyOCR error: %s", e)
        return "", 0.0


def merge_ocr_texts(results: List[Tuple[str, float, str]]) -> Tuple[str, float, str]:
    """Merge multiple OCR outputs; pick best + supplement with unique lines."""
    results = [(t.strip(), c, n) for t, c, n in results if t and t.strip()]
    if not results:
        return "", 0.0, "none"

    results.sort(key=lambda x: x[1], reverse=True)
    primary_text, primary_conf, primary_name = results[0]

    if len(results) == 1:
        return primary_text, primary_conf, primary_name

    seen = set()
    lines = []
    for text, _, _ in results:
        for line in text.splitlines():
            key = line.strip().lower()
            if key and key not in seen:
                seen.add(key)
                lines.append(line.strip())

    merged = "\n".join(lines) if lines else primary_text
    avg_conf = sum(r[1] for r in results) / len(results)
    methods = "+".join(sorted({r[2] for r in results}))
    return merged, avg_conf, methods


def ocr_image(img: "Image.Image", aggressive: bool = False) -> Tuple[str, float, str]:
    """Run pytesseract then EasyOCR if confidence low; return text, confidence, method."""
    if not PIL_AVAILABLE:
        return "", 0.0, "none"

    processed = preprocess_image(img, aggressive=aggressive)
    tess_text, tess_conf = _tesseract_ocr(processed)
    results: List[Tuple[str, float, str]] = []
    if tess_text:
        results.append((tess_text, tess_conf, "pytesseract"))

    if tess_conf < MIN_OCR_CONFIDENCE or len(tess_text) < 80:
        easy_text, easy_conf = _easyocr_ocr(processed)
        if easy_text:
            results.append((easy_text, easy_conf, "easyocr"))

    if not results and aggressive:
        tess2, c2 = _tesseract_ocr(preprocess_image(img, aggressive=True))
        if tess2:
            results.append((tess2, c2, "pytesseract_aggressive"))

    return merge_ocr_texts(results)


def ocr_images(images: List["Image.Image"], aggressive: bool = False) -> Tuple[str, float, str]:
    page_texts = []
    confs = []
    methods = set()
    for i, img in enumerate(images):
        text, conf, method = ocr_image(img, aggressive=aggressive)
        if text:
            page_texts.append(text)
            confs.append(conf)
            methods.add(method)
    if not page_texts:
        return "", 0.0, "ocr_none"
    combined = "\n\n".join(page_texts)
    avg_conf = sum(confs) / len(confs) if confs else 0.0
    return combined, avg_conf, "+".join(sorted(methods)) or "ocr"


def ocr_bytes(image_bytes: bytes, aggressive: bool = False) -> Tuple[str, float, str]:
    if not PIL_AVAILABLE:
        return "", 0.0, "none"
    try:
        img = Image.open(io.BytesIO(image_bytes))
        return ocr_image(img, aggressive=aggressive)
    except Exception as e:
        logger.debug("ocr_bytes failed: %s", e)
        return "", 0.0, "none"
