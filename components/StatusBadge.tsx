import { ComplaintStatus } from "@/lib/types";
import { CheckCircle2, Clock, Hourglass } from "lucide-react";

interface StatusBadgeProps {
  status: ComplaintStatus;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const configs: Record<
    ComplaintStatus,
    { label: string; bg: string; text: string; border: string; icon: any }
  > = {
    Reported: {
      label: "Reported",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: Clock,
    },
    "In Progress": {
      label: "In Progress",
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
      icon: Hourglass,
    },
    Resolved: {
      label: "Resolved",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: CheckCircle2,
    },
  };

  const config = configs[status] || configs.Reported;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}
