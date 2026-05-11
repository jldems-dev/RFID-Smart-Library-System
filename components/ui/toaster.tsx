"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { Check, AlertCircle, AlertTriangle, X } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant,
        ...props
      }) {
        // Default to success if no variant provided
        const type = variant || "success";

        const isSuccess = type === "success";
        const isError = type === "destructive";
        const isWarning = type === "default";

        return (
          <Toast
            key={id}
            {...props}
            className="group relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border-0 bg-white p-4 shadow-lg pr-8"
            style={{
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            }}
          >
            {/* Icon */}
            <div
              className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                isSuccess
                  ? "bg-emerald-100 text-emerald-600"
                  : isError
                    ? "bg-red-100 text-red-600"
                    : isWarning
                      ? "bg-amber-100 text-amber-600"
                      : ""
              }`}
            >
              {isSuccess && <Check size={20} strokeWidth={2.5} />}
              {isError && <AlertCircle size={20} />}
              {isWarning && <AlertTriangle size={20} />}
            </div>

            {/* Content */}
            <div className="flex-1 grid gap-0.5 pt-1">
              {title && (
                <ToastTitle className="text-base font-semibold text-gray-900">
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription className="text-sm text-gray-500">
                  {description}
                </ToastDescription>
              )}
            </div>

            {action}

            {/* Close button */}
            <ToastClose className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X size={16} />
            </ToastClose>
          </Toast>
        );
      })}
      <ToastViewport className="fixed top-4 right-4 z-100 flex w-full max-w-sm flex-col gap-3 p-4" />
    </ToastProvider>
  );
}
