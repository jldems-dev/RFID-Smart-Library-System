"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  User,
  Calendar,
  MapPin,
  Hash,
  Tag,
  Building2,
  Clock,
  AlertCircle,
  History,
} from "lucide-react";
import type { Book } from "@/lib/types";

// Helper functions
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "AVAILABLE":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
    case "BORROWED":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    case "RESERVED":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    case "MAINTENANCE":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "AVAILABLE":
      return <BookOpen className="w-4 h-4" />;
    case "BORROWED":
      return <User className="w-4 h-4" />;
    case "RESERVED":
      return <Clock className="w-4 h-4" />;
    case "MAINTENANCE":
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <BookOpen className="w-4 h-4" />;
  }
};

interface BookDetailedModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookDetailedModal({
  book,
  isOpen,
  onClose,
}: BookDetailedModalProps) {
  if (!book) return null;

  // Get active transaction (borrowed status)
  const activeTransaction = book.transactions?.find(
    (t: any) =>
      t.status === "ACTIVE" || t.status === "OVERDUE" || t.returnedAt === null,
  );

  console.log(activeTransaction);
  // Get borrower user from active transaction
  const borrower = activeTransaction?.user;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:max-w-4xl xl:max-w-5xl p-0 overflow-hidden bg-background border shadow-2xl max-h-[90vh] gap-0">
        <ScrollArea className="max-h-[90vh]">
          {/* Header with Gradient Background */}
          <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background p-4 sm:p-6 pb-6 sm:pb-8">
            <DialogHeader className="space-y-3 sm:space-y-4">
              <div className="flex items-start">
                <Badge
                  variant="secondary"
                  className={`${getStatusColor(book.status)} border px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 sm:gap-2`}
                >
                  {getStatusIcon(book.status)}
                  <span className="hidden sm:inline">{book.status}</span>
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner flex-shrink-0">
                  <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                </div>
                <div className="flex-1 space-y-1 sm:space-y-2 min-w-0">
                  <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight break-words">
                    {book.title}
                  </DialogTitle>
                  <p className="text-base sm:text-lg text-muted-foreground flex items-center gap-2 flex-wrap">
                    by{" "}
                    <span className="font-medium text-foreground">
                      {book.author}
                    </span>
                  </p>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ISBN
                </div>
                <p className="text-xs sm:text-sm font-bold text-foreground break-all">
                  {book.isbn}
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Category
                </div>
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {book.category}
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Location
                </div>
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {book.location}
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Condition
                </div>
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {book.condition}
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Publisher
                </div>
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {book.publisher || "N/A"}
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  RFID Tag
                </div>
                <p className="text-xs font-bold text-foreground break-all">
                  {book.rfidTag}
                </p>
              </div>
            </div>

            {/* Active Borrower Section - Full Width */}
            {book.status === "BORROWED" && borrower && (
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/90 to-orange-50/90 dark:from-amber-950/40 dark:to-orange-950/30">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-orange-500" />
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-amber-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="p-4 sm:p-6 relative">
                  <div className="flex items-center gap-2 mb-4 sm:mb-5 text-amber-800 dark:text-amber-200">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider">
                      Currently Borrowed By
                    </h3>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 sm:border-3 border-amber-200 dark:border-amber-700 shadow-lg flex-shrink-0">
                      <AvatarFallback className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 font-bold text-lg sm:text-xl">
                        {getInitials(borrower.name || "Unknown")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full">
                      <div className="space-y-1 sm:space-y-1.5">
                        <p className="text-xs text-amber-700/70 dark:text-amber-300/70 uppercase tracking-wider font-semibold">
                          Borrower Name
                        </p>
                        <p className="font-bold text-base sm:text-lg text-amber-900 dark:text-amber-100 break-words">
                          {borrower.name || "Unknown User"}
                        </p>
                      </div>

                      <div className="space-y-1 sm:space-y-1.5">
                        <p className="text-xs text-amber-700/70 dark:text-amber-300/70 uppercase tracking-wider font-semibold">
                          Email Address
                        </p>
                        <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 font-medium break-all">
                          {borrower.email || "No email provided"}
                        </p>
                      </div>

                      <div className="space-y-1 sm:space-y-1.5">
                        <p className="text-xs text-amber-700/70 dark:text-amber-300/70 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          Borrowed Date
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-100">
                          {activeTransaction?.borrowDate ||
                          activeTransaction?.createdAt
                            ? new Date(
                                activeTransaction.borrowDate ||
                                  activeTransaction.createdAt,
                              ).toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </p>
                      </div>

                      <div className="space-y-1 sm:space-y-1.5">
                        <p className="text-xs text-amber-700/70 dark:text-amber-300/70 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          Due Date
                        </p>
                        <p
                          className={`text-xs sm:text-sm font-bold ${
                            activeTransaction?.dueDate &&
                            new Date(activeTransaction.dueDate) < new Date()
                              ? "text-red-600 dark:text-red-400"
                              : "text-amber-900 dark:text-amber-100"
                          }`}
                        >
                          {activeTransaction?.dueDate
                            ? new Date(
                                activeTransaction.dueDate,
                              ).toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                          {activeTransaction?.dueDate &&
                            new Date(activeTransaction.dueDate) <
                              new Date() && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800">
                                Overdue
                              </span>
                            )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Separator className="my-4 sm:my-6" />

            {/* Footer with Metadata - No close button here */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 text-xs text-muted-foreground">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted">
                  ID:{" "}
                  <span className=" font-semibold text-foreground break-all">
                    {book.id}
                  </span>
                </span>
                {book.createdAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    Added {new Date(book.createdAt).toLocaleDateString()}
                  </span>
                )}
                {book.updatedAt && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Updated {new Date(book.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
