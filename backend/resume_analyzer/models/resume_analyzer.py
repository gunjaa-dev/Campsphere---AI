"""
CAMSPHER-AI Resume Analyzer
Main Analyzer Module - Orchestrates all NLP components
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from typing import Dict, Union, Optional
from utils.text_extractor import TextExtractor
from utils.skills_extractor import SkillsExtractor
from utils.content_extractor import ContentExtractor
from utils.scoring_engine import ResumeScoringEngine


class ResumeAnalyzer:
    """
    Main Resume Analyzer class for CAMSPHER-AI.
    Orchestrates text extraction, skills extraction, content parsing, and scoring.
    """

    def __init__(self):
        self.text_extractor = TextExtractor()
        self.skills_extractor = SkillsExtractor()
        self.content_extractor = ContentExtractor()
        self.scoring_engine = ResumeScoringEngine()

    def analyze_file(
        self,
        file_content: bytes,
        filename: str,
        content_type: Optional[str] = None,
    ) -> Dict:
        """
        Analyze a resume file (PDF, DOCX, DOC, or image).

        Args:
            file_content: Raw bytes of the file
            filename: Name with extension
            content_type: Optional MIME type from upload

        Returns:
            Complete analysis result with scores + extraction metadata
        """
        extraction = self.text_extractor.extract_with_metadata(
            file_content, filename, content_type
        )
        raw_text = extraction["cleaned_text"]
        result = self._analyze_text(raw_text)
        result["extraction"] = {
            "raw_text_length": len(extraction.get("raw_text", "")),
            "cleaned_text_length": extraction.get("character_count", len(raw_text)),
            "extraction_method_used": extraction.get("extraction_method_used"),
            "confidence_score": extraction.get("confidence_score"),
            "file_type_detected": extraction.get("file_type_detected"),
            "warnings": extraction.get("warnings", []),
        }
        return result

    def analyze_text(self, text: str) -> Dict:
        """
        Analyze raw resume text (pasted text).

        Args:
            text: Raw resume text

        Returns:
            Complete analysis result with scores
        """
        raw_text = self.text_extractor.extract_from_text(text)
        return self._analyze_text(raw_text)

    def _analyze_text(self, raw_text: str) -> Dict:
        """Internal: Run full analysis pipeline on text."""
        word_count = len(raw_text.split())

        # Step 2: Extract skills using NLP
        skills_result = self.skills_extractor.extract_skills(raw_text)

        # Step 3: Extract structured content (projects, experience, education)
        content_result = self.content_extractor.extract_all(raw_text)

        # Step 4: Calculate resume score
        analysis_data = {
            "skills": skills_result,
            "content": content_result,
            "raw_text": raw_text,
            "word_count": word_count,
        }
        scoring_result = self.scoring_engine.calculate_score(analysis_data)

        # Step 5: Compile final result
        return {
            "success": True,
            "filename": getattr(self, '_last_filename', 'text_input'),
            "analysis": {
                "text_stats": {
                    "word_count": word_count,
                    "character_count": len(raw_text),
                    "line_count": len(raw_text.split('\n')),
                },
                "skills": skills_result,
                "content": content_result,
                "scoring": scoring_result,
            },
            "summary": {
                "overall_score": scoring_result["overall_score"],
                "grade": scoring_result["grade"],
                "total_skills": skills_result["total_skills"],
                "technical_skills": skills_result["technical_count"],
                "soft_skills": skills_result["soft_count"],
                "high_demand_skills": len(skills_result["high_demand_matches"]),
                "projects_count": len(content_result.get("projects", [])),
                "experience_count": len(content_result.get("experience", [])),
                "education_count": len(content_result.get("education", [])),
                "certifications_count": len(content_result.get("certifications", [])),
                "top_recommendation": scoring_result["recommendations"][0] if scoring_result["recommendations"] else None,
            }
        }

    def analyze(
        self,
        input_data: Union[str, bytes],
        filename: Optional[str] = None,
        content_type: Optional[str] = None,
    ) -> Dict:
        """
        Universal analyze method - accepts file bytes or text.

        Args:
            input_data: Either file bytes or text string
            filename: Required if input_data is bytes
            content_type: Optional MIME type for file bytes

        Returns:
            Complete analysis result
        """
        if isinstance(input_data, bytes):
            if not filename:
                raise ValueError("filename is required when input_data is bytes")
            self._last_filename = filename
            return self.analyze_file(input_data, filename, content_type)
        else:
            self._last_filename = filename or "text_input"
            return self.analyze_text(str(input_data))


# Singleton instance for easy import
_default_analyzer = None

def get_analyzer() -> ResumeAnalyzer:
    """Get or create default analyzer instance."""
    global _default_analyzer
    if _default_analyzer is None:
        _default_analyzer = ResumeAnalyzer()
    return _default_analyzer


def analyze_resume(input_data: Union[str, bytes], filename: Optional[str] = None) -> Dict:
    """
    Quick function to analyze a resume.

    Usage:
        # Analyze file
        with open('resume.pdf', 'rb') as f:
            result = analyze_resume(f.read(), 'resume.pdf')

        # Analyze text
        result = analyze_resume(resume_text)
    """
    analyzer = get_analyzer()
    return analyzer.analyze(input_data, filename)
