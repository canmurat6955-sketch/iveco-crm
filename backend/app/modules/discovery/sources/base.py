"""
Base scraper interface for web discovery sources.
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from dataclasses import dataclass


@dataclass
class RawCompanyData:
    """Raw company data extracted from a web source."""
    company_name: str
    city: Optional[str] = None
    district: Optional[str] = None
    sector: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    activity_description: Optional[str] = None
    contact_info: Optional[str] = None
    raw_data: Optional[dict] = None


class BaseDiscoveryScraper(ABC):
    """Abstract base class for all discovery scrapers."""

    def __init__(self, source_url: str = ""):
        self.source_url = source_url

    @abstractmethod
    def scrape(self) -> List[RawCompanyData]:
        """Execute scraping and return list of discovered companies."""
        pass

    def get_name(self) -> str:
        return self.__class__.__name__
