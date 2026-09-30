"""
Vehicle Code Parser and NLP AI Query Parser.
Accurately decomposes IVECO model codes, technical specs, and natural language queries.
"""
import re
from typing import Optional, Dict, Any, List
from app.modules.vehicles.schemas import VehicleCodeParsed, AIQueryParsedFilter


class VehicleCodeParser:
    """
    Deconstructs IVECO vehicle codes and spec strings into structured technical parameters.
    """

    @classmethod
    def parse_code(cls, text: str) -> VehicleCodeParsed:
        clean = text.strip()
        upper = clean.upper()

        group = "Daily"
        sub_group = None
        model_code = upper
        tonnage_kg = None
        tonnage_desc = None
        wheel_type = None
        wheel_type_desc = None
        wheel_count = 4
        engine_power = None
        engine_power_desc = None
        engine_volume = None
        transmission = "Manuel"
        wheelbase = None
        wbs = None
        body_volume = None
        usage_type = None
        equipment_level = None

        # ── 1. T-Way Analysis ──
        if "T-WAY" in upper or "TWAY" in upper:
            group = "T-Way"
            model_code = "T-Way"
            if "HAFRİYAT" in upper or "HAFRIYAT" in upper:
                usage_type = "Hafriyat"
                sub_group = "Hafriyat"
                engine_power = 540
                engine_power_desc = "540 BG"
            elif "MİKSER" in upper or "MIKSER" in upper:
                usage_type = "Mikser"
                sub_group = "Mikser"
                engine_power = 460
                engine_power_desc = "460 BG"

            if "10 TEKER" in upper or "10" in upper.split():
                wheel_count = 10
            elif "12 TEKER" in upper or "12" in upper.split():
                wheel_count = 12

            if not engine_power:
                ep_m = re.search(r"(\d{3})\s*(?:BG|HP)", upper)
                if ep_m:
                    engine_power = int(ep_m.group(1))
                    engine_power_desc = f"{engine_power} BG"

        # ── 2. X-Way Analysis ──
        elif "X-WAY" in upper or "XWAY" in upper:
            group = "X-Way"
            model_code = "X-Way"
            if "ÇEKİCİ" in upper or "CEKICI" in upper or "TRACTOR" in upper:
                sub_group = "Çekici"
                usage_type = "Çekici"
            elif "RİGİT" in upper or "RIGIT" in upper:
                sub_group = "Rigit"
                usage_type = "Rigit"

        # ── 3. S-Way Analysis ──
        elif "S-WAY" in upper or "SWAY" in upper or ("S WAY" in upper):
            group = "S-Way"
            model_code = "S-Way"
            sub_group = "Çekici"
            if "DIAMOND" in upper:
                equipment_level = "Diamond"
            elif "FULL PLUS" in upper or "FULL+" in upper:
                equipment_level = "Full Plus"
            elif "FULL" in upper:
                equipment_level = "Full"

            if "580" in upper:
                engine_power = 580
                engine_power_desc = "580 BG"
                model_code = "580"
            elif "500" in upper:
                engine_power = 500
                engine_power_desc = "500 BG"
                model_code = "500"

        # ── 4. Eurocargo Analysis ──
        elif "EUROCARGO" in upper or re.search(r"\b(100|120|150|160|180)E(19|21|32)\b", upper):
            group = "Eurocargo"
            sub_group = "Kamyon"
            ec_m = re.search(r"(100|120|150|160|180)E(19|21|32)", upper)
            if ec_m:
                tonnage_prefix = int(ec_m.group(1))
                eng_code = int(ec_m.group(2))
                model_code = f"{tonnage_prefix}E{eng_code}"
                tonnage_kg = tonnage_prefix * 100
                tonnage_desc = f"{tonnage_prefix} ({tonnage_kg} kg)"
                if eng_code == 19:
                    engine_power = 190
                elif eng_code == 21:
                    engine_power = 210
                elif eng_code == 32:
                    engine_power = 320
                engine_power_desc = f"{engine_power} BG"

            # Check for WBS
            wbs_m = re.search(r"\b(3690|4185|4455|4815|5175|5670|6570)\b", upper)
            if wbs_m:
                wbs = int(wbs_m.group(1))

        # ── 5. Daily Analysis ──
        else:
            group = "Daily"
            daily_m = re.search(r"\b(35|70|72)([SC])(16|18|21)\b", upper)
            if daily_m:
                tonnage_code = int(daily_m.group(1))
                wheel_code = daily_m.group(2)
                power_code = int(daily_m.group(3))
                model_code = f"{tonnage_code}{wheel_code}{power_code}"

                tonnage_kg = tonnage_code * 100
                tonnage_desc = f"{tonnage_kg:,} kg".replace(",", ".")

                if wheel_code == "S":
                    wheel_type = "single"
                    wheel_type_desc = "Tek Teker"
                    wheel_count = 4
                else:
                    wheel_type = "twin"
                    wheel_type_desc = "Çift Teker"
                    wheel_count = 6

                if power_code == 16:
                    engine_power = 160
                elif power_code == 18:
                    engine_power = 180
                elif power_code == 21:
                    engine_power = 210
                engine_power_desc = f"{engine_power} BG"

            # Check Panelvan Volume (12 m3, 16 m3, 18 m3)
            vol_m = re.search(r"(\d+)\s*(?:M3|M³|METREKÜP)", upper)
            if vol_m:
                body_volume = float(vol_m.group(1))
                sub_group = "Panelvan"
                if body_volume in [12.0, 16.0]:
                    if not model_code or model_code == upper:
                        model_code = "35S16"
                        tonnage_kg = 3500
                        tonnage_desc = "3.500 kg"
                        wheel_type = "single"
                        wheel_type_desc = "Tek Teker"
                        engine_power = 160
                        engine_power_desc = "160 BG"
                elif body_volume == 18.0:
                    if not model_code or model_code == upper:
                        model_code = "35C16"
                        tonnage_kg = 3500
                        tonnage_desc = "3.500 kg"
                        wheel_type = "twin"
                        wheel_type_desc = "Çift Teker"
                        engine_power = 160
                        engine_power_desc = "160 BG"

            # Check Wheelbase (3450, 3750, 4100, 4350, 4750)
            wb_m = re.search(r"\b(3450|3750|4100|4350|4750)\b", upper)
            if wb_m:
                wheelbase = int(wb_m.group(1))

            # Transmission (A8 / Otomatik)
            if "A8" in upper or "OTOMATIK" in upper or "OTOMATİK" in upper:
                transmission = "Otomatik (A8)"

            if "PANELVAN KAMYON" in upper:
                sub_group = "Panelvan Kamyon"
            elif "PANELVAN" in upper:
                sub_group = "Panelvan"
            elif "ŞASİ" in upper or "SASI" in upper:
                sub_group = "Şasi Kamyonet"
            elif "RİGİT" in upper or "RIGIT" in upper:
                sub_group = "Rigit Kamyon"

        # Build human-readable summary
        summary_parts = []
        if tonnage_desc:
            summary_parts.append(tonnage_desc)
        if wheel_type_desc:
            summary_parts.append(wheel_type_desc)
        if engine_power_desc:
            summary_parts.append(engine_power_desc)
        if wheelbase:
            summary_parts.append(f"{wheelbase} mm Dingil")
        if wbs:
            summary_parts.append(f"WBS {wbs}")
        if body_volume:
            summary_parts.append(f"{int(body_volume)} m³")
        if equipment_level:
            summary_parts.append(equipment_level)
        if usage_type:
            summary_parts.append(usage_type)

        summary_text = f"{group} {model_code}"
        if summary_parts:
            summary_text += " (" + ", ".join(summary_parts) + ")"

        return VehicleCodeParsed(
            original_code=clean,
            vehicle_group=group,
            model_code=model_code,
            tonnage_kg=tonnage_kg,
            tonnage_desc=tonnage_desc,
            wheel_type=wheel_type,
            wheel_type_desc=wheel_type_desc,
            wheel_count=wheel_count,
            engine_power=engine_power,
            engine_power_desc=engine_power_desc,
            engine_volume=engine_volume,
            transmission=transmission,
            wheelbase=wheelbase,
            wbs=wbs,
            body_volume=body_volume,
            usage_type=usage_type,
            equipment_level=equipment_level,
            summary_text=summary_text
        )


