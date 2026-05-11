"""
Database Seeder — loads real-world CSV datasets into SQLite
and trains the ML models (RandomForest SDI classifier +
GradientBoosting demand forecaster) on the real data.
Run once: python seed_data.py
"""

import pandas as pd
import os
import sys

from database.database import engine, SessionLocal, Base
from database.models import Skill, SkillDemand, Resource, Region
from ml.sdi import compute_full_sdi, train_models
import traceback

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASETS_DIR = os.path.join(BASE_DIR, "..", "datasets")


def seed_skills_demand(db):
    """Load skills_demand.csv and compute SDI for each skill."""
    csv_path = os.path.join(DATASETS_DIR, "skills_demand.csv")
    df = pd.read_csv(csv_path)
    print(f"  Loading {len(df)} demand records...")

    # Insert demand records
    for _, row in df.iterrows():
        record = SkillDemand(
            skill=row["skill"],
            year=int(row["year"]),
            job_postings=int(row["job_postings"]),
            avg_salary_usd=int(row["avg_salary_usd"]),
            automation_risk=float(row["automation_risk"]),
            course_count=int(row["course_count"]),
            hiring_trend=float(row["hiring_trend"]),
        )
        db.add(record)

    db.commit()

    # Compute SDI for each unique skill
    skill_categories = {
        "Python": "Programming",
        "Machine Learning": "AI / Data Science",
        "SQL": "Data",
        "Cloud Computing": "Infrastructure",
        "DevOps": "Infrastructure",
        "Data Entry": "Administrative",
        "Manual Testing": "Software QA",
        "Excel": "Productivity",
        "Power BI": "Business Intelligence",
        "Photoshop": "Design",
        "Selenium": "Test Automation",
        "Kubernetes": "Infrastructure",
        "Generative AI": "AI / Data Science",
        "LLM Fine-tuning": "AI / Data Science",
        "MLOps": "AI / Data Science",
        "Data Engineering": "Data",
    }

    skill_descriptions = {
        "Python": "Python is the dominant language of the AI era. As AI/ML adoption accelerates, Python remains one of the most future-proof skills.",
        "Machine Learning": "Machine Learning is the engine of the AI revolution. These professionals are among the most sought-after globally.",
        "SQL": "SQL remains a stable foundational skill. Combined with modern data stack tools, it stays relevant long-term.",
        "Cloud Computing": "Cloud Computing is foundational infrastructure for the modern tech stack. Demand continues to accelerate.",
        "DevOps": "DevOps bridges development and operations. The rise of cloud-native apps makes this skill increasingly vital.",
        "Data Entry": "Basic data input work is among the most automation-vulnerable skills. RPA bots and AI agents now handle this at scale.",
        "Manual Testing": "Systematic regression testing is rapidly replaced by AI-powered automation. Exploratory testing still holds some value.",
        "Excel": "Excel as a standalone skill is losing market value as BI tools and AI assistants absorb its core use cases.",
        "Power BI": "Power BI is growing as the go-to enterprise BI tool, absorbing Excel reporting use cases.",
        "Photoshop": "Photoshop faces disruption from generative AI. Professionals who combine design thinking with AI tools remain valuable.",
        "Selenium": "Selenium was the gold standard for test automation but faces pressure from newer tools like Playwright and AI QA.",
        "Kubernetes": "Kubernetes is the backbone of cloud-native infrastructure. Demand continues growing strongly.",
        "Generative AI": "Generative AI is the fastest-growing skill domain in tech history. Explosive demand across all sectors.",
        "LLM Fine-tuning": "LLM Fine-tuning is a specialized AI skill commanding premium salaries with massive demand growth.",
        "MLOps": "MLOps bridges ML models and production deployment. Critical for scaling AI in enterprises.",
        "Data Engineering": "Data Engineering is the backbone of all data-driven organizations. Consistent strong growth.",
    }

    unique_skills = df["skill"].unique()
    for skill_name in unique_skills:
        skill_df = df[df["skill"] == skill_name].sort_values("year")

        sdi_result = compute_full_sdi(
            skill_name=skill_name,
            job_postings=skill_df["job_postings"].tolist(),
            automation_risks=skill_df["automation_risk"].tolist(),
            course_counts=skill_df["course_count"].tolist(),
            salaries=skill_df["avg_salary_usd"].tolist(),
        )

        skill = Skill(
            name=skill_name,
            category=skill_categories.get(skill_name, "Other"),
            sdi=sdi_result["sdi"],
            risk=sdi_result["risk"],
            automation_risk=sdi_result["automation_risk"],
            demand_trend=sdi_result["demand_decline"],
            oversupply=sdi_result["oversupply"],
            salary_stagnation=sdi_result["salary_stagnation"],
            description=skill_descriptions.get(skill_name, ""),
        )
        db.add(skill)

    db.commit()
    print(f"  Created {len(unique_skills)} skill profiles with SDI scores")


