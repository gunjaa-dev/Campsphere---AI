"""
CAMSPHER-AI Resume Analyzer
Scoring Engine — v1.1.0 (Bug-fixed)

Fix 1: count_score log10 -> linear (line ~185)
Fix 2: fresher base 50->20 (line ~259)
Fix 3: zero-project floor 30->10 (line ~214)
Fix 4: word count threshold 1200->1500 (line ~468) - Calculates overall resume score (0-100)
Based on: Skills, Projects, Experience, Education, Certifications, Format Quality
"""

import math
import re
from typing import Dict, List, Optional


class ResumeScoringEngine:
    """
    Calculates comprehensive resume scores with weighted components:
    - Skills Score (25%): Quality, diversity, and demand of skills
    - Projects Score (20%): Quality and relevance of projects
    - Experience Score (20%): Work history quality and relevance
    - Education Score (15%): Academic background
    - Content Quality Score (10%): Length, formatting, structure
    - ATS Compatibility Score (10%): Keyword optimization, standard sections
    """

    def __init__(self):
        # Score weights (must sum to 1.0)
        self.weights = {
            "skills": 0.25,
            "projects": 0.20,
            "experience": 0.20,
            "education": 0.15,
            "content_quality": 0.10,
            "ats_compatibility": 0.10,
        }

        # Thresholds
        self.min_skills_good = 8
        self.min_skills_excellent = 15
        self.min_projects_good = 2
        self.min_projects_excellent = 4
        self.min_exp_months_good = 6
        self.min_exp_months_excellent = 24

    def calculate_score(self, analysis_data: Dict) -> Dict:
        """
        Calculate complete resume scoring.

        Args:
            analysis_data: Dict containing all extracted analysis data
                {
                    "skills": skills extraction result,
                    "content": content extraction result,
                    "raw_text": original resume text,
                    "word_count": total word count,
                }

        Returns:
            {
                "overall_score": float (0-100),
                "category_scores": {
                    "skills": float,
                    "projects": float,
                    "experience": float,
                    "education": float,
                    "content_quality": float,
                    "ats_compatibility": float,
                },
                "skill_score_details": {...},
                "breakdown": [...],
                "recommendations": [...],
                "grade": str (A/B/C/D/F),
            }
        """
        skills_data = analysis_data.get("skills", {})
        content_data = analysis_data.get("content", {})
        raw_text = analysis_data.get("raw_text", "")
        word_count = analysis_data.get("word_count", len(raw_text.split()))

        # Calculate individual category scores
        skills_score, skills_details = self._score_skills(skills_data)
        projects_score, projects_details = self._score_projects(content_data.get("projects", []))
        experience_score, exp_details = self._score_experience(content_data.get("experience", []))
        education_score, edu_details = self._score_education(content_data.get("education", []))
        content_quality_score = self._score_content_quality(raw_text, word_count)
        ats_score = self._score_ats_compatibility(raw_text, skills_data)

        # Weighted overall score
        overall = (
            skills_score * self.weights["skills"] +
            projects_score * self.weights["projects"] +
            experience_score * self.weights["experience"] +
            education_score * self.weights["education"] +
            content_quality_score * self.weights["content_quality"] +
            ats_score * self.weights["ats_compatibility"]
        )

        category_scores = {
            "skills": round(skills_score, 1),
            "projects": round(projects_score, 1),
            "experience": round(experience_score, 1),
            "education": round(education_score, 1),
            "content_quality": round(content_quality_score, 1),
            "ats_compatibility": round(ats_score, 1),
        }

        # Generate breakdown
        breakdown = [
            {
                "category": "Skills & Technologies",
                "score": round(skills_score, 1),
                "weight": f"{int(self.weights['skills'] * 100)}%",
                "weighted_score": round(skills_score * self.weights["skills"], 1),
                "status": self._get_status(skills_score),
                "details": skills_details
            },
            {
                "category": "Projects & Portfolio",
                "score": round(projects_score, 1),
                "weight": f"{int(self.weights['projects'] * 100)}%",
                "weighted_score": round(projects_score * self.weights["projects"], 1),
                "status": self._get_status(projects_score),
                "details": projects_details
            },
            {
                "category": "Work Experience",
                "score": round(experience_score, 1),
                "weight": f"{int(self.weights['experience'] * 100)}%",
                "weighted_score": round(experience_score * self.weights["experience"], 1),
                "status": self._get_status(experience_score),
                "details": exp_details
            },
            {
                "category": "Education",
                "score": round(education_score, 1),
                "weight": f"{int(self.weights['education'] * 100)}%",
                "weighted_score": round(education_score * self.weights["education"], 1),
                "status": self._get_status(education_score),
                "details": edu_details
            },
            {
                "category": "Content Quality",
                "score": round(content_quality_score, 1),
                "weight": f"{int(self.weights['content_quality'] * 100)}%",
                "weighted_score": round(content_quality_score * self.weights["content_quality"], 1),
                "status": self._get_status(content_quality_score),
                "details": self._get_content_details(word_count)
            },
            {
                "category": "ATS Compatibility",
                "score": round(ats_score, 1),
                "weight": f"{int(self.weights['ats_compatibility'] * 100)}%",
                "weighted_score": round(ats_score * self.weights["ats_compatibility"], 1),
                "status": self._get_status(ats_score),
                "details": self._get_ats_details(ats_score)
            },
        ]

        # Generate recommendations
        recommendations = self._generate_recommendations(
            category_scores, skills_data, content_data, word_count
        )

        # Determine grade
        grade = self._get_grade(overall)

        return {
            "overall_score": round(overall, 1),
            "grade": grade,
            "category_scores": category_scores,
            "breakdown": breakdown,
            "recommendations": recommendations,
            "max_possible": 100,
            "scoring_version": "1.0.0",
        }

    def _score_skills(self, skills_data: Dict) -> tuple[float, Dict]:
        """Score skills component (0-100)."""
        total_skills = skills_data.get("total_skills", 0)
        tech_count = skills_data.get("technical_count", 0)
        soft_count = skills_data.get("soft_count", 0)
        domain_count = skills_data.get("domain_count", 0)
        diversity_score = skills_data.get("skill_diversity_score", 0)
        high_demand = skills_data.get("high_demand_matches", [])
        strengths = skills_data.get("skill_strengths", {})

        # Base score from skill count (diminishing returns)
        count_score = min(50, (total_skills / 15) * 50)  # FIX1: linear scale, 15 skills = full 50pts

        # Diversity bonus (0-25)
        diversity_bonus = diversity_score * 0.25

        # High-demand skills bonus (0-15)
        demand_bonus = min(15, len(high_demand) * 2)

        # Strength quality bonus (0-10)
        avg_strength = sum(strengths.values()) / len(strengths) if strengths else 50
        strength_bonus = (avg_strength / 100) * 10

        total = count_score + diversity_bonus + demand_bonus + strength_bonus

        details = {
            "total_skills": total_skills,
            "technical": tech_count,
            "soft_skills": soft_count,
            "domain": domain_count,
            "high_demand_matches": len(high_demand),
            "diversity_score": round(diversity_score, 1),
            "avg_skill_strength": round(avg_strength, 1) if strengths else 0,
        }

        return min(100, total), details

    def _score_projects(self, projects: List[Dict]) -> tuple[float, Dict]:
        """Score projects component (0-100)."""
        if not projects:
            return 10.0, {"count": 0, "avg_tech": 0, "has_urls": False, "has_descriptions": False}  # FIX3: 0 projects != 30/100

        count = len(projects)

        # Count score (max 40)
        count_score = min(40, count * 10)

        # Tech diversity score (max 25)
        all_tech = []
        has_descriptions = 0
        has_urls = 0
        for p in projects:
            all_tech.extend(p.get("technologies", []))
            if p.get("description") and len(p["description"]) > 30:
                has_descriptions += 1
            if p.get("url"):
                has_urls += 1

        unique_tech = len(set(all_tech))
        tech_score = min(25, unique_tech * 3)

        # Description quality (max 20)
        desc_ratio = has_descriptions / max(1, count)
        desc_score = desc_ratio * 20

        # URL bonus (max 15)
        url_ratio = has_urls / max(1, count)
        url_score = url_ratio * 15

        total = count_score + tech_score + desc_score + url_score

        details = {
            "count": count,
            "unique_technologies": unique_tech,
            "has_descriptions": has_descriptions,
            "has_urls": has_urls,
            "avg_tech_per_project": round(len(all_tech) / max(1, count), 1),
        }

        return min(100, total), details

    def _score_experience(self, experiences: List[Dict]) -> tuple[float, Dict]:
        """Score work experience component (0-100)."""
        if not experiences:
            # Check if this is a fresher resume (no experience expected)
            return 20.0, {"count": 0, "total_duration": "N/A", "is_fresher": True}  # FIX2: 0 exp != Average

        count = len(experiences)

        # Count score (max 30) - diminishing returns
        count_score = min(30, 15 * math.log10(count + 1))

        # Duration estimation score (max 30)
        total_months = self._estimate_total_duration(experiences)
        if total_months < 6:
            duration_score = 10
        elif total_months < 12:
            duration_score = 20
        elif total_months < 24:
            duration_score = 25
        else:
            duration_score = 30

        # Role progression (max 20)
        titles = [e.get("title", "") for e in experiences]
        seniority_score = self._calculate_seniority_progression(titles)

        # Tech relevance (max 20)
        all_tech = []
        for e in experiences:
            all_tech.extend(e.get("technologies", []))
        unique_tech = len(set(all_tech))
        tech_score = min(20, unique_tech * 2)

        total = count_score + duration_score + seniority_score + tech_score

        details = {
            "count": count,
            "estimated_months": total_months,
            "unique_technologies": unique_tech,
            "titles": titles,
            "seniority_progression": seniority_score,
        }

        return min(100, total), details

    def _estimate_total_duration(self, experiences: List[Dict]) -> int:
        """Estimate total experience in months from duration strings."""
        total_months = 0
        for exp in experiences:
            duration = exp.get("duration", "")
            if not duration:
                continue

            # Pattern: YYYY-YYYY or YYYY-present
            match = re.search(r'(20\d{2})\s*[-–]\s*(20\d{2}|present|current)', duration, re.I)
            if match:
                start = int(match.group(1))
                end_str = match.group(2).lower()
                if end_str in ('present', 'current'):
                    end = 2025  # Current year
                else:
                    end = int(end_str)
                years = end - start
                total_months += years * 12

            # Pattern: Month Year - Month Year
            match = re.search(r'(\w+)\s+(20\d{2})\s*[-–]\s*(\w+)\s+(20\d{2}|present)', duration, re.I)
            if match:
                start_year = int(match.group(2))
                end_str = match.group(4).lower()
                end_year = 2025 if end_str in ('present', 'current') else int(end_str)
                years = end_year - start_year
                total_months += max(0, years * 12)

        return max(0, total_months)

    def _calculate_seniority_progression(self, titles: List[str]) -> float:
        """Calculate seniority progression score."""
        if not titles:
            return 0.0

        seniority_keywords = {
            "intern": 1, "trainee": 1, "fresher": 1, "junior": 2,
            "associate": 3, "developer": 3, "engineer": 3, "analyst": 3,
            "senior": 4, "lead": 5, "manager": 6, "principal": 7,
            "director": 8, "head": 8, "vp": 9, "cto": 10, "ceo": 10,
        }

        levels = []
        for title in titles:
            title_lower = title.lower()
            for keyword, level in seniority_keywords.items():
                if keyword in title_lower:
                    levels.append(level)
                    break
            else:
                levels.append(3)  # Default mid-level

        if len(levels) < 2:
            return 10.0  # Base score for single role

        # Check for progression (increasing levels)
        progression = sum(1 for i in range(1, len(levels)) if levels[i] > levels[i-1])
        return min(20, progression * 10 + 5)

    def _score_education(self, education: List[Dict]) -> tuple[float, Dict]:
        """Score education component (0-100)."""
        if not education:
            return 20.0, {"count": 0, "highest_degree": "Unknown", "has_tier1": False}

        count = len(education)

        # Count score (max 20)
        count_score = min(20, count * 10)

        # Degree quality (max 40)
        degree_scores = {
            "phd": 40, "ph.d": 40, "doctorate": 40,
            "m.tech": 35, "mtech": 35, "me": 35, "m.e": 35,
            "mba": 35, "m.b.a": 35,
            "mca": 32, "m.sc": 32, "msc": 32, "m.com": 30, "mcom": 30,
            "be": 30, "b.e": 30, "b.tech": 30, "btech": 30,
            "bca": 28, "b.sc": 28, "bsc": 28, "bba": 28,
            "diploma": 20,
        }

        max_degree_score = 0
        highest_degree = "Unknown"
        for edu in education:
            # Safely fetch degree, handling None
            degree = (edu.get("degree") or "").lower().strip()
            for deg_key, score in degree_scores.items():
                if deg_key in degree:
                    if score > max_degree_score:
                        max_degree_score = score
                        highest_degree = degree.upper()
                    break

        # Institution tier (max 25)
        tier1_keywords = [
            "iit", "indian institute of technology",
            "bits", "birla institute",
            "nit", "national institute of technology",
            "iim", "indian institute of management",
            "university", "college of engineering"
        ]
        has_tier1 = False
        for edu in education:
            # Safely fetch institution, handling None
            inst = (edu.get("institution") or "").lower()
            for tier in tier1_keywords:
                if tier in inst:
                    has_tier1 = True
                    break

        tier_score = 25 if has_tier1 else 15

        # Grade bonus (max 15)
        grade_bonus = 0
        for edu in education:
            grade = edu.get("grade", "")
            if grade:
                try:
                    # CGPA out of 10
                    if '/' in grade:
                        val = float(grade.split('/')[0])
                        if val >= 9:
                            grade_bonus = 15
                        elif val >= 8:
                            grade_bonus = 12
                        elif val >= 7:
                            grade_bonus = 8
                    # Percentage
                    elif '%' in grade:
                        val = float(grade.replace('%', ''))
                        if val >= 90:
                            grade_bonus = 15
                        elif val >= 80:
                            grade_bonus = 12
                        elif val >= 70:
                            grade_bonus = 8
                    # Raw number (assume CGPA)
                    else:
                        val = float(grade)
                        if val >= 9:
                            grade_bonus = 15
                        elif val >= 8:
                            grade_bonus = 12
                        elif val >= 7:
                            grade_bonus = 8
                except (ValueError, TypeError):
                    pass

        total = count_score + max_degree_score + tier_score + grade_bonus

        details = {
            "count": count,
            "highest_degree": highest_degree,
            "has_tier1": has_tier1,
            "grade_bonus": grade_bonus,
        }

        return min(100, total), details

    def _score_content_quality(self, text: str, word_count: int) -> float:
        """Score resume content quality (0-100)."""
        # Ideal word count: 300-800
        if word_count < 150:
            length_score = 20  # Too short
        elif word_count < 300:
            length_score = 60  # Short but acceptable
        elif word_count <= 800:
            length_score = 100  # Ideal
        elif word_count <= 1200:
            length_score = 80  # Slightly long
        else:
            length_score = 50  # Too long

        # Section presence (0-50)
        required_sections = ['education', 'experience', 'skills', 'project']
        sections_found = sum(1 for section in required_sections
                           if section in text.lower() or
                           any(s in text.lower() for s in self._get_section_variants(section)))
        section_score = (sections_found / 4) * 50

        # Contact info presence (0-20)
        has_email = bool(re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text))
        has_phone = bool(re.search(r'[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}', text))
        has_linkedin = 'linkedin' in text.lower()
        contact_score = sum([has_email, has_phone, has_linkedin]) * 6.67

        # Action verbs presence (0-20)
        action_verbs = ['developed', 'built', 'created', 'designed', 'implemented',
                       'led', 'managed', 'optimized', 'improved', 'increased',
                       'reduced', 'achieved', 'delivered', 'launched', 'architected',
                       'engineered', 'programmed', 'automated', 'streamlined']
        verb_count = sum(1 for verb in action_verbs if verb in text.lower())
        verb_score = min(20, verb_count * 2)

        total = (length_score * 0.4 + section_score * 0.3 +
                contact_score * 0.15 + verb_score * 0.15)

        return min(100, total)

    def _get_section_variants(self, section: str) -> List[str]:
        """Get common variants of section names."""
        variants = {
            'education': ['academic', 'qualification', 'degree', 'university', 'college'],
            'experience': ['work', 'employment', 'career', 'internship', 'professional'],
            'skills': ['technical skills', 'technologies', 'expertise', 'competencies', 'proficiencies'],
            'project': ['projects', 'portfolio', 'hackathon', 'case study', 'publications'],
        }
        return variants.get(section, [])

    def _score_ats_compatibility(self, text: str, skills_data: Dict) -> float:
        """Score ATS (Applicant Tracking System) compatibility (0-100)."""
        # Standard section headers (0-30)
        standard_headers = [
            'summary', 'objective', 'experience', 'education', 'skills',
            'projects', 'certifications', 'achievements'
        ]
        headers_found = sum(1 for h in standard_headers if h in text.lower())
        header_score = (headers_found / len(standard_headers)) * 30

        # Keyword density (0-30)
        total_skills = skills_data.get("total_skills", 0)
        if total_skills >= 15:
            keyword_score = 30
        elif total_skills >= 10:
            keyword_score = 25
        elif total_skills >= 5:
            keyword_score = 18
        else:
            keyword_score = 10

        # No special characters/formatting issues (0-20)
        # Check for excessive special chars that might confuse ATS
        special_chars = len(re.findall(r'[^\w\s\n\-–—.,:;/@&()|]', text))
        special_ratio = special_chars / max(1, len(text))
        formatting_score = 20 if special_ratio < 0.05 else max(0, 20 - special_ratio * 100)

        # Measurable achievements (0-20)
        # Look for numbers, percentages, metrics
        metrics_patterns = [
            r'\d+%', r'\d+\s*percent', r'\$\d+', r'\d+\s*(x|times|fold)',
            r'\d+\s*(users|customers|clients)', r'\d+\s*(requests|queries|transactions)',
            r'reduced\s+.*\d+', r'increased\s+.*\d+', r'improved\s+.*\d+',
        ]
        metrics_count = sum(1 for pattern in metrics_patterns
                          if re.search(pattern, text, re.I))
        metrics_score = min(20, metrics_count * 4)

        total = header_score + keyword_score + formatting_score + metrics_score
        return min(100, total)

    def _get_status(self, score: float) -> str:
        """Get status label for score."""
        if score >= 80:
            return "Excellent"
        elif score >= 65:
            return "Good"
        elif score >= 50:
            return "Average"
        elif score >= 35:
            return "Below Average"
        else:
            return "Needs Improvement"

    def _get_grade(self, score: float) -> str:
        """Get letter grade."""
        if score >= 90:
            return "A+"
        elif score >= 85:
            return "A"
        elif score >= 80:
            return "A-"
        elif score >= 75:
            return "B+"
        elif score >= 70:
            return "B"
        elif score >= 65:
            return "B-"
        elif score >= 60:
            return "C+"
        elif score >= 55:
            return "C"
        elif score >= 50:
            return "C-"
        elif score >= 40:
            return "D"
        else:
            return "F"

    def _get_content_details(self, word_count: int) -> Dict:
        """Get details for content quality score."""
        return {
            "word_count": word_count,
            "ideal_range": "300-800 words",
            "status": "Optimal" if 300 <= word_count <= 800 else
                     "Too Short" if word_count < 300 else "Too Long"
        }

    def _get_ats_details(self, score: float) -> Dict:
        """Get details for ATS score."""
        return {
            "standard_sections_required": 5,
            "keywords_recommended": 10,
            "formatting": "Clean" if score > 70 else "Needs cleanup",
            "metrics_found": score > 50
        }

    def _generate_recommendations(
        self,
        scores: Dict[str, float],
        skills_data: Dict,
        content_data: Dict,
        word_count: int
    ) -> List[Dict]:
        """Generate actionable recommendations based on scores."""
        recommendations = []

        # Skills recommendations
        if scores["skills"] < 60:
            total_skills = skills_data.get("total_skills", 0)
            if total_skills < 8:
                recommendations.append({
                    "priority": "high",
                    "category": "Skills",
                    "issue": f"Only {total_skills} skills detected",
                    "action": "Add more relevant technical skills. Aim for at least 10-15 skills."
                })
            else:
                recommendations.append({
                    "priority": "medium",
                    "category": "Skills",
                    "issue": "Skills lack diversity",
                    "action": "Include skills from multiple categories: technical, soft skills, and domain knowledge."
                })

        high_demand = skills_data.get("high_demand_matches", [])
        if len(high_demand) < 3:
            recommendations.append({
                "priority": "high",
                "category": "Skills",
                "issue": "Few high-demand skills",
                "action": f"Add in-demand skills like: Python, Machine Learning, React, AWS, Data Science, Cloud Computing. Currently only {len(high_demand)} found."
            })

        # Projects recommendations
        projects = content_data.get("projects", [])
        if scores["projects"] < 60:
            if len(projects) < 2:
                recommendations.append({
                    "priority": "high",
                    "category": "Projects",
                    "issue": "No projects listed" if not projects else "Only 1 project",
                    "action": "Add at least 2-3 projects with detailed descriptions, tech stack, and links (GitHub/Live demo)."
                })
            else:
                recommendations.append({
                    "priority": "medium",
                    "category": "Projects",
                    "issue": "Projects lack detail",
                    "action": "Include project descriptions with: problem solved, your role, technologies used, and measurable outcomes."
                })

        # Experience recommendations
        experience = content_data.get("experience", [])
        if scores["experience"] < 50 and not experience:
            recommendations.append({
                "priority": "medium",
                "category": "Experience",
                "issue": "No work experience listed",
                "action": "Add internships, freelance work, or significant academic projects as experience."
            })

        # Content quality recommendations
        if word_count < 300:
            recommendations.append({
                "priority": "medium",
                "category": "Content",
                "issue": f"Resume is too short ({word_count} words)",
                "action": "Expand to 400-800 words. Add more details about achievements and responsibilities."
            })
        elif word_count > 1500:
            recommendations.append({
                "priority": "medium",
                "category": "Content",
                "issue": f"Resume is too long ({word_count} words)",
                "action": "Condense to under 800 words. Focus on most relevant information."
            })

        # ATS recommendations
        if scores["ats_compatibility"] < 60:
            recommendations.append({
                "priority": "high",
                "category": "ATS",
                "issue": "Low ATS compatibility",
                "action": "Use standard section headers (Experience, Education, Skills, Projects). Avoid tables, graphics, and unusual formatting."
            })

        # If everything is good
        if not recommendations:
            recommendations.append({
                "priority": "low",
                "category": "General",
                "issue": "Resume is well-optimized",
                "action": "Great job! Keep updating with new skills and achievements. Consider tailoring for specific job applications."
            })

        # Sort by priority
        priority_order = {"high": 0, "medium": 1, "low": 2}
        recommendations.sort(key=lambda x: priority_order.get(x["priority"], 3))

        return recommendations[:6]  # Top 6 recommendations


def calculate_resume_score(analysis_data: Dict) -> Dict:
    """Quick function to calculate resume score."""
    engine = ResumeScoringEngine()
    return engine.calculate_score(analysis_data)