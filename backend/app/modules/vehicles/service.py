"""
Vehicle Service: Business logic for Master Data, Customer Interests, Stock,
Matchmaking, Opportunities, AI Search, and Demand Reporting.
"""
from datetime import datetime, timezone, date, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_, and_, desc, asc

from app.modules.vehicles.models import VehicleMaster, CustomerVehicleInterest, VehicleStock
from app.modules.vehicles.schemas import (
    VehicleMasterCreate, VehicleMasterUpdate, VehicleMasterResponse,
    CustomerVehicleInterestCreate, CustomerVehicleInterestUpdate, CustomerVehicleInterestResponse,
    VehicleStockCreate, VehicleStockUpdate, VehicleStockResponse,
    StockMatchSummaryResponse, StockMatchCustomerItem,
    CascadeDataResponse, TodayOpportunitiesResponse, OpportunityItem,
    VehiclePipelineResponse, VehicleDemandPipelineItem,
    VehicleDemandReportResponse, DemandReportItem,
    AIQueryResponse, AIQueryParsedFilter, CustomerSearchResultItem
)
from app.modules.vehicles.parser import VehicleCodeParser, VehicleAIQueryParser
from app.modules.crm.models import Customer
from app.modules.campaigns.models import Campaign
from app.modules.auth.models import User


