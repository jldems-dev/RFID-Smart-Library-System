"use client";

import { useState, useEffect } from "react";
import { useRFIDScanner } from "@/hooks/use-rfid-scanner";
import ProgressIndicator from "./progress-indicator";
import {
  ChevronLeft,
  Check,
  AlertCircle,
  BookOpen,
  ArrowRightLeft,
  Loader2,
} from "lucide-react";

interface StudentData {
  id: string;
  name: string;
  maxBooks: number;
  currentBorrows: number;
}

interface BorrowScreenProps {
  student: StudentData;
  onBack: () => void;
  onComplete: (
    success: boolean,
    message: string,
    scannedBooks: string[],
  ) => void;
}

interface ScannedBook {
  id: string;
  title: string;
  rfidtag: string;
  quantity: number;
  scannedAt: number;
}

interface CurrentBorrow {
  bookId: string;
  title: string;
  userId: string;
  status: string;
  quantity: number;
}

export default function BorrowScreen({
  student,
  onBack,
  onComplete,
}: BorrowScreenProps) {
  const [scannedBooks, setScannedBooks] = useState<ScannedBook[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const clearError = () => setTimeout(() => setError(""), 3000);

  // Calculate remaining - check against maxBooks limit
  const remainingAllowed = Math.min(
    student.maxBooks - student.currentBorrows - scannedBooks.length,
    3,
  );

  // Book RFID Scanner
  const { isWaiting: bookWaiting } = useRFIDScanner({
    onScan: async (rfidTag: string) => {
      if (scannedBooks.some((b) => b.id === rfidTag)) {
        setError("This book is already scanned!");
        clearError();
        return;
      }

      if (scannedBooks.length >= 3) {
        setError("Maximum 3 books per session!");
        clearError();
        return;
      }

      if (remainingAllowed <= 0) {
        setError("Maximum books reached!");
        clearError();
        return;
      }

      setIsProcessing(true);

      try {
        const response = await fetch(
          `/api/rfid/book/${encodeURIComponent(rfidTag)}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || "Book not found");
        }

        const bookData = data.data;

        if (bookData.status !== "AVAILABLE") {
          setError(`"${bookData.title}" is not available!`);
          clearError();
          setIsProcessing(false);
          return;
        }

        const newBook: ScannedBook = {
          id: bookData.id,
          rfidtag: rfidTag,
          title: bookData.title,
          quantity: bookData.quantity,
          scannedAt: Date.now(),
        };

        setScannedBooks((prev) => [...prev, newBook]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Book scan failed");
        clearError();
      } finally {
        setIsProcessing(false);
      }
    },
    debounceTime: 2000,
  });

  const handleRemoveBook = (bookId: string) => {
    setScannedBooks((prev) => prev.filter((b) => b.id !== bookId));
  };

  const handleComplete = async () => {
    if (scannedBooks.length === 0) {
      setError("Please scan at least one book to borrow");
      clearError();
      return;
    }

    setIsProcessing(true);

    try {
      setIsProcessing(false);
      const bookMap = new Map();

      scannedBooks.forEach((book) => {
        if (bookMap.has(book.id)) {
          const existing = bookMap.get(book.id);
          existing.scannedCount += 1;
        } else {
          bookMap.set(book.id, {
            ...book,
            scannedCount: 1,
          });
        }
      });

      const uniqueBooks = Array.from(bookMap.values());

      for (const book of uniqueBooks) {
        await fetch("/api/transactions/borrow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: student.id,
            bookId: book.id,
            title: book.title,
            notes: "Borrowed via kiosk",
          }),
        });

        await fetch("/api/rfid/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rfidTag: book.rfidtag,
            message: "Book successfully borrowed",
            action: "BORROW",
            type: "BOOK",
          }),
        });
      }

      const message = `Successfully borrowed ${uniqueBooks.length} unique book${uniqueBooks.length !== 1 ? "s" : ""}!`;
      onComplete(
        true,
        message,
        uniqueBooks.map((b) => b.id),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Borrow failed");
      clearError();
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-8 px-8 gap-6">
      {/* Header with Page Identification */}
      <div className="flex-shrink-0 w-full space-y-4">
        {/* Borrow Mode Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white font-heading">
                  Borrow Books
                </h1>
                <p className="text-blue-100 text-sm flex items-center gap-1">
                  <ArrowRightLeft className="w-3 h-3" />
                  Taking books out
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <p className="text-xs text-blue-100 uppercase tracking-wider font-semibold">
                  Mode
                </p>
                <p className="text-lg font-bold text-white">CHECKOUT</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="flex items-center justify-between bg-card border-2 border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {student.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-foreground">{student.name}</p>
              <p className="text-sm text-muted-foreground">ID: {student.id}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Available slots</p>
            <p className="text-2xl font-bold text-primary">
              {remainingAllowed}
              <span className="text-sm text-muted-foreground font-normal">
                {" "}
                / {student.maxBooks}
              </span>
            </p>
          </div>
        </div>

        <ProgressIndicator
          currentStep={scannedBooks.length > 0 ? 2 : 1}
          steps={["Identify User", "Scan Books", "Complete"]}
          description={
            scannedBooks.length > 0
              ? `${scannedBooks.length} of ${Math.min(3, student.maxBooks)} books scanned`
              : "Waiting for books…"
          }
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
        {error && (
          <div className="w-full bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 text-red-600 flex items-center gap-3 shadow-sm animate-in slide-in-from-top-2">
            <AlertCircle size={24} className="flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">Processing...</p>
          </div>
        ) : scannedBooks.length > 0 ? (
          <div className="flex flex-col items-center gap-4 animate-in zoom-in-95">
            <div className="w-32 h-32 rounded-full bg-green-100 dark:bg-green-900/30 border-4 border-green-500 flex items-center justify-center shadow-lg">
              <Check className="w-16 h-16 text-green-600" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-bold text-foreground">
                {scannedBooks[scannedBooks.length - 1].title}
              </p>
              <p className="text-green-600 font-semibold flex items-center justify-center gap-1">
                <Check className="w-4 h-4" /> Successfully scanned
              </p>
            </div>
            {remainingAllowed <= 0 && (
              <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Maximum books reached!
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 animate-pulse">
            <div className="relative">
              <div className="w-40 h-40 rounded-full bg-blue-50 dark:bg-blue-900/20 border-4 border-dashed border-blue-300 flex items-center justify-center">
                <BookOpen className="w-20 h-20 text-blue-400" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">+</span>
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold text-foreground">
                Ready to borrow
              </p>
              <p className="text-lg text-muted-foreground">
                Place books on the scanner to check out
              </p>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                {bookWaiting ? "Scanner active" : "Processing..."}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="flex-shrink-0 w-full space-y-4">
        {scannedBooks.length > 0 && (
          <div className="space-y-3">
            <div className="bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Books to Borrow
                </h2>
                <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {scannedBooks.length}
                </span>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                {scannedBooks.map((book, index) => (
                  <div
                    key={book.id}
                    className="flex items-center justify-between bg-white dark:bg-background rounded-lg p-3 border border-border shadow-sm"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-foreground truncate">
                        {book.title}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveBook(book.id)}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remove book"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleComplete}
              disabled={isProcessing || scannedBooks.length === 0}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-6 h-6" />
                  Complete Borrow
                  <span className="bg-white/20 px-2 py-0.5 rounded-lg text-sm">
                    {scannedBooks.length}
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        <button
          onClick={onBack}
          className="w-full px-6 py-3 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
        >
          <ChevronLeft size={20} />
          Back to Main Menu
        </button>
      </div>
    </div>
  );
}
