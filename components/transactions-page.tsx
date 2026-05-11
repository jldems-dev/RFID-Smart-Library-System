"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import SearchFilterBar from "@/components/admin/search-filter-bar";
import DeleteConfirmationDialog from "@/components/dialogs/delete-confirmation-dialog";
import { useTransactions } from "@/hooks/use-library-data";
import {
  TableSkeletonLoader,
  DataLoadingError,
} from "@/components/data-skeleton";
import { useServerPagination } from "@/hooks/use-server-pagination";
import type { Transaction } from "@/lib/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { format } from "date-fns";

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

export default function TransactionsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const activeFilter = activeFilters[0];

  const paginationLocal = useServerPagination({ pageSize: 10 });

  const { transactions, total, isLoading, error, mutate } = useSafeTransactions(
    paginationLocal.currentPage,
    paginationLocal.pageSize,
    {
      search: searchQuery,
      status: ["ACTIVE", "OVERDUE", "COMPLETED"].includes(activeFilter)
        ? activeFilter
        : undefined,
      type: ["BORROW", "RETURN"].includes(activeFilter)
        ? activeFilter
        : undefined,
    },
  );

  const filterOptions = [
    { id: "BORROW", label: "Borrows", value: "BORROW" },
    { id: "RETURN", label: "Returns", value: "RETURN" },
    { id: "ACTIVE", label: "Active", value: "ACTIVE" },
    { id: "OVERDUE", label: "Overdue", value: "OVERDUE" },
    { id: "COMPLETED", label: "Completed", value: "COMPLETED" },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    paginationLocal.reset();
  };

  const handleFilter = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId],
    );
    paginationLocal.reset();
  };

  const handleRemoveFilter = (filterId: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filterId));
    paginationLocal.reset();
  };
  const getTypeColor = (type: string) => {
    switch (type) {
      case "BORROW":
        return "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "RETURN":
        return "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "OVERDUE":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      case "COMPLETED":
      case "RETURNED":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400";
    }
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;

    try {
      const response = await fetch(
        `/api/transactions/${transactionToDelete.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) throw new Error("Failed to delete transaction");

      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
      paginationLocal.reset();
      mutate();

      toast({
        title: "Success",
        description: "User deleted successfully!",
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  if (!isClient) {
    return (
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground font-heading">
              Transaction Logs
            </h2>
            <p className="text-muted-foreground mt-2">Loading...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground font-heading">
            Transaction Logs
          </h2>
          <p className="text-muted-foreground mt-2">
            View and manage system transaction records
          </p>
        </div>
      </div>

      <div className="mb-8">
        <SearchFilterBar
          placeholder="Search by member name, book title, or ID..."
          onSearch={handleSearch}
          onFilter={handleFilter}
          filters={filterOptions}
          activeFilters={activeFilters}
          onRemoveFilter={handleRemoveFilter}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Member
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Book
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Borrow Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Due Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeletonLoader rowCount={5} />
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      <DataLoadingError />
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction: Transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-border hover:bg-secondary transition-colors"
                    >
                      <td className="py-3 px-4 text-foreground font-medium">
                        {transaction.user?.name || "Unknown"}
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {transaction.book?.title || "Unknown"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(transaction.type)}`}
                        >
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-foreground text-sm">
                        {transaction.borrowDate
                          ? format(
                              new Date(transaction.borrowDate),
                              "MMM dd, yyyy",
                            )
                          : "-"}
                      </td>
                      <td className="py-3 px-4 text-foreground text-sm">
                        {transaction.dueDate
                          ? format(
                              new Date(transaction.dueDate),
                              "MMM dd, yyyy",
                            )
                          : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-medium text-sm px-2 py-1 rounded ${getStatusColor(transaction.status)}`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction)}
                          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {total > 0 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      paginationLocal.goToPage(paginationLocal.currentPage - 1);
                    }}
                    className={
                      paginationLocal.currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>

                {Array.from({
                  length: Math.ceil(total / paginationLocal.pageSize),
                }).map((_, i) => {
                  const page = i + 1;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={paginationLocal.currentPage === page}
                        onClick={(e) => {
                          e.preventDefault();
                          paginationLocal.goToPage(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      paginationLocal.goToPage(paginationLocal.currentPage + 1);
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

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Transaction"
        description="This action cannot be undone. The transaction record will be permanently removed."
        itemName={`${transactionToDelete?.book?.title || "Unknown Book"} - ${transactionToDelete?.user?.name || "Unknown User"}`}
        onConfirm={confirmDelete}
      />

      <div className="h-12" />
    </div>
  );
}
