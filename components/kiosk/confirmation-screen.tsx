"use client";

import {
  CheckCircle2,
  XCircle,
  BookOpen,
  RotateCcw,
  Library,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface ConfirmationScreenProps {
  success: boolean;
  message: string;
  bookCount: number;
  actionType?: "borrow" | "return" | "search";
}

export default function KioskConfirmation({
  success,
  message,
  bookCount,
  actionType = "borrow",
}: ConfirmationScreenProps) {
  // Determine colors based on action type and success
  const getThemeColors = () => {
    if (!success)
      return {
        primary: "red",
        gradient: "from-red-600 to-rose-600",
        bg: "bg-red-50 dark:bg-red-900/20",
        border: "border-red-200 dark:border-red-800",
        icon: "text-red-600",
        lightBg: "bg-red-100 dark:bg-red-900/30",
      };

    switch (actionType) {
      case "borrow":
        return {
          primary: "blue",
          gradient: "from-blue-600 to-indigo-600",
          bg: "bg-blue-50 dark:bg-blue-900/20",
          border: "border-blue-200 dark:border-blue-800",
          icon: "text-blue-600",
          lightBg: "bg-blue-100 dark:bg-blue-900/30",
        };
      case "return":
        return {
          primary: "amber",
          gradient: "from-amber-600 to-orange-600",
          bg: "bg-amber-50 dark:bg-amber-900/20",
          border: "border-amber-200 dark:border-amber-800",
          icon: "text-amber-600",
          lightBg: "bg-amber-100 dark:bg-amber-900/30",
        };
      case "search":
        return {
          primary: "violet",
          gradient: "from-violet-600 to-purple-600",
          bg: "bg-violet-50 dark:bg-violet-900/20",
          border: "border-violet-200 dark:border-violet-800",
          icon: "text-violet-600",
          lightBg: "bg-violet-100 dark:bg-violet-900/30",
        };
      default:
        return {
          primary: "green",
          gradient: "from-green-600 to-emerald-600",
          bg: "bg-green-50 dark:bg-green-900/20",
          border: "border-green-200 dark:border-green-800",
          icon: "text-green-600",
          lightBg: "bg-green-100 dark:bg-green-900/30",
        };
    }
  };

  const colors = getThemeColors();

  const getActionIcon = () => {
    switch (actionType) {
      case "borrow":
        return <BookOpen className="w-6 h-6" />;
      case "return":
        return <RotateCcw className="w-6 h-6" />;
      case "search":
        return <Library className="w-6 h-6" />;
      default:
        return <BookOpen className="w-6 h-6" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-8 px-8 gap-6">
      {/* Header Banner */}
      <div
        className={`w-full bg-gradient-to-r ${colors.gradient} rounded-2xl p-4 shadow-lg`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              {success ? (
                <CheckCircle2 className="w-7 h-7 text-white" />
              ) : (
                <XCircle className="w-7 h-7 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white font-heading">
                {success ? "Transaction Complete" : "Transaction Failed"}
              </h1>
              <p className="text-white/80 text-sm flex items-center gap-1">
                {getActionIcon()}
                {actionType.charAt(0).toUpperCase() + actionType.slice(1)}{" "}
                operation
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <p className="text-xs text-white/80 uppercase tracking-wider font-semibold">
                Status
              </p>
              <p className="text-lg font-bold text-white">
                {success ? "SUCCESS" : "ERROR"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl gap-8">
        {/* Status Icon */}
        <div className="relative">
          {/* Animated rings */}
          <div
            className={`absolute inset-0 rounded-full animate-ping opacity-20 ${
              success ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <div
            className={`w-40 h-40 rounded-full ${colors.lightBg} border-4 ${colors.border} flex items-center justify-center shadow-lg`}
          >
            {success ? (
              <CheckCircle2
                className={`w-20 h-20 ${colors.icon} animate-in zoom-in-50`}
              />
            ) : (
              <XCircle className="w-20 h-20 text-red-600 animate-in zoom-in-50" />
            )}
          </div>

          {/* Book count badge */}
          {success && bookCount > 0 && (
            <div
              className={`absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-background`}
            >
              <span className="text-xl font-bold text-white">{bookCount}</span>
            </div>
          )}
        </div>

        {/* Message */}
        <div className="text-center space-y-4 max-w-2xl">
          <h2
            className={`text-4xl font-bold font-heading ${
              success ? "text-foreground" : "text-red-600"
            }`}
          >
            {success ? "All Done!" : "Something Went Wrong"}
          </h2>

          <p className="text-xl text-muted-foreground leading-relaxed">
            {message}
          </p>

          {/* Success Details Card */}
          {success && (
            <div
              className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-6 mt-6`}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                {getActionIcon()}
                <span className="text-lg font-semibold text-foreground capitalize">
                  {actionType} Summary
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-background rounded-xl p-4 text-center shadow-sm">
                  <p className="text-3xl font-bold text-foreground">
                    {bookCount}
                  </p>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                    Book{bookCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="bg-white dark:bg-background rounded-xl p-4 text-center shadow-sm">
                  <p className="text-3xl font-bold text-green-600">✓</p>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                    Completed
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-foreground font-medium">
                  Thank you for using the Library Self-Service Kiosk
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please take your receipt and belongings
                </p>
              </div>
            </div>
          )}

          {/* Error Help Card */}
          {!success && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 mt-6">
              <p className="text-red-800 dark:text-red-200 font-semibold mb-2">
                What you can do:
              </p>
              <ul className="text-left text-red-700 dark:text-red-300 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span> Check if your card is
                  properly scanned
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span> Verify the books are
                  correct
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span> Contact librarian if
                  problem persists
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Auto Return Indicator */}
      <div className="flex-shrink-0 w-full max-w-md">
        <div className="bg-card border-2 border-border rounded-xl p-4 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">
              Returning to welcome screen
            </span>
          </div>

          {/* Progress dots */}
          <div className="flex gap-2">
            <div
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <div className="w-2 h-2 rounded-full bg-primary/30" />
            <div className="w-2 h-2 rounded-full bg-primary/30" />
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ArrowRight className="w-3 h-3" />
            Auto-redirect in 5 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
