"""
Excel/CSV import service for CRM customers.
Supports flexible column mapping and duplicate detection.
"""
import io
import csv
from typing import List
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.modules.crm.models import Customer
from app.modules.crm.schemas import CustomerCreate, ImportResult
from app.modules.crm.service import CRMService

# Flexible column mapping: maps various header names to model fields
COLUMN_MAP = {
    "firma": "company_name", "firma adı": "company_name", "firma adi": "company_name",
    "şirket": "company_name", "sirket": "company_name", "company": "company_name",
    "vergi no": "tax_number", "vergi numarası": "tax_number", "tax": "tax_number",
    "şehir": "city", "sehir": "city", "il": "city", "city": "city",
    "ilçe": "district", "ilce": "district", "district": "district",
    "adres": "address", "address": "address",
    "telefon": "phone", "tel": "phone", "phone": "phone",
    "e-posta": "email", "eposta": "email", "email": "email", "mail": "email",
    "web": "website", "web sitesi": "website", "website": "website", "site": "website",
    "sektör": "sector", "sektor": "sector", "sector": "sector",
    "araç parkı": "current_fleet", "filo": "current_fleet", "mevcut araçlar": "current_fleet",
    "filo büyüklüğü": "estimated_fleet_size", "araç sayısı": "estimated_fleet_size",
    "önceki araçlar": "previous_vehicles", "alınan araçlar": "previous_vehicles",
    "segment": "segment", "müşteri segmenti": "segment",
    "notlar": "sales_notes", "not": "sales_notes", "açıklama": "sales_notes",
    "potansiyel": "potential_level",
}


def _map_headers(headers: List[str]) -> dict:
    """Map CSV/Excel headers to model field names."""
    mapping = {}
    for idx, header in enumerate(headers):
        clean = header.strip().lower()
        if clean in COLUMN_MAP:
            mapping[idx] = COLUMN_MAP[clean]
    return mapping


async def import_from_file(file: UploadFile, db: Session, user_id: int) -> ImportResult:
    """Import customers from CSV or Excel file."""
    content = await file.read()
    filename = file.filename.lower()

    if filename.endswith(".csv"):
        rows = _parse_csv(content)
    elif filename.endswith((".xlsx", ".xls")):
        rows = _parse_excel(content)
    else:
        return ImportResult(total_rows=0, imported=0, duplicates=0, errors=1,
                          error_details=["Desteklenmeyen dosya formatı. CSV veya Excel kullanın."])

    if not rows:
        return ImportResult(total_rows=0, imported=0, duplicates=0, errors=1,
                          error_details=["Dosya boş veya okunamadı."])

    service = CRMService(db)
    result = ImportResult(total_rows=len(rows) - 1, imported=0, duplicates=0, errors=0, error_details=[])
    headers = rows[0]
    col_map = _map_headers(headers)

    if not col_map:
        result.errors = 1
        result.error_details.append("Tanınan kolon başlığı bulunamadı.")
        return result

    for row_idx, row in enumerate(rows[1:], start=2):
        try:
            data = {}
            for col_idx, field_name in col_map.items():
                if col_idx < len(row) and row[col_idx]:
                    val = row[col_idx].strip()
                    if field_name == "estimated_fleet_size":
                        try: val = int(val)
                        except: val = None
                    data[field_name] = val

            if "company_name" not in data or not data["company_name"]:
                result.errors += 1
                result.error_details.append(f"Satır {row_idx}: Firma adı boş")
                continue

            # Check duplicates
            create_data = CustomerCreate(**{k: v for k, v in data.items() if v is not None})
            dupes = service.check_duplicate(create_data)
            if dupes:
                result.duplicates += 1
                result.error_details.append(f"Satır {row_idx}: '{data['company_name']}' zaten mevcut ({dupes[0]['match_type']})")
                continue

            service.create_customer(create_data, source="import")
            result.imported += 1

        except Exception as e:
            result.errors += 1
            result.error_details.append(f"Satır {row_idx}: {str(e)}")

    return result


def _parse_csv(content: bytes) -> List[List[str]]:
    """Parse CSV content into rows."""
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = content.decode("latin-1")
    reader = csv.reader(io.StringIO(text))
    return list(reader)


def _parse_excel(content: bytes) -> List[List[str]]:
    """Parse Excel content into rows."""
    import openpyxl
    wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True)
    ws = wb.active
    rows = []
    for row in ws.iter_rows(values_only=True):
        rows.append([str(cell) if cell is not None else "" for cell in row])
    wb.close()
    return rows
