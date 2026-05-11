"use client";

import { useState, useEffect } from "react";
import { useRFIDScanner } from "@/hooks/use-rfid-scanner";
import ProgressIndicator from "./progress-indicator";
import {
  ChevronLeft,
  Check,
  AlertCircle,
  BookOpen,
  RotateCcw,
  User,
  Loader2,
} from "lucide-react";

interface StudentData {
  id: string;
  name: string;
  maxBooks: number;
  currentBorrows: number;
}

interface ReturnScreenProps {
  student: StudentData;
  onBack: () => void;
  onComplete: (
    success: boolean,
    message: string,
    scannedBooks: string[],
  ) => void;
}

interface BorrowedBook {
  id: string;
  bookId: string;
  title: string;
  borrowDate: string;
  dueDate: string;
  isOverdue: boolean;
}

interface ScannedBook {
  id: string;
  title: string;
  quantity: number;
  totalQuantity: number;
  scannedAt: number;
}

export default function ReturnScreen({
  student,
  onBack,
  onComplete,
}: ReturnScreenProps) {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [scannedBooks, setScannedBooks] = useState<ScannedBook[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [error, setError] = useState("");

  const clearError = () => setTimeout(() => setError(""), 3000);

  // Calculate overdue books count
  const overdueCount = borrowedBooks.filter((b) => b.isOverdue).length;

  // Fetch borrowed books on mount (since student is already provided)
  useEffect(() => {
    fetchBorrowedBooks();
  }, [student.id]);

  const fetchBorrowedBooks = async () => {
    setIsLoadingBooks(true);
    try {
      const statuses = ["ACTIVE", "OVERDUE"];
      const queryParams = new URLSearchParams({
        userId: student.id,
      });
      statuses.forEach((status) => queryParams.append("status", status));

      const response = await fetch(
        `/api/transactions/?${queryParams.toString()}`,
      );
      const data = await response.json();

      if (response.ok) {
        // Transform API data to match our interface
        const activeBorrows = (data.data || []).map((borrow: any) => ({
          id: borrow.id,
          bookId: borrow.bookId,
          title: borrow.bookTitle || borrow.title || "Unknown Book",
          borrowDate: borrow.borrowDate,
          dueDate: borrow.dueDate,
          isOverdue: new Date(borrow.dueDate) < new Date(),
        }));
        setBorrowedBooks(activeBorrows);
      } else {
        setError("Failed to load borrowed books");
        clearError();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load borrowed books",
      );
      clearError();
    } finally {
      setIsLoadingBooks(false);
    }
  };

  // Book RFID Scanner
  const { isWaiting: bookWaiting } = useRFIDScanner({
    onScan: async (rfidTag: string) => {
      if (scannedBooks.some((b) => b.id === rfidTag)) {
        setError("This book is already scanned!");
        clearError();
        return;
      }

      setIsProcessing(true);
      setError("");

      try {
        // Verify book belongs to student via API
        const response = await fetch(
          `/api/rfid/book/${encodeURIComponent(rfidTag)}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || "Book not found");
        }

        const bookData = data.data;

        // Check if this book is actually borrowed by this student
        const matchedBorrow = borrowedBooks.find(
          (b) => b.bookId === bookData.id,
        );

        if (!matchedBorrow) {
          setError(`"${bookData.title}" is not in your borrowed list!`);
          clearError();
          setIsProcessing(false);
          return;
        }

        const newBook: ScannedBook = {
          id: bookData.id,
          title: bookData.title,
          quantity: bookData.quantity,
          totalQuantity: bookData.totalQuantity,
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
      setError("Please scan at least one book to return");
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

      // Process returns via API
      for (const book of uniqueBooks) {
        await fetch("/api/transactions/return", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: student.id,
            bookId: book.id,
            title: book.title,
            notes: "Returned via kiosk",
          }),
        });
      }

      const overdueBooks = scannedBooks.filter((book) => {
        const borrowed = borrowedBooks.find((b) => b.bookId === book.id);
        return borrowed?.isOverdue;
      });

      let message = `Successfully returned ${scannedBooks.length} book${scannedBooks.length !== 1 ? "s" : ""}!`;
      if (overdueBooks.length > 0) {
        message += ` (${overdueBooks.length} overdue - fee may apply)`;
      }

      onComplete(
        true,
        message,
        scannedBooks.map((b) => b.id),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Return failed");
      clearError();
      setIsProcessing(false);
    }
  };

  // Render loading state while fetching borrowed books
  if (isLoadingBooks) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center py-8 px-8 gap-6">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-4 shadow-lg w-full max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <RotateCcw className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white font-heading">
                Return Books
              </h1>
              <p className="text-orange-100 text-sm">{student.name}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin" />
            <BookOpen className="absolute inset-0 m-auto w-10 h-10 text-orange-600" />
          </div>
          <p className="text-xl font-bold text-foreground">
            Loading your books...
          </p>
          <p className="text-muted-foreground">
            Fetching active borrow from library
          </p>
        </div>

        <button
          onClick={onBack}
          className="w-full max-w-2xl px-6 py-3 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
        >
          <ChevronLeft size={20} />
          Cancel and Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-8 px-8 gap-6">
      {/* Header */}
      <div className="flex-shrink-0 w-full space-y-4">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <RotateCcw className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white font-heading">
                  Return Books
                </h1>
                <p className="text-orange-100 text-sm flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {student.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <p className="text-xs text-orange-100 uppercase tracking-wider font-semibold">
                  Mode
                </p>
                <p className="text-lg font-bold text-white">CHECKIN</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Info & Stats */}
        <div className="flex items-center justify-between bg-card border-2 border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-amber-700 dark:text-amber-300">
                {student.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-foreground">{student.name}</p>
              <p className="text-sm text-muted-foreground">ID: {student.id}</p>
            </div>
          </div>
          <div className="flex gap-4 text-right">
            <div>
              <p className="text-sm text-muted-foreground">Active Borrow</p>
              <p className="text-2xl font-bold text-foreground">
                {borrowedBooks.length}
              </p>
            </div>
            {overdueCount > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {overdueCount}
                </p>
              </div>
            )}
          </div>
        </div>

        <ProgressIndicator
          currentStep={scannedBooks.length > 0 ? 2 : 1}
          steps={["Select Action", "Return Books", "Complete"]}
          description={
            scannedBooks.length > 0
              ? `${scannedBooks.length} book${scannedBooks.length !== 1 ? "s" : ""} ready to return`
              : "Scan books to return"
          }
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
        {error && (
          <div className="w-full bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 text-red-600 flex items-center gap-3 shadow-sm animate-in slide-in-from-top-2">
            <AlertCircle size={24} className="flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {borrowedBooks.length === 0 ? (
          <div className="flex flex-col items-center gap-6">
            <div className="w-32 h-32 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check className="w-16 h-16 text-green-600" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold text-foreground">
                No borrowed books
              </p>
              <p className="text-lg text-muted-foreground">
                {student.name} has no active borrow to return.
              </p>
            </div>
            <button
              onClick={() => onComplete(true, "No books to return", [])}
              className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xl font-bold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg"
            >
              Return to Menu
            </button>
          </div>
        ) : (
          <>
            {isProcessing ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-orange-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  Processing...
                </p>
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
                    <Check className="w-4 h-4" /> Ready to return
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Scan another book or complete the return
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 animate-pulse">
                <div className="relative">
                  <div className="w-40 h-40 rounded-full bg-orange-50 dark:bg-orange-900/20 border-4 border-dashed border-orange-300 flex items-center justify-center">
                    <BookOpen className="w-20 h-20 text-orange-400" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center shadow-lg">
                    <RotateCcw className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-foreground">
                    Ready to return
                  </p>
                  <p className="text-lg text-muted-foreground">
                    Place borrowed books on the scanner
                  </p>
                  <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" />
                    {bookWaiting ? "Scanner active" : "Processing..."}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Section */}
      <div className="flex-shrink-0 w-full space-y-4">
        {scannedBooks.length > 0 && (
          <div className="space-y-3">
            <div className="bg-orange-50/50 dark:bg-orange-900/10 border-2 border-orange-200 dark:border-orange-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-orange-600" />
                  Books to Return
                </h2>
                <span className="bg-orange-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {scannedBooks.length}
                </span>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                {scannedBooks.map((book, index) => {
                  const borrowInfo = borrowedBooks.find(
                    (b) => b.bookId === book.id,
                  );
                  return (
                    <div
                      key={book.id}
                      className="flex items-center justify-between bg-white dark:bg-background rounded-lg p-3 border border-border shadow-sm"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="font-medium text-foreground block truncate">
                            {book.title}
                          </span>
                          {borrowInfo?.isOverdue && (
                            <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Overdue since{" "}
                              {new Date(
                                borrowInfo.dueDate,
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveBook(book.id)}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove book"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleComplete}
              disabled={isProcessing || scannedBooks.length === 0}
              className="w-full px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xl font-bold rounded-xl hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-6 h-6" />
                  Complete Return
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