class VehicleService:
    def __init__(self, db: Session):
        self.db = db

    # ── 1. Seed Master Data ───────────────────────────────────────
    def seed_master_data(self) -> int:
        """
        Populates initial IVECO vehicle master records if empty.
        Covers Daily, Eurocargo, S-Way, X-Way, T-Way.
        """
        existing_count = self.db.query(VehicleMaster).count()
        if existing_count > 0:
            return existing_count

        vehicles_to_seed = [
            # ── DAILY PANELVAN ──
            dict(vehicle_group="Daily", vehicle_sub_group="Panelvan", model_code="35S16",
                 tonnage_kg=3500, wheel_type="single", wheel_count=4, engine_code="F1A", engine_power=160,
                 engine_volume=2.3, transmission="Manuel", transmission_code="MAN", body_volume=12.0,
                 usage_type="Şehir İçi Dağıtım / Kargo"),
            dict(vehicle_group="Daily", vehicle_sub_group="Panelvan", model_code="35S16",
                 tonnage_kg=3500, wheel_type="single", wheel_count=4, engine_code="F1A", engine_power=160,
                 engine_volume=2.3, transmission="Manuel", transmission_code="MAN", body_volume=16.0,
                 usage_type="Şehir İçi Dağıtım / Kargo"),
            dict(vehicle_group="Daily", vehicle_sub_group="Panelvan", model_code="35C16",
                 tonnage_kg=3500, wheel_type="twin", wheel_count=6, engine_code="F1A", engine_power=160,
                 engine_volume=2.3, transmission="Manuel", transmission_code="MAN", body_volume=18.0,
                 usage_type="Ağır Yük Dağıtım"),
            
            # ── DAILY PANELVAN KAMYON (70C18) ──
            dict(vehicle_group="Daily", vehicle_sub_group="Panelvan Kamyon", model_code="70C18",
                 tonnage_kg=7000, wheel_type="twin", wheel_count=6, engine_code="F1C", engine_power=180,
                 engine_volume=3.0, transmission="Manuel", transmission_code="MAN", body_volume=19.6,
                 usage_type="Ağır Dağıtım"),
            dict(vehicle_group="Daily", vehicle_sub_group="Panelvan Kamyon", model_code="70C18",
                 tonnage_kg=7000, wheel_type="twin", wheel_count=6, engine_code="F1C", engine_power=180,
                 engine_volume=3.0, transmission="Otomatik (A8)", transmission_code="A8", body_volume=19.6,
                 usage_type="Ağır Dağıtım / Konfor"),

            # ── DAILY ŞASİ KAMYONET (35S16) ──
            dict(vehicle_group="Daily", vehicle_sub_group="Şasi Kamyonet", model_code="35S16",
                 tonnage_kg=3500, wheel_type="single", wheel_count=4, engine_code="F1A", engine_power=160,
                 engine_volume=2.3, transmission="Manuel", transmission_code="MAN", wheelbase=3450,
                 usage_type="Hafif Ticari Taşımacılık"),
            dict(vehicle_group="Daily", vehicle_sub_group="Şasi Kamyonet", model_code="35S16",
                 tonnage_kg=3500, wheel_type="single", wheel_count=4, engine_code="F1A", engine_power=160,
                 engine_volume=2.3, transmission="Manuel", transmission_code="MAN", wheelbase=3750,
                 usage_type="Hafif Ticari Taşımacılık"),

            # ── DAILY ŞASİ KAMYONET (35C16) ──
            dict(vehicle_group="Daily", vehicle_sub_group="Şasi Kamyonet", model_code="35C16",
                 tonnage_kg=3500, wheel_type="twin", wheel_count=6, engine_code="F1A", engine_power=160,
                 engine_volume=2.3, transmission="Manuel", transmission_code="MAN", wheelbase=3450,
                 usage_type="Kasalı Yük Taşıma"),
            dict(vehicle_group="Daily", vehicle_sub_group="Şasi Kamyonet", model_code="35C16",
                 tonnage_kg=3500, wheel_type="twin", wheel_count=6, engine_code="F1A", engine_power=160,
                 engine_volume=2.3, transmission="Manuel", transmission_code="MAN", wheelbase=3750,
                 usage_type="Kasalı Yük Taşıma"),
            dict(vehicle_group="Daily", vehicle_sub_group="Şasi Kamyonet", model_code="35C16",
                 tonnage_kg=3500, wheel_type="twin", wheel_count=6, engine_code="F1A", engine_power=160,
                 engine_volume=2.3, transmission="Manuel", transmission_code="MAN", wheelbase=4100,
                 usage_type="Uzun Kasa Taşımacılık"),

            # ── DAILY RİGİT KAMYON (72C16) ──
            dict(vehicle_group="Daily", vehicle_sub_group="Rigit Kamyon", model_code="72C16",
                 tonnage_kg=7200, wheel_type="twin", wheel_count=6, engine_code="F1C", engine_power=160,
                 engine_volume=3.0, transmission="Manuel", transmission_code="MAN", wheelbase=3750,
                 usage_type="Şehirlerarası Dağıtım"),
            dict(vehicle_group="Daily", vehicle_sub_group="Rigit Kamyon", model_code="72C16",
                 tonnage_kg=7200, wheel_type="twin", wheel_count=6, engine_code="F1C", engine_power=160,
                 engine_volume=3.0, transmission="Manuel", transmission_code="MAN", wheelbase=4350,
                 usage_type="Şehirlerarası Dağıtım / Kasa"),
            dict(vehicle_group="Daily", vehicle_sub_group="Rigit Kamyon", model_code="72C16",
                 tonnage_kg=7200, wheel_type="twin", wheel_count=6, engine_code="F1C", engine_power=160,
                 engine_volume=3.0, transmission="Manuel", transmission_code="MAN", wheelbase=4750,
                 usage_type="Uzun Yol Yük Taşımacılığı"),

            # ── EUROCARGO 100E19 ──
            dict(vehicle_group="Eurocargo", vehicle_sub_group="Kamyon", model_code="100E19",
                 tonnage_kg=10000, wheel_type="twin", wheel_count=6, engine_code="Tector 5", engine_power=190,
                 engine_volume=4.5, transmission="Manuel", transmission_code="MAN", wbs=3690,
                 usage_type="Orta Dağıtım"),

            # ── EUROCARGO 120E19 ──
            dict(vehicle_group="Eurocargo", vehicle_sub_group="Kamyon", model_code="120E19",
                 tonnage_kg=12000, wheel_type="twin", wheel_count=6, engine_code="Tector 5", engine_power=190,
                 engine_volume=4.5, transmission="Manuel", transmission_code="MAN", wbs=3690,
                 usage_type="Orta Dağıtım"),
            dict(vehicle_group="Eurocargo", vehicle_sub_group="Kamyon", model_code="120E19",
                 tonnage_kg=12000, wheel_type="twin", wheel_count=6, engine_code="Tector 5", engine_power=190,
                 engine_volume=4.5, transmission="Manuel", transmission_code="MAN", wbs=4185,
                 usage_type="Orta Dağıtım"),

            # ── EUROCARGO 150E21 ──
            dict(vehicle_group="Eurocargo", vehicle_sub_group="Kamyon", model_code="150E21",
                 tonnage_kg=15000, wheel_type="twin", wheel_count=6, engine_code="Tector 7", engine_power=210,
                 engine_volume=6.7, transmission="Manuel", transmission_code="MAN", wbs=4185,
                 usage_type="Bölgesel Nakliyat"),
            dict(vehicle_group="Eurocargo", vehicle_sub_group="Kamyon", model_code="150E21",
                 tonnage_kg=15000, wheel_type="twin", wheel_count=6, engine_code="Tector 7", engine_power=210,
                 engine_volume=6.7, transmission="Manuel", transmission_code="MAN", wbs=4455,
                 usage_type="Bölgesel Nakliyat"),
            dict(vehicle_group="Eurocargo", vehicle_sub_group="Kamyon", model_code="150E21",
                 tonnage_kg=15000, wheel_type="twin", wheel_count=6, engine_code="Tector 7", engine_power=210,
                 engine_volume=6.7, transmission="Manuel", transmission_code="MAN", wbs=4815,
                 usage_type="Bölgesel Nakliyat"),
            dict(vehicle_group="Eurocargo", vehicle_sub_group="Kamyon", model_code="150E21",
                 tonnage_kg=15000, wheel_type="twin", wheel_count=6, engine_code="Tector 7", engine_power=210,
                 engine_volume=6.7, transmission="Manuel", transmission_code="MAN", wbs=5175,
                 usage_type="Uzun Şasi Nakliye"),
            dict(vehicle_group="Eurocargo", vehicle_sub_group="Kamyon", model_code="150E21",
                 tonnage_kg=15000, wheel_type="twin", wheel_count=6, engine_code="Tector 7", engine_power=210,
                 engine_volume=6.7, transmission="Manuel", transmission_code="MAN", wbs=5670,
                 usage_type="Ekstra Uzun Nakliye"),
            dict(vehicle_group="Eurocargo", vehicle_sub_group="Kamyon", model_code="150E21",
                 tonnage_kg=15000, wheel_type="twin", wheel_count=6, engine_code="Tector 7", engine_power=210,
                 engine_volume=6.7, transmission="Manuel", transmission_code="MAN", wbs=6570,
                 usage_type="Maksimum Hacim Nakliye"),

            # ── EUROCARGO 160E32 ──
            dict(vehicle_group="Eurocargo", vehicle_sub_group="Kamyon", model_code="160E32",
                 tonnage_kg=16000, wheel_type="twin", wheel_count=6, engine_code="Tector 7", engine_power=320,
                 engine_volume=6.7, transmission="Manuel", transmission_code="MAN", wbs=5175,
                 usage_type="Ağır Dağıtım"),
            dict(vehicle_group="Eurocargo", vehicle_sub_group="Kamyon", model_code="160E32",
                 tonnage_kg=16000, wheel_type="twin", wheel_count=6, engine_code="Tector 7", engine_power=320,
                 engine_volume=6.7, transmission="Manuel", transmission_code="MAN", wbs=5670,
                 usage_type="Ağır Dağıtım"),
            dict(vehicle_group="Eurocargo", vehicle_sub_group="Kamyon", model_code="160E32",
                 tonnage_kg=16000, wheel_type="twin", wheel_count=6, engine_code="Tector 7", engine_power=320,
                 engine_volume=6.7, transmission="Manuel", transmission_code="MAN", wbs=6570,
                 usage_type="Ağır Dağıtım"),

            # ── S-WAY (500 BG) ──
            dict(vehicle_group="S-Way", vehicle_sub_group="Çekici", model_code="500",
                 tonnage_kg=18000, wheel_type="twin", wheel_count=6, engine_code="Cursor 13", engine_power=500,
                 engine_volume=12.9, transmission="HI-TRONIX", transmission_code="AUTO", equipment_level="Full",
                 usage_type="Uluslararası Nakliye"),
            dict(vehicle_group="S-Way", vehicle_sub_group="Çekici", model_code="500",
                 tonnage_kg=18000, wheel_type="twin", wheel_count=6, engine_code="Cursor 13", engine_power=500,
                 engine_volume=12.9, transmission="HI-TRONIX", transmission_code="AUTO", equipment_level="Full Plus",
                 usage_type="Uluslararası Nakliye"),
            dict(vehicle_group="S-Way", vehicle_sub_group="Çekici", model_code="500",
                 tonnage_kg=18000, wheel_type="twin", wheel_count=6, engine_code="Cursor 13", engine_power=500,
                 engine_volume=12.9, transmission="HI-TRONIX", transmission_code="AUTO", equipment_level="Diamond",
                 usage_type="Lüks Uzun Yol Nakliye"),

            # ── S-WAY (580 BG) ──
            dict(vehicle_group="S-Way", vehicle_sub_group="Çekici", model_code="580",
                 tonnage_kg=18000, wheel_type="twin", wheel_count=6, engine_code="Cursor 13", engine_power=580,
                 engine_volume=12.9, transmission="HI-TRONIX", transmission_code="AUTO", equipment_level="Full",
                 usage_type="Ağır Yol Nakliye"),
            dict(vehicle_group="S-Way", vehicle_sub_group="Çekici", model_code="580",
                 tonnage_kg=18000, wheel_type="twin", wheel_count=6, engine_code="Cursor 13", engine_power=580,
                 engine_volume=12.9, transmission="HI-TRONIX", transmission_code="AUTO", equipment_level="Full Plus",
                 usage_type="Ağır Yol Nakliye"),
            dict(vehicle_group="S-Way", vehicle_sub_group="Çekici", model_code="580",
                 tonnage_kg=18000, wheel_type="twin", wheel_count=6, engine_code="Cursor 13", engine_power=580,
                 engine_volume=12.9, transmission="HI-TRONIX", transmission_code="AUTO", equipment_level="Diamond",
                 usage_type="VIP Ağır Yol Taşımacılık"),

            # ── X-WAY ──
            dict(vehicle_group="X-Way", vehicle_sub_group="Rigit", model_code="Rigit",
                 tonnage_kg=26000, wheel_type="twin", wheel_count=6, engine_code="Cursor 11", engine_power=480,
                 engine_volume=11.1, transmission="HI-TRONIX", transmission_code="AUTO",
                 usage_type="Şantiye / Karma Yol"),
            dict(vehicle_group="X-Way", vehicle_sub_group="Çekici", model_code="Çekici",
                 tonnage_kg=18000, wheel_type="twin", wheel_count=6, engine_code="Cursor 11", engine_power=480,
                 engine_volume=11.1, transmission="HI-TRONIX", transmission_code="AUTO",
                 usage_type="Şantiye / Damper Çekici"),

            # ── T-WAY HAFRİYAT ──
            dict(vehicle_group="T-Way", vehicle_sub_group="Hafriyat", model_code="T-Way Hafriyat",
                 tonnage_kg=33000, wheel_type="twin", wheel_count=10, engine_code="Cursor 13", engine_power=540,
                 engine_volume=12.9, transmission="HI-TRONIX", transmission_code="AUTO",
                 usage_type="Hafriyat"),
            dict(vehicle_group="T-Way", vehicle_sub_group="Hafriyat", model_code="T-Way Hafriyat",
                 tonnage_kg=41000, wheel_type="twin", wheel_count=12, engine_code="Cursor 13", engine_power=540,
                 engine_volume=12.9, transmission="HI-TRONIX", transmission_code="AUTO",
                 usage_type="Hafriyat"),

            # ── T-WAY MİKSER ──
            dict(vehicle_group="T-Way", vehicle_sub_group="Mikser", model_code="T-Way Mikser",
                 tonnage_kg=33000, wheel_type="twin", wheel_count=10, engine_code="Cursor 11", engine_power=460,
                 engine_volume=11.1, transmission="HI-TRONIX", transmission_code="AUTO",
                 usage_type="Mikser"),
            dict(vehicle_group="T-Way", vehicle_sub_group="Mikser", model_code="T-Way Mikser",
                 tonnage_kg=41000, wheel_type="twin", wheel_count=12, engine_code="Cursor 11", engine_power=460,
                 engine_volume=11.1, transmission="HI-TRONIX", transmission_code="AUTO",
                 usage_type="Mikser"),
        ]

        created = 0
        for item in vehicles_to_seed:
            try:
                vm = VehicleMaster(**item)
                self.db.add(vm)
                self.db.commit()
                created += 1
            except Exception:
                self.db.rollback()

        # Seed initial stock examples if empty
        if self.db.query(VehicleStock).count() == 0:
            stock_35c16 = self.db.query(VehicleMaster).filter(
                VehicleMaster.model_code == "35C16",
                VehicleMaster.wheelbase == 3750
            ).first()
            if stock_35c16:
                self.db.add(VehicleStock(
                    vehicle_id=stock_35c16.id,
                    chassis_no="ZCF35C16SAMSUN01",
                    status="in_stock",
                    location="Samsun Merkez Bayi",
                    year=2024,
                    color="Beyaz",
                    list_price=42500.0,
                    currency="EUR",
                    notes="Hemen teslime hazır açık sac kasa uyumlu şasi"
                ))
            
            stock_150e21 = self.db.query(VehicleMaster).filter(
                VehicleMaster.model_code == "150E21",
                VehicleMaster.wbs == 5175
            ).first()
            if stock_150e21:
                self.db.add(VehicleStock(
                    vehicle_id=stock_150e21.id,
                    chassis_no="ZCF150E21CORUM02",
                    status="in_stock",
                    location="Çorum Şube",
                    year=2024,
                    color="Kırmızı",
                    list_price=89000.0,
                    currency="EUR",
                    notes="Fabrikadan yeni intikal etti, 5175 WBS uzun şasi"
                ))
            self.db.commit()

        return created

    # ── 2. Cascade Selection Data ─────────────────────────────────
    def get_cascade_data(self) -> CascadeDataResponse:
        """
        Provides dynamic options for the cascade vehicle selector modal.
        """
        all_v = self.db.query(VehicleMaster).filter(VehicleMaster.active == True).all()

        groups = sorted(list(set(v.vehicle_group for v in all_v)))
        sub_groups: Dict[str, List[str]] = {}
        volumes: Dict[str, List[float]] = {}
        wheelbases: Dict[str, List[int]] = {}
        wbs_options: Dict[str, List[int]] = {}
        equipment_options: Dict[str, List[str]] = {}
        usage_options: Dict[str, List[str]] = {}
        auto_suggestions: Dict[str, str] = {
            "Daily|Panelvan|12": "35S16",
            "Daily|Panelvan|16": "35S16",
            "Daily|Panelvan|18": "35C16",
        }

        for v in all_v:
            if v.vehicle_group not in sub_groups:
                sub_groups[v.vehicle_group] = []
            if v.vehicle_sub_group and v.vehicle_sub_group not in sub_groups[v.vehicle_group]:
                sub_groups[v.vehicle_group].append(v.vehicle_sub_group)

            # Volumes
            if v.body_volume:
                k = f"{v.vehicle_group}|{v.vehicle_sub_group}"
                if k not in volumes:
                    volumes[k] = []
                if v.body_volume not in volumes[k]:
                    volumes[k].append(v.body_volume)

            # Wheelbases
            if v.wheelbase:
                k = f"{v.vehicle_group}|{v.vehicle_sub_group}"
                if k not in wheelbases:
                    wheelbases[k] = []
                if v.wheelbase not in wheelbases[k]:
                    wheelbases[k].append(v.wheelbase)

            # WBS
            if v.wbs:
                k = f"{v.vehicle_group}|{v.model_code}"
                if k not in wbs_options:
                    wbs_options[k] = []
                if v.wbs not in wbs_options[k]:
                    wbs_options[k].append(v.wbs)

            # Equipment
            if v.equipment_level:
                k = f"{v.vehicle_group}|{v.model_code}"
                if k not in equipment_options:
                    equipment_options[k] = []
                if v.equipment_level not in equipment_options[k]:
                    equipment_options[k].append(v.equipment_level)

            # Usage
            if v.usage_type:
                k = f"{v.vehicle_group}"
                if k not in usage_options:
                    usage_options[k] = []
                if v.usage_type not in usage_options[k]:
                    usage_options[k].append(v.usage_type)

        return CascadeDataResponse(
            groups=groups,
            sub_groups=sub_groups,
            volumes=volumes,
            wheelbases=wheelbases,
            wbs_options=wbs_options,
            equipment_options=equipment_options,
            usage_options=usage_options,
            auto_suggestions=auto_suggestions
        )

    # ── 3. Vehicle Master CRUD ────────────────────────────────────
    def list_master_vehicles(
        self,
        vehicle_group: Optional[str] = None,
        model_code: Optional[str] = None,
        active_only: bool = True,
        skip: int = 0,
        limit: int = 100
    ) -> List[VehicleMasterResponse]:
        q = self.db.query(VehicleMaster)
        if active_only:
            q = q.filter(VehicleMaster.active == True)
        if vehicle_group:
            q = q.filter(VehicleMaster.vehicle_group.ilike(f"%{vehicle_group}%"))
        if model_code:
            q = q.filter(VehicleMaster.model_code.ilike(f"%{model_code}%"))

        q = q.order_by(VehicleMaster.vehicle_group, VehicleMaster.model_code, VehicleMaster.wheelbase)
        items = q.offset(skip).limit(limit).all()

        results = []
        for it in items:
            resp = VehicleMasterResponse.model_validate(it)
            resp.display_title = self._format_vehicle_title(it)
            results.append(resp)
        return results

    def create_master_vehicle(self, data: VehicleMasterCreate) -> VehicleMasterResponse:
        vm = VehicleMaster(**data.model_dump())
        self.db.add(vm)
        self.db.commit()
        self.db.refresh(vm)
        resp = VehicleMasterResponse.model_validate(vm)
        resp.display_title = self._format_vehicle_title(vm)
        return resp

    def update_master_vehicle(self, vehicle_id: int, data: VehicleMasterUpdate) -> VehicleMasterResponse:
        vm = self.db.query(VehicleMaster).filter(VehicleMaster.id == vehicle_id).first()
        if not vm:
            raise ValueError(f"VehicleMaster id={vehicle_id} bulunamadı")

        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(vm, k, v)

        self.db.commit()
        self.db.refresh(vm)
        resp = VehicleMasterResponse.model_validate(vm)
        resp.display_title = self._format_vehicle_title(vm)
        return resp

    def delete_master_vehicle(self, vehicle_id: int) -> Dict[str, Any]:
        """Soft delete by default to maintain historical customer integrity."""
        vm = self.db.query(VehicleMaster).filter(VehicleMaster.id == vehicle_id).first()
        if not vm:
            raise ValueError(f"VehicleMaster id={vehicle_id} bulunamadı")

        vm.active = False
        self.db.commit()
        return {"message": "Araç pasife alındı (soft-delete)", "id": vehicle_id, "active": False}

    # ── 4. Customer Vehicle Interests ─────────────────────────────
    def get_customer_interests(self, customer_id: int) -> List[CustomerVehicleInterestResponse]:
        interests = self.db.query(CustomerVehicleInterest).options(
            joinedload(CustomerVehicleInterest.vehicle),
            joinedload(CustomerVehicleInterest.customer)
        ).filter(
            CustomerVehicleInterest.customer_id == customer_id
        ).order_by(desc(CustomerVehicleInterest.created_at)).all()

        results = []
        # Preload active campaigns
        active_campaigns = self.db.query(Campaign).filter(Campaign.is_active == True).all()

        for inter in interests:
            v_resp = None
            if inter.vehicle:
                v_resp = VehicleMasterResponse.model_validate(inter.vehicle)
                v_resp.display_title = self._format_vehicle_title(inter.vehicle)

            # Check campaign match
            matched_camp = self._find_matching_campaign(inter.vehicle, active_campaigns)

            # Check matching stock
            stock_count = 0
            if inter.vehicle:
                stock_count = self.db.query(VehicleStock).filter(
                    VehicleStock.vehicle_id == inter.vehicle.id,
                    VehicleStock.status == "in_stock"
                ).count()

            res = CustomerVehicleInterestResponse(
                id=inter.id,
                customer_id=inter.customer_id,
                vehicle_id=inter.vehicle_id,
                interest_level=inter.interest_level,
                purchase_timeframe=inter.purchase_timeframe,
                estimated_quantity=inter.estimated_quantity,
                usage_type=inter.usage_type,
                customer_note=inter.customer_note,
                opportunity_status=inter.opportunity_status,
                last_activity_date=inter.last_activity_date,
                next_activity_date=inter.next_activity_date,
                created_by=inter.created_by,
                created_at=inter.created_at,
                updated_at=inter.updated_at,
                vehicle=v_resp,
                customer_name=inter.customer.company_name if inter.customer else None,
                customer_city=inter.customer.city if inter.customer else None,
                customer_phone=inter.customer.phone if inter.customer else None,
                active_campaign_id=matched_camp.id if matched_camp else None,
                active_campaign_title=matched_camp.title if matched_camp else None,
                has_active_campaign=bool(matched_camp),
                matching_stock_count=stock_count
            )
            results.append(res)
        return results

    def create_customer_interest(
        self,
        customer_id: int,
        data: CustomerVehicleInterestCreate,
        user_id: Optional[int] = None
    ) -> CustomerVehicleInterestResponse:
        cust = self.db.query(Customer).filter(Customer.id == customer_id).first()
        if not cust:
            raise ValueError(f"Müşteri id={customer_id} bulunamadı")

        veh = self.db.query(VehicleMaster).filter(VehicleMaster.id == data.vehicle_id).first()
        if not veh:
            raise ValueError(f"Araç id={data.vehicle_id} bulunamadı")

        interest = CustomerVehicleInterest(
            customer_id=customer_id,
            vehicle_id=data.vehicle_id,
            interest_level=data.interest_level,
            purchase_timeframe=data.purchase_timeframe,
            estimated_quantity=data.estimated_quantity or 1,
            usage_type=data.usage_type or veh.usage_type,
            customer_note=data.customer_note,
            opportunity_status=data.opportunity_status or "open",
            last_activity_date=date.today(),
            next_activity_date=data.next_activity_date or (date.today() + timedelta(days=3)),
            created_by=user_id
        )
        self.db.add(interest)
        self.db.commit()
        self.db.refresh(interest)

        # Update customer last_contact_date
        cust.last_contact_date = date.today()
        self.db.commit()

        return self.get_customer_interests(customer_id)[0]

    def update_customer_interest(
        self,
        interest_id: int,
        data: CustomerVehicleInterestUpdate
    ) -> CustomerVehicleInterestResponse:
        interest = self.db.query(CustomerVehicleInterest).filter(CustomerVehicleInterest.id == interest_id).first()
        if not interest:
            raise ValueError(f"İlgi kaydı id={interest_id} bulunamadı")

        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(interest, k, v)

        self.db.commit()
        self.db.refresh(interest)
        interests = self.get_customer_interests(interest.customer_id)
        for it in interests:
            if it.id == interest_id:
                return it
        return interests[0]

    def delete_customer_interest(self, interest_id: int) -> Dict[str, Any]:
        interest = self.db.query(CustomerVehicleInterest).filter(CustomerVehicleInterest.id == interest_id).first()
        if not interest:
            raise ValueError(f"İlgi kaydı id={interest_id} bulunamadı")

        self.db.delete(interest)
        self.db.commit()
        return {"message": "Araç ilgisi silindi", "id": interest_id}

    # ── 5. Stock Management & Matchmaking ─────────────────────────
    def list_stock(
        self,
        status: Optional[str] = None,
        vehicle_group: Optional[str] = None,
        location: Optional[str] = None
    ) -> List[VehicleStockResponse]:
        q = self.db.query(VehicleStock).options(joinedload(VehicleStock.vehicle))
        if status:
            q = q.filter(VehicleStock.status == status)
        if location:
            q = q.filter(VehicleStock.location.ilike(f"%{location}%"))
        if vehicle_group:
            q = q.join(VehicleMaster).filter(VehicleMaster.vehicle_group == vehicle_group)

        items = q.order_by(desc(VehicleStock.created_at)).all()
        results = []
        for it in items:
            v_resp = None
            if it.vehicle:
                v_resp = VehicleMasterResponse.model_validate(it.vehicle)
                v_resp.display_title = self._format_vehicle_title(it.vehicle)

            # Count potential customers
            matching_count = self.db.query(CustomerVehicleInterest).filter(
                CustomerVehicleInterest.vehicle_id == it.vehicle_id
            ).count()

            res = VehicleStockResponse(
                id=it.id,
                vehicle_id=it.vehicle_id,
                chassis_no=it.chassis_no,
                status=it.status,
                location=it.location,
                year=it.year,
                color=it.color,
                list_price=it.list_price,
                currency=it.currency,
                notes=it.notes,
                created_at=it.created_at,
                vehicle=v_resp,
                matching_customer_count=matching_count
            )
            results.append(res)
        return results

    def create_stock(self, data: VehicleStockCreate) -> VehicleStockResponse:
        st = VehicleStock(**data.model_dump())
        self.db.add(st)
        self.db.commit()
        self.db.refresh(st)
        return self.list_stock(status=st.status)[0]

    def update_stock(self, stock_id: int, data: VehicleStockUpdate) -> VehicleStockResponse:
        st = self.db.query(VehicleStock).filter(VehicleStock.id == stock_id).first()
        if not st:
            raise ValueError(f"Stok aracı id={stock_id} bulunamadı")

        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(st, k, v)

        self.db.commit()
        self.db.refresh(st)
        return self.list_stock()[0]

    def delete_stock(self, stock_id: int) -> Dict[str, Any]:
        st = self.db.query(VehicleStock).filter(VehicleStock.id == stock_id).first()
        if not st:
            raise ValueError(f"Stok aracı id={stock_id} bulunamadı")
        self.db.delete(st)
        self.db.commit()
        return {"message": "Stok kaydı silindi", "id": stock_id}

    def get_stock_matching_customers(self, stock_id: int) -> StockMatchSummaryResponse:
        """
        Calculates customer matches for a stock vehicle across 4 matching tiers:
        - Exact Match (100%): Same model_code + same wheelbase/wbs/volume
        - Model Match (85%): Same model_code
        - Spec Match (70%): Same tonnage or wheel type
        - Group Match (50%): Same vehicle group
        """
        stock = self.db.query(VehicleStock).options(joinedload(VehicleStock.vehicle)).filter(VehicleStock.id == stock_id).first()
        if not stock or not stock.vehicle:
            raise ValueError(f"Stok aracı id={stock_id} bulunamadı")

        target_v = stock.vehicle
        stock_title = self._format_vehicle_title(target_v)

        # Query all customer interests
        interests = self.db.query(CustomerVehicleInterest).options(
            joinedload(CustomerVehicleInterest.customer),
            joinedload(CustomerVehicleInterest.vehicle)
        ).filter(
            CustomerVehicleInterest.opportunity_status.in_(["open", "quoted"])
        ).all()

        matches: List[StockMatchCustomerItem] = []
        high_count = 0
        med_count = 0
        low_count = 0

        for inter in interests:
            iv = inter.vehicle
            if not iv or not inter.customer:
                continue

            match_level = None
            match_pct = 0

            # Level 1: Exact Match
            if iv.id == target_v.id:
                match_level = "exact"
                match_pct = 100
            elif iv.model_code == target_v.model_code:
                if (iv.wheelbase and iv.wheelbase == target_v.wheelbase) or \
                   (iv.wbs and iv.wbs == target_v.wbs) or \
                   (iv.body_volume and iv.body_volume == target_v.body_volume):
                    match_level = "exact"
                    match_pct = 100
                else:
                    match_level = "model"
                    match_pct = 85
            elif iv.vehicle_group == target_v.vehicle_group:
                if iv.tonnage_kg and target_v.tonnage_kg and iv.tonnage_kg == target_v.tonnage_kg:
                    match_level = "spec"
                    match_pct = 70
                elif iv.wheel_type and target_v.wheel_type and iv.wheel_type == target_v.wheel_type:
                    match_level = "spec"
                    match_pct = 70
                else:
                    match_level = "group"
                    match_pct = 50

            if match_level:
                if inter.interest_level in ["high", "purchase_ready"]:
                    high_count += 1
                elif inter.interest_level == "medium":
                    med_count += 1
                else:
                    low_count += 1

                # Find assigned sales rep
                rep_name = "King (Samsun)"
                if inter.customer.assigned_to_id:
                    u = self.db.query(User).filter(User.id == inter.customer.assigned_to_id).first()
                    if u:
                        rep_name = u.full_name

                matches.append(StockMatchCustomerItem(
                    interest_id=inter.id,
                    customer_id=inter.customer_id,
                    company_name=inter.customer.company_name,
                    city=inter.customer.city,
                    phone=inter.customer.phone,
                    interest_level=inter.interest_level,
                    purchase_timeframe=inter.purchase_timeframe,
                    estimated_quantity=inter.estimated_quantity,
                    last_contact_date=inter.customer.last_contact_date,
                    assigned_sales_rep=rep_name,
                    match_level=match_level,
                    match_percentage=match_pct,
                    customer_note=inter.customer_note
                ))

        # Sort matches by match_percentage desc, then interest_level
        level_order = {"purchase_ready": 5, "high": 4, "medium": 3, "low": 2, "very_low": 1}
        matches.sort(key=lambda m: (m.match_percentage, level_order.get(m.interest_level, 0)), reverse=True)

        return StockMatchSummaryResponse(
            stock_id=stock_id,
            stock_vehicle_title=stock_title,
            total_matches=len(matches),
            high_interest_count=high_count,
            medium_interest_count=med_count,
            low_interest_count=low_count,
            matches=matches
        )

    # ── 6. Global AI Search ───────────────────────────────────────
    def ai_search(self, raw_query: str) -> AIQueryResponse:
        """
        Translates Turkish natural language into structured database query
        and returns matching customers with full vehicle interest context.
        """
        parsed_f = VehicleAIQueryParser.parse_query(raw_query)

        q = self.db.query(Customer).join(
            CustomerVehicleInterest, Customer.id == CustomerVehicleInterest.customer_id
        ).join(
            VehicleMaster, CustomerVehicleInterest.vehicle_id == VehicleMaster.id
        )

        if parsed_f.vehicle_group:
            q = q.filter(VehicleMaster.vehicle_group.ilike(f"%{parsed_f.vehicle_group}%"))

        if parsed_f.vehicle_sub_group:
            q = q.filter(VehicleMaster.vehicle_sub_group.ilike(f"%{parsed_f.vehicle_sub_group}%"))

        if parsed_f.model_code:
            q = q.filter(VehicleMaster.model_code.ilike(f"%{parsed_f.model_code}%"))

        if parsed_f.engine_power:
            q = q.filter(VehicleMaster.engine_power == parsed_f.engine_power)

        if parsed_f.body_volume:
            q = q.filter(VehicleMaster.body_volume == parsed_f.body_volume)

        if parsed_f.wheelbase:
            q = q.filter(VehicleMaster.wheelbase == parsed_f.wheelbase)

        if parsed_f.wbs:
            q = q.filter(VehicleMaster.wbs == parsed_f.wbs)

        if parsed_f.usage_type:
            q = q.filter(or_(
                VehicleMaster.usage_type.ilike(f"%{parsed_f.usage_type}%"),
                CustomerVehicleInterest.usage_type.ilike(f"%{parsed_f.usage_type}%")
            ))

        if parsed_f.wheel_count:
            q = q.filter(VehicleMaster.wheel_count == parsed_f.wheel_count)

        if parsed_f.equipment_level:
            q = q.filter(VehicleMaster.equipment_level.ilike(f"%{parsed_f.equipment_level}%"))

        if parsed_f.city:
            q = q.filter(Customer.city.ilike(f"%{parsed_f.city}%"))

        if parsed_f.purchase_timeframe:
            q = q.filter(CustomerVehicleInterest.purchase_timeframe.in_(parsed_f.purchase_timeframe))

        if parsed_f.days_since_contact:
            cutoff = date.today() - timedelta(days=parsed_f.days_since_contact)
            q = q.filter(or_(
                Customer.last_contact_date <= cutoff,
                Customer.last_contact_date.is_(None)
            ))

        if parsed_f.has_stock_match:
            stock_v_ids = [s.vehicle_id for s in self.db.query(VehicleStock).filter(VehicleStock.status == "in_stock").all()]
            q = q.filter(CustomerVehicleInterest.vehicle_id.in_(stock_v_ids))

        customers = q.distinct().limit(50).all()

        results: List[CustomerSearchResultItem] = []
        for cust in customers:
            # Get this customer's matched vehicle interests
            c_interests = self.db.query(CustomerVehicleInterest).options(
                joinedload(CustomerVehicleInterest.vehicle)
            ).filter(CustomerVehicleInterest.customer_id == cust.id).all()

            v_titles = [self._format_vehicle_title(ci.vehicle) for ci in c_interests if ci.vehicle]
            interest_summary = ", ".join(v_titles) if v_titles else "Araç İlgisi"

            primary_interest = c_interests[0] if c_interests else None
            matched_v = primary_interest.vehicle if primary_interest else None

            # Stock & campaign
            stock_matched = False
            has_campaign = False
            if matched_v:
                stock_matched = self.db.query(VehicleStock).filter(
                    VehicleStock.vehicle_id == matched_v.id,
                    VehicleStock.status == "in_stock"
                ).count() > 0
                has_campaign = self._find_matching_campaign(matched_v, self.db.query(Campaign).filter(Campaign.is_active == True).all()) is not None

            results.append(CustomerSearchResultItem(
                id=cust.id,
                company_name=cust.company_name,
                city=cust.city,
                phone=cust.phone,
                last_contact_date=cust.last_contact_date,
                interest_summary=interest_summary,
                interest_level=primary_interest.interest_level if primary_interest else None,
                purchase_timeframe=primary_interest.purchase_timeframe if primary_interest else None,
                matched_vehicle_title=self._format_vehicle_title(matched_v) if matched_v else None,
                stock_matched=stock_matched,
                has_campaign=has_campaign
            ))

        return AIQueryResponse(
            query=raw_query,
            parsed_filters=parsed_f,
            total_found=len(results),
            results=results
        )

    # ── 7. Today's Opportunities Dashboard ────────────────────────
    def get_today_opportunities(self) -> TodayOpportunitiesResponse:
        """
        Gathers daily high-priority sales triggers across:
        - Hot Leads (Satın alma yakın + Yüksek ilgi)
        - Stock Matches (Stokta olan araçlarla eşleşenler)
        - Follow-up Needed (Görüşme vakti gelenler)
        - Quote Pending (Teklif aşamasındakiler)
        - Campaign Opportunities (İlgilendiği araçta kampanya olanlar)
        """
        all_interests = self.db.query(CustomerVehicleInterest).options(
            joinedload(CustomerVehicleInterest.customer),
            joinedload(CustomerVehicleInterest.vehicle)
        ).all()

        active_stock_vehicle_ids = {
            s.vehicle_id for s in self.db.query(VehicleStock).filter(VehicleStock.status == "in_stock").all()
        }
        active_campaigns = self.db.query(Campaign).filter(Campaign.is_active == True).all()

        hot_leads: List[OpportunityItem] = []
        stock_matches: List[OpportunityItem] = []
        follow_up_needed: List[OpportunityItem] = []
        quote_pending: List[OpportunityItem] = []
        campaign_opportunities: List[OpportunityItem] = []

        today = date.today()

        for inter in all_interests:
            cust = inter.customer
            veh = inter.vehicle
            if not cust or not veh:
                continue

            v_title = self._format_vehicle_title(veh)

            # Hot leads: immediate or 0_30_days AND high or purchase_ready
            if inter.purchase_timeframe in ["immediate", "0_30_days"] and inter.interest_level in ["high", "purchase_ready"]:
                hot_leads.append(OpportunityItem(
                    interest_id=inter.id,
                    customer_id=cust.id,
                    company_name=cust.company_name,
                    city=cust.city,
                    phone=cust.phone,
                    vehicle_title=v_title,
                    interest_level=inter.interest_level,
                    purchase_timeframe=inter.purchase_timeframe,
                    reason="Satın alma kararı çok yakın ve ilgi seviyesi yüksek",
                    action_label="Hemen Ara / Teklif Sun",
                    last_activity_date=inter.last_activity_date
                ))

            # Stock matches
            if veh.id in active_stock_vehicle_ids:
                stock_matches.append(OpportunityItem(
                    interest_id=inter.id,
                    customer_id=cust.id,
                    company_name=cust.company_name,
                    city=cust.city,
                    phone=cust.phone,
                    vehicle_title=v_title,
                    interest_level=inter.interest_level,
                    purchase_timeframe=inter.purchase_timeframe,
                    reason="İlgilendiği araç hemen teslim bayii stoğunda hazır",
                    action_label="Stok Teklifi Gönder",
                    last_activity_date=inter.last_activity_date
                ))

            # Follow up needed
            needs_follow = False
            reason_str = ""
            if inter.next_activity_date and inter.next_activity_date <= today:
                needs_follow = True
                reason_str = "Planlanan takip tarihi geldi"
            elif not cust.last_contact_date or cust.last_contact_date <= (today - timedelta(days=15)):
                needs_follow = True
                reason_str = "Son 15 gündür temas kurulmadı"

            if needs_follow:
                follow_up_needed.append(OpportunityItem(
                    interest_id=inter.id,
                    customer_id=cust.id,
                    company_name=cust.company_name,
                    city=cust.city,
                    phone=cust.phone,
                    vehicle_title=v_title,
                    interest_level=inter.interest_level,
                    purchase_timeframe=inter.purchase_timeframe,
                    reason=reason_str,
                    action_label="İletişime Geç",
                    last_activity_date=inter.last_activity_date
                ))

            # Quote pending
            if inter.opportunity_status == "quoted":
                quote_pending.append(OpportunityItem(
                    interest_id=inter.id,
                    customer_id=cust.id,
                    company_name=cust.company_name,
                    city=cust.city,
                    phone=cust.phone,
                    vehicle_title=v_title,
                    interest_level=inter.interest_level,
                    purchase_timeframe=inter.purchase_timeframe,
                    reason="Teklif iletildi, müşteriden nihai karar bekleniyor",
                    action_label="Karar Takibi Yap",
                    last_activity_date=inter.last_activity_date
                ))

            # Campaign matches
            camp = self._find_matching_campaign(veh, active_campaigns)
            if camp:
                campaign_opportunities.append(OpportunityItem(
                    interest_id=inter.id,
                    customer_id=cust.id,
                    company_name=cust.company_name,
                    city=cust.city,
                    phone=cust.phone,
                    vehicle_title=v_title,
                    interest_level=inter.interest_level,
                    purchase_timeframe=inter.purchase_timeframe,
                    reason=f"Aktif Kampanya: {camp.title}",
                    action_label="Kampanya Paylaş",
                    last_activity_date=inter.last_activity_date,
                    campaign_title=camp.title
                ))

        return TodayOpportunitiesResponse(
            hot_leads=hot_leads[:10],
            stock_matches=stock_matches[:10],
            follow_up_needed=follow_up_needed[:10],
            quote_pending=quote_pending[:10],
            campaign_opportunities=campaign_opportunities[:10],
            counts={
                "hot_leads": len(hot_leads),
                "stock_matches": len(stock_matches),
                "follow_up_needed": len(follow_up_needed),
                "quote_pending": len(quote_pending),
                "campaign_opportunities": len(campaign_opportunities),
            }
        )

    # ── 8. Vehicle Pipeline Distribution ──────────────────────────
    def get_vehicle_pipeline(self) -> VehiclePipelineResponse:
        """
        Dynamically calculates customer demand distribution across vehicle groups and models.
        """
        rows = self.db.query(
            VehicleMaster.vehicle_group,
            VehicleMaster.model_code,
            func.count(CustomerVehicleInterest.id).label("demand_count"),
            func.sum(CustomerVehicleInterest.estimated_quantity).label("total_qty")
        ).join(
            CustomerVehicleInterest, VehicleMaster.id == CustomerVehicleInterest.vehicle_id
        ).group_by(
            VehicleMaster.vehicle_group, VehicleMaster.model_code
        ).all()

        total_demand = sum(r.demand_count for r in rows) or 1
        group_counts: Dict[str, int] = {}
        breakdown: List[VehicleDemandPipelineItem] = []

        for r in rows:
            group_counts[r.vehicle_group] = group_counts.get(r.vehicle_group, 0) + r.demand_count
            breakdown.append(VehicleDemandPipelineItem(
                vehicle_group=r.vehicle_group,
                model_or_type=r.model_code,
                customer_count=r.demand_count,
                total_vehicle_count=int(r.total_qty or r.demand_count),
                percentage=round((r.demand_count / total_demand) * 100, 1)
            ))

        breakdown.sort(key=lambda x: x.customer_count, reverse=True)

        return VehiclePipelineResponse(
            total_demand_count=total_demand if rows else 0,
            group_counts=group_counts,
            breakdown=breakdown
        )

    # ── 9. Demand Intelligence Reports ────────────────────────────
    def get_demand_reports(
        self,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None
    ) -> VehicleDemandReportResponse:
        """
        Generates multifaceted demand intelligence reports for administration.
        """
        base_q = self.db.query(CustomerVehicleInterest).join(VehicleMaster).join(Customer)

        if date_from:
            base_q = base_q.filter(CustomerVehicleInterest.created_at >= date_from)
        if date_to:
            base_q = base_q.filter(CustomerVehicleInterest.created_at <= date_to)

        total_interests = base_q.count() or 1

        def _aggregate_by(column, label_prefix=""):
            items = self.db.query(
                column.label("k"),
                func.count(CustomerVehicleInterest.id).label("c"),
                func.sum(CustomerVehicleInterest.estimated_quantity).label("q")
            ).select_from(CustomerVehicleInterest).join(VehicleMaster).join(Customer).group_by(column).all()

            res = []
            for it in items:
                val = str(it.k) if it.k is not None else "Belirtilmemiş"
                res.append(DemandReportItem(
                    key=val,
                    label=f"{label_prefix}{val}",
                    demand_count=it.c,
                    vehicle_quantity=int(it.q or it.c),
                    percentage=round((it.c / total_interests) * 100, 1)
                ))
            res.sort(key=lambda x: x.demand_count, reverse=True)
            return res

        by_group = _aggregate_by(VehicleMaster.vehicle_group)
        by_model = _aggregate_by(VehicleMaster.model_code)
        by_engine = _aggregate_by(VehicleMaster.engine_power, label_prefix="")
        by_wbs = _aggregate_by(VehicleMaster.wbs, label_prefix="WBS ")
        by_volume = _aggregate_by(VehicleMaster.body_volume, label_prefix="")
        by_interest_level = _aggregate_by(CustomerVehicleInterest.interest_level)
        by_purchase_timeframe = _aggregate_by(CustomerVehicleInterest.purchase_timeframe)
        by_city = _aggregate_by(Customer.city)
        by_sales_rep = _aggregate_by(Customer.assigned_to_id, label_prefix="Temsilci ID: ")

        return VehicleDemandReportResponse(
            by_group=by_group,
            by_model=by_model,
            by_engine=by_engine,
            by_wbs=by_wbs,
            by_volume=by_volume,
            by_interest_level=by_interest_level,
            by_purchase_timeframe=by_purchase_timeframe,
            by_city=by_city,
            by_sales_rep=by_sales_rep,
            total_interests=total_interests if total_interests > 1 else 0
        )

    # ── Helpers ───────────────────────────────────────────────────
    def _format_vehicle_title(self, v: Optional[VehicleMaster]) -> str:
        if not v:
            return "Bilinmeyen Araç"
        title = f"{v.vehicle_group} {v.model_code}"
        specs = []
        if v.wheelbase:
            specs.append(f"{v.wheelbase}")
        elif v.wbs:
            specs.append(f"WBS {v.wbs}")
        elif v.body_volume:
            specs.append(f"{int(v.body_volume)} m³")

        if v.equipment_level:
            specs.append(v.equipment_level)
        elif v.wheel_count and v.wheel_count > 6:
            specs.append(f"{v.wheel_count} Teker")

        if v.transmission and "Otomatik" in v.transmission:
            specs.append("A8")

        if specs:
            title += " – " + " / ".join(specs)
        return title

    def _find_matching_campaign(self, v: Optional[VehicleMaster], campaigns: List[Campaign]) -> Optional[Campaign]:
        if not v or not campaigns:
            return None

        for c in campaigns:
            if not c.is_active:
                continue
            cat = (c.category or "").lower()
            title = (c.title or "").upper()

            if v.vehicle_group == "Daily" and cat == "daily_catalog":
                return c
            elif v.vehicle_group == "Eurocargo" and cat == "eurocargo_catalog":
                return c
            elif v.vehicle_group == "S-Way" and cat == "sway_catalog":
                return c
            elif v.vehicle_group == "T-Way" and cat == "tway_catalog":
                return c
            elif v.model_code.upper() in title:
                return c
            elif cat in ["finance_campaign", "stock_vehicles"]:
                return c
        return None
