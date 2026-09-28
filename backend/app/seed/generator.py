import random
import datetime
from sqlalchemy.orm import Session
from app.models.domain import (
    Supplier, SupplierMetric, RiskAssessment, Event, Alert,
    Component, ProductLine, Dependency, Recommendation, Action, Document, AgentLog, AuditLog
)

COMPANY_NAMES = [
    # Semiconductors & Electronics
    ("Aether Semiconductor GmbH", "Semiconductor", "Germany", "Europe", "Dresden"),
    ("Vanguard Precision Microelectronics Corp", "Semiconductor", "Taiwan", "Asia-Pacific", "Hsinchu"),
    ("Silicon Valley Lithography Systems", "Semiconductor", "United States", "North America", "San Jose"),
    ("Nippon Wafer Foundry Technologies", "Semiconductor", "Japan", "Asia-Pacific", "Tokyo"),
    ("Kyoto Quantum Microchips Inc", "Semiconductor", "Japan", "Asia-Pacific", "Kyoto"),
    ("Seoul Electro-Optics Co Ltd", "Electronics", "South Korea", "Asia-Pacific", "Seoul"),
    ("Bavaria Micro Sensor Systems", "Electronics", "Germany", "Europe", "Munich"),
    ("Taichung Silicon Assembly Ltd", "Semiconductor", "Taiwan", "Asia-Pacific", "Taichung"),
    ("Shenzhen Advanced Display Tech", "Electronics", "China", "Asia-Pacific", "Shenzhen"),
    ("Zurich High-Frequency Components AG", "Electronics", "Switzerland", "Europe", "Zurich"),
    
    # Pharma & Chemicals
    ("Nordic ChemTech A/S", "Pharma", "Denmark", "Europe", "Copenhagen"),
    ("BioSynthetix Pharma Solutions", "Pharma", "Switzerland", "Europe", "Basel"),
    ("Apex Active Ingredients Corp", "Pharma", "India", "Asia-Pacific", "Hyderabad"),
    ("Rhine Valley Organic Synthesis GmbH", "Pharma", "Germany", "Europe", "Frankfurt"),
    ("Osaka Fine Chemical Industries", "Pharma", "Japan", "Asia-Pacific", "Osaka"),
    ("Lyon Bioprocess Technologies", "Pharma", "France", "Europe", "Lyon"),
    ("New Jersey Bio-Pharma Logistics", "Pharma", "United States", "North America", "Princeton"),
    
    # Automotive & Mobility
    ("Stuttgart Powertrain Dynamics", "Automotive", "Germany", "Europe", "Stuttgart"),
    ("Nagoya Precision Axles & Gears", "Automotive", "Japan", "Asia-Pacific", "Nagoya"),
    ("Turin Automotive Chassis Systems", "Automotive", "Italy", "Europe", "Turin"),
    ("Detroit EV Battery Modules Inc", "Automotive", "United States", "North America", "Detroit"),
    ("Gothenburg Heavy Drive Systems", "Automotive", "Sweden", "Europe", "Gothenburg"),
    ("Guangzhou Electric Motors Co", "Automotive", "China", "Asia-Pacific", "Guangzhou"),
    
    # Raw Materials & Energy
    ("Atacama Lithium Refining Corp", "Raw Materials", "Chile", "South America", "Antofagasta"),
    ("Katanga Cobalt Mining Consortium", "Raw Materials", "DR Congo", "Africa", "Kolwezi"),
    ("Queensland Bauxite & Rare Earths", "Raw Materials", "Australia", "Asia-Pacific", "Brisbane"),
    ("Siberian Nickel & Platinum Mining", "Raw Materials", "Kazakhstan", "Eurasia", "Astana"),
    ("Perth Critical Minerals Ltd", "Raw Materials", "Australia", "Asia-Pacific", "Perth"),
    ("Sao Paulo Industrial Alloys", "Raw Materials", "Brazil", "South America", "Sao Paulo"),
    
    # Aerospace & Defense
    ("Toulouse Avionics Systems SA", "Aerospace", "France", "Europe", "Toulouse"),
    ("Seattle Composite Structures", "Aerospace", "United States", "North America", "Seattle"),
    ("Bristol Aero Turbines Ltd", "Aerospace", "United Kingdom", "Europe", "Bristol"),
    ("Hamburg Cabin Technologies", "Aerospace", "Germany", "Europe", "Hamburg")
]

