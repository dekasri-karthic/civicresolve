import { Priority } from "@/lib/types";
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from "lucide-react";

interface PriorityBadgeProps {
  priority: Priority;
  showIcon?: boolean;
  className?: string;
}

export default function PriorityBadge({
  priority,
  showIcon = true,
  className = "",
}: PriorityBadgeProps) {
  const configs: Record<
    Priority,
    { label: string; bg: string; text: string; border: string; icon: any }
  > = {
    Low: {
      label: "Low Priority",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: Info,
    },
    Medium: {
      label: "Medium Priority",
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
      icon: AlertCircle,
    },
    High: {
      label: "High Priority",
      bg: "bg-orange-50",
      text: "text-orange-800",
      border: "border-orange-200",
      icon: AlertTriangle,
    },
    Critical: {
      label: "Critical Risk",
      bg: "bg-red-50",
      text: "text-red-800",
      border: "border-red-300",
      icon: ShieldAlert,
    },
  };

  const config = configs[priority] || configs.Medium;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{priority}</span>
    </span>
  );
}
