"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Eye } from "lucide-react";
import SearchFilterBar from "@/components/admin/search-filter-bar";
import UserForm from "@/components/forms/user-form";
import DeleteConfirmationDialog from "@/components/dialogs/delete-confirmation-dialog";
import { useUsers } from "@/hooks/use-library-data";
import {
  TableSkeletonLoader,
  DataLoadingError,
} from "@/components/data-skeleton";
import { useServerPagination } from "@/hooks/use-server-pagination";
import { User, STATUS_COLOR_MAP } from "@/lib/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { UserDetailedModal } from "@/components/admin/user-detailed-modal";

// Safe hook wrapper for client-side rendering
function useSafeUsers(page: number, pageSize: number, filters: any) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const result = useUsers(page, pageSize, filters);

  return {
    ...result,
    isLoading: !isClient || result.isLoading,
    users: isClient ? result.users : [],
    total: isClient ? result.total : 0,
  };
}

export default function UsersPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Only store the ID of the book being viewed
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const paginationLocal = useServerPagination({ pageSize: 10 });
  const { users, total, isLoading, error, mutate } = useSafeUsers(
    paginationLocal.currentPage,
    paginationLocal.pageSize,
    { search: searchQuery, type: activeFilters[0] },
  );

  const filterOptions = [
    { id: "STUDENT", label: "Students", value: "STUDENT" },
    { id: "TEACHER", label: "Teachers", value: "TEACHER" },
    { id: "STAFF", label: "Staff", value: "STAFF" },
    { id: "ADMIN", label: "Admins", value: "ADMIN" },
    { id: "ACTIVE", label: "Active", value: "ACTIVE" },
    { id: "INACTIVE", label: "Inactive", value: "INACTIVE" },
    { id: "SUSPENDED", label: "Suspended", value: "SUSPENDED" },
    { id: "BANNED", label: "Banned", value: "BANNED" },
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

  const handleSaveUser = async (formData: Record<string, any>) => {
    try {
      if (editingUserId) {
        // Update existing user
        const response = await fetch(`/api/users/${editingUserId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData["Full Name"],
            email: formData["Email"],
            rfidTag: formData["RFID Tag"],
            grade: formData["Grade"],
            role: formData["Role"],
            password: formData["Password"],
            maxBooks: formData["maxBooks"],
            status: formData["Status"],
          }),
        });

        if (!response.ok) throw new Error("Failed to update user");

        toast({
          title: "Success",
          description: "User updated successfully!",
          duration: 3000,
        });
      } else {
        // Add new user
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData["Full Name"],
            email: formData["Email"],
            rfidTag: formData["RFID Tag"],
            role: formData["Role"],
            grade: formData["Grade"],
            password: formData["Password"],
            status: formData["Status"],
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
              type: "STUDENT",
            }),
          });

          toast({
            title: "Success",
            description: "User added successfully!",
            duration: 3000,
          });
        }
      }
      mutate();
      handleCloseForm();
    } catch (err) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleEditUser = (userId: string) => {
    setEditingUserId(userId);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUserId(null);
  };

  const getEditingUserData = () => {
    if (!editingUserId) return undefined;
    const user = users.find((u: User) => u.id === editingUserId);
    if (!user) return undefined;
    return {
      "Full Name": user.name,
      Email: user.email,
      Role: user.role,
      "RFID Tag": user.rfidTag,
      Grade: user.grade,
      Password: "********",
      Status: user.status,
    };
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleViewUser = (user: User) => {
    setViewingUserId(user.id);
  };

  const handleCloseViewDialog = () => {
    setViewingUserId(null);
  };

  const confirmDelete = async () => {
    if (userToDelete && (userToDelete.transactions?.length ?? 0) > 0) {
      toast({
        title: "Error",
        description:
          "Cannot delete this user because they have active borrow transactions.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    if (userToDelete) {
      try {
        const response = await fetch(`/api/users/${userToDelete.id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete user");
        setDeleteDialogOpen(false);
        setUserToDelete(null);
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
    }
  };

  // Get current viewing book data from books array
  const viewingUser = viewingUserId
    ? users.find((b: User) => b.id === viewingUserId)
    : null;

  // Prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground font-heading">
              Library Members
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
            Library Members
          </h2>
          <p className="text-muted-foreground mt-2">
            Search, filter, and manage library memberships
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
          {showForm ? "Cancel" : "Add User"}
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-8">
        <SearchFilterBar
          placeholder="Search by name, email, or member ID..."
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
            <UserForm
              initialData={getEditingUserData()}
              onSubmit={handleSaveUser}
              submitButtonLabel={editingUserId ? "Update Member" : "Add Member"}
            />
          </CardContent>
        </Card>
      )}

      <div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Member Since
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Role
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Active Books
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
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user: User) => (
                  <tr
                    key={user.id}
                    className="border-b border-border hover:bg-secondary transition-colors"
                  >
                    <td className="py-3 px-4 text-foreground font-medium">
                      {user.name}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">
                      {user.email}
                    </td>
                    <td className="py-3 px-4 text-foreground text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          STATUS_COLOR_MAP[user.role]
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-foreground font-semibold">
                      {user.transactions?.length || 0}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          STATUS_COLOR_MAP[user.status]
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                          className="text-xs"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user.id)}
                          className="text-xs"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
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

        {/* Pagination */}
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
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Member"
        description="This action cannot be undone. The member will be permanently removed from the library."
        itemName={userToDelete?.name}
        onConfirm={confirmDelete}
      />

      {/* Separate Modal Component */}
      <UserDetailedModal
        user={viewingUser}
        isOpen={!!viewingUserId}
        onClose={handleCloseViewDialog}
      />
    </div>
  );
}
