import os
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASETS_DIR = os.path.join(BASE_DIR, "..", "datasets")

SKILL_MAPPING = {
    "excel": ["mathematics", "systems analysis"],
    "tableu": ["systems analysis", "critical thinking", "systems evaluation"],
    "tableau": ["systems analysis", "critical thinking", "systems evaluation"],
    "power bi": ["systems analysis", "critical thinking", "systems evaluation"],
    "python": ["programming", "systems analysis", "complex problem solving"],
    "java": ["programming", "systems analysis", "complex problem solving"],
    "react": ["programming", "systems analysis"],
    "javascript": ["programming", "systems analysis"],
    "sql": ["programming", "systems analysis"],
    "kubernetes": ["programming", "systems analysis", "complex problem solving"],
    "devops": ["programming", "systems analysis", "complex problem solving"],
    "mlops": ["programming", "systems analysis", "complex problem solving"],
    "data engineering": ["programming", "systems analysis", "complex problem solving"],
    "manual testing": ["reading comprehension", "active listening", "critical thinking"],
    "data entry": ["reading comprehension", "active listening", "critical thinking"],
    "bpo skills": ["reading comprehension", "active listening", "critical thinking"],
}

def get_job_matches(user_skills: list, top_n=5) -> list:
    """
    Match user skills against O*NET occupations.
    Returns a list of matching jobs with fit scores and automation risk.
    """
    onet_path = os.path.join(DATASETS_DIR, "onet_skills.csv")
    risk_path = os.path.join(DATASETS_DIR, "automation_risk_real.csv")
    
    if not os.path.exists(onet_path) or not os.path.exists(risk_path):
        return []

    onet_df = pd.read_csv(onet_path)
    risk_df = pd.read_csv(risk_path)

    # Normalize user skills to lowercase and expand them using SKILL_MAPPING
    expanded_skills = set()
    for s in user_skills:
        s_lower = s.lower().strip()
        expanded_skills.add(s_lower)
        if s_lower in SKILL_MAPPING:
            for mapped in SKILL_MAPPING[s_lower]:
                expanded_skills.add(mapped)
                
    user_skills = list(expanded_skills)
    
    results = []
    
    # Group O*NET skills by occupation
    grouped = onet_df.groupby(["SOC", "Occupation"])
    
    for (soc, job_title), group in grouped:
        job_skills = group["Skill"].tolist()
        importances = group["Importance"].tolist()
        
        # Calculate fit score
        # A simple score: sum of importances of user skills that are in the job's required skills
        matched_importance = 0
        total_importance = sum(importances)
        
        matches = []
        for skill, imp in zip(job_skills, importances):
            if skill.lower() in user_skills:
                matched_importance += imp
                matches.append(skill)
        
        fit_score = (matched_importance / total_importance) if total_importance > 0 else 0
        
        # Get automation risk
        risk_row = risk_df[risk_df["SOC"] == soc]
        automation_risk = float(risk_row["Probability"].iloc[0]) if not risk_row.empty else 0.5
        
        if fit_score > 0:
            results.append({
                "job_title": job_title,
                "soc": soc,
                "fit_score": round(fit_score, 2),
                "automation_risk": round(automation_risk, 2),
                "matched_skills": matches,
                "missing_skills": [s for s in job_skills if s.lower() not in user_skills]
            })

    # Sort by fit score descending
    results.sort(key=lambda x: x["fit_score"], reverse=True)
    
    return results[:top_n]

if __name__ == "__main__":
    # Test
    test_skills = ["Programming", "Mathematics", "Systems Analysis"]
    matches = get_job_matches(test_skills)
    for m in matches:
        print(f"{m['job_title']} (Fit: {m['fit_score']}, Risk: {m['automation_risk']})")
