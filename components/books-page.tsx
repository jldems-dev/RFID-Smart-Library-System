"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Eye } from "lucide-react";
import SearchFilterBar from "@/components/admin/search-filter-bar";
import ValidationFeedback, {
  ValidationStatus,
} from "@/components/admin/validation-feedback";
import { StatusBadge } from "@/components/ui/status-badge";
import BookForm from "@/components/forms/book-form";
import DeleteConfirmationDialog from "@/components/dialogs/delete-confirmation-dialog";
import { useBooks } from "@/hooks/use-library-data";
import {
  TableSkeletonLoader,
  DataLoadingError,
} from "@/components/data-skeleton";
import { useServerPagination } from "@/hooks/use-server-pagination";
import type { Book } from "@/lib/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { BookDetailedModal } from "@/components/admin/books-detailed-modal";

// Safe hook wrapper
function useSafeBooks(page: number, pageSize: number, filters: any) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const result = useBooks(page, pageSize, filters);

  return {
    ...result,
    isLoading: !isClient || result.isLoading,
    books: isClient ? result.books : [],
    total: isClient ? result.total : 0,
  };
}

export default function BooksPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [validationStatus, setValidationStatus] =
    useState<ValidationStatus>(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Only store the ID of the book being viewed
  const [viewingBookId, setViewingBookId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const paginationLocal = useServerPagination({ pageSize: 10 });
  const { books, total, isLoading, error, mutate } = useSafeBooks(
    paginationLocal.currentPage,
    paginationLocal.pageSize,
    { search: searchQuery, status: activeFilters[0] },
  );

  const filterOptions = [
    { id: "AVAILABLE", label: "Available", value: "AVAILABLE" },
    { id: "BORROWED", label: "Borrowed", value: "BORROWED" },
    { id: "RESERVED", label: "Reserved", value: "RESERVED" },
    { id: "MAINTENANCE", label: "Maintenance", value: "MAINTENANCE" },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId],
    );
  };

  const handleRemoveFilter = (filterId: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filterId));
  };

  const handleSaveBook = async (formData: Record<string, any>) => {
    try {
      if (editingBookId) {
        const response = await fetch(`/api/books/${editingBookId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData["Title"],
            author: formData["Author"],
            category: formData["Category"],
            location: formData["Location"],
            condition: formData["Condition"],
            rfidTag: formData["RFID Tag"],
          }),
        });
        if (!response.ok) {
          toast({
            title: "Error",
            description: "Failed to create book",
            variant: "destructive",
            duration: 3000,
          });
        } else {
          toast({
            title: "Success",
            description: "Book updated successfully!",
            duration: 3000,
          });
        }
      } else {
        const response = await fetch("/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData["Title"],
            author: formData["Author"],
            isbn: formData["ISBN"],
            rfidTag: formData["RFID Tag"],
            category: formData["Category"],
            location: formData["Location"],
            publisher: formData["Publisher"],
            condition: formData["Condition"],
          }),
        });

        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to create user" }));

        if (!response.ok) {
          toast({
            title: "Error",
            description: errorData.error.message || "Failed to create user",
            variant: "destructive",
            duration: 3000,
          });
        } else {
          await fetch("/api/rfid/lookup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              rfidTag: formData["RFID Tag"],
              message: "RFID tag registered successfully",
              action: "REGISTERED",
              type: "BOOK",
            }),
          });
          toast({
            title: "Success",
            description: "Book added successfully!",
            duration: 3000,
          });
        }
      }
      mutate();
      handleCloseForm();
      setTimeout(() => setValidationStatus(null), 3000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save book",
        duration: 3000,
      });
    }
  };

  const handleEditBook = (bookId: string) => {
    setEditingBookId(bookId);
    setShowForm(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBookId(null);
  };

  const getEditingBookData = () => {
    if (!editingBookId) return undefined;
    const book = books.find((b: Book) => b.id === editingBookId);
    if (!book) return undefined;
    return {
      Title: book.title,
      Author: book.author,
      ISBN: book.isbn,
      Category: book.category,
      Location: book.location,
      Condition: book.condition,
      Publisher: book.publisher,
      "RFID Tag": book.rfidTag,
    };
  };

  const handleDeleteBook = (book: Book) => {
    setBookToDelete(book);
    setDeleteDialogOpen(true);
  };

  const handleViewBook = (book: Book) => {
    setViewingBookId(book.id);
  };

  const handleCloseViewDialog = () => {
    setViewingBookId(null);
  };

  const confirmDelete = async () => {
    if (bookToDelete) {
      try {
        const response = await fetch(`/api/books/${bookToDelete.id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete book");
        setDeleteDialogOpen(false);
        setBookToDelete(null);
        paginationLocal.reset();
        mutate();
        toast({
          title: "Success",
          description: "Book deleted successfully!",
          duration: 3000,
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete book",
          duration: 3000,
        });
      }
    }
  };

  // Get current viewing book data from books array
  const viewingBook = viewingBookId
    ? books.find((b: Book) => b.id === viewingBookId)
    : null;

  if (!isClient) {
    return (
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground font-heading">
              Books Management
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
            Books Management
          </h2>
          <p className="text-muted-foreground mt-2">
            Search, filter, and manage your library collection
          </p>
        </div>
        <Button
          onClick={() => {
            if (showForm) {
              handleCloseForm();
            } else {
              setShowForm(true);
            }
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {showForm ? "Cancel" : "Add Book"}
        </Button>
      </div>

      {validationStatus && (
        <div className="mb-6">
          <ValidationFeedback
            status={validationStatus}
            message={validationMessage}
          />
        </div>
      )}

      <div className="mb-8">
        <SearchFilterBar
          placeholder="Search by title, author, or ISBN..."
          onSearch={handleSearch}
          onFilter={handleFilter}
          filters={filterOptions}
          activeFilters={activeFilters}
          onRemoveFilter={handleRemoveFilter}
        />
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <BookForm
              initialData={getEditingBookData()}
              onSubmit={handleSaveBook}
              submitButtonLabel={editingBookId ? "Update Book" : "Add Book"}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Books ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Title
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Author
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    ISBN
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Condition
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
                ) : books.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No books found
                    </td>
                  </tr>
                ) : (
                  books.map((book: Book) => (
                    <tr
                      key={book.id}
                      className="border-b border-border hover:bg-secondary transition-colors"
                    >
                      <td className="py-3 px-4 text-foreground font-medium">
                        {book.title}
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {book.author}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">
                        {book.isbn}
                      </td>
                      <td className="py-3 px-4 text-foreground text-sm">
                        {book.category}
                      </td>
                      <td className="py-3 px-4 text-foreground text-sm">
                        {book.condition}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={book.status} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewBook(book)}
                            className="text-xs"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBook(book.id)}
                            className="text-xs"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBook(book)}
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
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
        title="Delete Book"
        description="This action cannot be undone. The book will be permanently removed from the library."
        itemName={bookToDelete?.title}
        onConfirm={confirmDelete}
      />

      {/* Separate Modal Component */}
      <BookDetailedModal
        book={viewingBook}
        isOpen={!!viewingBookId}
        onClose={handleCloseViewDialog}
      />
    </div>
  );
}
