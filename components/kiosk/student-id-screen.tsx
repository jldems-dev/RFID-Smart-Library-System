"use client";
import { useState } from "react";
import {
  User,
  BookOpen,
  RotateCcw,
  Search,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Library,
} from "lucide-react";
import ProgressIndicator from "./progress-indicator";
import BorrowedBooksModal from "./borrowed-books-modal";

interface StudentData {
  id: string;
  name: string;
  maxBooks: number;
  currentBorrows: number;
}

interface StudentIdScreenProps {
  student: StudentData;
  onContinue: (action: "borrow" | "return" | "search") => void;
}

export default function KioskStudentId({
  student,
  onContinue,
}: StudentIdScreenProps) {
  const [isBorrowedModalOpen, setIsBorrowedModalOpen] = useState(false);
  const remainingBooks = student.maxBooks - student.currentBorrows;
  const canBorrow = remainingBooks > 0;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-8 px-8 gap-6">
      {/* Header with Welcome Banner */}
      <div className="flex-shrink-0 w-full space-y-4">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white font-heading">
                  User Verified
                </h1>
                <p className="text-emerald-100 text-sm flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Identity confirmed
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <p className="text-xs text-emerald-100 uppercase tracking-wider font-semibold">
                  Status
                </p>
                <p className="text-lg font-bold text-white">ACTIVE</p>
              </div>
            </div>
          </div>
        </div>

        <ProgressIndicator
          currentStep={1}
          steps={["Identify User", "Select Action", "Complete"]}
          description="Choose your next action"
        />
      </div>

      {/* Student Profile Card */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl gap-6">
        <div className="w-full bg-card border-2 border-border rounded-2xl p-6 shadow-lg space-y-6">
          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl flex items-center justify-center border-2 border-emerald-200 dark:border-emerald-800">
              <span className="text-4xl font-bold text-emerald-700 dark:text-emerald-300">
                {student.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                Welcome back,
              </p>
              <h2 className="text-3xl font-bold text-foreground font-heading">
                {student.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                ID: {student.id}
              </p>
            </div>
          </div>

          {/* Borrow Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                {student.maxBooks}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold mt-1">
                Max Limit
              </p>
            </div>
            <div
              onClick={() =>
                student.currentBorrows > 0 && setIsBorrowedModalOpen(true)
              }
              className={`border-2 rounded-xl p-4 text-center transition-all duration-200 ${
                student.currentBorrows > 0
                  ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-md hover:scale-[1.02]"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              }`}
            >
              <p
                className={`text-3xl font-bold transition-colors ${
                  student.currentBorrows > 0
                    ? "text-amber-700 dark:text-amber-300"
                    : "text-muted-foreground"
                }`}
              >
                {student.currentBorrows}
              </p>
              <p
                className={`text-xs uppercase tracking-wider font-semibold mt-1 ${
                  student.currentBorrows > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground"
                }`}
              >
                Borrowed
              </p>
              {student.currentBorrows > 0 && (
                <p className="text-[10px] text-amber-500 mt-1 font-medium opacity-0 hover:opacity-100 transition-opacity">
                  Click to view
                </p>
              )}
            </div>
            <div
              className={`border-2 rounded-xl p-4 text-center ${
                canBorrow
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              }`}
            >
              <p
                className={`text-3xl font-bold ${
                  canBorrow
                    ? "text-green-700 dark:text-green-300"
                    : "text-red-700 dark:text-red-300"
                }`}
              >
                {remainingBooks}
              </p>
              <p
                className={`text-xs uppercase tracking-wider font-semibold mt-1 ${
                  canBorrow
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                Remaining
              </p>
            </div>
          </div>

          {/* Status Message */}
          <div
            className={`flex items-center gap-3 p-4 rounded-xl ${
              canBorrow
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            }`}
          >
            {canBorrow ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200">
                    Ready to borrow
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    You can borrow up to {remainingBooks} more book
                    {remainingBooks !== 1 ? "s" : ""}
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-200">
                    Borrow limit reached
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Return books to borrow more titles
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Selection */}
      <div className="flex-shrink-0 w-full max-w-4xl space-y-4">
        <p className="text-lg font-semibold text-foreground text-center">
          What would you like to do?
        </p>

        <div className="grid grid-cols-3 gap-4">
          {/* Borrow Button */}
          <button
            onClick={() => onContinue("borrow")}
            disabled={!canBorrow}
            className={`group relative overflow-hidden rounded-2xl p-6 transition-all ${
              canBorrow
                ? "bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                : "bg-muted cursor-not-allowed opacity-60"
            }`}
          >
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  canBorrow ? "bg-white/20" : "bg-muted-foreground/20"
                }`}
              >
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">Borrow</p>
                <p className="text-sm text-white/80 mt-1">
                  {canBorrow ? "Check out books" : "Limit reached"}
                </p>
              </div>
            </div>
            {canBorrow && (
              <div className="absolute bottom-2 right-2">
                <ChevronRight className="w-5 h-5 text-white/60" />
              </div>
            )}
          </button>

          {/* Return Button */}
          <button
            onClick={() => onContinue("return")}
            className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <RotateCcw className="w-7 h-7 text-white" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">Return</p>
                <p className="text-sm text-white/80 mt-1">Bring books back</p>
              </div>
            </div>
            <div className="absolute bottom-2 right-2">
              <ChevronRight className="w-5 h-5 text-white/60" />
            </div>
          </button>

          {/* Search Button */}
          <button
            onClick={() => onContinue("search")}
            className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <Search className="w-7 h-7 text-white" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">Search</p>
                <p className="text-sm text-white/80 mt-1">Browse catalog</p>
              </div>
            </div>
            <div className="absolute bottom-2 right-2">
              <ChevronRight className="w-5 h-5 text-white/60" />
            </div>
          </button>
        </div>

        {/* Helper Text */}
        <p className="text-center text-sm text-muted-foreground">
          Select an action to continue with your library session
        </p>
      </div>
      <BorrowedBooksModal
        isOpen={isBorrowedModalOpen}
        onClose={() => setIsBorrowedModalOpen(false)}
        studentId={student.id}
        studentName={student.name}
      />
    </div>
  );
}
