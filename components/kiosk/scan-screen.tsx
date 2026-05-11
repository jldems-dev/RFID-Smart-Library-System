"use client";

import { useState } from "react";
import ProgressIndicator from "./progress-indicator";

interface ScanScreenProps {
  action: "borrow" | "return" | null;
  scannedBooks: string[];
  onBookScanned: (bookId: string) => void;
  onComplete: (success: boolean, message: string) => void;
}

export default function KioskScan({
  action,
  scannedBooks,
  onBookScanned,
  onComplete,
}: ScanScreenProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScannedBook, setLastScannedBook] = useState<string | null>(null);

  const mockBooks = {
    borrow: [
      "The Great Gatsby",
      "To Kill a Mockingbird",
      "1984",
      "Pride and Prejudice",
    ],
    return: ["Dune", "The Hobbit", "Sapiens", "Educated"],
  };

  const availableBooks =
    action === "borrow"
      ? mockBooks.borrow.filter((_, i) => !scannedBooks.includes(`book-${i}`))
      : mockBooks.return.filter((_, i) => !scannedBooks.includes(`book-${i}`));

  const simulateScan = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const bookIndex = availableBooks[0]
        ? Math.floor(Math.random() * availableBooks.length)
        : 0;
      const bookId = `book-${scannedBooks.length}`;
      const bookName =
        action === "borrow"
          ? mockBooks.borrow[bookIndex % mockBooks.borrow.length]
          : mockBooks.return[bookIndex % mockBooks.return.length];
      setLastScannedBook(bookName);
      onBookScanned(bookId);
      setIsProcessing(false);
    }, 800);
  };

  const handleComplete = () => {
    if (scannedBooks.length > 0) {
      const message =
        action === "borrow"
          ? `Successfully borrowed ${scannedBooks.length} book${scannedBooks.length !== 1 ? "s" : ""}!`
          : `Successfully returned ${scannedBooks.length} book${scannedBooks.length !== 1 ? "s" : ""}!`;
      onComplete(true, message);
    } else {
      onComplete(false, "Please scan at least one book to continue");
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-12 px-8 gap-8">
      {/* Progress Indicator */}
      <div className="flex-shrink-0">
        <ProgressIndicator
          currentStep={scannedBooks.length > 0 ? 2 : 1}
          steps={["Identify User", "Scan Books", "Confirm"]}
          description={
            scannedBooks.length > 0
              ? `${scannedBooks.length} book${scannedBooks.length !== 1 ? "s" : ""} scanned`
              : "Waiting for RFID..."
          }
        />
      </div>

      {/* Scan Area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        {isProcessing ? (
          <>
            <div className="w-40 h-40 rounded-full border-8 border-primary flex items-center justify-center animate-spin">
              <span className="text-6xl">📚</span>
            </div>
            <p className="text-3xl font-bold text-foreground">Processing...</p>
          </>
        ) : lastScannedBook ? (
          <>
            <div className="w-40 h-40 rounded-full bg-green-100 dark:bg-green-900/30 border-8 border-green-500 flex items-center justify-center">
              <span className="text-6xl">✓</span>
            </div>
            <p className="text-2xl font-bold text-foreground text-center">
              {lastScannedBook} scanned successfully!
            </p>
            <button
              onClick={simulateScan}
              disabled={isProcessing}
              className="px-12 py-6 bg-primary text-primary-foreground text-2xl font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer font-heading"
            >
              Scan Another Book
            </button>
          </>
        ) : (
          <>
            <div className="w-40 h-40 rounded-full border-8 border-primary animate-pulse flex items-center justify-center">
              <span className="text-6xl">📚</span>
            </div>
            <button
              onClick={simulateScan}
              disabled={isProcessing}
              className="px-12 py-6 bg-primary text-primary-foreground text-2xl font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer font-heading"
            >
              Scan Book
            </button>
            <p className="text-xl text-muted-foreground text-center max-w-2xl">
              Place each book on the scanner to begin.
            </p>
          </>
        )}
      </div>

      {/* Scanned Books Summary */}
      {scannedBooks.length > 0 && (
        <div className="flex-shrink-0 w-full space-y-4">
          <div className="bg-card border-2 border-border rounded-2xl p-6 max-h-40 overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground font-heading mb-4">
              Scanned Books ({scannedBooks.length}):
            </h2>
            <ul className="space-y-2">
              {scannedBooks.map((bookId, index) => (
                <li key={bookId} className="text-lg text-foreground">
                  {index + 1}.{" "}
                  {action === "borrow"
                    ? mockBooks.borrow[index % mockBooks.borrow.length]
                    : mockBooks.return[index % mockBooks.return.length]}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleComplete}
            disabled={isProcessing}
            className="w-full px-8 py-6 bg-accent text-accent-foreground text-2xl font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer font-heading"
          >
            Complete Transaction
          </button>
        </div>
      )}
    </div>
  );
}
