"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  BookOpen,
  X,
  Library,
  ScanBarcode,
  User,
  Filter,
  Calendar,
  Hash,
  Layers,
  Building2,
  MapPin,
  FileText,
  Clock,
  GraduationCap,
  BookX,
  UserCircle,
  Mail,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email?: string;
}

interface BorrowRecord {
  id: string;
  bookId: string;
  userId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: "ACTIVE" | "RETURNED" | "OVERDUE";
  name: string;
  email: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  status: "AVAILABLE" | "BORROWED";
  category?: string;
  publisher?: string;
  location?: string;
  addedDate?: string;
  condition?: "NEW" | "GOOD" | "FAIR" | "POOR";
  currentBorrow?: BorrowRecord;
}

interface BookSearchScreenProps {
  onBack: () => void;
}

type FilterType = "all" | "available" | "borrowed" | "category";

export default function BookSearchScreen({ onBack }: BookSearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all books on mount
  useEffect(() => {
    fetchAllBooks();
  }, []);

  const fetchAllBooks = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/books");
      const data = await response.json();

      if (response.ok) {
        const booksWithBorrower = (data.data || []).map((book: any) => ({
          ...book,
          currentBorrow: book.transactions?.[0]
            ? {
                name: book.transactions[0].user?.name || "",
                email: book.transactions[0].user?.email || "",
                dueDate: book.transactions[0]?.dueDate || null,
                borrowDate: book.transactions[0]?.borrowDate || null,
              }
            : {},
        }));

        setBooks(booksWithBorrower);
        setFilteredBooks(booksWithBorrower);
      }
    } catch (error) {
      console.error("Failed to fetch books:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = Array.from(
    new Set(
      books.map((b) => b.category).filter((c): c is string => Boolean(c)),
    ),
  );
  // Filter and search logic
  useEffect(() => {
    let result = [...books];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.isbn.toLowerCase().includes(query) ||
          book.category?.toLowerCase().includes(query) ||
          book.publisher?.toLowerCase().includes(query),
      );
    }

    // Apply status filter
    if (activeFilter === "available") {
      result = result.filter((book) => book.status === "AVAILABLE");
    } else if (activeFilter === "borrowed") {
      result = result.filter((book) => book.status === "BORROWED");
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter((book) => book.category === selectedCategory);
    }

    setFilteredBooks(result);
  }, [searchQuery, activeFilter, selectedCategory, books]);

  const getAvailabilityStatus = (book: Book) => {
    if (book.status === "AVAILABLE") {
      return {
        text: "Available",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        textColor: "text-green-700 dark:text-green-300",
        borderColor: "border-green-200 dark:border-green-800",
        indicatorColor: "bg-green-500",
        icon: <CheckCircle2 className="w-5 h-5" />,
        subtext: "Ready for borrowing",
      };
    }

    const isOverdue =
      book.currentBorrow && new Date(book.currentBorrow.dueDate) < new Date();

    return {
      text: isOverdue ? "Overdue" : "Borrowed",
      bgColor: isOverdue
        ? "bg-orange-100 dark:bg-orange-900/30"
        : "bg-red-100 dark:bg-red-900/30",
      textColor: isOverdue
        ? "text-orange-700 dark:text-orange-300"
        : "text-red-700 dark:text-red-300",
      borderColor: isOverdue
        ? "border-orange-200 dark:border-orange-800"
        : "border-red-200 dark:border-red-800",
      indicatorColor: isOverdue ? "bg-orange-500" : "bg-red-500",
      icon: isOverdue ? (
        <AlertCircle className="w-5 h-5" />
      ) : (
        <XCircle className="w-5 h-5" />
      ),
      subtext: isOverdue ? "Past due date" : "Currently checked out",
    };
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActiveFilter("all");
    setSelectedCategory("all");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getConditionColor = (condition?: string) => {
    switch (condition) {
      case "NEW":
        return "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30";
      case "GOOD":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
      case "FAIR":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
      case "POOR":
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800";
    }
  };

  // Book Detail View
  if (selectedBook) {
    const status = getAvailabilityStatus(selectedBook);
    const isBorrowed = selectedBook.status === "BORROWED";
    const isOverdue =
      selectedBook.currentBorrow &&
      new Date(selectedBook.currentBorrow.dueDate) < new Date();

    return (
      <div className="w-full h-full flex flex-col items-center justify-between py-6 px-6 gap-4 overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 w-full">
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Library className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white font-heading">
                    Book Details
                  </h1>
                  <p className="text-purple-100 text-xs flex items-center gap-1">
                    <ScanBarcode className="w-3 h-3" />
                    {selectedBook.isbn}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors backdrop-blur-sm"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto w-full max-w-4xl">
          <div className="space-y-4 pb-4">
            {/* Title Section */}
            <div className="text-center space-y-2 py-4">
              <h2 className="text-3xl font-bold text-foreground font-heading leading-tight">
                {selectedBook.title}
              </h2>
              <p className="text-xl text-muted-foreground flex items-center justify-center gap-2">
                <User className="w-5 h-5" />
                {selectedBook.author}
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {selectedBook.category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-sm font-medium">
                    <Layers className="w-3 h-3" />
                    {selectedBook.category}
                  </span>
                )}
                {selectedBook.condition && (
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(selectedBook.condition)}`}
                  >
                    <BookOpen className="w-3 h-3" />
                    {selectedBook.condition}
                  </span>
                )}
              </div>
            </div>

            {/* Status Card */}
            <div
              className={`flex items-center justify-center gap-4 p-6 rounded-2xl ${status.bgColor} border-2 ${status.borderColor}`}
            >
              <div
                className={`w-16 h-16 rounded-full bg-white dark:bg-background flex items-center justify-center ${status.textColor}`}
              >
                {status.icon}
              </div>
              <div className="text-left">
                <p className={`text-2xl font-bold ${status.textColor}`}>
                  {status.text}
                </p>
                <p className="text-base text-muted-foreground">
                  {status.subtext}
                </p>
              </div>
            </div>

            {/* Current Borrower Info - Only show if borrowed */}
            {isBorrowed && selectedBook.currentBorrow && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <UserCircle className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-blue-900 dark:text-blue-100">
                    Current Borrower
                  </h3>
                  {isOverdue && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded text-xs font-bold">
                      OVERDUE
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      User Name
                    </p>
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {selectedBook.currentBorrow.name || "Unknown"}
                    </p>
                  </div>

                  {selectedBook.currentBorrow.id && (
                    <div className="space-y-1">
                      <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        ID
                      </p>
                      <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                        {selectedBook.currentBorrow.id}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Borrowed On
                    </p>
                    <p className="text-base font-bold text-blue-900 dark:text-blue-100">
                      {formatDate(selectedBook.currentBorrow.borrowDate)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Due Date
                    </p>
                    <p
                      className={`text-base font-bold ${isOverdue ? "text-red-600 dark:text-red-400" : "text-blue-900 dark:text-blue-100"}`}
                    >
                      {formatDate(selectedBook.currentBorrow.dueDate)}
                    </p>
                  </div>

                  {selectedBook.currentBorrow.email && (
                    <div className="space-y-1">
                      <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Email
                      </p>
                      <p className="text-sm text-blue-900 dark:text-blue-100 truncate">
                        {selectedBook.currentBorrow.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Primary Information Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-card border-2 border-border rounded-xl p-4 space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
                  <ScanBarcode className="w-3 h-3" />
                  ISBN
                </p>
                <p className="text-base font-bold text-foreground break-all">
                  {selectedBook.isbn}
                </p>
              </div>

              <div className="bg-card border-2 border-border rounded-xl p-4 space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  Book ID
                </p>
                <p className="text-base font-bold text-foreground">
                  {selectedBook.id}
                </p>
              </div>

              {selectedBook.publisher && (
                <div className="bg-card border-2 border-border rounded-xl p-4 space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Publisher
                  </p>
                  <p className="text-base font-bold text-foreground line-clamp-2">
                    {selectedBook.publisher}
                  </p>
                </div>
              )}

              {selectedBook.addedDate && (
                <div className="bg-card border-2 border-border rounded-xl p-4 space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Added to Library
                  </p>
                  <p className="text-base font-bold text-foreground">
                    {formatDate(selectedBook.addedDate)}
                  </p>
                </div>
              )}
            </div>

            {/* Location Info */}
            {selectedBook.location && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-3">
                <p className="text-xs text-amber-800 dark:text-amber-200 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Location Information
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedBook.location && (
                    <div>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Library Location
                      </p>
                      <p className="text-lg font-bold text-amber-900 dark:text-amber-100">
                        {selectedBook.location}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Hint */}
            {selectedBook.status === "AVAILABLE" ? (
              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200">
                    Available for borrowing
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Return to main menu and select "Borrow Books" to check out
                    this title
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`border-l-4 rounded-r-xl p-4 flex items-start gap-3 ${isOverdue ? "bg-orange-50 dark:bg-orange-900/20 border-orange-500" : "bg-red-50 dark:bg-red-900/20 border-red-500"}`}
              >
                <BookX
                  className={`w-6 h-6 flex-shrink-0 mt-0.5 ${isOverdue ? "text-orange-600" : "text-red-600"}`}
                />
                <div>
                  <p
                    className={`font-semibold ${isOverdue ? "text-orange-800 dark:text-orange-200" : "text-red-800 dark:text-red-200"}`}
                  >
                    {isOverdue ? "Book is overdue" : "Currently unavailable"}
                  </p>
                  <p
                    className={`text-sm mt-1 ${isOverdue ? "text-orange-700 dark:text-orange-300" : "text-red-700 dark:text-red-300"}`}
                  >
                    {isOverdue
                      ? `This book was due on ${formatDate(selectedBook.currentBorrow?.dueDate)}. Please contact the borrower or librarian.`
                      : `This book is currently borrowed by ${selectedBook.currentBorrow?.name || "a user"}. Due back on ${formatDate(selectedBook.currentBorrow?.dueDate)}.`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action */}
        <div className="flex-shrink-0 w-full max-w-4xl pt-2">
          <button
            onClick={() => setSelectedBook(null)}
            className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-lg font-bold rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  // Main Browse View
  return (
    <div className="w-full h-full flex flex-col py-6 px-6 gap-4">
      {/* Header */}
      <div className="flex-shrink-0 space-y-3">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Library className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-heading">
                  Library Catalog
                </h1>
                <p className="text-purple-100 text-xs flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Browse all {books.length} books
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <p className="text-xs text-purple-100 uppercase tracking-wider font-semibold">
                  Mode
                </p>
                <p className="text-lg font-bold text-white">BROWSE</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search title, author, ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 text-base bg-card border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-2 font-medium ${
              showFilters ||
              activeFilter !== "all" ||
              selectedCategory !== "all"
                ? "bg-violet-100 border-violet-500 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                : "bg-card border-border hover:border-violet-500"
            }`}
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
            {(activeFilter !== "all" || selectedCategory !== "all") && (
              <span className="w-5 h-5 bg-violet-600 text-white rounded-full text-xs flex items-center justify-center">
                {(activeFilter !== "all" ? 1 : 0) +
                  (selectedCategory !== "all" ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                Filter by Status
              </p>
              <button
                onClick={clearFilters}
                className="text-xs text-violet-600 hover:text-violet-700 font-medium"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All Books", count: books.length },
                {
                  key: "available",
                  label: "Available",
                  count: books.filter((b) => b.status === "AVAILABLE").length,
                },
                {
                  key: "borrowed",
                  label: "Borrowed",
                  count: books.filter((b) => b.status === "BORROWED").length,
                },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key as FilterType)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeFilter === filter.key
                      ? "bg-violet-600 text-white"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {categories.length > 0 && (
              <>
                <div className="border-t border-border pt-3">
                  <p className="text-sm font-semibold text-foreground mb-2">
                    Filter by Category
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === "all"
                          ? "bg-violet-600 text-white"
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedCategory === category
                            ? "bg-violet-600 text-white"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Showing{" "}
            <span className="font-bold text-foreground">
              {filteredBooks.length}
            </span>{" "}
            of <span className="font-bold text-foreground">{books.length}</span>{" "}
            books
          </p>
          {(searchQuery ||
            activeFilter !== "all" ||
            selectedCategory !== "all") && (
            <button
              onClick={clearFilters}
              className="text-violet-600 hover:text-violet-700 font-medium text-xs"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Books Grid */}
      <div className="flex-1 overflow-y-auto -mx-2 px-2">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
              <Library className="absolute inset-0 m-auto w-6 h-6 text-violet-600" />
            </div>
            <p className="text-lg text-muted-foreground font-medium">
              Loading catalog...
            </p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold text-foreground">
                No books found
              </p>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-violet-100 text-violet-700 rounded-lg font-medium hover:bg-violet-200 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pb-4">
            {filteredBooks.map((book: any) => {
              const status = getAvailabilityStatus(book);
              const isOverdue =
                book.currentBorrow &&
                new Date(book.currentBorrow.dueDate) < new Date();

              return (
                <button
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  className="group bg-card border-2 border-border hover:border-violet-500 rounded-xl p-4 transition-all hover:shadow-md text-left relative overflow-hidden"
                >
                  {/* Availability indicator strip */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${status.indicatorColor}`}
                  />

                  <div className="pl-3">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors text-sm leading-tight">
                        {book.title}
                      </h3>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold ${status.bgColor} ${status.textColor}`}
                        >
                          {status.text}
                        </span>
                        {isOverdue && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded text-xs font-bold">
                            OVERDUE
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <User className="w-3 h-3" />
                      <span className="truncate">{book.author}</span>
                    </p>

                    {/* Show borrower info in list if borrowed */}
                    {book.status === "BORROWED" && book.currentBorrow && (
                      <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                          <UserCircle className="w-3 h-3" />
                          <span className="font-medium truncate">
                            {book.currentBorrow?.name || "Unknown"}
                          </span>
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                          Due: {formatDate(book.currentBorrow.dueDate)}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      {book.publisher ? (
                        <span className="text-muted-foreground truncate max-w-[120px] flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {book.publisher}
                        </span>
                      ) : (
                        <span />
                      )}
                      {book.category && (
                        <span className="px-2 py-0.5 bg-muted rounded-full text-muted-foreground truncate max-w-[100px]">
                          {book.category}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-xs text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        View details →
                      </span>
                      {book.language && (
                        <span className="text-xs text-muted-foreground">
                          {book.language}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Back Button */}
      <div className="flex-shrink-0">
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
