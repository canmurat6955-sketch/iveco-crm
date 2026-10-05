"""
FastAPI Router for Vehicles Module:
Master Data, Customer Interests, Stock, Matchmaking, AI Search, Opportunities & Reports.
"""
from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.vehicles.service import VehicleService
from app.modules.vehicles.schemas import (
    VehicleMasterCreate, VehicleMasterUpdate, VehicleMasterResponse,
    CustomerVehicleInterestCreate, CustomerVehicleInterestUpdate, CustomerVehicleInterestResponse,
    VehicleStockCreate, VehicleStockUpdate, VehicleStockResponse,
    StockMatchSummaryResponse,
    CascadeDataResponse, VehicleCodeParsed,
    AIQueryRequest, AIQueryResponse,
    TodayOpportunitiesResponse, VehiclePipelineResponse, VehicleDemandReportResponse
)
from app.modules.vehicles.parser import VehicleCodeParser

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])


# ── 1. Cascade Options & Code Parser ──────────────────────────────
@router.get("/cascade-data", response_model=CascadeDataResponse)
def get_cascade_data(db: Session = Depends(get_db)):
    """Provides dynamic cascade options for the vehicle selector modal."""
    return VehicleService(db).get_cascade_data()


@router.get("/parse-code", response_model=VehicleCodeParsed)
def parse_vehicle_code(code: str = Query(..., description="IVECO model kodu veya metni")):
    """Parses an IVECO model code (e.g. 35C16, 72C16 4350) into technical specs."""
    return VehicleCodeParser.parse_code(code)


# ── 2. Master Vehicle Data Endpoints ─────────────────────────────
@router.get("/master", response_model=List[VehicleMasterResponse])
def list_master_vehicles(
    vehicle_group: Optional[str] = Query(None),
    model_code: Optional[str] = Query(None),
    active_only: bool = Query(True),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Lists vehicle master records with optional filtering."""
    return VehicleService(db).list_master_vehicles(
        vehicle_group=vehicle_group,
        model_code=model_code,
        active_only=active_only,
        skip=skip,
        limit=limit
    )


@router.post("/master", response_model=VehicleMasterResponse, status_code=status.HTTP_201_CREATED)
def create_master_vehicle(
    data: VehicleMasterCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Creates a new vehicle definition in the master catalog."""
    try:
        return VehicleService(db).create_master_vehicle(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/master/{vehicle_id}", response_model=VehicleMasterResponse)
def update_master_vehicle(
    vehicle_id: int,
    data: VehicleMasterUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Updates an existing vehicle in master catalog."""
    try:
        return VehicleService(db).update_master_vehicle(vehicle_id, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/master/{vehicle_id}")
def delete_master_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Soft-deletes a vehicle in master catalog (active=False)."""
    try:
        return VehicleService(db).delete_master_vehicle(vehicle_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── 3. Customer Vehicle Interests ────────────────────────────────
@router.get("/customers/{customer_id}/interests", response_model=List[CustomerVehicleInterestResponse])
def get_customer_interests(
    customer_id: int,
    db: Session = Depends(get_db)
):
    """Returns all vehicle interests for a specific customer."""
    return VehicleService(db).get_customer_interests(customer_id)


@router.post("/customers/{customer_id}/interests", response_model=CustomerVehicleInterestResponse, status_code=status.HTTP_201_CREATED)
def create_customer_interest(
    customer_id: int,
    data: CustomerVehicleInterestCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Records a new vehicle interest for a customer."""
    try:
        user_id = getattr(current_user, "id", None)
        return VehicleService(db).create_customer_interest(customer_id, data, user_id=user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/interests/{interest_id}", response_model=CustomerVehicleInterestResponse)
def update_customer_interest(
    interest_id: int,
    data: CustomerVehicleInterestUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Updates a customer's vehicle interest record."""
    try:
        return VehicleService(db).update_customer_interest(interest_id, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/interests/{interest_id}")
def delete_customer_interest(
    interest_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Deletes a customer's vehicle interest record."""
    try:
        return VehicleService(db).delete_customer_interest(interest_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/interests/cleanup-auto")
def cleanup_auto_interests(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Cleans up auto-detected vehicle interest records created from phonebook notes."""
    try:
        return VehicleService(db).cleanup_auto_interests()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── 4. Stock Management & Matchmaking ────────────────────────────
@router.get("/stock", response_model=List[VehicleStockResponse])
def list_stock(
    status: Optional[str] = Query(None),
    vehicle_group: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Lists vehicles in stock with matching customer counts."""
    return VehicleService(db).list_stock(status=status, vehicle_group=vehicle_group, location=location)


@router.post("/stock", response_model=VehicleStockResponse, status_code=status.HTTP_201_CREATED)
def create_stock(
    data: VehicleStockCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Creates a physical stock inventory vehicle."""
    return VehicleService(db).create_stock(data)


@router.put("/stock/{stock_id}", response_model=VehicleStockResponse)
def update_stock(
    stock_id: int,
    data: VehicleStockUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Updates a stock vehicle."""
    try:
        return VehicleService(db).update_stock(stock_id, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/stock/{stock_id}")
def delete_stock(
    stock_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Deletes a stock vehicle record."""
    try:
        return VehicleService(db).delete_stock(stock_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/stock/{stock_id}/matching-customers", response_model=StockMatchSummaryResponse)
def get_stock_matching_customers(
    stock_id: int,
    db: Session = Depends(get_db)
):
    """
    Returns all customers interested in this stock vehicle,
    categorized by matching levels (exact, model, spec, group).
    """
    try:
        return VehicleService(db).get_stock_matching_customers(stock_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── 5. AI Search & Natural Language Query ────────────────────────
@router.post("/ai-search", response_model=AIQueryResponse)
def ai_search(
    body: AIQueryRequest,
    db: Session = Depends(get_db)
):
    """
    Executes a natural language AI query across customer vehicle demands.
    Supports queries like: '16 m3 panelvan', '35C16 3750', 'Eurocargo 150E21 5175'.
    """
    return VehicleService(db).ai_search(body.query)


# ── 6. Opportunities & Dashboard Endpoints ───────────────────────
@router.get("/opportunities/today", response_model=TodayOpportunitiesResponse)
def get_today_opportunities(db: Session = Depends(get_db)):
    """Returns today's high-impact vehicle sales opportunities."""
    return VehicleService(db).get_today_opportunities()


@router.get("/pipeline", response_model=VehiclePipelineResponse)
def get_vehicle_pipeline(db: Session = Depends(get_db)):
    """Calculates dynamic customer demand pipeline distribution across vehicle groups."""
    return VehicleService(db).get_vehicle_pipeline()


# ── 7. Demand Intelligence Reports ───────────────────────────────
@router.get("/reports/demand", response_model=VehicleDemandReportResponse)
def get_demand_reports(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """Generates demand intelligence reports across groups, models, engines, and cities."""
    return VehicleService(db).get_demand_reports(date_from=date_from, date_to=date_to)
