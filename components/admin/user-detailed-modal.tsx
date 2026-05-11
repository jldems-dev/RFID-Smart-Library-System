"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Hash,
  BookOpen,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  GraduationCap,
  CreditCard,
  History,
} from "lucide-react";
import type { User } from "@/lib/types";

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
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
    case "INACTIVE":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    case "SUSPENDED":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    case "BANNED":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return <CheckCircle2 className="w-4 h-4" />;
    case "INACTIVE":
      return <XCircle className="w-4 h-4" />;
    case "SUSPENDED":
      return <AlertCircle className="w-4 h-4" />;
    case "BANNED":
      return <XCircle className="w-4 h-4" />;
    default:
      return <UserIcon className="w-4 h-4" />;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800";
    case "TEACHER":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    case "STUDENT":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  }
};

interface UserDetailedModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailedModal({
  user,
  isOpen,
  onClose,
}: UserDetailedModalProps) {
  if (!user) return null;
  console.log(user);
  // Get active transactions (borrowed books not returned)
  const activeTransactions =
    user.transactions?.filter((t: any) => !t.returnedAt) || [];

  // Get transaction history (returned books)
  const historyTransactions =
    user.transactions?.filter((t: any) => t.returnedAt) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:max-w-4xl xl:max-w-5xl p-0 overflow-hidden bg-background border shadow-2xl max-h-[90vh] gap-0">
        <ScrollArea className="max-h-[90vh]">
          {/* Header with Gradient Background */}
          <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background p-4 sm:p-6 pb-6 sm:pb-8">
            <DialogHeader className="space-y-3 sm:space-y-4 pr-20 sm:pr-40">
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-5">
                <Badge
                  variant="secondary"
                  className={`${getRoleColor(user.role)} border px-2 sm:px-3 py-1 text-xs font-semibold uppercase tracking-wider`}
                >
                  {user.role}
                </Badge>
                <Badge
                  variant="secondary"
                  className={`${getStatusColor(user.status)} border px-2 sm:px-3 py-1 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 sm:gap-2`}
                >
                  {getStatusIcon(user.status)}
                  <span className="hidden sm:inline">{user.status}</span>
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-5">
                <Avatar className="w-16 h-16 sm:w-24 sm:h-24 border-2 sm:border-4 border-background shadow-lg flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl sm:text-2xl">
                    {getInitials(user.name || "Unknown")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1 sm:space-y-2 min-w-0 pt-0 sm:pt-2">
                  <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight break-words">
                    {user.name || "Unknown User"}
                  </DialogTitle>
                  <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-3 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="break-all">{user.email}</span>
                    </span>
                    {user.grade && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted text-xs sm:text-sm">
                        <GraduationCap className="w-4 h-4" />
                        Grade {user.grade}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* User Details Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  User ID
                </div>
                <p className=" text-xs sm:text-sm font-bold text-foreground break-all">
                  {user.id}
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  RFID Tag
                </div>
                <p className=" text-xs sm:text-sm font-bold text-foreground break-all">
                  {user.rfidTag || "Not assigned"}
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Role
                </div>
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {user.role}
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Status
                </div>
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {user.status}
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Member Since
                </div>
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Total Borrowed
                </div>
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {user.transactions?.length || 0} books
                </p>
              </div>

              {user.maxBooks !== undefined && (
                <div className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Max Books Allowed
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-foreground">
                    {user.maxBooks} books
                  </p>
                </div>
              )}
            </div>

            {/* Currently Borrowed Books Section */}
            {activeTransactions.length > 0 && (
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 dark:from-blue-950/40 dark:to-indigo-950/30">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-500" />

                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4 sm:mb-5 text-blue-800 dark:text-blue-200">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider">
                      Currently Borrowed ({activeTransactions.length})
                    </h3>
                  </div>

                  <div className="grid gap-2 sm:gap-3">
                    {activeTransactions.map(
                      (transaction: any, index: number) => (
                        <div
                          key={transaction.id || index}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/50 dark:bg-background/50 border border-blue-100 dark:border-blue-800/50 gap-3 sm:gap-4"
                        >
                          <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-foreground text-sm break-words">
                                {transaction.book?.title || "Unknown Book"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                by{" "}
                                {transaction.book?.author || "Unknown Author"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                ISBN:{" "}
                                <span className="">
                                  {transaction.book?.isbn || "N/A"}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1 sm:text-right sm:flex-shrink-0 border-t sm:border-t-0 border-blue-100 dark:border-blue-800/50 pt-2 sm:pt-0">
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800 text-xs"
                            >
                              Active
                            </Badge>
                            <div className="flex flex-col items-end gap-0.5">
                              <p
                                className={`text-xs ${
                                  transaction.dueDate &&
                                  new Date(transaction.dueDate) < new Date()
                                    ? "text-red-600 dark:text-red-400 font-bold"
                                    : "text-muted-foreground"
                                }`}
                              >
                                Due:{" "}
                                {transaction.dueDate
                                  ? new Date(
                                      transaction.dueDate,
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </p>
                              {transaction.dueDate &&
                                new Date(transaction.dueDate) < new Date() && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                                    Overdue
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Transaction History Section */}
            {historyTransactions.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground border-b border-border pb-2">
                  <History className="w-4 h-4" />
                  <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider">
                    Borrowing History
                  </h4>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {historyTransactions.length} returned
                  </Badge>
                </div>

                <div className="grid gap-2 sm:gap-3">
                  {historyTransactions
                    .slice(0, 5)
                    .map((transaction: any, index: number) => (
                      <div
                        key={transaction.id || index}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/30 border border-border/50 gap-3 sm:gap-4"
                      >
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground text-sm break-words">
                              {transaction.book?.title || "Unknown Book"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {transaction.borrowedAt
                                ? new Date(
                                    transaction.borrowedAt,
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "Unknown date"}
                            </p>
                          </div>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1 sm:text-right sm:flex-shrink-0 border-t sm:border-t-0 border-border/50 pt-2 sm:pt-0">
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700 text-xs"
                          >
                            Returned
                          </Badge>
                          {transaction.returnedAt && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                transaction.returnedAt,
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                  {historyTransactions.length > 5 && (
                    <div className="text-center pt-2">
                      <p className="text-xs text-muted-foreground">
                        +{historyTransactions.length - 5} more records
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* No transactions message */}
            {(!user.transactions || user.transactions.length === 0) && (
              <div className="text-center py-6 sm:py-8 text-muted-foreground bg-muted/30 rounded-xl border border-border/50">
                <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                <p className="text-sm">No borrowing history found</p>
              </div>
            )}

            <Separator className="my-4 sm:my-6" />

            {/* Footer with Metadata */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 text-xs text-muted-foreground">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted">
                  <Hash className="w-3 h-3" />
                  ID:{" "}
                  <span className=" font-semibold text-foreground break-all">
                    {user.id}
                  </span>
                </span>
                {user.updatedAt && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Last updated {new Date(user.updatedAt).toLocaleDateString()}
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