# Sector suffixes to auto-generate 300+ suppliers programmatically
PREFIXES = ["Apex", "Nova", "Titan", "Vertex", "Helios", "Atlas", "Nexus", "Orion", "Aero", "Synapse", "Quantum", "Spectral", "Terra", "Vanguard", "Zephyr", "Aether", "Kinetix", "Dynasty", "Hyperion", "Matrix"]
CATEGORIES = ["Semiconductor", "Automotive", "Pharma", "Raw Materials", "Electronics", "Aerospace"]
COUNTRIES = [
    ("United States", "North America"), ("Germany", "Europe"), ("Japan", "Asia-Pacific"),
    ("Taiwan", "Asia-Pacific"), ("South Korea", "Asia-Pacific"), ("China", "Asia-Pacific"),
    ("India", "Asia-Pacific"), ("Switzerland", "Europe"), ("France", "Europe"),
    ("United Kingdom", "Europe"), ("Chile", "South America"), ("Australia", "Asia-Pacific")
]

def generate_supplier_pool():
    suppliers_list = []
    # Add curated top list first
    for name, cat, country, region, city in COMPANY_NAMES:
        suppliers_list.append((name, cat, country, region, city))
        
    # Programmatically expand to 300 suppliers
    counter = 1
    while len(suppliers_list) < 300:
        p = random.choice(PREFIXES)
        c = random.choice(CATEGORIES)
        ct, reg = random.choice(COUNTRIES)
        name = f"{p} {c} Technologies {counter} Inc"
        city = f"Industrial Zone {counter % 20 + 1}"
        suppliers_list.append((name, c, ct, reg, city))
        counter += 1
        
    return suppliers_list

def seed_database(db: Session):
    # Check if data already exists
    if db.query(Supplier).count() >= 300:
        print("Database already contains >= 300 suppliers. Skipping seed.")
        return

    print("Seeding database with 300+ realistic synthetic suppliers, metrics, digital twin dependencies, and events...")
    
    supplier_pool = generate_supplier_pool()
    created_suppliers = []
    
    for i, (name, cat, country, region, city) in enumerate(supplier_pool):
        code = f"SUP-{cat[:3].upper()}-{1000 + i}"
        contract_val = round(random.uniform(500_000, 45_000_000), -4)
        dep_pct = round(random.uniform(5.0, 95.0), 1)
        tier = random.choice([1, 1, 1, 2, 2, 3])
        
        # High risk flags for realistic risk distribution (~15% high risk, 30% medium, 55% low)
        is_risky = (i % 7 == 0) or (country in ["DR Congo", "Kazakhstan"] and random.random() > 0.3)
        
        supplier = Supplier(
            code=code,
            name=name,
            category=cat,
            tier=tier,
            country=country,
            region=region,
            city=city,
            contract_value=contract_val,
            dependency_pct=dep_pct,
            status="Active" if not is_risky else random.choice(["Under Review", "Escalated"]),
            overall_risk_score=0.0, # Will be calculated by ML engine
            risk_category="Low",
            confidence_score=round(random.uniform(0.88, 0.98), 2)
        )
        db.add(supplier)
        db.flush()
        
        # Add Metrics
        if is_risky:
            revenue_growth = round(random.uniform(-25.0, -2.0), 1)
            debt_to_equity = round(random.uniform(2.8, 6.5), 2)
            altman_z = round(random.uniform(0.8, 1.7), 2) # Distress zone < 1.8
            dso = round(random.uniform(70.0, 120.0), 1)
            lead_time = round(random.uniform(35.0, 90.0), 1)
            on_time = round(random.uniform(62.0, 81.0), 1)
            defect_ppm = round(random.uniform(450.0, 2400.0), 1)
            cancel_pct = round(random.uniform(6.0, 18.0), 1)
            country_risk = round(random.uniform(60.0, 92.0), 1) if country not in ["Germany", "Japan", "Switzerland"] else round(random.uniform(30.0, 45.0), 1)
            cyber_score = round(random.uniform(45.0, 68.0), 1)
            disruptions = random.randint(3, 8)
        else:
            revenue_growth = round(random.uniform(3.0, 22.0), 1)
            debt_to_equity = round(random.uniform(0.4, 1.8), 2)
            altman_z = round(random.uniform(2.8, 5.2), 2) # Safe zone > 2.99
            dso = round(random.uniform(30.0, 52.0), 1)
            lead_time = round(random.uniform(7.0, 21.0), 1)
            on_time = round(random.uniform(92.0, 99.5), 1)
            defect_ppm = round(random.uniform(15.0, 150.0), 1)
            cancel_pct = round(random.uniform(0.2, 2.5), 1)
            country_risk = round(random.uniform(10.0, 35.0), 1)
            cyber_score = round(random.uniform(82.0, 98.0), 1)
            disruptions = random.randint(0, 1)
            
        metric = SupplierMetric(
            supplier_id=supplier.id,
            revenue_growth_pct=revenue_growth,
            debt_to_equity=debt_to_equity,
            altman_z_score=altman_z,
            days_sales_outstanding=dso,
            avg_lead_time_days=lead_time,
            on_time_delivery_pct=on_time,
            defect_rate_ppm=defect_ppm,
            order_cancellation_pct=cancel_pct,
            capacity_utilization_pct=round(random.uniform(70.0, 96.0), 1),
            country_risk_index=country_risk,
            logistics_friction_score=round(random.uniform(10.0, 65.0), 1),
            port_congestion_days=round(random.uniform(0.5, 7.5), 1),
            carbon_intensity=round(random.uniform(15.0, 85.0), 1),
            esg_audit_score=round(random.uniform(60.0, 95.0), 1) if not is_risky else round(random.uniform(40.0, 65.0), 1),
            labor_violation_flag=is_risky and random.random() > 0.5,
            cyber_security_score=cyber_score,
            unpatched_vulnerabilities=0 if not is_risky else random.randint(3, 14),
            historical_disruptions_cnt=disruptions
        )
        db.add(metric)
        created_suppliers.append(supplier)

    db.commit()
    print(f"Created {len(created_suppliers)} suppliers with metrics.")
    
    # Seed Digital Twin components and Product lines
    seed_digital_twin_topology(db, created_suppliers[:50])
    
    # Seed Events & News Feed
    seed_events_and_alerts(db, created_suppliers[:50])
    
    # Seed Sample RAG Documents
    seed_sample_documents(db)
    
    # Seed Recommendations & Actions
    seed_recommendations_and_actions(db, created_suppliers[:50])

