"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Bot,
  Building2,
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  Info,
  Loader2,
  MapPin,
  RefreshCw,
  Sparkles,
  UploadCloud,
  X,
  FileText,
} from "lucide-react";
import { Category, CATEGORIES, ClassificationResult, Priority, PRIORITIES } from "@/lib/types";
import PriorityBadge from "@/components/PriorityBadge";

export default function ReportPage() {
  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("auto");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Photo-first AI analysis states
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [photoAiNote, setPhotoAiNote] = useState<string | null>(null);
  const [photoAiError, setPhotoAiError] = useState<string | null>(null);

  // Flow states: "form" | "analyzing" | "review" | "submitting" | "success"
  const [step, setStep] = useState<"form" | "analyzing" | "review" | "submitting" | "success">(
    "form"
  );

  // AI Classification result (editable in review step)
  const [aiResult, setAiResult] = useState<ClassificationResult | null>(null);
  const [finalCategory, setFinalCategory] = useState<Category>("Road & Potholes");
  const [finalPriority, setFinalPriority] = useState<Priority>("Medium");
  const [finalDepartment, setFinalDepartment] = useState<string>("");

  // Submission result
  const [createdIssueId, setCreatedIssueId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image selection & trigger photo-first AI detection
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    setPhotoAiError(null);
    setPhotoAiNote(null);

    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrorMessage("Please upload a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image file must be 5 MB or less.");
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Call POST /api/analyze-image for photo-first auto-completion
    setAnalyzingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.title) setTitle(data.title);
        if (data.description) setDescription(data.description);
        if (data.category && CATEGORIES.includes(data.category)) {
          setSelectedCategory(data.category);
        }
        setPhotoAiNote(
          "✨ AI analyzed your photo and auto-filled the title, description, and category. You can edit any field below."
        );
      } else {
        // Gentle fallback message without breaking or crashing
        setPhotoAiError(
          "Could not automatically detect issue details from this photo. Please describe it manually below."
        );
      }
    } catch (err: any) {
      console.warn("Photo analysis error (continuing without auto-fill):", err);
      setPhotoAiError(
        "Could not automatically detect issue details from this photo. Please describe it manually below."
      );
    } finally {
      setAnalyzingPhoto(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setPhotoAiNote(null);
    setPhotoAiError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Step 1: Citizen submits form to trigger AI classification & priority triage
  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Please enter an issue title.");
      return;
    }

    if (!description.trim()) {
      setErrorMessage("Please describe the problem.");
      return;
    }

    if (!location.trim()) {
      setErrorMessage("Please specify the street address or neighborhood.");
      return;
    }

    setStep("analyzing");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("location", location);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/classify", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to classify grievance.");
      }

      const data: ClassificationResult = await res.json();
      setAiResult(data);

      const initialCat =
        selectedCategory !== "auto" && CATEGORIES.includes(selectedCategory as Category)
          ? (selectedCategory as Category)
          : data.category;

      setFinalCategory(initialCat);
      setFinalPriority(data.priority);
      setFinalDepartment(data.department);
      setStep("review");
    } catch (err: any) {
      console.error("Classification error:", err);
      setErrorMessage(err.message || "Failed to analyze grievance. Please try again.");
      setStep("form");
    }
  };

  // Step 2: Citizen confirms AI review and creates the complaint
  const handleConfirmSubmit = async () => {
    if (!aiResult) return;
    setStep("submitting");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("location", location);
      formData.append("category", finalCategory);
      formData.append("priority", finalPriority);
      formData.append("department", finalDepartment || aiResult.department);
      formData.append("aiSummary", aiResult.summary);
      formData.append("aiReasoning", aiResult.reasoning);
      formData.append("aiSource", aiResult.source);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/complaints", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to record complaint.");
      }

      const created = await res.json();
      setCreatedIssueId(created.id);
      setStep("success");
    } catch (err: any) {
      console.error("Creation error:", err);
      setErrorMessage(err.message || "Failed to submit complaint. Please try again.");
      setStep("review");
    }
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setSelectedCategory("auto");
    removeImage();
    setAiResult(null);
    setCreatedIssueId("");
    setErrorMessage("");
    setStep("form");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 w-full">
      {/* Page Title */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
          <Camera className="w-3.5 h-3.5 text-teal-600" />
          <span>Photo-First AI Reporting</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Civic Grievance
        </h1>
        <p className="text-slate-600 mt-1 text-sm sm:text-base">
          Upload a photo to let Gemini auto-fill the issue details, or type them in manually.
        </p>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-semibold">Notice: </strong>
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage("")}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STATE 1: INITIAL REPORT FORM */}
      {step === "form" && (
        <form
          onSubmit={handleAnalyze}
          className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6"
        >
          {/* PHOTO-FIRST UPLOAD SECTION */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-teal-50/50 to-slate-50 border border-teal-100/80">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-teal-600" />
                <span>Snap or Upload Issue Photo (Photo-First)</span>
              </label>
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-100/70 px-2.5 py-0.5 rounded-full">
                AI Vision
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Upload a clear photo (JPG, PNG, or WebP). Gemini Vision will automatically detect the civic problem and fill in the form for you!
            </p>

            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-teal-300 hover:border-teal-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-white hover:bg-teal-50/30 group"
              >
                <UploadCloud className="w-8 h-8 text-teal-500 group-hover:scale-110 mx-auto mb-2 transition-transform" />
                <p className="text-sm font-semibold text-slate-800">
                  Click to select photo, or drag and drop
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  JPG, PNG, or WEBP up to 5 MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 max-w-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Issue preview"
                    className="w-full h-44 object-cover opacity-90"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition-colors shadow-md cursor-pointer"
                    title="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="p-2.5 bg-white text-xs text-slate-600 flex items-center justify-between">
                    <span className="truncate">{imageFile?.name}</span>
                    <span className="shrink-0 text-slate-400">
                      {imageFile ? `${(imageFile.size / 1024 / 1024).toFixed(2)} MB` : ""}
                    </span>
                  </div>
                </div>

                {/* Photo-First Analyzing Loading State */}
                {analyzingPhoto && (
                  <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex items-center gap-2.5 text-xs text-teal-800 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600 shrink-0" />
                    <span>Gemini is inspecting your photo to identify the civic issue...</span>
                  </div>
                )}

                {/* Photo-First AI Success Note */}
                {!analyzingPhoto && photoAiNote && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <strong className="font-semibold">AI filled this from your photo: </strong>
                      <span>Review the title, description, and category below. You can edit any detail.</span>
                    </div>
                  </div>
                )}

                {/* Photo-First Gentle Failure Notice */}
                {!analyzingPhoto && photoAiError && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{photoAiError}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-slate-800"
              >
                Issue Title <span className="text-red-500">*</span>
              </label>
              {photoAiNote && (
                <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                  Auto-suggested
                </span>
              )}
            </div>
            <input
              id="title"
              type="text"
              placeholder="e.g., Deep pothole near City Library entrance"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden text-slate-800 text-sm transition-all"
              required
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-slate-800"
              >
                Description <span className="text-red-500">*</span>
              </label>
              {photoAiNote && (
                <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                  Auto-suggested
                </span>
              )}
            </div>
            <textarea
              id="description"
              rows={4}
              placeholder="Describe what happened, how severe it is, or any immediate hazards to pedestrians or motorists..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden text-slate-800 text-sm transition-all resize-y"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              Location / Landmark <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="location"
                type="text"
                placeholder="e.g., Corner of 4th Cross & 12th Main, Indiranagar"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden text-slate-800 text-sm transition-all"
                required
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden text-slate-800 text-sm bg-white transition-all font-medium"
            >
              <option value="auto">✨ Let AI decide (Recommended)</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Leave on &ldquo;Let AI decide&rdquo; for Gemini to verify category during submission.
            </p>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={analyzingPhoto}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold text-sm shadow-md shadow-teal-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Review with AI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STATE 2: AI ANALYZING LOADING STATE */}
      {step === "analyzing" && (
        <div className="bg-white rounded-2xl border border-teal-200 shadow-md p-10 sm:p-14 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">
              AI is analyzing your report...
            </h3>
            <p className="text-slate-600 text-sm mt-1.5 max-w-md mx-auto">
              Google Gemini is reading your grievance details, evaluating public safety risk,
              and matching with the relevant municipal division.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span>Assessing urgency • Extracting category • Recommending department</span>
          </div>
        </div>
      )}

      {/* STATE 3: REVIEW AI ANALYSIS CARD (EDITABLE) */}
      {step === "review" && aiResult && (
        <div className="space-y-6">
          {/* AI Analysis Card */}
          <div className="bg-white rounded-2xl border-2 border-teal-500/80 shadow-lg p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-teal-500/10 to-transparent w-48 h-48 pointer-events-none" />

            {/* AI Source Pill */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                <h3 className="text-lg font-bold text-slate-900">
                  AI Intelligence Assessment
                </h3>
              </div>

              {aiResult.source === "gemini" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Analyzed by Gemini</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                  <Bot className="w-3.5 h-3.5 text-amber-600" />
                  <span>Basic analysis (fallback)</span>
                </span>
              )}
            </div>

            {/* Summary Line */}
            <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">
                Executive AI Summary
              </p>
              <p className="text-slate-800 font-medium text-sm sm:text-base leading-snug">
                {aiResult.summary}
              </p>
            </div>

            {/* Reasoning */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">
                AI Reasoning &amp; Hazard Context
              </p>
              <p className="text-sm text-slate-600 leading-relaxed bg-teal-50/40 p-3 rounded-lg border border-teal-100">
                {aiResult.reasoning}
              </p>
            </div>

            {/* Editable Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
              {/* Category Editable */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assigned Category (Editable)
                </label>
                <select
                  value={finalCategory}
                  onChange={(e) => setFinalCategory(e.target.value as Category)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-medium text-sm text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  AI chose: <strong className="text-teal-700">{aiResult.category}</strong>
                </p>
              </div>

              {/* Priority Editable */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Priority Level (Editable)
                  </label>
                  <PriorityBadge priority={finalPriority} />
                </div>
                <select
                  value={finalPriority}
                  onChange={(e) => setFinalPriority(e.target.value as Priority)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-medium text-sm text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  AI assessed: <strong className="text-teal-700">{aiResult.priority}</strong>
                </p>
              </div>
            </div>

            {/* Department */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-teal-600" />
                Target Municipal Department:
              </span>
              <span className="font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-md">
                {finalDepartment || aiResult.department}
              </span>
            </div>
          </div>

          {/* Confirmation Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setStep("form")}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Modify Details</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmSubmit}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md transition-all hover:scale-[1.01] cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm &amp; Submit Complaint</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 4: SUBMITTING FINAL STATE */}
      {step === "submitting" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-10 text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">
            Filing grievance in municipal records...
          </h3>
        </div>
      )}

      {/* STATE 5: SUCCESS CONFIRMATION */}
      {step === "success" && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-lg p-8 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-2">
              Status: Reported
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Grievance Successfully Filed!
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-md mx-auto">
              Your report has been logged with ID{" "}
              <strong className="text-slate-900 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-sm">
                {createdIssueId}
              </strong>{" "}
              and dispatched to the{" "}
              <strong className="text-teal-700">
                {finalDepartment || aiResult?.department}
              </strong>
              .
            </p>
          </div>

          {/* Quick Recap Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-sm max-w-md mx-auto space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Issue ID:</span>
              <span className="font-mono font-bold text-slate-900">{createdIssueId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Category:</span>
              <span className="font-semibold text-slate-800">{finalCategory}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Priority:</span>
              <PriorityBadge priority={finalPriority} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">AI Source:</span>
              <span className="text-xs font-semibold text-teal-700">
                {aiResult?.source === "gemini" ? "Analyzed by Gemini" : "Basic analysis (fallback)"}
              </span>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/track"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md transition-all hover:scale-[1.01]"
            >
              <span>Track This &amp; Other Issues</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
