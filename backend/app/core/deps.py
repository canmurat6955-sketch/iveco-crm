"""
Common FastAPI dependencies for pagination, filtering, and sorting.
"""

from typing import Optional
from fastapi import Query


class PaginationParams:
    """Common pagination parameters."""

    def __init__(
        self,
        page: int = Query(1, ge=1, description="Sayfa numarası"),
        page_size: int = Query(20, ge=1, le=100, description="Sayfa başına kayıt"),
    ):
        self.page = page
        self.page_size = page_size
        self.offset = (page - 1) * page_size


class CustomerFilterParams:
    """Filter parameters for customer queries."""

    def __init__(
        self,
        search: Optional[str] = Query(None, description="Firma adı, telefon veya e-posta ile ara"),
        city: Optional[str] = Query(None, description="Şehir filtresi"),
        sector: Optional[str] = Query(None, description="Sektör filtresi"),
        segment: Optional[str] = Query(None, description="Segment filtresi (A/B/C/D)"),
        potential_level: Optional[str] = Query(None, description="Potansiyel seviyesi"),
        source: Optional[str] = Query(None, description="Kaynak (manual/import/discovery)"),
        assigned_to_id: Optional[int] = Query(None, description="Atanan temsilci ID"),
        sort_by: str = Query("created_at", description="Sıralama alanı"),
        sort_order: str = Query("desc", description="Sıralama yönü (asc/desc)"),
    ):
        self.search = search
        self.city = city
        self.sector = sector
        self.segment = segment
        self.potential_level = potential_level
        self.source = source
        self.assigned_to_id = assigned_to_id
        self.sort_by = sort_by
        self.sort_order = sort_order