def seed_digital_twin_topology(db: Session, key_suppliers):
    product_lines = [
        ("PL-AUT-01", "NextGen Autonomous Vehicle Compute Module", 450_000_000.0, 38.5),
        ("PL-PHR-02", "Oncology Biologics & Specialty Injectables", 620_000_000.0, 52.0),
        ("PL-ELE-03", "Enterprise AI Server Hardware Suite", 890_000_000.0, 44.0),
        ("PL-AER-04", "Commercial Turbofan Propulsion Engine", 710_000_000.0, 31.0),
        ("PL-RAW-05", "High-Purity Battery Grade Lithium Cathodes", 340_000_000.0, 29.0)
    ]
    
    pls = []
    for code, name, rev, margin in product_lines:
        pl = ProductLine(code=code, name=name, annual_revenue_impact=rev, margin_pct=margin)
        db.add(pl)
        db.flush()
        pls.append(pl)
        
    components = [
        ("CMP-7NM-01", "7nm EUV Silicon Processor Wafer", key_suppliers[0].id, "Semiconductor", 1250.0, 12, True),
        ("CMP-SNS-02", "Automotive Grade LiDAR Optical Sensor Pack", key_suppliers[1].id, "Sensors", 480.0, 18, True),
        ("CMP-BIO-03", "Sterile Monoclonal Antibody Carrier Medium", key_suppliers[10].id, "Biologics", 890.0, 24, False),
        ("CMP-LTH-04", "Battery Grade Lithium Hydroxide Powder", key_suppliers[23].id, "Chemicals", 310.0, 14, True),
        ("CMP-TIT-05", "Aerospace Titanium Forged Turbine Blades", key_suppliers[30].id, "Metallurgy", 3400.0, 30, True),
        ("CMP-PCB-06", "High-Density Interconnect 16-Layer PCB", key_suppliers[5].id, "Electronics", 120.0, 20, False)
    ]
    
    cmps = []
    for code, name, sup_id, cat, cost, buffer_days, is_crit in components:
        cmp_obj = Component(
            code=code, name=name, supplier_id=sup_id, category=cat,
            unit_cost=cost, inventory_buffer_days=buffer_days, is_critical_single_source=is_crit
        )
        db.add(cmp_obj)
        db.flush()
        cmps.append(cmp_obj)
        
    # Bind components to product lines
    dependencies = [
        (cmps[0].id, pls[0].id, "OEM Enterprise", 1.5), # 7nm wafer -> Autonomous Vehicle Module
        (cmps[0].id, pls[2].id, "Hyperscale Cloud", 2.0), # 7nm wafer -> AI Server Suite
        (cmps[1].id, pls[0].id, "Automotive OEMs", 1.2), # LiDAR -> Autonomous Vehicle Module
        (cmps[2].id, pls[1].id, "Global Health Systems", 1.8), # Biologic -> Oncology Biologics
        (cmps[3].id, pls[4].id, "EV Manufacturers", 1.4), # Lithium -> Battery Grade Lithium
        (cmps[4].id, pls[3].id, "Commercial Airlines", 2.2), # Titanium Blades -> Turbofan Engine
        (cmps[5].id, pls[2].id, "Data Centers", 1.0)
    ]
    
    for cmp_id, pl_id, customer, weight in dependencies:
        dep = Dependency(component_id=cmp_id, product_line_id=pl_id, customer_tier=customer, bottleneck_weight=weight)
        db.add(dep)
        
    db.commit()

