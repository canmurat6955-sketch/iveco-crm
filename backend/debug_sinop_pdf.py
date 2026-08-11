import sys, os
sys.path.insert(0, os.path.dirname(__file__))
sys.stdout.reconfigure(encoding='utf-8')
import pdfplumber

pdf_path = r"C:\Users\Murat\Downloads\sinop ticaret odası.pdf"
pdf = pdfplumber.open(pdf_path)

# First 3 pages raw text
for i, page in enumerate(pdf.pages[:5]):
    text = page.extract_text()
    if text:
        print(f"\n{'='*60}")
        print(f"SAYFA {i+1}")
        print(f"{'='*60}")
        lines = text.strip().split('\n')
        for j, line in enumerate(lines):
            print(f"  L{j:03d}: {line}")

pdf.close()
