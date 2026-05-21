"""
CAMSPHER-AI Resume Analyzer
Skills Extractor Module - NLP-based skills extraction using:
- Keyword matching with comprehensive skills database
- Named Entity Recognition (NER) via spaCy
- TF-IDF vectorization for skill importance ranking
"""

import re
import math
from typing import List, Dict, Set, Tuple, Optional
from collections import Counter, defaultdict

from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.skills_db import (
    ALL_SKILLS,
    SKILL_CATEGORIES,
    HIGH_DEMAND_SKILLS,
    SKILL_SYNONYMS,
    SKILL_SYNONYMS as SKILL_ALIASES
)

# spaCy NER setup
try:
    import spacy
    SPACY_AVAILABLE = True
    try:
        nlp = spacy.load("en_core_web_sm")
    except OSError:
        print("Downloading spaCy model...")
        import subprocess
        subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"], check=True)
        nlp = spacy.load("en_core_web_sm")
except ImportError:
    SPACY_AVAILABLE = False
    nlp = None


class SkillsExtractor:
    """
    Extracts skills from resume text using multiple NLP techniques:
    1. Rule-based keyword matching with synonym resolution
    2. spaCy Named Entity Recognition for organization/product mentions
    3. TF-IDF scoring for skill importance/weight
    """

    def __init__(self):
        self.all_skills = ALL_SKILLS
        self.skill_categories = SKILL_CATEGORIES
        self.high_demand_skills = HIGH_DEMAND_SKILLS
        self.skill_synonyms = SKILL_SYNONYMS
        self.skill_aliases = {v: k for k, v in SKILL_SYNONYMS.items()}

        # Compile regex patterns for faster matching
        self._compile_patterns()

        # TF-IDF vectorizer (lazy init)
        self.tfidf_vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        self.skill_vocabulary: List[str] = []

    def _compile_patterns(self):
        """Pre-compile regex patterns for skill matching."""
        self.skill_patterns = {}
        for skill in self.all_skills:
            # Match whole word with word boundaries
            pattern = re.compile(r'\b' + re.escape(skill) + r'\b', re.IGNORECASE)
            self.skill_patterns[skill] = pattern

    def extract_skills(self, text: str, use_ner: bool = True, use_tfidf: bool = True) -> Dict:
        """
        Main method: Extract skills using all available NLP techniques.

        Returns:
            {
                "found_skills": [str],
                "skill_categories": {"technical": [...], "soft": [...], "domain": [...]},
                "skill_strengths": {"skill": float_score},
                "high_demand_matches": [str],
                "total_skills": int,
                "technical_count": int,
                "soft_count": int,
                "domain_count": int,
                "skill_diversity_score": float (0-100),
                "ner_entities": [{"text": str, "label": str, "type": str}],
                "tfidf_top_skills": [{"skill": str, "score": float}]
            }
        """
        # Normalize text
        clean_text = self._normalize_text(text)

        # 1. Keyword-based skill extraction
        found_skills = self._extract_by_keywords(clean_text, text)

        # 2. NER-based extraction (if available)
        ner_entities = []
        if use_ner and SPACY_AVAILABLE and nlp:
            ner_entities = self._extract_by_ner(text)
            # Some NER entities might be skills (ORG for companies -> domain knowledge)
            ner_skills = self._extract_skills_from_ner(ner_entities)
            found_skills.update(ner_skills)

        # 3. TF-IDF scoring for skill importance
        tfidf_scores = {}
        if use_tfidf:
            tfidf_scores = self._compute_tfidf_scores(text, list(found_skills))

        # Categorize skills
        categorized = self._categorize_skills(found_skills)

        # Identify high-demand skill matches
        high_demand_matches = [s for s in found_skills if s in self.high_demand_skills]

        # Calculate skill strengths (combine frequency + TF-IDF + demand weight)
        skill_strengths = self._calculate_skill_strengths(
            found_skills, tfidf_scores, clean_text
        )

        # Calculate diversity score
        diversity_score = self._calculate_diversity_score(categorized)

        # TF-IDF top skills sorted
        tfidf_top = sorted(
            [{"skill": k, "score": round(v, 4)} for k, v in tfidf_scores.items()],
            key=lambda x: x["score"],
            reverse=True
        )[:15]

        return {
            "found_skills": sorted(list(found_skills)),
            "skill_categories": categorized,
            "skill_strengths": skill_strengths,
            "high_demand_matches": sorted(high_demand_matches),
            "total_skills": len(found_skills),
            "technical_count": len(categorized["technical"]),
            "soft_count": len(categorized["soft"]),
            "domain_count": len(categorized["domain"]),
            "skill_diversity_score": round(diversity_score, 2),
            "ner_entities": ner_entities[:20],  # Limit NER output
            "tfidf_top_skills": tfidf_top,
        }

    def _normalize_text(self, text: str) -> str:
        """Normalize text for better matching."""
        text = text.lower()
        # Replace common separators with spaces
        text = text.replace('|', ' ').replace('/', ' ').replace(',', ' ')
        text = text.replace('•', ' ').replace('·', ' ')
        text = text.replace('(', ' ').replace(')', ' ')
        # Remove extra whitespace
        text = ' '.join(text.split())
        return text

    def _extract_by_keywords(self, clean_text: str, original_text: str) -> Set[str]:
        """Extract skills using regex keyword matching with synonym resolution."""
        found = set()
        text_to_search = clean_text + " " + original_text.lower()

        for skill, pattern in self.skill_patterns.items():
            if pattern.search(text_to_search):
                # Resolve to canonical form
                canonical = self.skill_synonyms.get(skill, skill)
                found.add(canonical)

        # Also check for multi-word skills with hyphen variations
        found = self._resolve_multi_word_skills(found, text_to_search)

        return found

    def _resolve_multi_word_skills(self, found: Set[str], text: str) -> Set[str]:
        """Handle hyphenated and spaced variations of multi-word skills."""
        resolved = set()
        for skill in found:
            # Add canonical form
            canonical = self.skill_synonyms.get(skill, skill)
            resolved.add(canonical)

            # Check for hyphenated version in text
            hyphenated = skill.replace(' ', '-')
            if hyphenated in text and skill in text:
                resolved.add(canonical)

            # Check for joined version
            joined = skill.replace(' ', '')
            if joined in text.replace(' ', ''):
                resolved.add(canonical)

        return resolved

    def _extract_by_ner(self, text: str) -> List[Dict]:
        """Extract named entities using spaCy NER."""
        if not nlp:
            return []

        doc = nlp(text[:50000])  # Limit text length for performance
        entities = []

        # Map spaCy entity labels to skill-relevant categories
        relevant_labels = {
            "ORG": "organization",      # Companies (Google, Microsoft) -> domain knowledge
            "PRODUCT": "product",       # Products (AWS, Kubernetes) -> technical skills
            "GPE": "location",          # Less relevant for skills
            "WORK_OF_ART": "framework", # Framework names
            "PERSON": "person",         # Not a skill
        }

        for ent in doc.ents:
            if ent.label_ in relevant_labels:
                entities.append({
                    "text": ent.text,
                    "label": ent.label_,
                    "type": relevant_labels[ent.label_],
                    "start": ent.start_char,
                    "end": ent.end_char,
                })

        return entities

    def _extract_skills_from_ner(self, entities: List[Dict]) -> Set[str]:
        """Map NER entities to known skills."""
        ner_skills = set()
        known_products = {
            "aws", "amazon web services", "azure", "gcp", "google cloud", "docker",
            "kubernetes", "jenkins", "gitlab", "github", "tensorflow", "pytorch",
            "keras", "scikit-learn", "pandas", "numpy", "react", "angular", "vue",
            "spring", "django", "flask", "fastapi", "nodejs", "next.js", "mongodb",
            "mysql", "postgresql", "redis", "elasticsearch", "kafka", "spark",
            "hadoop", "unity", "unreal engine", "sap", "salesforce", "tableau",
            "power bi", "looker", "shopify", "magento", "wordpress", "drupal",
        }

        for ent in entities:
            text_lower = ent["text"].lower()
            if text_lower in known_products:
                ner_skills.add(text_lower)
            elif text_lower in self.all_skills:
                ner_skills.add(text_lower)
            # Check if entity contains a known skill
            for skill in self.all_skills:
                if skill in text_lower or text_lower in skill:
                    if len(skill) > 3:  # Avoid short false matches
                        ner_skills.add(self.skill_synonyms.get(skill, skill))

        return ner_skills

    def _compute_tfidf_scores(self, text: str, skills: List[str]) -> Dict[str, float]:
        """
        Compute TF-IDF scores for skills to determine importance.
        Uses a small corpus of reference documents for IDF calculation.
        """
        if not skills:
            return {}

        # Create reference corpus (various job descriptions for IDF baseline)
        reference_corpus = [
            "software engineer python java javascript react nodejs full stack developer",
            "data scientist machine learning deep learning tensorflow pytorch neural networks",
            "devops engineer aws docker kubernetes terraform ci/cd cloud infrastructure",
            "frontend developer html css javascript react angular vue typescript",
            "backend developer java python golang microservices api database sql nosql",
            "android developer kotlin java firebase mobile app development",
            "ios developer swift objective-c mobile app development",
            "business analyst data analysis sql excel tableau power bi reporting",
            "project manager agile scrum kanban jira confluence stakeholder management",
            "cybersecurity engineer penetration testing network security ethical hacking",
            "ai engineer natural language processing computer vision llm generative ai",
            "full stack developer frontend backend database api rest graphql",
            "cloud engineer aws azure gcp infrastructure serverless lambda",
            "qa engineer automation testing selenium cypress manual testing",
            "product manager roadmap strategy user research analytics metrics",
        ]

        # Add the resume text as a document
        all_documents = reference_corpus + [text]

        # Fit TF-IDF with skill-focused parameters
        vectorizer = TfidfVectorizer(
            lowercase=True,
            stop_words='english',
            max_features=5000,
            ngram_range=(1, 3),  # Unigrams, bigrams, trigrams for multi-word skills
            min_df=1,
            max_df=0.95,
        )

        try:
            tfidf_matrix = vectorizer.fit_transform(all_documents)
            feature_names = vectorizer.get_feature_names_out()
            resume_vector = tfidf_matrix[-1]  # Last document is the resume

            # ✅ FIX 5: Build O(1) lookup dict once instead of O(n) list.index() per skill
            feature_index = {name: i for i, name in enumerate(feature_names)}

            # Extract scores for found skills
            skill_scores = {}
            for skill in skills:
                # Try exact match, then variations
                variations = [
                    skill,
                    skill.replace(' ', '_'),
                    skill.replace(' ', '-'),
                    skill.replace('.', ''),
                    skill.replace('/', ' '),
                ]

                for var in variations:
                    # ✅ FIX 5 continued: O(1) dict lookup instead of list.index()
                    idx = feature_index.get(var)
                    if idx is not None:
                        score = resume_vector[0, idx]
                        skill_scores[skill] = max(skill_scores.get(skill, 0), float(score))
                        break

                # If no exact match, try fuzzy matching with ngrams
                if skill not in skill_scores:
                    words = skill.split()
                    if len(words) == 2:  # Bigram
                        bigram = f"{words[0]} {words[1]}"
                        idx = feature_index.get(bigram)
                        if idx is not None:
                            skill_scores[skill] = float(resume_vector[0, idx])

            return skill_scores

        except Exception:
            # Fallback: use simple frequency-based scoring
            return self._fallback_skill_scores(text, skills)

    def _fallback_skill_scores(self, text: str, skills: List[str]) -> Dict[str, float]:
        """Fallback scoring using simple term frequency."""
        text_lower = text.lower()
        words = text_lower.split()
        total_words = len(words)

        scores = {}
        for skill in skills:
            count = text_lower.count(skill)
            # Normalize by text length
            score = min(1.0, count / max(1, total_words / 100))
            scores[skill] = score

        return scores

    def _categorize_skills(self, skills: Set[str]) -> Dict[str, List[str]]:
        """Categorize found skills into technical, soft, and domain."""
        categorized = {
            "technical": [],
            "soft": [],
            "domain": [],
            "uncategorized": []
        }

        for skill in skills:
            found_category = None
            for category, skill_set in self.skill_categories.items():
                if skill in skill_set:
                    found_category = category
                    break

            if found_category:
                categorized[found_category].append(skill)
            else:
                categorized["uncategorized"].append(skill)

        return {
            "technical": sorted(categorized["technical"]),
            "soft": sorted(categorized["soft"]),
            "domain": sorted(categorized["domain"]),
            "uncategorized": sorted(categorized["uncategorized"]),
        }

    def _calculate_skill_strengths(
        self,
        skills: Set[str],
        tfidf_scores: Dict[str, float],
        text: str
    ) -> Dict[str, float]:
        """
        Calculate per-skill strength scores (0-100).
        Combines:
        - TF-IDF importance weight (30%)
        - Demand score (25%)
        - Frequency in text (25%)
        - Category weight (20%)

        v1.1.0 fixes:
          FIX 1: tfidf default 0.5 → 0.0  (was inflating every skill baseline)
          FIX 2: demand_mult 1.5/1.0 → normalized 1.0/0.4  (was exceeding weight budget)
          FIX 3: category_weight 1.0-1.2 → normalized 0.60-1.0  (same issue)
          FIX 4: removed max(40, raw_score) floor  (was giving every skill ≥ 40 regardless)
        """
        strengths = {}
        text_lower = text.lower()
        word_count = len(text.split())

        for skill in skills:
            # ✅ FIX 1: Default to 0.0 not 0.5 — absent TF-IDF = 0, not inflated
            tfidf_raw = tfidf_scores.get(skill, 0.0)
            # Normalize: typical max TF-IDF in a 500-word doc ≈ 0.30
            tfidf_norm = min(1.0, tfidf_raw / 0.30)

            # ✅ FIX 2: Normalize demand score to 0–1 range
            # Old: demand_mult = 1.5 or 1.0 (used as multiplier, not a 0-1 weight)
            # New: demand_norm = 1.0 or 0.4 (both within the 0-1 budget for 25 pts)
            demand_norm = 1.0 if skill in self.high_demand_skills else 0.4

            # Frequency score (unchanged — already 0–1)
            frequency = text_lower.count(skill)
            freq_score = min(1.0, frequency / max(1, word_count / 200))

            # ✅ FIX 3: Normalize category weight to 0–1 range
            # Old: 1.0–1.2 (values > 1.0 exceeded the weight budget of 20 pts)
            # New: 0.60–1.0 so the maximum contribution is exactly 20 pts
            if skill in self.skill_categories["technical"]:
                cat_norm = 1.0    # technical → full 20 pts
            elif skill in self.skill_categories["domain"]:
                cat_norm = 0.85   # domain → 17 pts
            elif skill in self.skill_categories["soft"]:
                cat_norm = 0.70   # soft → 14 pts
            else:
                cat_norm = 0.60   # uncategorized → 12 pts

            # All components are 0–1, weights sum to 100
            raw_score = (
                (tfidf_norm  * 30) +   # 0–30
                (demand_norm * 25) +   # 0–25
                (freq_score  * 25) +   # 0–25
                (cat_norm    * 20)     # 0–20
            )

            # ✅ FIX 4: Remove min 40 floor — a weak skill SHOULD score low
            # Old: min(100, max(40, raw_score))
            # New: min(100, max(0, raw_score))
            normalized = min(100, max(0, raw_score))
            strengths[skill] = round(normalized, 1)

        return strengths

    def _calculate_diversity_score(self, categorized: Dict[str, List[str]]) -> float:
        """
        Calculate skill diversity score (0-100).
        Rewards having skills across multiple categories.

        v1.1.0 fix:
          FIX 6: base_score log10 → linear scale
          Old: min(60, 20 * math.log10(total + 1))  — needs 99,999 skills to reach 60
          New: min(60, (total / 20) * 60)             — 20 skills = full 60 pts
        """
        tech = len(categorized["technical"])
        soft = len(categorized["soft"])
        domain = len(categorized["domain"])

        # Base score from counts
        total = tech + soft + domain
        if total == 0:
            return 0.0

        # Diversity bonus for multi-category skills
        categories_with_skills = sum(1 for c in [tech, soft, domain] if c > 0)
        diversity_bonus = categories_with_skills * 15  # 15 points per category

        # ✅ FIX 6: Linear scale — 20 skills = full 60 pts (was log10 unreachable)
        base_score = min(60, (total / 20) * 60)

        # Penalty for being single-category
        category_balance = min(tech, soft, domain) / max(1, total / 3)
        balance_bonus = category_balance * 10

        total_score = base_score + diversity_bonus + balance_bonus
        return min(100, total_score)


# Convenience function
def extract_skills(text: str) -> Dict:
    """Quick function to extract skills from resume text."""
    extractor = SkillsExtractor()
    return extractor.extract_skills(text)