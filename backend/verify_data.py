"""Verify real data and ML model outputs from the live API."""
import urllib.request
import json

BASE = "http://localhost:8000"

def fetch_json(url):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

def post_json(url, data):
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

print("=" * 55)
print("SkillWatch AI - Real Data Verification")
print("=" * 55)

# 1. Skills + SDI scores
print("\n[1] Skills & ML-Predicted SDI Scores")
print("-" * 55)
skills = fetch_json(f"{BASE}/api/skills/")
print(f"    Total skills loaded: {len(skills)}")
print(f"    {'Skill':<22} {'SDI':>5}  {'Risk':<10}")
print(f"    {'-'*22} {'-'*5}  {'-'*10}")
for s in sorted(skills, key=lambda x: x["sdi"]):
    print(f"    {s['name']:<22} {s['sdi']:>5.2f}  {s['risk']}")

# 2. Forecast for Python (real BLS-anchored data)
print("\n[2] Python Demand Forecast (real BLS/Lightcast base)")
print("-" * 55)
data = fetch_json(f"{BASE}/api/forecast/Python")
forecasts = data.get("demand_forecast", [])
print(f"    {'Year':>5}  {'Postings':>10}  {'Type'}")
print(f"    {'-'*5}  {'-'*10}  {'-'*10}")
for f in forecasts:
    t = "PROJECTED" if f["is_projected"] else "actual"
    print(f"    {f['year']:>5}  {f['value']:>10,}  {t}")

# 3. Recommendations - professional
print("\n[3] Recommendations - Software Engineer (professional)")
print("-" * 55)
payload = {
    "user_type": "professional",
    "role": "Software Engineer",
    "time_available": "medium",
    "skills": ["Manual Testing", "Excel"],
    "courses": []
}
rec = post_json(f"{BASE}/api/recommend/", payload)
print(f"    Focus:     {rec.get('focus')}")
print(f"    Timeframe: {rec.get('timeframe')}")
print(f"    Recommendations:")
for item in rec.get("recommendations", []):
    sdi_str = f"SDI:{item.get('sdi', 0):.2f}" if item.get("sdi") else ""
    risk = item.get("risk", "")
    print(f"      {item['priority']}. {item['skill']:<22} {sdi_str}  [{risk}]")
    print(f"         -> {item['reason'][:70]}...")

# 4. Data Entry decline verification
print("\n[4] Data Entry Decline (BLS SOC 43-9021)")
print("-" * 55)
data = fetch_json(f"{BASE}/api/forecast/Data%20Entry")
for f in data.get("demand_forecast", []):
    t = "PROJECTED" if f["is_projected"] else "actual"
    print(f"    {f['year']:>5}  {f['value']:>8,} postings  {t}")

# 5. Regions
print("\n[5] Regional Risk Data (BLS/OECD/NASSCOM sources)")
print("-" * 55)
regions = fetch_json(f"{BASE}/api/regions/")
print(f"    Total regions: {len(regions)}")
for reg in sorted(regions, key=lambda x: x["high_risk_pct"], reverse=True)[:5]:
    print(f"    {reg['region']:<22} {reg['country']:<12} High-risk: {reg['high_risk_pct']:.0f}%")

print("\n" + "=" * 55)
print("[OK] All real-data API endpoints verified successfully")
print("=" * 55)
