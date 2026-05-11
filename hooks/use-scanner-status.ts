import { useState, useEffect } from "react";

interface ScannerDevice {
  vendorId: number;
  productId: number;
  product: string;
  manufacturer: string;
}

interface ScannerStatus {
  connected: boolean;
  device: ScannerDevice | null;
  loading: boolean;
  error: string | null;
}

export function useScannerStatus(pollInterval = 3000) {
  const [status, setStatus] = useState<ScannerStatus>({
    connected: false,
    device: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkScanner = async () => {
      try {
        const response = await fetch("/api/rfid/status");
        const data = await response.json();

        console.log(data);

        if (data.success) {
          setStatus({
            connected: data.connected,
            device: data.device,
            loading: false,
            error: null,
          });
        } else {
          setStatus((prev) => ({
            ...prev,
            connected: false,
            loading: false,
            error: data.error || "Unknown error",
          }));
        }
      } catch (err) {
        setStatus({
          connected: false,
          device: null,
          loading: false,
          error: "Failed to check scanner status",
        });
      }
    };

    // Initial check
    checkScanner();

    // Poll every X seconds
    const interval = setInterval(checkScanner, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval]);

  return status;
}