def seed_resources(db):
    """Load resources.csv."""
    csv_path = os.path.join(DATASETS_DIR, "resources.csv")
    df = pd.read_csv(csv_path)
    print(f"  Loading {len(df)} resources...")

    for _, row in df.iterrows():
        resource = Resource(
            skill=row["skill"],
            resource_type=row["resource_type"],
            title=row["title"],
            platform=row["platform"],
            url=row["url"],
            rating=float(row["rating"]),
            cost_type=row["cost_type"],
            duration_hrs=float(row["duration_hrs"]) if pd.notna(row["duration_hrs"]) else None,
            level=row["level"],
        )
        db.add(resource)

    db.commit()
    print(f"  Loaded {len(df)} resources")


def seed_regions(db):
    """Load regions_risk.csv."""
    csv_path = os.path.join(DATASETS_DIR, "regions_risk.csv")
    df = pd.read_csv(csv_path)
    print(f"  Loading {len(df)} regions...")

    for _, row in df.iterrows():
        region = Region(
            region=row["region"],
            country=row["country"],
            workforce_size=int(row["workforce_size"]),
            high_risk_pct=float(row["high_risk_pct"]),
            medium_risk_pct=float(row["medium_risk_pct"]),
            primary_at_risk_skills=row["primary_at_risk_skills"],
            dominant_sector=row["dominant_sector"],
        )
        db.add(region)

    db.commit()
    print(f"  Loaded {len(df)} regions")


def seed_all():
    """Create tables, seed real-world data, and train ML models."""
    print("SkillWatch AI — Database Seeder (Real Data Pipeline)")
    print("=" * 50)

    # Create all tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("[OK] Tables created\n")

    db = SessionLocal()
    try:
        print("[1/4] Seeding skills & demand data (BLS/Lightcast/WEF sources)...")
        seed_skills_demand(db)

        print("[2/4] Seeding resources...")
        seed_resources(db)

        print("[3/4] Seeding regions (BLS/OECD/NASSCOM sources)...")
        seed_regions(db)

        print("[4/4] Training ML models on real data...")
        print("  Sources: BLS OES, Lightcast, WEF Future of Jobs 2025,")
        print("           LinkedIn Economic Graph, Frey & Osborne (2013)")
        trained_scaler, trained_clf, trained_reg = train_models()
        if trained_clf is not None:
            print("  [OK] RandomForest risk classifier trained & saved")
            print("  [OK] GradientBoosting SDI regressor trained & saved")
        else:
            print("  [WARN] Model training skipped — using heuristic fallback")

        print("\n" + "=" * 50)
        print("[OK] Database seeded with real-world data!")
        print(f"  Skills: {db.query(Skill).count()}")
        print(f"  Demand records: {db.query(SkillDemand).count()}")
        print(f"  Resources: {db.query(Resource).count()}")
        print(f"  Regions: {db.query(Region).count()}")
        print("\nData sources:")
        print("  - BLS OES: https://www.bls.gov/oes/")
        print("  - LinkedIn Economic Graph: https://economicgraph.linkedin.com/")
        print("  - Lightcast: https://lightcast.io/resources/research/")
        print("  - WEF Future of Jobs 2025: https://www.weforum.org/publications/")
        print("  - Stack Overflow Survey: https://survey.stackoverflow.co/2024/")
    finally:
        db.close()


if __name__ == "__main__":
    try:
        seed_all()
    except Exception as e:
        print("\n[ERROR] Seeding failed!")
        print(traceback.format_exc())
        sys.exit(1)
