import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  getStudentProfile,
  loadSavedPipeline,
  runStudentPipeline,
} from "../../api/camspherApi";

const PlacementContext = createContext(null);

export function usePlacement() {
  const ctx = useContext(PlacementContext);
  if (!ctx) {
    throw new Error("usePlacement must be used within PlacementProvider");
  }
  return ctx;
}

export function PlacementProvider({ children }) {
  const [resumeData, setResumeData] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [skills, setSkills] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ percent: 0, message: "", step: "" });

  useEffect(() => {
    const saved = loadSavedPipeline();
    if (saved) {
      setResumeData(saved.resumeData || null);
      setJobData(saved.jobData || null);
      setPrediction(saved.prediction || null);
      setReadiness(saved.readiness || null);
      setSkills(saved.skills || []);
    }
  }, []);

  const runPipeline = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    setProgress({ percent: 0, message: "Starting…", step: "init" });

    try {
      const profile = getStudentProfile();
      const result = await runStudentPipeline(file, profile, setProgress);

      setResumeData(result.resumeData);
      setJobData(result.jobData);
      setPrediction(result.prediction);
      setReadiness(result.readiness);
      setSkills(result.skills);

      const mergedSkills = [
        ...new Set([
          ...(profile.skills || []),
          ...(result.skills || []),
        ]),
      ];
      localStorage.setItem(
        "profile",
        JSON.stringify({ ...profile, skills: mergedSkills })
      );

      return result;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("[Pipeline]", err);
      }
      const message =
        err?.message ||
        (typeof err === "string" ? err : "Pipeline failed");
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearPipeline = useCallback(() => {
    setResumeData(null);
    setJobData(null);
    setPrediction(null);
    setReadiness(null);
    setSkills([]);
    setError(null);
    setProgress({ percent: 0, message: "", step: "" });
    localStorage.removeItem("placementPipeline");
  }, []);

  const getAtsScore = () =>
    resumeData?.analysis?.scoring?.category_scores?.ats_compatibility ?? null;

  const value = {
    resumeData,
    jobData,
    prediction,
    readiness,
    skills,
    loading,
    error,
    progress,
    runPipeline,
    clearPipeline,
    getAtsScore,
    hasResults: Boolean(resumeData),
  };

  return (
    <PlacementContext.Provider value={value}>
      {children}
    </PlacementContext.Provider>
  );
}
