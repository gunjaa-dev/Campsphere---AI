# OCR & Multi-Format Extraction Setup

## Python packages

```bash
cd backend/resume_analyzer
pip install -r requirements.txt
```

## System dependencies (recommended)

### Tesseract OCR (pytesseract)

- **Windows:** Install [UB Mannheim Tesseract](https://github.com/UB-Mannheim/tesseract/wiki)  
  Default path: `C:\Program Files\Tesseract-OCR\tesseract.exe` (auto-detected)
- **Linux:** `sudo apt install tesseract-ocr`
- **macOS:** `brew install tesseract`

### Poppler (optional, for pdf2image fallback)

- **Windows:** Install poppler and add `bin` to PATH, or rely on PyMuPDF rendering (default)
- **Linux:** `sudo apt install poppler-utils`

### antiword (optional, legacy `.doc`)

- **Linux:** `sudo apt install antiword`

EasyOCR downloads English models on first run (~100MB).

## Supported uploads

PDF (text + scanned), DOC, DOCX, JPG, JPEG, PNG, WEBP, BMP, TIFF — up to 15MB.

The API never requires manual text paste; extraction falls back through native parsers → OCR automatically.
