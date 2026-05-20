/**
 * CAMSPHER-AI — Central API Service (axios)
 *
 * Dev (Vite :5173): VITE_API_URL="" → requests use /api/* proxy → :8000
 * Prod: set VITE_API_URL=http://127.0.0.1:8000
 */
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ""
    ? import.meta.env.VITE_API_URL
    : import.meta.env.DEV
      ? ""
      : "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 300000,
  headers: {
    Accept: "application/json",
  },
});

function formatApiError(error) {
  if (import.meta.env.DEV) {
    console.error("[API Error]", error?.message, error?.response?.data);
  }

  if (error.code === "ECONNABORTED") {
    return "Request timed out. Large scanned PDFs can take a few minutes — try again.";
  }

  if (!error.response) {
    const target = API_BASE || `${window.location.origin} (Vite proxy → :8000)`;
    return (
      `Cannot reach the backend at ${target}. ` +
      `Start it in a separate terminal: cd backend/resume_analyzer && python main.py ` +
      `(then open http://127.0.0.1:8000/docs to verify).`
    );
  }

  const data = error.response.data;
  if (typeof data === "string") return data;
  if (Array.isArray(data?.detail)) {
    return data.detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
  }
  return data?.detail || data?.message || error.message || "Request failed";
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = formatApiError(error);
    return Promise.reject(new Error(message));
  }
);

async function request(endpoint, options = {}) {
  const { method = "GET", body, headers, ...rest } = options;
  const config = {
    url: endpoint,
    method,
    headers: { ...headers },
    ...rest,
  };
  if (body !== undefined) {
    config.data = typeof body === "string" ? JSON.parse(body) : body;
    config.headers = { "Content-Type": "application/json", ...config.headers };
  }
  const { data } = await api.request(config);
  return data;
}

