"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface RFIDScannerOptions {
  onScan: (uid: string) => void;
  debounceTime?: number; // milliseconds to prevent duplicate scans
}

interface RFIDScannerState {
  isScanning: boolean;
  lastScannedUid: string | null;
  isWaiting: boolean;
}

export function useRFIDScanner({
  onScan,
  debounceTime = 3000,
}: RFIDScannerOptions) {
  const [state, setState] = useState<RFIDScannerState>({
    isScanning: true,
    lastScannedUid: null,
    isWaiting: true,
  });

  const rfidInputRef = useRef<string>("");
  const lastScanTimeRef = useRef<number>(0);
  const inputTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleRFIDScan = useCallback(
    (uid: string) => {
      const now = Date.now();
      const timeSinceLastScan = now - lastScanTimeRef.current;

      // Prevent duplicate scans within debounce time
      if (timeSinceLastScan < debounceTime) {
        console.log(
          "[v0] RFID scan ignored - duplicate within debounce period",
        );
        return;
      }

      lastScanTimeRef.current = now;
      setState((prev) => ({
        ...prev,
        lastScannedUid: uid,
        isWaiting: false,
      }));

      onScan(uid);
    },
    [onScan, debounceTime],
  );

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if input is focused on text fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" &&
        target.getAttribute("type") !== "text"
      ) {
        return;
      }

      // RFID scanners typically send Enter key at the end
      if (event.key === "Enter") {
        if (rfidInputRef.current.length > 0) {
          handleRFIDScan(rfidInputRef.current);
          rfidInputRef.current = "";
        }
        return;
      }

      // Only accept numeric input and common characters (typical for RFID UIDs)
      if (/^[a-zA-Z0-9\-:]$/.test(event.key) || event.key === "Backspace") {
        if (event.key === "Backspace") {
          rfidInputRef.current = rfidInputRef.current.slice(0, -1);
        } else {
          rfidInputRef.current += event.key;
        }

        // Reset timeout - clear input if no new keys for 5 seconds
        if (inputTimeoutRef.current) {
          clearTimeout(inputTimeoutRef.current);
        }
        inputTimeoutRef.current = setTimeout(() => {
          rfidInputRef.current = "";
        }, 5000);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      if (inputTimeoutRef.current) {
        clearTimeout(inputTimeoutRef.current);
      }
    };
  }, [handleRFIDScan]);

  return {
    ...state,
  };
}
