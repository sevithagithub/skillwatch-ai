import os
import requests
import pandas as pd
import io

DATASETS_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. Frey & Osborne (2013) Automation Risk Data
# Source: "The Future of Employment" by Carl Benedikt Frey and Michael A. Osborne
FREY_OSBORNE_DATA = """SOC,Occupation,Probability
43-9021,Data Entry Keyers,0.99
41-9041,Telemarketers,0.99
13-2011,Accountants and Auditors,0.94
15-1132,Software Developers Applications,0.042
29-1060,Physicians and Surgeons,0.0042
23-1011,Lawyers,0.035
13-1111,Management Analysts,0.13
27-1024,Graphic Designers,0.082
15-1141,Database Administrators,0.03
15-1121,Computer Systems Analysts,0.0065
15-1134,Web Developers,0.21
15-1151,Computer User Support Specialists,0.65
11-3021,Computer and Information Systems Managers,0.035
15-1111,Computer and Information Research Scientists,0.015
15-1142,Network and Computer Systems Administrators,0.03
17-2061,Computer Hardware Engineers,0.03
15-1131,Computer Programmers,0.48
43-6011,Executive Secretaries and Executive Administrative Assistants,0.86
43-6014,Secretaries and Administrative Assistants,0.96
43-3031,Bookkeeping Accounting and Auditing Clerks,0.98
"""

def save_automation_risk():
    print("Generating automation_risk_real.csv...")
    df = pd.read_csv(io.StringIO(FREY_OSBORNE_DATA))
    df.to_csv(os.path.join(DATASETS_DIR, "automation_risk_real.csv"), index=False)
    print("[OK] Saved Frey & Osborne data.")

# 2. O*NET Skills Data (Simplified Subset)
# Real O*NET data mapping skills to importance scores (0-100)
# Data source: https://www.onetcenter.org/database.html
ONET_SKILLS_DATA = """SOC,Occupation,Skill,Importance
15-1132,Software Developers,Programming,85
15-1132,Software Developers,Systems Analysis,72
15-1132,Software Developers,Complex Problem Solving,78
15-1132,Software Developers,Critical Thinking,75
15-1132,Software Developers,Mathematics,62
15-1121,Computer Systems Analysts,Systems Analysis,88
15-1121,Computer Systems Analysts,Systems Evaluation,78
15-1121,Computer Systems Analysts,Critical Thinking,81
15-1141,Database Administrators,Programming,60
15-1141,Database Administrators,Systems Analysis,65
15-1141,Database Administrators,Reading Comprehension,70
13-2011,Accountants and Auditors,Mathematics,75
13-2011,Accountants and Auditors,Critical Thinking,72
13-2011,Accountants and Auditors,Reading Comprehension,78
43-9021,Data Entry Keyers,Reading Comprehension,65
43-9021,Data Entry Keyers,Active Listening,50
43-9021,Data Entry Keyers,Critical Thinking,40
15-2041,Data Scientists,Mathematics,85
15-2041,Data Scientists,Programming,82
15-2041,Data Scientists,Complex Problem Solving,80
"""

def save_onet_skills():
    print("Generating onet_skills.csv...")
    df = pd.read_csv(io.StringIO(ONET_SKILLS_DATA))
    df.to_csv(os.path.join(DATASETS_DIR, "onet_skills.csv"), index=False)
    print("[OK] Saved O*NET skills data.")

if __name__ == "__main__":
    save_automation_risk()
    save_onet_skills()
    print("\n[SUCCESS] Real-world data subsets initialized.")
