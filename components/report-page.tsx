"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  FileText,
  Calendar,
  BookOpen,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Printer,
  ChevronRight,
  Library,
  BookX,
  RotateCcw,
  BarChart3,
  Loader2,
} from "lucide-react";
import { useTransactions, useBooks } from "@/hooks/use-library-data";
import {
  TableSkeletonLoader,
  DataLoadingError,
} from "@/components/data-skeleton";
import { useServerPagination } from "@/hooks/use-server-pagination";
import type { Transaction, Book } from "@/lib/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { format, subDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useReactToPrint } from "react-to-print";
import { usePDF } from "react-to-pdf";
import * as XLSX from "xlsx";

type ReportTab =
  | "inventory"
  | "borrowed"
  | "overdue"
  | "returned"
  | "most-borrowed";

// Safe hook wrapper
function useSafeTransactions(page: number, pageSize: number, filters: any) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const result = useTransactions(page, pageSize, filters);

  return {
    ...result,
    isLoading: !isClient || result.isLoading,
    transactions: isClient ? result.transactions : [],
    total: isClient ? result.total : 0,
  };
}

const useInventoryData = (dateRange?: DateRange) => {
  const [data, setData] = useState({
    totalBooks: 0,
    available: 0,
    borrowed: 0,
    maintenance: 0,
    categories: [],
    conditionStats: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange?.from)
          params.append("from", dateRange.from.toISOString());
        if (dateRange?.to) params.append("to", dateRange.to.toISOString());

        const res = await fetch(`/api/report/book?${params.toString()}`);
        const result = await res.json();

        setData(result.data.stats);
      } catch (error) {
        console.error("Failed to fetch inventory report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [dateRange?.from, dateRange?.to]);

  return { ...data, loading };
};

const useMostBorrowedData = (dateRange?: DateRange) => {
  const [data, setData] = useState({
    books: [],
    period: "Last 30 days",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMostBorrowed = async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange?.from)
          params.append("from", dateRange.from.toISOString());
        if (dateRange?.to) params.append("to", dateRange.to.toISOString());

        const res = await fetch(`/api/report/book?${params.toString()}`);
        const result = await res.json();

        const mappedBooks = result.data.books.map((book: any) => ({
          id: book.id,
          title: book.title,
          author: book.author,
          borrowCount: book.borrowCount ?? 0,
          totalBorrows: book.borrowCount ?? 0,
        }));

        setData({
          books: mappedBooks,
          period: result.period || "Last 30 days",
        });
      } catch (error) {
        console.error("Failed to fetch most borrowed books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMostBorrowed();
  }, [dateRange?.from, dateRange?.to]);

  return { ...data, loading };
};

const tabs = [
  {
    id: "inventory" as ReportTab,
    label: "Book Inventory Report",
    icon: Library,
    color: "text-blue-600",
  },
  {
    id: "borrowed" as ReportTab,
    label: "Borrowed Books Report",
    icon: BookOpen,
    color: "text-amber-600",
  },
  {
    id: "overdue" as ReportTab,
    label: "Overdue Books Report",
    icon: BookX,
    color: "text-red-600",
  },
  {
    id: "returned" as ReportTab,
    label: "Returned Books Report",
    icon: RotateCcw,
    color: "text-green-600",
  },
  {
    id: "most-borrowed" as ReportTab,
    label: "Most Borrowed Books",
    icon: BarChart3,
    color: "text-purple-600",
  },
];

export default function ReportPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ReportTab>("inventory");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [isClient, setIsClient] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Refs for printing and PDF
  const contentRef = useRef<HTMLDivElement>(null);
  const { toPDF, targetRef: pdfTargetRef } = usePDF({
    filename: `library-report-${activeTab}-${format(new Date(), "yyyy-MM-dd")}.pdf`,
  });

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Library Report - ${tabs.find((t) => t.id === activeTab)?.label}`,
    onAfterPrint: () => {
      toast({
        title: "Print Complete",
        description: "Report sent to printer",
      });
    },
  });

  // Pass dateRange to data hooks
  const inventoryData = useInventoryData(dateRange);
  const mostBorrowedData = useMostBorrowedData(dateRange);

  const paginationLocal = useServerPagination({ pageSize: 10 });

  // Fetch transactions based on active tab with date filtering
  const { transactions, total, isLoading, error } = useSafeTransactions(
    paginationLocal.currentPage,
    paginationLocal.pageSize,
    {
      status:
        activeTab === "overdue"
          ? "OVERDUE"
          : activeTab === "borrowed"
            ? "ACTIVE"
            : activeTab === "returned"
              ? "COMPLETED"
              : undefined,
      from: dateRange?.from,
      to: dateRange?.to,
    },
  );

  // Reset pagination when tab or date changes
  useEffect(() => {
    paginationLocal.goToPage(1);
  }, [activeTab, dateRange?.from, dateRange?.to]);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await toPDF();
      toast({
        title: "PDF Exported",
        description: "Report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = useCallback(() => {
    setIsExporting(true);
    try {
      let data: any[] = [];
      let headers: string[] = [];
      let filename = `library-report-${activeTab}-${format(new Date(), "yyyy-MM-dd")}.xlsx`;

      switch (activeTab) {
        case "inventory":
          data = inventoryData.categories.map((cat: any) => ({
            Category: cat.name,
            Count: cat.count,
            Percentage: `${cat.percentage}%`,
          }));
          headers = ["Category", "Count", "Percentage"];
          break;

        case "most-borrowed":
          data = mostBorrowedData.books.map((book: any) => ({
            Rank: book.id,
            Title: book.title,
            Author: book.author,
            "Borrow Count": book.borrowCount,
          }));
          headers = ["Rank", "Title", "Author", "Borrow Count"];
          break;

        case "borrowed":
        case "overdue":
        case "returned":
          data = transactions.map((t: Transaction) => ({
            Book: t.book?.title || "Unknown",
            Borrower: t.user?.name || "Unknown",
            "Borrow Date": t.borrowDate
              ? format(new Date(t.borrowDate), "yyyy-MM-dd")
              : "-",
            "Due Date": t.dueDate
              ? format(new Date(t.dueDate), "yyyy-MM-dd")
              : "-",
            "Returned Date": t.returnedAt
              ? format(new Date(t.returnedAt), "yyyy-MM-dd")
              : "-",
            Status: t.status,
            "Days Overdue":
              activeTab === "overdue" && t.dueDate
                ? Math.max(
                    0,
                    Math.floor(
                      (new Date().getTime() - new Date(t.dueDate).getTime()) /
                        (1000 * 60 * 60 * 24),
                    ),
                  )
                : 0,
          }));
          headers = [
            "Book",
            "Borrower",
            "Borrow Date",
            "Due Date",
            "Returned Date",
            "Status",
            "Days Overdue",
          ];
          break;
      }

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(data, { header: headers });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");

      // Auto-size columns
      const colWidths = headers.map((h) => ({ wch: Math.max(h.length, 15) }));
      ws["!cols"] = colWidths;

      // Download
      XLSX.writeFile(wb, filename);

      toast({
        title: "Excel Exported",
        description: `${filename} downloaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate Excel file",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [activeTab, inventoryData, mostBorrowedData, transactions, toast]);

  const handlePrintReport = () => {
    handlePrint();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200";
      case "OVERDUE":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200";
      case "COMPLETED":
      case "RETURNED":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400";
    }
  };

  const renderReportContent = () => {
    switch (activeTab) {
      case "inventory":
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Library className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Books
                      </p>
                      <p className="text-2xl font-bold">
                        {inventoryData.totalBooks}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Available</p>
                      <p className="text-2xl font-bold">
                        {inventoryData.available}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                      <BookOpen className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Borrowed</p>
                      <p className="text-2xl font-bold">
                        {inventoryData.borrowed}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Maintenance
                      </p>
                      <p className="text-2xl font-bold">
                        {inventoryData.maintenance}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Books by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventoryData.categories.map((cat: any) => (
                    <div key={cat.name} className="flex items-center gap-4">
                      <span className="text-sm font-medium w-24">
                        {cat.name}
                      </span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {cat.count}
                      </span>
                      <span className="text-sm font-medium w-12 text-right">
                        {cat.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Condition Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Book Condition Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {inventoryData.conditionStats.map((stat: any) => (
                    <div
                      key={stat.condition}
                      className="text-center p-4 rounded-lg bg-muted/50"
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${stat.color} mx-auto mb-2`}
                      />
                      <p className="text-2xl font-bold">{stat.count}</p>
                      <p className="text-sm text-muted-foreground">
                        {stat.condition}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "most-borrowed":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Most Borrowed Books</CardTitle>
              <CardDescription>
                {dateRange?.from && dateRange?.to
                  ? `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd, yyyy")}`
                  : mostBorrowedData.period}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mostBorrowedData.books.map((book: any, index: number) => (
                  <div
                    key={book.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0",
                        index < 3
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {book.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {book.author}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        {book.borrowCount}
                      </p>
                      <p className="text-xs text-muted-foreground">borrows</p>
                    </div>
                    <div className="w-24 hidden sm:block">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(book.borrowCount / 50) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "borrowed":
      case "overdue":
      case "returned":
        return (
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "borrowed" && "Currently Borrowed Books"}
                {activeTab === "overdue" && "Overdue Books"}
                {activeTab === "returned" && "Recently Returned Books"}
              </CardTitle>
              <CardDescription>
                {total} records found
                {dateRange?.from && dateRange?.to && (
                  <span className="ml-2 text-muted-foreground">
                    ({format(dateRange.from, "MMM dd")} -{" "}
                    {format(dateRange.to, "MMM dd")})
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-3 font-semibold text-foreground text-sm">
                        Book
                      </th>
                      <th className="text-left py-3 px-3 font-semibold text-foreground text-sm">
                        Borrower
                      </th>
                      <th className="text-left py-3 px-3 font-semibold text-foreground text-sm hidden sm:table-cell">
                        {activeTab === "returned"
                          ? "Returned Date"
                          : "Borrowed Date"}
                      </th>
                      {activeTab !== "returned" && (
                        <th className="text-left py-3 px-3 font-semibold text-foreground text-sm hidden md:table-cell">
                          Due Date
                        </th>
                      )}
                      <th className="text-left py-3 px-3 font-semibold text-foreground text-sm">
                        Status
                      </th>
                      {activeTab === "overdue" && (
                        <th className="text-left py-3 px-3 font-semibold text-foreground text-sm">
                          Days Overdue
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <TableSkeletonLoader rowCount={5} />
                    ) : error ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <DataLoadingError />
                        </td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No records found for selected date range
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction: Transaction) => (
                        <tr
                          key={transaction.id}
                          className="border-b border-border hover:bg-secondary/50 transition-colors"
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="h-4 w-4 text-primary" />
                              </div>
                              <span className="text-sm font-medium truncate max-w-[150px]">
                                {transaction.book?.title || "Unknown"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                <Users className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <span className="text-sm truncate max-w-[100px]">
                                {transaction.user?.name || "Unknown"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-sm text-muted-foreground hidden sm:table-cell">
                            {activeTab === "returned"
                              ? transaction.returnedAt
                                ? format(
                                    new Date(transaction.returnedAt),
                                    "MMM dd, yyyy",
                                  )
                                : "-"
                              : transaction.borrowDate
                                ? format(
                                    new Date(transaction.borrowDate),
                                    "MMM dd, yyyy",
                                  )
                                : "-"}
                          </td>
                          {activeTab !== "returned" && (
                            <td className="py-3 px-3 text-sm hidden md:table-cell">
                              {transaction.dueDate
                                ? format(
                                    new Date(transaction.dueDate),
                                    "MMM dd, yyyy",
                                  )
                                : "-"}
                            </td>
                          )}
                          <td className="py-3 px-3">
                            <Badge
                              variant="outline"
                              className={`text-xs ${getStatusColor(transaction.status)}`}
                            >
                              {transaction.status}
                            </Badge>
                          </td>
                          {activeTab === "overdue" && transaction.dueDate && (
                            <td className="py-3 px-3">
                              <span className="text-sm font-bold text-red-600">
                                {Math.max(
                                  0,
                                  Math.floor(
                                    (new Date().getTime() -
                                      new Date(transaction.dueDate).getTime()) /
                                      (1000 * 60 * 60 * 24),
                                  ),
                                )}{" "}
                                days
                              </span>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {total > 0 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          paginationLocal.goToPage(
                            paginationLocal.currentPage - 1,
                          );
                        }}
                        className={
                          paginationLocal.currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                    {Array.from({
                      length: Math.min(
                        5,
                        Math.ceil(total / paginationLocal.pageSize),
                      ),
                    }).map((_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          href="#"
                          isActive={paginationLocal.currentPage === i + 1}
                          onClick={(e) => {
                            e.preventDefault();
                            paginationLocal.goToPage(i + 1);
                          }}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          paginationLocal.goToPage(
                            paginationLocal.currentPage + 1,
                          );
                        }}
                        className={
                          paginationLocal.currentPage ===
                          Math.ceil(total / paginationLocal.pageSize)
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (!isClient) {
    return (
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground font-heading">
              Reports
            </h2>
            <p className="text-muted-foreground mt-2">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground font-heading">
            Library Reports
          </h2>
          <p className="text-muted-foreground mt-2">
            Generate and view detailed library reports
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM dd")} -{" "}
                      {format(dateRange.to, "MMM dd")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM dd")
                  )
                ) : (
                  "Select dates"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Excel
          </Button>
          <Button
            onClick={handlePrintReport}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            Print
          </Button>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-muted text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        isActive ? "text-primary-foreground" : tab.color,
                      )}
                    />
                    <span className="font-medium text-sm flex-1">
                      {tab.label}
                    </span>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isActive
                          ? "rotate-90 text-primary-foreground"
                          : "text-muted-foreground",
                      )}
                    />
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Stats Sidebar */}
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Quick Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Books</span>
                <span className="font-bold">{inventoryData.totalBooks}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active Loans</span>
                <span className="font-bold text-amber-600">
                  {inventoryData.borrowed}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overdue</span>
                <span className="font-bold text-red-600">12</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Return Rate</span>
                <span className="font-bold text-green-600">96%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area - Wrapped for Print/PDF */}
        <div className="lg:col-span-3" ref={contentRef}>
          {/* PDF Target Wrapper */}
          <div ref={pdfTargetRef} className="bg-background p-4">
            {/* Report Header for Print/PDF */}
            <div className="hidden print:block mb-6 pb-4 border-b">
              <h1 className="text-2xl font-bold">
                Library Report: {tabs.find((t) => t.id === activeTab)?.label}
              </h1>
              <p className="text-muted-foreground">
                Generated on: {format(new Date(), "MMMM dd, yyyy")}
                {dateRange?.from && dateRange?.to && (
                  <span className="ml-2">
                    (Period: {format(dateRange.from, "MMM dd")} -{" "}
                    {format(dateRange.to, "MMM dd, yyyy")})
                  </span>
                )}
              </p>
            </div>

            {renderReportContent()}

            {/* Print Footer */}
            <div className="hidden print:block mt-8 pt-4 border-t text-sm text-muted-foreground">
              <p>Library Management System - Confidential Report</p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-12" />
    </div>
  );
}
