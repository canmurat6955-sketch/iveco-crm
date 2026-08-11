"""
Keyword-based scoring engine for commercial vehicle potential.
Scores companies 0-100 based on logistics/transport signals.
"""
import re
from dataclasses import dataclass, field
from typing import List, Dict, Optional


@dataclass
class ScoreBreakdown:
    total_score: int = 0
    signals: List[Dict] = field(default_factory=list)
    potential_level: str = "low"


# ── Keyword categories and weights ─────────────────────────────

LOGISTICS_KEYWORDS = [
    "lojistik", "logistics", "nakliye", "nakliyat", "taşıma", "taşımacılık",
    "transport", "kargo", "dağıtım", "depolama", "sevkiyat", "tedarik",
    "forwarder", "freight", "shipping",
]

HEAVY_VEHICLE_KEYWORDS = [
    "çekici", "tır", "kamyon", "truck", "trailer", "dorse", "treyler",
    "ağır vasıta", "ağır taşıma", "heavy", "s-way", "t-way", "trakker",
]

LIGHT_COMMERCIAL_KEYWORDS = [
    "hafif ticari", "daily", "panelvan", "minibüs", "kamyonet",
    "pickup", "van", "eurocargo", "cargo", "furgon",
]

FLEET_KEYWORDS = [
    "filo", "fleet", "araç parkı", "filosu", "filomuz",
    "araç kiralama", "rent", "rental", "operasyonel kiralama",
]

TRANSPORT_ACTIVITY_KEYWORDS = [
    "karayolu", "uluslararası taşımacılık", "yurtiçi taşıma",
    "parsiyel", "komple", "konteyner", "soğuk zincir", "cold chain",
    "tehlikeli madde", "adr", "ro-ro", "intermodal",
]

CONSTRUCTION_KEYWORDS = [
    "inşaat", "hafriyat", "beton", "çimento", "maden", "kum", "çakıl",
    "kazı", "altyapı", "yol yapım", "construction",
]


def _count_keyword_matches(text: str, keywords: list) -> int:
    """Count how many keywords appear in the text."""
    text_lower = text.lower()
    count = 0
    for kw in keywords:
        if kw in text_lower:
            count += 1
    return count


def score_company(
    company_name: str,
    sector: Optional[str] = None,
    activity_description: Optional[str] = None,
    website: Optional[str] = None,
    phone: Optional[str] = None,
    city: Optional[str] = None,
) -> ScoreBreakdown:
    """
    Score a company based on keyword signals.
    Returns a ScoreBreakdown with total score and signal details.
    """
    result = ScoreBreakdown()
    combined_text = " ".join(filter(None, [company_name, sector, activity_description]))

    # 1. Logistics company signal (+30 max)
    logistics_matches = _count_keyword_matches(combined_text, LOGISTICS_KEYWORDS)
    if logistics_matches > 0:
        score = min(30, logistics_matches * 15)
        result.signals.append({"signal": "Lojistik firması", "score": score, "matches": logistics_matches})
        result.total_score += score

    # 2. Heavy vehicle signal (+25 max)
    heavy_matches = _count_keyword_matches(combined_text, HEAVY_VEHICLE_KEYWORDS)
    if heavy_matches > 0:
        score = min(25, heavy_matches * 12)
        result.signals.append({"signal": "Çekici/kamyon sinyali", "score": score, "matches": heavy_matches})
        result.total_score += score

    # 3. Light commercial signal (+15 max)
    light_matches = _count_keyword_matches(combined_text, LIGHT_COMMERCIAL_KEYWORDS)
    if light_matches > 0:
        score = min(15, light_matches * 8)
        result.signals.append({"signal": "Hafif ticari araç sinyali", "score": score, "matches": light_matches})
        result.total_score += score

    # 4. Fleet signal (+20 max)
    fleet_matches = _count_keyword_matches(combined_text, FLEET_KEYWORDS)
    if fleet_matches > 0:
        score = min(20, fleet_matches * 10)
        result.signals.append({"signal": "Filo kullanıcısı sinyali", "score": score, "matches": fleet_matches})
        result.total_score += score

    # 5. Transport activity (+15 max)
    transport_matches = _count_keyword_matches(combined_text, TRANSPORT_ACTIVITY_KEYWORDS)
    if transport_matches > 0:
        score = min(15, transport_matches * 8)
        result.signals.append({"signal": "Ticari taşımacılık faaliyeti", "score": score, "matches": transport_matches})
        result.total_score += score

    # 6. Construction/mining signal (+10 max - potential for T-Way/Trakker)
    construction_matches = _count_keyword_matches(combined_text, CONSTRUCTION_KEYWORDS)
    if construction_matches > 0:
        score = min(10, construction_matches * 5)
        result.signals.append({"signal": "İnşaat/madencilik sinyali", "score": score, "matches": construction_matches})
        result.total_score += score

    # 7. Website availability (+10)
    if website:
        result.signals.append({"signal": "Aktif web sitesi", "score": 10})
        result.total_score += 10

    # 8. Contact info completeness (+5)
    if phone:
        result.signals.append({"signal": "İletişim bilgisi mevcut", "score": 5})
        result.total_score += 5

    # Cap at 100
    result.total_score = min(100, result.total_score)

    # Determine potential level
    if result.total_score >= 75:
        result.potential_level = "very_high"
    elif result.total_score >= 55:
        result.potential_level = "high"
    elif result.total_score >= 35:
        result.potential_level = "medium"
    else:
        result.potential_level = "low"

    return result
