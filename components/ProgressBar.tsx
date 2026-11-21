import { ComplaintStatus } from "@/lib/types";
import { CheckCircle2, CircleDot, Clock } from "lucide-react";

interface ProgressBarProps {
  status: ComplaintStatus;
  className?: string;
}

export default function ProgressBar({ status, className = "" }: ProgressBarProps) {
  const steps: { key: ComplaintStatus; label: string }[] = [
    { key: "Reported", label: "Reported" },
    { key: "In Progress", label: "In Progress" },
    { key: "Resolved", label: "Resolved" },
  ];

  const statusIndex =
    status === "Resolved" ? 2 : status === "In Progress" ? 1 : 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="relative flex items-center justify-between">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate-200 -z-0">
          <div
            className="h-full bg-teal-600 transition-all duration-500 ease-out"
            style={{
              width:
                statusIndex === 0 ? "0%" : statusIndex === 1 ? "50%" : "100%",
            }}
          />
        </div>

        {/* Step Nodes */}
        {steps.map((step, idx) => {
          const isDone = idx < statusIndex;
          const isCurrent = idx === statusIndex;
          const isPending = idx > statusIndex;

          return (
            <div
              key={step.key}
              className="relative z-10 flex flex-col items-center group"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                  isDone
                    ? "bg-teal-600 text-white ring-4 ring-teal-50"
                    : isCurrent
                    ? status === "Resolved"
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-50"
                      : "bg-teal-600 text-white ring-4 ring-teal-100 animate-pulse"
                    : "bg-white text-slate-400 border-2 border-slate-300"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  status === "Resolved" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <CircleDot className="w-4 h-4 text-white" />
                  )
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <span
                className={`mt-1.5 text-[11px] font-semibold tracking-tight transition-colors ${
                  isDone || isCurrent
                    ? status === "Resolved" && isCurrent
                      ? "text-emerald-700 font-bold"
                      : "text-teal-900 font-bold"
                    : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
