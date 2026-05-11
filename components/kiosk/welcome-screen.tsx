"use client";

import { useState } from "react";
import { useRFIDScanner } from "@/hooks/use-rfid-scanner";
import { useScannerStatus } from "@/hooks/use-scanner-status";
import {
  Library,
  ScanLine,
  AlertCircle,
  BookOpen,
  RotateCcw,
  Search,
  Info,
  Wifi,
  Loader2,
} from "lucide-react";

interface StudentData {
  id: string;
  name: string;
  maxBooks: number;
  currentBorrows: number;
}

interface WelcomeScreenProps {
  onCardScanned: (student: StudentData) => void;
}

export default function KioskWelcome({ onCardScanned }: WelcomeScreenProps) {
  const { connected, loading, device } = useScannerStatus(2000);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");

  const getStatusText = () => {
    if (loading) return "Checking scanner...";
    if (connected) return "System Online • Ready to scan";
    return "RFID Scanner Offline";
  };

  const getStatusIcon = () => {
    if (loading) return <Loader2 className="w-3 h-3 animate-spin" />;
    if (connected) return <Wifi className="w-3 h-3 text-green-400" />;
    return <Wifi className="w-3 h-3 text-red-400" />;
  };

  const handleScan = async (rfidTag: string) => {
    setIsScanning(true);
    setError("");

    try {
      const response = await fetch(
        `/api/rfid/student/${encodeURIComponent(rfidTag)}`,
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || "Scan failed");
        setTimeout(() => setError(""), 3000);
        return;
      }

      const student = data.data;

      onCardScanned({
        id: student.id,
        name: student.name,
        maxBooks: student.maxBooks,
        currentBorrows: student.transactions.length,
      });

      await fetch("/api/rfid/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rfidTag: rfidTag,
          message: "RFID tag scanned at kiosk",
          action: "SCAN",
          type: student.role,
        }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsScanning(false);
    }
  };

  const { isWaiting } = useRFIDScanner({
    onScan: handleScan,
  });

  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-8 px-8 gap-6">
      {/* Header Banner */}
      <div className="w-full bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Library className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-heading">
                Library Kiosk
              </h1>
              <p
                className={`text-sm flex items-center gap-2 ${
                  loading
                    ? "text-slate-300"
                    : connected
                      ? "text-green-400"
                      : "text-red-400"
                }`}
              >
                {getStatusIcon()}
                {getStatusText()}
              </p>
              {device && (
                <p className="text-xs text-slate-500 mt-1">
                  {device.product || "Unknown Device"}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div
              className={`backdrop-blur-sm rounded-lg px-4 py-2 ${
                loading
                  ? "bg-slate-700/50"
                  : connected
                    ? "bg-green-500/20"
                    : "bg-red-500/20"
              }`}
            >
              <p className="text-xs text-slate-300 uppercase tracking-wider font-semibold">
                Status
              </p>
              <p
                className={`text-xl font-bold flex items-center gap-2 ${
                  loading
                    ? "text-slate-400"
                    : connected
                      ? "text-green-400"
                      : "text-red-400"
                }`}
              >
                {!loading && (
                  <span
                    className={`w-2 h-2 rounded-full animate-pulse ${
                      connected ? "bg-green-400" : "bg-red-400"
                    }`}
                  />
                )}
                {loading ? "..." : connected ? "ACTIVE" : "OFFLINE"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl gap-8">
        {/* Title Section */}
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-bold text-foreground font-heading">
            Welcome to the Library
          </h2>
          <p className="text-2xl text-muted-foreground">
            Self-service book management system
          </p>
        </div>

        {/* Scanner Animation */}
        <div className="relative">
          {/* Outer ring animation */}
          <div
            className={`w-48 h-48 rounded-full border-4 border-dashed flex items-center justify-center ${
              isScanning
                ? "border-yellow-500 animate-spin"
                : isWaiting
                  ? "border-slate-300 dark:border-slate-600 animate-pulse"
                  : "border-slate-200 dark:border-slate-700"
            }`}
          >
            {/* Middle ring */}
            <div
              className={`w-40 h-40 rounded-full border-4 flex items-center justify-center ${
                isScanning
                  ? "border-yellow-400"
                  : "border-slate-300 dark:border-slate-600"
              }`}
            >
              {/* Inner circle with icon */}
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg ${
                  isScanning
                    ? "bg-yellow-100 dark:bg-yellow-900/30"
                    : isWaiting
                      ? "bg-slate-100 dark:bg-slate-800 animate-pulse"
                      : "bg-slate-50 dark:bg-slate-900"
                }`}
              >
                {isScanning ? (
                  <ScanLine className="w-16 h-16 text-yellow-600 animate-pulse" />
                ) : (
                  <ScanLine className="w-16 h-16 text-slate-400" />
                )}
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <div
              className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 ${
                isScanning
                  ? "bg-yellow-500 text-white"
                  : isWaiting
                    ? "bg-green-500 text-white"
                    : "bg-slate-500 text-white"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${isScanning ? "bg-white animate-pulse" : "bg-white"}`}
              />
              {isScanning
                ? "Scanning..."
                : isWaiting
                  ? "Ready to scan"
                  : "Processing"}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center space-y-3 max-w-xl">
          <p className="text-xl font-semibold text-foreground">
            Tap your RFID card on the scanner
          </p>
          <p className="text-muted-foreground">
            Hold your card near the RFID reader below the screen. The system
            will automatically detect and verify your identity.
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div className="w-full bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 text-red-600 flex items-center gap-3 shadow-sm animate-in slide-in-from-top-2">
            <AlertCircle size={24} className="flex-shrink-0" />
            <div>
              <p className="font-semibold">Scan Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Services Overview */}
        <div className="grid grid-cols-3 gap-4 w-full">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="font-semibold text-blue-900 dark:text-blue-200">
              Borrow
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Check out books
            </p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mx-auto mb-2">
              <RotateCcw className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="font-semibold text-amber-900 dark:text-amber-200">
              Return
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Bring books back
            </p>
          </div>
          <div className="bg-violet-50 dark:bg-violet-900/20 border-2 border-violet-200 dark:border-violet-800 rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/40 rounded-full flex items-center justify-center mx-auto mb-2">
              <Search className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <p className="font-semibold text-violet-900 dark:text-violet-200">
              Search
            </p>
            <p className="text-xs text-violet-700 dark:text-violet-300">
              Browse catalog
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex-shrink-0 w-full">
        <div className="bg-card border-2 border-border rounded-xl p-4 flex items-center justify-center gap-2 text-muted-foreground">
          <Info className="w-4 h-4" />
          <p className="text-sm">
            Need help? Contact the librarian at the front desk
          </p>
        </div>
      </div>
    </div>
  );
}
