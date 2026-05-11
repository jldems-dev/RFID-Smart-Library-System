"use client";

import { useState, useEffect } from "react";
import { X, Book, Calendar, Clock, AlertCircle, Loader2 } from "lucide-react";

interface BorrowedBook {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  borrowDate: string;
  dueDate: string;
  isOverdue: boolean;
  daysRemaining: number;
}

interface BorrowedBooksModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
}

export default function BorrowedBooksModal({
  isOpen,
  onClose,
  studentId,
  studentName,
}: BorrowedBooksModalProps) {
  const [books, setBooks] = useState<BorrowedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchBorrowedBooks();
    }
  }, [isOpen, studentId]);

  const fetchBorrowedBooks = async () => {
    setLoading(true);
    setError(null);

    try {
      // Replace with your actual API endpoint
      const response = await fetch(`/api/users/${studentId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch borrowed books");
      }

      const result = await response.json();

      const books = result.data.transactions.map((item: any) => {
        const borrowDate = new Date(item.borrowDate).getTime();
        const dueDate = new Date(item.dueDate).getTime();

        const diffTime = dueDate - borrowDate;
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          id: item.book.id,
          title: item.book.title,
          author: item.book.author,
          borrowDate: item.borrowDated,
          dueDate: item.dueDate,
          isOverdue: daysRemaining < 0,
          daysRemaining: daysRemaining,
        };
      });

      setBooks(books);
    } catch (err) {
      setBooks([
        {
          id: "1",
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          borrowDate: "2024-03-01",
          dueDate: "2024-03-15",
          isOverdue: false,
          daysRemaining: 5,
        },
        {
          id: "2",
          title: "Introduction to Algorithms",
          author: "Thomas H. Cormen",
          borrowDate: "2024-02-20",
          dueDate: "2024-03-10",
          isOverdue: true,
          daysRemaining: -2,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-background rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Book className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-heading">
                Borrowed Books
              </h2>
              <p className="text-amber-100 text-sm">
                {studentName} • {books.length} book
                {books.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
              <p className="text-muted-foreground">Loading borrowed books...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <div>
                <p className="font-semibold text-red-600">
                  Failed to load books
                </p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
              <button
                onClick={fetchBorrowedBooks}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : books.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <Book className="w-10 h-10 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">
                  No Books Borrowed
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {studentName} hasn&apos;t borrowed any books yet
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {books.map((book) => (
                <div
                  key={book.id}
                  className={`group relative p-4 rounded-2xl border-2 transition-all hover:shadow-md ${
                    book.isOverdue
                      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                      : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Book Cover Placeholder */}
                    <div
                      className={`w-16 h-20 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        book.isOverdue
                          ? "bg-red-200 dark:bg-red-800"
                          : "bg-amber-200 dark:bg-amber-800"
                      }`}
                    >
                      <Book
                        className={`w-8 h-8 ${
                          book.isOverdue
                            ? "text-red-600 dark:text-red-300"
                            : "text-amber-600 dark:text-amber-300"
                        }`}
                      />
                    </div>

                    {/* Book Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground truncate text-lg">
                        {book.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {book.author}
                      </p>

                      <div className="flex items-center gap-4 mt-3">
                        {/* Due Date */}
                        <div
                          className={`flex items-center gap-1.5 text-sm ${
                            book.isOverdue
                              ? "text-red-600 dark:text-red-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Due: {formatDate(book.dueDate)}</span>
                        </div>

                        {/* Days Remaining */}
                        <div
                          className={`flex items-center gap-1.5 text-sm font-medium ${
                            book.isOverdue
                              ? "text-red-600 dark:text-red-400"
                              : "text-green-600 dark:text-green-400"
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          <span>
                            {book.isOverdue
                              ? `${Math.abs(book.daysRemaining)} days overdue`
                              : `${book.daysRemaining} days left`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {book.isOverdue && (
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                          OVERDUE
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-muted/50 border-t border-border flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {books.filter((b) => b.isOverdue).length > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <AlertCircle className="w-4 h-4" />
                {books.filter((b) => b.isOverdue).length} overdue book
                {books.filter((b) => b.isOverdue).length !== 1 ? "s" : ""}
              </span>
            )}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-foreground text-background font-semibold rounded-xl hover:bg-foreground/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
