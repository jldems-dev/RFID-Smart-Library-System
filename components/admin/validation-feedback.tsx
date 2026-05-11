"use client";

import { AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";

export type ValidationStatus = "success" | "error" | "warning" | "info" | null;

interface ValidationFeedbackProps {
  status: ValidationStatus;
  message: string;
  details?: string;
}

export default function ValidationFeedback({
  status,
  message,
  details,
}: ValidationFeedbackProps) {
  if (!status) return null;

  const styles = {
    success: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      icon: CheckCircle,
      iconColor: "text-green-600 dark:text-green-400",
      textColor: "text-green-900 dark:text-green-100",
    },
    error: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      icon: AlertCircle,
      iconColor: "text-red-600 dark:text-red-400",
      textColor: "text-red-900 dark:text-red-100",
    },
    warning: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      border: "border-yellow-200 dark:border-yellow-800",
      icon: AlertTriangle,
      iconColor: "text-yellow-600 dark:text-yellow-400",
      textColor: "text-yellow-900 dark:text-yellow-100",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      icon: Info,
      iconColor: "text-blue-600 dark:text-blue-400",
      textColor: "text-blue-900 dark:text-blue-100",
    },
  };

  const style = styles[status];
  const Icon = style.icon;

  return (
    <div
      className={`p-4 rounded-lg border flex gap-3 ${style.bg} ${style.border} animate-in fade-in slide-in-from-top-2 duration-300`}
    >
      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${style.iconColor}`} />
      <div className="flex-1">
        <p className={`font-medium ${style.textColor}`}>{message}</p>
        {details && (
          <p className={`text-sm mt-1 ${style.textColor} opacity-80`}>
            {details}
          </p>
        )}
      </div>
    </div>
  );
}
