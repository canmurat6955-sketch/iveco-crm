"""
Pydantic schemas for the vehicles module.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict, Field


# ── Vehicle Master Schemas ───────────────────────────────────────
class VehicleMasterBase(BaseModel):
    brand: str = "IVECO"
    vehicle_group: str  # Daily, Eurocargo, S-Way, X-Way, T-Way
    vehicle_sub_group: Optional[str] = None
    model_code: str
    tonnage_kg: Optional[int] = None
    wheel_type: Optional[str] = None  # single, twin
    wheel_count: Optional[int] = None
    engine_code: Optional[str] = None
    engine_power: Optional[int] = None
    engine_volume: Optional[float] = None
    transmission: Optional[str] = "Manuel"
    transmission_code: Optional[str] = "MAN"
    body_volume: Optional[float] = None
    wheelbase: Optional[int] = None
    wbs: Optional[int] = None
    equipment_level: Optional[str] = None
    usage_type: Optional[str] = None

    # Bodywork / Superstructure
    body_type: Optional[str] = None
    body_length: Optional[float] = None
    body_width: Optional[float] = None
    body_height: Optional[float] = None
    body_brand: Optional[str] = None
    body_model: Optional[str] = None
    body_price: Optional[float] = None
    body_active: Optional[bool] = True
    active: bool = True


class VehicleMasterCreate(VehicleMasterBase):
    pass


class VehicleMasterUpdate(BaseModel):
    brand: Optional[str] = None
    vehicle_group: Optional[str] = None
    vehicle_sub_group: Optional[str] = None
    model_code: Optional[str] = None
    tonnage_kg: Optional[int] = None
    wheel_type: Optional[str] = None
    wheel_count: Optional[int] = None
    engine_code: Optional[str] = None
    engine_power: Optional[int] = None
    engine_volume: Optional[float] = None
    transmission: Optional[str] = None
    transmission_code: Optional[str] = None
    body_volume: Optional[float] = None
    wheelbase: Optional[int] = None
    wbs: Optional[int] = None
    equipment_level: Optional[str] = None
    usage_type: Optional[str] = None
    body_type: Optional[str] = None
    body_length: Optional[float] = None
    body_width: Optional[float] = None
    body_height: Optional[float] = None
    body_brand: Optional[str] = None
    body_model: Optional[str] = None
    body_price: Optional[float] = None
    body_active: Optional[bool] = None
    active: Optional[bool] = None


class VehicleMasterResponse(VehicleMasterBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    display_title: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ── Customer Vehicle Interest Schemas ────────────────────────────
class CustomerVehicleInterestCreate(BaseModel):
    customer_id: Optional[int] = None
    vehicle_id: int
    interest_level: str = "medium"  # very_low, low, medium, high, purchase_ready
    purchase_timeframe: str = "1_3_months"  # immediate, 0_30_days, 1_3_months, 3_6_months, 6_12_months, unknown
    estimated_quantity: int = 1
    usage_type: Optional[str] = None
    customer_note: Optional[str] = None
    opportunity_status: str = "open"
    next_activity_date: Optional[date] = None


class CustomerVehicleInterestUpdate(BaseModel):
    vehicle_id: Optional[int] = None
    interest_level: Optional[str] = None
    purchase_timeframe: Optional[str] = None
    estimated_quantity: Optional[int] = None
    usage_type: Optional[str] = None
    customer_note: Optional[str] = None
    opportunity_status: Optional[str] = None
    last_activity_date: Optional[date] = None
    next_activity_date: Optional[date] = None


class CustomerVehicleInterestResponse(BaseModel):
    id: int
    customer_id: int
    vehicle_id: int
    interest_level: str
    purchase_timeframe: str
    estimated_quantity: int
    usage_type: Optional[str] = None
    customer_note: Optional[str] = None
    opportunity_status: str
    last_activity_date: Optional[date] = None
    next_activity_date: Optional[date] = None
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Joined fields for frontend presentation
    vehicle: Optional[VehicleMasterResponse] = None
    customer_name: Optional[str] = None
    customer_city: Optional[str] = None
    customer_phone: Optional[str] = None
    active_campaign_id: Optional[int] = None
    active_campaign_title: Optional[str] = None
    has_active_campaign: bool = False
    matching_stock_count: int = 0

    model_config = ConfigDict(from_attributes=True)


# ── Stock Schemas ────────────────────────────────────────────────
class VehicleStockCreate(BaseModel):
    vehicle_id: int
    chassis_no: Optional[str] = None
    status: str = "in_stock"  # in_stock, in_transit, reserved, sold
    location: str = "Samsun Merkez"
    year: int = 2024
    color: str = "Beyaz"
    list_price: Optional[float] = None
    currency: str = "EUR"
    notes: Optional[str] = None


class VehicleStockUpdate(BaseModel):
    vehicle_id: Optional[int] = None
    chassis_no: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    year: Optional[int] = None
    color: Optional[str] = None
    list_price: Optional[float] = None
    currency: Optional[str] = None
    notes: Optional[str] = None


class VehicleStockResponse(BaseModel):
    id: int
    vehicle_id: int
    chassis_no: Optional[str] = None
    status: str
    location: str
    year: int
    color: str
    list_price: Optional[float] = None
    currency: str
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    vehicle: Optional[VehicleMasterResponse] = None
    matching_customer_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class StockMatchCustomerItem(BaseModel):
    interest_id: int
    customer_id: int
    company_name: str
    city: Optional[str] = None
    phone: Optional[str] = None
    interest_level: str
    purchase_timeframe: str
    estimated_quantity: int
    last_contact_date: Optional[date] = None
    assigned_sales_rep: Optional[str] = None
    match_level: str  # exact, model, spec, group
    match_percentage: int
    customer_note: Optional[str] = None


class StockMatchSummaryResponse(BaseModel):
    stock_id: int
    stock_vehicle_title: str
    total_matches: int
    high_interest_count: int
    medium_interest_count: int
    low_interest_count: int
    matches: List[StockMatchCustomerItem]


# ── Parser & AI Search Schemas ───────────────────────────────────
class VehicleCodeParsed(BaseModel):
    original_code: str
    vehicle_group: str
    model_code: str
    tonnage_kg: Optional[int] = None
    tonnage_desc: Optional[str] = None
    wheel_type: Optional[str] = None
    wheel_type_desc: Optional[str] = None
    wheel_count: Optional[int] = None
    engine_power: Optional[int] = None
    engine_power_desc: Optional[str] = None
    engine_volume: Optional[float] = None
    transmission: Optional[str] = None
    wheelbase: Optional[int] = None
    wbs: Optional[int] = None
    body_volume: Optional[float] = None
    usage_type: Optional[str] = None
    equipment_level: Optional[str] = None
    matched_vehicle_id: Optional[int] = None
    summary_text: str


class AIQueryRequest(BaseModel):
    query: str


class AIQueryParsedFilter(BaseModel):
    raw_query: str
    vehicle_group: Optional[str] = None
    vehicle_sub_group: Optional[str] = None
    model_code: Optional[str] = None
    engine_power: Optional[int] = None
    body_volume: Optional[float] = None
    wheelbase: Optional[int] = None
    wbs: Optional[int] = None
    usage_type: Optional[str] = None
    wheel_count: Optional[int] = None
    equipment_level: Optional[str] = None
    city: Optional[str] = None
    days_since_contact: Optional[int] = None
    purchase_timeframe: Optional[List[str]] = None
    has_stock_match: Optional[bool] = None


class CustomerSearchResultItem(BaseModel):
    id: int
    company_name: str
    city: Optional[str] = None
    phone: Optional[str] = None
    last_contact_date: Optional[date] = None
    interest_summary: str
    interest_level: Optional[str] = None
    purchase_timeframe: Optional[str] = None
    matched_vehicle_title: Optional[str] = None
    stock_matched: bool = False
    has_campaign: bool = False


class AIQueryResponse(BaseModel):
    query: str
    parsed_filters: AIQueryParsedFilter
    total_found: int
    results: List[CustomerSearchResultItem]


# ── Cascade Selection Schemas ────────────────────────────────────
class CascadeDataResponse(BaseModel):
    groups: List[str]
    sub_groups: Dict[str, List[str]]
    volumes: Dict[str, List[float]]  # Daily / Panelvan -> [12, 16, 18]
    wheelbases: Dict[str, List[int]]  # Daily / Şasi -> [3450, 3750, 4100]
    wbs_options: Dict[str, List[int]]  # Eurocargo 150E21 -> [4185, 4455, 4815, 5175, 5670, 6570]
    equipment_options: Dict[str, List[str]]  # S-Way -> [Full, Full Plus, Diamond]
    usage_options: Dict[str, List[str]]  # T-Way -> [Hafriyat, Mikser]
    auto_suggestions: Dict[str, str]  # "Daily|Panelvan|16" -> "35S16"


# ── Opportunities & Dashboard Schemas ────────────────────────────
class OpportunityItem(BaseModel):
    interest_id: int
    customer_id: int
    company_name: str
    city: Optional[str] = None
    phone: Optional[str] = None
    vehicle_title: str
    interest_level: str
    purchase_timeframe: str
    reason: str
    action_label: str
    last_activity_date: Optional[date] = None
    campaign_title: Optional[str] = None


class TodayOpportunitiesResponse(BaseModel):
    hot_leads: List[OpportunityItem]
    stock_matches: List[OpportunityItem]
    follow_up_needed: List[OpportunityItem]
    quote_pending: List[OpportunityItem]
    campaign_opportunities: List[OpportunityItem]
    counts: Dict[str, int]


class VehicleDemandPipelineItem(BaseModel):
    vehicle_group: str
    model_or_type: str
    customer_count: int
    total_vehicle_count: int
    percentage: float


class VehiclePipelineResponse(BaseModel):
    total_demand_count: int
    group_counts: Dict[str, int]
    breakdown: List[VehicleDemandPipelineItem]


# ── Demand Reports Schemas ───────────────────────────────────────
class DemandReportItem(BaseModel):
    key: str
    label: str
    demand_count: int
    vehicle_quantity: int
    percentage: float


class VehicleDemandReportResponse(BaseModel):
    by_group: List[DemandReportItem]
    by_model: List[DemandReportItem]
    by_engine: List[DemandReportItem]
    by_wbs: List[DemandReportItem]
    by_volume: List[DemandReportItem]
    by_interest_level: List[DemandReportItem]
    by_purchase_timeframe: List[DemandReportItem]
    by_city: List[DemandReportItem]
    by_sales_rep: List[DemandReportItem]
    total_interests: int
