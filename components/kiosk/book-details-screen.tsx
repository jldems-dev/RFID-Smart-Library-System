"use client";

import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BookDetailsScreenProps {
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    isAvailable: boolean;
  };
  onBack: () => void;
}

export default function BookDetailsScreen({
  book,
  onBack,
}: BookDetailsScreenProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-8 py-12">
      <button
        onClick={onBack}
        className="absolute top-8 left-8 p-3 rounded-full hover:bg-secondary transition-colors"
        title="Back to search"
      >
        <ArrowLeft className="h-8 w-8 text-foreground" />
      </button>

      <div className="w-full max-w-2xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-foreground font-heading text-pretty">
            {book.title}
          </h1>
          <p className="text-3xl text-muted-foreground">{book.author}</p>
        </div>

        {/* Book Details Card */}
        <div className="bg-card border-2 border-border rounded-3xl p-12 space-y-10">
          {/* Availability Status */}
          <div className="flex items-center justify-center gap-6">
            <span className="text-6xl">{book.isAvailable ? "✓" : "✗"}</span>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground">
                {book.isAvailable ? "Available" : "Currently Issued"}
              </p>
              {book.isAvailable && (
                <p className="text-lg text-muted-foreground">
                  Ready for you to borrow
                </p>
              )}
            </div>
          </div>

          {/* ISBN */}
          <div className="border-t border-border pt-8">
            <p className="text-lg text-muted-foreground mb-3">ISBN</p>
            <p className="text-3xl font-bold text-foreground">{book.isbn}</p>
          </div>

          {/* Info Box */}
          {book.isAvailable && (
            <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-6">
              <p className="text-lg text-foreground">
                Return to the main menu and select "Borrow Books" to check out
                this title.
              </p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full py-6 bg-secondary text-secondary-foreground rounded-2xl font-bold text-2xl hover:shadow-lg transition-all cursor-pointer hover:scale-105"
        >
          Back to Search
        </button>
      </div>
    </div>
  );
}
