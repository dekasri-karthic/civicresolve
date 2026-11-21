import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  Shield,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/70 via-white to-slate-50 py-16 sm:py-24 border-b border-teal-100/60">
        <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.06] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs sm:text-sm font-medium mb-6 shadow-xs">
            <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
            <span>Powered by Google Gemini Flash</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Empowering Citizens. <br />
            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Resolving Civic Issues Faster.
            </span>
          </h1>

          {/* Tagline Badge */}
          <div className="mt-5 flex items-center justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs sm:text-sm font-bold tracking-widest uppercase shadow-xs">
              Report • Track • Resolve
            </span>
          </div>

          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            Report potholes, garbage overflows, broken streetlights, or water
            leakages in seconds. Google Gemini automatically classifies the issue,
            evaluates urgency, and routes it directly to municipal officers.
          </p>

          {/* Core Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/report"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold text-base shadow-lg shadow-teal-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <AlertCircle className="w-5 h-5" />
              <span>Report an Issue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/track"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-300 shadow-sm transition-all hover:border-slate-400 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Clock className="w-5 h-5 text-teal-600" />
              <span>Track Issues</span>
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Shield className="w-5 h-5 text-teal-400" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            How CivicResolve Works
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            From grievance report to municipal action in 3 seamless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xl mb-4">
              1
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Citizen Reports Issue
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Describe the problem, pin your location, and upload an optional photo.
              Simple and accessible on any device.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative bg-white rounded-2xl p-6 border border-teal-200 shadow-sm hover:shadow-md transition-shadow ring-1 ring-teal-500/10">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xl mb-4">
              2
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-600" />
              Gemini AI Categorizes
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Gemini reads the report and photo, evaluates safety priority (Low to Critical),
              and routes it to the exact city department.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl mb-4">
              3
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Tracked & Resolved
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Municipal teams manage issues in their portal. Citizens get live status updates
              from Reported to In Progress to Resolved.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="bg-slate-100/70 border-t border-slate-200 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Key Civic Intelligence Features
            </h2>
            <p className="mt-2 text-slate-600 text-sm">
              Purpose-built for transparent urban governance and rapid response.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">
                AI Category Detection
              </h4>
              <p className="text-xs text-slate-600">
                Accurately maps issues into standard municipal categories even from vague descriptions.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">
                Risk-Based Priority
              </h4>
              <p className="text-xs text-slate-600">
                Automated triage identifies hazards like open live wires or sinkholes as Critical.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">
                Smart Department Routing
              </h4>
              <p className="text-xs text-slate-600">
                Assigns each issue straight to Sanitation, Public Works, Roads, or Electrical.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">
                Zero-Friction Tracking
              </h4>
              <p className="text-xs text-slate-600">
                Transparent civic accountability with visual progress tracking from day one.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