/** Upload resume with progress; do not set Content-Type (axios sets multipart boundary). */
async function uploadWithProgress(endpoint, formData, onProgress) {
  if (import.meta.env.DEV) {
    console.log("[API] Uploading file to", `${API_BASE}${endpoint}`);
  }
  const { data } = await api.post(endpoint, formData, {
    timeout: 300000,
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  if (import.meta.env.DEV) {
    console.log("[API] Upload response", data?.success, data?.extraction?.extraction_method_used);
  }
  return data;
}

// ─── Profile helpers ─────────────────────────────────────────────────────────

export function getStudentProfile() {
  return JSON.parse(localStorage.getItem("profile") || "{}");
}

export function normalizeBranch(profile = {}) {
  const raw = (profile.branch || profile.degree || "CSE").toString().toUpperCase();
  if (raw.includes("IT")) return "IT";
  if (raw.includes("ECE")) return "ECE";
  if (raw.includes("EEE")) return "EEE";
  if (raw.includes("ME")) return "ME";
  return "CSE";
}

export function buildPredictPayload(resumeData, jobData, profile = {}) {
  const summary = resumeData?.summary || {};
  const analysis = resumeData?.analysis || {};
  const skills = analysis.skills || {};
  const scoring = analysis.scoring || {};
  const categoryScores = scoring.category_scores || {};
  const topJob = jobData?.top_recommendations?.[0];

  return {
    cgpa: parseFloat(profile.cgpa) || 7.0,
    resume_score: summary.overall_score ?? 50,
    skills_count: summary.total_skills ?? 0,
    technical_skills: summary.technical_skills ?? 0,
    soft_skills: summary.soft_skills ?? 0,
    high_demand_skills: summary.high_demand_skills ?? 0,
    projects_count: summary.projects_count ?? 0,
    exp_months: (summary.experience_count ?? 0) * 3,
    certifications: summary.certifications_count ?? 0,
    job_match_score: topJob?.match_score ?? 0,
    ats_score: categoryScores.ats_compatibility ?? 50,
    skill_diversity_score: skills.skill_diversity_score ?? 50,
    has_backlogs: !!profile.has_backlogs,
    branch: normalizeBranch(profile),
    model_choice: "ensemble",
  };
}

export function buildReadinessPayload(resumeData, jobData, prediction, profile = {}) {
  const summary = resumeData?.summary || {};
  const analysis = resumeData?.analysis || {};
  const skills = analysis.skills || {};
  const scoring = analysis.scoring || {};
  const categoryScores = scoring.category_scores || {};
  const topJob = jobData?.top_recommendations?.[0];

  return {
    cgpa: parseFloat(profile.cgpa) || 7.0,
    branch: normalizeBranch(profile),
    has_backlogs: !!profile.has_backlogs,
    resume_score: summary.overall_score ?? 50,
    total_skills: summary.total_skills ?? 0,
    technical_skills: summary.technical_skills ?? 0,
    high_demand_skills: summary.high_demand_skills ?? 0,
    skill_diversity: skills.skill_diversity_score ?? 50,
    projects_count: summary.projects_count ?? 0,
    certifications: summary.certifications_count ?? 0,
    ats_score: categoryScores.ats_compatibility ?? 50,
    job_match_score: topJob?.match_score ?? 0,
    total_jobs_matched: jobData?.total_jobs_matched ?? 0,
    selection_probability: prediction?.selection_probability ?? 50,
    mock_test_score: profile.mock_test_score ?? null,
  };
}

// ─── General ─────────────────────────────────────────────────────────────────

export const checkHealth = async () => {
  const { data } = await api.get("/health");
  return data;
};

/** Verify backend before upload (optional). */
export async function ensureBackendReachable() {
  try {
    await checkHealth();
    return true;
  } catch (e) {
    throw e;
  }
}

// ─── Model 1: Resume Analyzer ────────────────────────────────────────────────

export const analyzeResumeText = (resumeText) =>
  request("/api/analyze/text", {
    method: "POST",
    body: JSON.stringify({ resume_text: resumeText }),
  });

export const uploadResume = async (file, onProgress) => {
  if (import.meta.env.DEV) {
    console.log("[API] Sending resume", file?.name, file?.size);
  }
  const formData = new FormData();
  formData.append("file", file);
  return uploadWithProgress("/api/analyze/file", formData, onProgress);
};

export const analyzeResumeFile = uploadResume;

// ─── Model 2: Job Recommender ────────────────────────────────────────────────

export const getJobRecommendations = (payload) =>
  request("/api/recommend-jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getAllJobs = ({ category, experience_level, search, limit = 20 } = {}) => {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (experience_level) params.append("experience_level", experience_level);
  if (search) params.append("search", search);
  params.append("limit", limit);
  return request(`/api/jobs?${params}`);
};

export const getJobCategories = () => request("/api/jobs/categories");
export const getJobById = (jobId) => request(`/api/jobs/${jobId}`);
export const getSimilarJobs = (jobId, limit = 5) =>
  request(`/api/jobs/${jobId}/similar?limit=${limit}`);

// ─── Model 3: Selection Predictor ────────────────────────────────────────────

export const predictPlacement = (data) =>
  request("/api/predict", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const predictSelection = predictPlacement;
export const getModel3Metrics = () => request("/api/model3/metrics");

// ─── Model 4: Placement Readiness ────────────────────────────────────────────

export const getFullReadiness = (payload) =>
  request("/api/readiness", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getReadinessScore = (data) =>
  request("/api/readiness/direct", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getReadinessDirect = getReadinessScore;

export const runPipelineFromFile = (file, profile = {}, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("cgpa", String(parseFloat(profile.cgpa) || 7.0));
  formData.append("branch", normalizeBranch(profile));
  formData.append("has_backlogs", profile.has_backlogs ? "true" : "false");
  formData.append("top_n", String(profile.top_n || 10));
  formData.append("model_choice", "ensemble");
  if (profile.mock_test_score != null) {
    formData.append("mock_test_score", String(profile.mock_test_score));
  }
  return uploadWithProgress("/api/readiness/file", formData, onProgress);
};

const PIPELINE_STAGES = {
  upload: { end: 18 },
  extract: { end: 42 },
  ocr: { end: 55 },
  analyze: { end: 68 },
  jobs: { start: 68, end: 82 },
  predict: { start: 82, end: 92 },
  readiness: { start: 92, end: 100 },
};

function mapUploadProgress(uploadPct, resumeData) {
  if (uploadPct < 100) {
    return {
      percent: Math.min(18, Math.round(uploadPct * 0.18)),
      message: `Uploading… ${uploadPct}%`,
      step: "upload",
    };
  }
  const method = resumeData?.extraction?.extraction_method_used || "";
  const isOcr = /ocr|tesseract|easyocr|pymupdf_render|pdf2image/i.test(method);
  if (isOcr) {
    return { percent: 55, message: "Running OCR…", step: "ocr" };
  }
  return { percent: 42, message: "Extracting text…", step: "extract" };
}

export async function runStudentPipeline(file, profile = {}, onStep) {
  const step = (pct, msg, key) => onStep?.({ percent: pct, message: msg, step: key });

  await ensureBackendReachable();

  step(2, "Uploading…", "upload");
  const resumeData = await uploadResume(file, (uploadPct) => {
    onStep?.({
      percent: Math.min(18, Math.round(uploadPct * 0.18)),
      message: `Uploading… ${uploadPct}%`,
      step: "upload",
    });
  });

  onStep?.(mapUploadProgress(100, resumeData));

  if (!resumeData?.success) {
    throw new Error(resumeData?.detail || "Resume analysis failed");
  }

  step(68, "Analyzing resume…", "analyze");

  const skills = resumeData.analysis?.skills?.found_skills || [];

  step(PIPELINE_STAGES.jobs.start, "Generating job recommendations…", "jobs");
  const jobData = await getJobRecommendations({
    skills,
    cgpa: parseFloat(profile.cgpa) || 7.0,
    branch: normalizeBranch(profile),
    has_backlogs: !!profile.has_backlogs,
    top_n: profile.top_n || 10,
  });
  step(PIPELINE_STAGES.jobs.end, "Job matches ready", "jobs");

  step(PIPELINE_STAGES.predict.start, "Predicting placement…", "predict");
  const prediction = await predictPlacement(
    buildPredictPayload(resumeData, jobData, profile)
  );
  step(PIPELINE_STAGES.predict.end, "Placement prediction ready", "predict");

  step(PIPELINE_STAGES.readiness.start, "Computing readiness score…", "readiness");
  const readiness = await getReadinessScore(
    buildReadinessPayload(resumeData, jobData, prediction, profile)
  );

  step(100, "Analysis complete", "done");

  const pipeline = { resumeData, jobData, prediction, readiness, skills };
  localStorage.setItem("placementPipeline", JSON.stringify(pipeline));
  return pipeline;
}

export function loadSavedPipeline() {
  try {
    return JSON.parse(localStorage.getItem("placementPipeline") || "null");
  } catch {
    return null;
  }
}

export default api;