def seed_events_and_alerts(db: Session, suppliers):
    sample_events = [
        (suppliers[0].id, "Dresden Fab Power Spike & Wafer Loss", "Unscheduled power grid trip at Dresden Fab #2 resulted in loss of ~3,500 7nm wafers. Estimated lead time delay: 18 days.", "Operational", "High", "European Semiconductor Monitor", 78.0),
        (suppliers[1].id, "Strait of Taiwan Freight Shipping Congestion", "Naval exercises and weather disruptions near Hsinchu port increased shipping lead times by 7-10 days for precision microelectronics.", "Geopolitical", "Critical", "Global Freight Daily", 88.0),
        (suppliers[10].id, "Copenhagen Bioprocess Regulatory Warning Letter", "Danish Medicines Agency issued a compliance observation notice regarding sterile room ventilation records.", "ESG", "Medium", "Pharma Regulatory Digest", 55.0),
        (suppliers[23].id, "Atacama Labor Contract Stoppage", "Union negotiations stalled at Antofagasta lithium refining facility, leading to a temporary 48-hour strike threat.", "Financial", "High", "Mining & Minerals Intelligence", 72.0),
        (None, "Suez Canal Logistics Bottleneck Heightens Risk", "Red Sea rerouting increases Europe-to-Asia maritime transit duration by an average of 12 days.", "Geopolitical", "High", "Maritime Executive", 65.0)
    ]
    
    for sup_id, title, summary, cat, sev, source, impact in sample_events:
        ev = Event(
            supplier_id=sup_id, title=title, summary=summary, category=cat,
            severity=sev, source=source, impact_score=impact,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=random.randint(2, 48))
        )
        db.add(ev)
        
    # Add System Alerts
    alerts = [
        ("CRITICAL: Supplier Risk Escalation", "Aether Semiconductor GmbH risk score spiked from 42% to 84% due to EUV wafer loss and lead time doubling.", "Critical"),
        ("WARNING: Single-Source Component Dependency", "7nm EUV Silicon Wafer (CMP-7NM-01) has < 15 days of inventory buffer remaining across all regional warehouses.", "Warning"),
        ("INFO: Quarterly Risk Refresh Completed", "ML Risk Engine re-evaluated all 300 active supplier profiles with 94.2% ROC-AUC accuracy.", "Info")
    ]
    
    for title, desc, sev in alerts:
        db.add(Alert(title=title, description=desc, severity=sev))
        
    db.commit()

