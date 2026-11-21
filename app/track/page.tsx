"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
  Image as ImageIcon,
  Loader2,
  MapPin,
  PlusCircle,
  Search,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { Category, CATEGORIES, Complaint, ComplaintStatus } from "@/lib/types";
import PriorityBadge from "@/components/PriorityBadge";
import StatusBadge from "@/components/StatusBadge";
import ProgressBar from "@/components/ProgressBar";

export default function TrackPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Expanded cards state for AI reasoning details
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedCardIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchComplaints = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/complaints");
      if (!res.ok) {
        throw new Error("Failed to load grievances.");
      }
      const data = await res.json();
      setComplaints(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load grievances.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Filter complaints based on search query, status, and category
  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      // Status filter
      if (selectedStatus !== "All" && item.status !== selectedStatus) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesLoc = item.location.toLowerCase().includes(query);
        const matchesId = item.id.toLowerCase().includes(query);
        const matchesDept = item.department.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);

        return (
          matchesTitle ||
          matchesDesc ||
          matchesLoc ||
          matchesId ||
          matchesDept ||
          matchesCat
        );
      }

      return true;
    });
  }, [complaints, selectedStatus, selectedCategory, searchQuery]);

  // Compute status counts
  const counts = useMemo(() => {
    return {
      all: complaints.length,
      reported: complaints.filter((c) => c.status === "Reported").length,
      inProgress: complaints.filter((c) => c.status === "In Progress").length,
      resolved: complaints.filter((c) => c.status === "Resolved").length,
    };
  }, [complaints]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("All");
    setSelectedCategory("All");
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Track Civic Grievances
          </h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            Transparent public tracking for municipal complaints. Monitor status,
            urgency, and departmental action.
          </p>
        </div>

        <Link
          href="/report"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md transition-all self-start md:self-auto hover:scale-[1.01]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 mb-8 space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by issue title, landmark, ID (e.g. CR-87468), or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden text-slate-800 text-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Status chips */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Status:
            </span>
            {[
              { id: "All", label: `All (${counts.all})` },
              { id: "Reported", label: `Reported (${counts.reported})` },
              { id: "In Progress", label: `In Progress (${counts.inProgress})` },
              { id: "Resolved", label: `Resolved (${counts.resolved})` },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setSelectedStatus(chip.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedStatus === chip.id
                    ? "bg-teal-700 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Category filter dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white focus:border-teal-500 outline-hidden w-full sm:w-auto"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchComplaints}
            className="text-xs font-bold underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="py-20 text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-teal-600 mx-auto" />
          <p className="text-slate-600 text-sm font-medium">
            Loading municipal grievances...
          </p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredComplaints.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            No matching complaints found
          </h3>
          <p className="text-slate-500 text-sm mt-1 mb-6">
            We couldn&apos;t find any grievance matching your current search or filter
            criteria.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Clear Search &amp; Filters
          </button>
        </div>
      )}

      {/* COMPLAINTS LIST */}
      {!loading && filteredComplaints.length > 0 && (
        <div className="space-y-5">
          {filteredComplaints.map((item) => {
            const isExpanded = !!expandedCardIds[item.id];

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-teal-300 shadow-xs hover:shadow-md transition-all p-5 sm:p-6"
              >
                {/* Header Row: ID, Created Date, Status, Priority */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200">
                      {item.id}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={item.priority} />
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                {/* Content Row: Image (if any) + Title & Details */}
                <div className="mt-4 flex flex-col md:flex-row gap-5">
                  {/* Optional Image Thumbnail */}
                  {item.imageUrl && (
                    <div className="w-full md:w-44 h-36 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Grievance Info */}
                  <div className="flex-1 space-y-2.5">
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Metadata tags: Location, Category, Department */}
                    <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-600 pt-1">
                      <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium flex-wrap">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{item.location}</span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800 hover:underline font-semibold text-[11px] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200"
                          title="Open location in Google Maps"
                        >
                          <span>Open in Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </span>

                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.category}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.department}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visual Progress Bar (Reported -> In Progress -> Resolved) */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="max-w-md mx-auto">
                    <ProgressBar status={item.status} />
                  </div>
                </div>

                {/* AI Analysis Accordion */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>
                      {item.aiSource === "gemini"
                        ? "Analyzed by Google Gemini"
                        : "Basic analysis (fallback)"}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 font-semibold cursor-pointer"
                  >
                    <span>{isExpanded ? "Hide AI Reasoning" : "View AI Reasoning"}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Collapsible AI Analysis Details */}
                {isExpanded && (
                  <div className="mt-3 p-3.5 rounded-xl bg-teal-50/50 border border-teal-100 text-xs space-y-1.5 animate-fadeIn">
                    <p className="font-semibold text-teal-900">
                      Summary: <span className="font-normal text-slate-700">{item.aiSummary}</span>
                    </p>
                    <p className="font-semibold text-teal-900">
                      AI Reasoning:{" "}
                      <span className="font-normal text-slate-700">{item.aiReasoning}</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