class VehicleAIQueryParser:
    """
    Translates free-text Turkish CRM queries into structured SQL filter parameters.
    """

    @classmethod
    def parse_query(cls, query: str) -> AIQueryParsedFilter:
        raw = query.strip()
        upper = raw.upper()

        f = AIQueryParsedFilter(raw_query=raw)

        # ── 1. Stock matching intent ──
        if "STOKTA BULUNAN" in upper or "STOKLA EŞLEŞEN" in upper or "STOKTAKİ" in upper or "STOKTAKI" in upper:
            f.has_stock_match = True

        # ── 2. Days since contact / Follow up ──
        day_match = re.search(r"(?:SON\s*)?(\d+)\s*GÜNDÜR\s*(?:GÖRÜŞMEDİĞİMİZ|GORUSMEDIGIMIZ|GÖRÜŞÜLMEYEN|ARANMAYAN)", upper)
        if day_match:
            f.days_since_contact = int(day_match.group(1))

        # ── 3. Purchase timeframe intent ──
        if "HEMEN" in upper:
            f.purchase_timeframe = ["immediate"]
        elif "0-30" in upper or "0-30 GÜN" in upper or "1 AY" in upper:
            f.purchase_timeframe = ["immediate", "0_30_days"]
        elif "0-3 AY" in upper or "0–3 AY" in upper:
            f.purchase_timeframe = ["immediate", "0_30_days", "1_3_months"]
        elif "1-3 AY" in upper:
            f.purchase_timeframe = ["1_3_months"]
        elif "3-6 AY" in upper:
            f.purchase_timeframe = ["3_6_months"]

        # ── 4. City detection ──
        cities = ["SAMSUN", "ÇORUM", "CORUM", "SİNOP", "SINOP", "ORDU", "AMASYA", "TOKAT", "GİRESUN", "GIRESUN", "TRABZON"]
        for c in cities:
            if re.search(r"\b" + c + r"(?:'DA|'DE|'TE|'TA|DA|DE|TE|TA)?\b", upper):
                f.city = "Çorum" if c in ["CORUM", "ÇORUM"] else ("Sinop" if c in ["SINOP", "SİNOP"] else ("Giresun" if c in ["GIRESUN", "GİRESUN"] else c.capitalize()))
                break

        # ── 5. Vehicle Group & Specific Specs ──
        # T-Way Check
        if "T-WAY" in upper or "TWAY" in upper or "HAFRİYAT" in upper or "MİKSER" in upper:
            f.vehicle_group = "T-Way"
            if "HAFRİYAT" in upper or "HAFRIYAT" in upper:
                f.usage_type = "Hafriyat"
                f.engine_power = 540
            elif "MİKSER" in upper or "MIKSER" in upper:
                f.usage_type = "Mikser"
                f.engine_power = 460

            if "10 TEKER" in upper or re.search(r"\b10\s*TEKER\b", upper):
                f.wheel_count = 10
            elif "12 TEKER" in upper or re.search(r"\b12\s*TEKER\b", upper):
                f.wheel_count = 12

        # S-Way Check
        elif "S-WAY" in upper or "SWAY" in upper or ("S WAY" in upper) or ("580" in upper and "DIAMOND" in upper):
            f.vehicle_group = "S-Way"
            if "DIAMOND" in upper:
                f.equipment_level = "Diamond"
            elif "FULL PLUS" in upper or "FULL+" in upper:
                f.equipment_level = "Full Plus"
            elif "FULL" in upper:
                f.equipment_level = "Full"

            if "580" in upper:
                f.engine_power = 580
                f.model_code = "580"
            elif "500" in upper:
                f.engine_power = 500
                f.model_code = "500"

        # X-Way Check
        elif "X-WAY" in upper or "XWAY" in upper:
            f.vehicle_group = "X-Way"
            if "ÇEKİCİ" in upper or "CEKICI" in upper:
                f.vehicle_sub_group = "Çekici"
            elif "RİGİT" in upper or "RIGIT" in upper:
                f.vehicle_sub_group = "Rigit"

        # Eurocargo Check
        elif "EUROCARGO" in upper or re.search(r"\b(100|120|150|160|180)E(19|21|32)\b", upper):
            f.vehicle_group = "Eurocargo"
            ec_m = re.search(r"(100|120|150|160|180)E(19|21|32)", upper)
            if ec_m:
                f.model_code = f"{ec_m.group(1)}E{ec_m.group(2)}"
                eng_code = int(ec_m.group(2))
                if eng_code == 19:
                    f.engine_power = 190
                elif eng_code == 21:
                    f.engine_power = 210
                elif eng_code == 32:
                    f.engine_power = 320
            elif re.search(r"\b150\b", upper):
                f.model_code = "150E21"
                f.engine_power = 210

            wbs_m = re.search(r"\b(3690|4185|4455|4815|5175|5670|6570)\b", upper)
            if wbs_m:
                f.wbs = int(wbs_m.group(1))

        # Daily Check
        else:
            daily_m = re.search(r"\b(35|70|72)([SC])(16|18|21)\b", upper)
            if daily_m:
                f.vehicle_group = "Daily"
                f.model_code = f"{daily_m.group(1)}{daily_m.group(2)}{daily_m.group(3)}"
                power_code = int(daily_m.group(3))
                if power_code == 16:
                    f.engine_power = 160
                elif power_code == 18:
                    f.engine_power = 180
                elif power_code == 21:
                    f.engine_power = 210
            elif "DAILY" in upper:
                f.vehicle_group = "Daily"

            # Panelvan volume
            vol_m = re.search(r"(\d+)\s*(?:M3|M³|METREKÜP)", upper)
            if vol_m:
                f.vehicle_group = "Daily"
                f.vehicle_sub_group = "Panelvan"
                f.body_volume = float(vol_m.group(1))
                if not f.model_code:
                    if f.body_volume in [12.0, 16.0]:
                        f.model_code = "35S16"
                    elif f.body_volume == 18.0:
                        f.model_code = "35C16"

            # Wheelbase
            wb_m = re.search(r"\b(3450|3750|4100|4350|4750)\b", upper)
            if wb_m:
                f.wheelbase = int(wb_m.group(1))

        return f