def seed_sample_documents(db: Session):
    docs = [
        ("Master_Supply_Agreement_Aether_Semiconductor.pdf", "Master Supply Agreement — Aether Semiconductor GmbH", "Contract",
         "MASTER SUPPLY AGREEMENT (MSA)\nBetween: Enterprise Global Operations & Aether Semiconductor GmbH\nEffective Date: Jan 15, 2025\n"
         "Section 4.2 Lead Time Commitments: Supplier guarantees standard order fulfillment within 14 business days. Excusable delays require written notice within 24 hours.\n"
         "Section 8.1 Liquidated Damages: Supplier shall pay 1.5% of total shipment value per day of unexcused delay exceeding 5 business days.\n"
         "Section 12.4 Dual Sourcing Right: Buyer retains absolute right to allocate up to 40% of component volume to secondary suppliers if Supplier's risk score exceeds 75% for 30 consecutive days."),
        
        ("ESG_Compliance_Audit_Nordic_ChemTech.pdf", "ESG & Environmental Audit — Nordic ChemTech A/S", "ESG Policy",
         "ANNUAL ESG COMPLIANCE & SUSTAINABILITY REPORT 2025\nTarget Facility: Nordic ChemTech A/S (Copenhagen Plant)\n"
         "Summary: Facility achieves Scope 1 & 2 carbon intensity score of 32.4 kg CO2e per unit. Solvent recovery rate is 94.1%.\n"
         "Audit Observations: Minor documentation gap identified in hazardous waste transport logs (ISO 14001 Clause 8.2). Resolution due by Q3 2026."),
        
        ("Cybersecurity_Assessment_Vanguard_Precision.pdf", "Cybersecurity Posture & Penetration Test — Vanguard Precision", "Audit Report",
         "THIRD-PARTY CYBER SECURITY RISK REPORT\nVendor: Vanguard Precision Microelectronics Corp\n"
         "Security Rating: 84 / 100 (Tier 1 Approved)\n"
         "Key Audit Findings:\n- External perimeter firewall configuration meets NIST CSF v2.0 standard.\n"
         "- Two unpatched non-critical CVE vulnerabilities noted in secondary staging server (CVE-2025-4912).\n"
         "- Patch remediation SLA: 14 business days.")
    ]
    
    for fname, title, dtype, content in docs:
        doc = Document(
            filename=fname, title=title, doc_type=dtype,
            content=content, file_size=len(content.encode('utf-8'))
        )
        db.add(doc)
    db.commit()

def seed_recommendations_and_actions(db: Session, suppliers):
    recs = [
        (suppliers[0].id, "Activate Secondary Foundry Sourcing for 7nm Wafers", "Shift Volume",
         "Split 35% of current 7nm silicon wafer allocation to Silicon Valley Lithography Systems to mitigate Dresden facility disruption risk.",
         125000.0, 42.5, 88.0, 0.94, "Pending"),
        
        (suppliers[1].id, "Buffer Stock Expansion for Optical Sensors", "Expedite Shipping",
         "Increase safety stock of CMP-SNS-02 Optical Sensors from 18 days to 45 days in Munich logistics hub.",
         65000.0, 28.0, 92.0, 0.91, "Approved"),
         
        (suppliers[3].id, "Initiate Financial Health & Restructuring Audit", "Pause Supplier",
         "Request audited Q2 cash-flow statements and issue formal inquiry regarding rising days sales outstanding (DSO > 90 days).",
         15000.0, 18.5, 95.0, 0.88, "Pending")
    ]
    
    for sup_id, title, atype, desc, cost, risk_red, feas, conf, status in recs:
        rec = Recommendation(
            supplier_id=sup_id, title=title, action_type=atype, description=desc,
            cost_usd=cost, estimated_risk_reduction_pct=risk_red,
            feasibility_score=feas, confidence=conf, status=status
        )
        db.add(rec)
        db.flush()
        
        if status == "Approved":
            act = Action(
                recommendation_id=rec.id, action_taken="Approved",
                reviewed_by="Chief Procurement Officer",
                notes="Approved secondary buffer inventory allocation given Strait of Taiwan shipping tensions."
            )
            db.add(act)
            
            audit = AuditLog(
                user_name="Chief Procurement Officer",
                action_type="ACTION_APPROVAL",
                details=f"Approved recommendation '{title}' for Supplier ID {sup_id} with estimated risk reduction of {risk_red}%."
            )
            db.add(audit)
            
    db.commit()
