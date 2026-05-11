"use client";

import React from "react";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GuidedActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: "add-book" | "issue-book" | "return-book" | "add-user" | null;
}

interface ActionStep {
  title: string;
  description: string;
  fields: { label: string; placeholder: string; type: string }[];
}

const actionSteps: Record<string, ActionStep[]> = {
  "add-book": [
    {
      title: "Book Information",
      description: "Enter basic book details",
      fields: [
        { label: "Title", placeholder: "Enter book title", type: "text" },
        { label: "Author", placeholder: "Enter author name", type: "text" },
        { label: "ISBN", placeholder: "Enter ISBN number", type: "text" },
        { label: "Category", placeholder: "Enter book category", type: "text" },
      ],
    },
    {
      title: "Stock Details",
      description: "Set location and condition",
      fields: [
        { label: "Location", placeholder: "Shelf or section", type: "text" },
        { label: "Condition", placeholder: "Select condition", type: "select" },
      ],
    },
    {
      title: "Assign RFID Tag",
      description: "Optional: Assign RFID tag to book",
      fields: [
        {
          label: "RFID Tag",
          placeholder: "Scan or enter RFID tag (optional)",
          type: "text",
        },
      ],
    },
    {
      title: "Confirm Book",
      description: "Review and save the new book",
      fields: [],
    },
  ],
  "issue-book": [
    {
      title: "Student Information",
      description: "Identify the student",
      fields: [
        {
          label: "Student RFID Tag",
          placeholder: "Scan student rfid",
          type: "text",
        },
      ],
    },
    {
      title: "Select Books",
      description: "Choose books to issue",
      fields: [
        {
          label: "Book ISBN",
          placeholder: "Scan enter ISBN",
          type: "text",
        },
        {
          label: "Book RFID",
          placeholder: "Scan book RFID tag",
          type: "text",
        },
      ],
    },

    {
      title: "Confirm Issue",
      description: "Review and confirm transaction",
      fields: [],
    },
  ],
  "return-book": [
    {
      title: "Student Information",
      description: "Identify the student returning the book",
      fields: [
        {
          label: "Student RFID Tag",
          placeholder: "Scan student rfid",
          type: "text",
        },
      ],
    },
    {
      title: "Select Books",
      description: "Choose books to return",
      fields: [
        {
          label: "Book ISBN",
          placeholder: "Scan enter ISBN",
          type: "text",
        },
        {
          label: "Book RFID",
          placeholder: "Scan book RFID tag",
          type: "text",
        },
      ],
    },
    {
      title: "Confirm Return",
      description: "Review and confirm transaction",
      fields: [],
    },
  ],
  "add-user": [
    {
      title: "Personal Information",
      description: "Enter the user's basic details",
      fields: [
        { label: "Full Name", placeholder: "Enter full name", type: "text" },
        { label: "Email", placeholder: "Enter email address", type: "email" },
        {
          label: "Grade",
          placeholder: "Enter Grade",
          type: "text",
        },
      ],
    },
    {
      title: "User Type",
      description: "Select the user role",
      fields: [
        {
          label: "User Type",
          placeholder: "Select user type",
          type: "select",
        },
      ],
    },
    {
      title: "Credentials",
      description: "Set up access credentials",
      fields: [],
    },
    {
      title: "Confirm User",
      description: "Review and save the new user",
      fields: [],
    },
  ],
};

const userTypeOptions = [
  { value: "STUDENT", label: "Student" },
  { value: "TEACHER", label: "Teacher" },
  { value: "STAFF", label: "Staff" },
  { value: "ADMIN", label: "Admin" },
];

const conditionOptions = [
  { value: "New", label: "New" },
  { value: "Good", label: "Good" },
  { value: "Fair", label: "Fair" },
  { value: "Damaged", label: "Damaged" },
];

export default function GuidedActionModal({
  open,
  onOpenChange,
  action,
}: GuidedActionModalProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!action || !actionSteps[action]) return null;

  const getDynamicSteps = () => {
    if (action !== "add-user") return actionSteps[action];

    const steps = [...actionSteps[action]];
    const userType = formData["User Type"]?.toLowerCase();

    // Update step 2 (index 2) based on user type
    if (
      userType === "student" ||
      userType === "teacher" ||
      userType === "staff"
    ) {
      steps[2] = {
        title: "Assign RFID Tag",
        description: "Optional: Scan or tap RFID tag to assign",
        fields: [
          {
            label: "RFID Tag",
            placeholder: "Scan or enter RFID tag (optional)",
            type: "text",
          },
        ],
      };
    } else if (userType === "admin") {
      steps[2] = {
        title: "Set Password",
        description: "Create a secure password for account access",
        fields: [
          {
            label: "Password",
            placeholder: "Enter password (min 6 characters)",
            type: "password",
          },
          {
            label: "Confirm Password",
            placeholder: "Confirm password",
            type: "password",
          },
        ],
      };
    }

    return steps;
  };

  const steps = getDynamicSteps();
  const step = steps[currentStep];
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Real-time validation for form fields
  const validateField = (fieldLabel: string, value: string) => {
    const errors: Record<string, string> = {};

    // User fields validation
    if (fieldLabel === "Full Name" && value) {
      if (value.length < 2) {
        errors[fieldLabel] = "Name must be at least 2 characters";
      }
    }
    if (fieldLabel === "Email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors[fieldLabel] = "Please enter a valid email address";
      }
    }
    if (fieldLabel === "Grade" && value) {
      if (value.length < 3) {
        errors[fieldLabel] = "Grade must be at least 3 characters";
      }
    }
    if (fieldLabel === "User Type" && value) {
      const validTypes = ["student", "teacher", "staff", "admin"];
      if (!validTypes.includes(value.toLowerCase())) {
        errors[fieldLabel] = "Select from: Student, Teacher, or Admin";
      }
    }

    // Password validation for teacher/admin
    if (fieldLabel === "Password" && value) {
      if (value.length < 6) {
        errors[fieldLabel] = "Password must be at least 6 characters";
      }
    }

    if (fieldLabel === "Confirm Password" && value) {
      const password = formData["Password"];
      if (value !== password) {
        errors[fieldLabel] = "Passwords do not match";
      }
    }

    // RFID Tag validation (only for students)
    if (fieldLabel === "RFID Tag" && value) {
      if (value === "RFID123") {
        errors[fieldLabel] = "This RFID tag is already assigned";
      } else if (value.length < 4) {
        errors[fieldLabel] = "Invalid RFID tag format";
      }
    }

    // Book fields validation
    if (fieldLabel === "Title" && value) {
      if (value.length < 2) {
        errors[fieldLabel] = "Title must be at least 2 characters";
      }
    }
    if (fieldLabel === "Author" && value) {
      if (value.length < 2) {
        errors[fieldLabel] = "Author must be at least 2 characters";
      }
    }
    if (fieldLabel === "ISBN" && value) {
      if (value.length < 10) {
        errors[fieldLabel] = "ISBN must be at least 10 characters";
      }
    }
    if (fieldLabel === "Category" && value) {
      if (value.length < 2) {
        errors[fieldLabel] = "Category must be at least 2 characters";
      }
    }
    if (fieldLabel === "Condition" && value) {
      const validConditions = ["New", "Good", "Fair", "Damaged"];
      if (!validConditions.includes(value)) {
        errors[fieldLabel] = "Select a valid condition";
      }
    }

    setValidationErrors((prev) => ({
      ...prev,
      ...errors,
    }));

    return Object.keys(errors).length === 0;
  };

  // Check if all required fields in current step are filled
  const validateRequiredFields = () => {
    const errors: Record<string, string> = {};
    let hasErrors = false;

    // Define required fields for each action and step
    const requiredFieldsMap: Record<string, Record<number, string[]>> = {
      "add-user": {
        0: ["Full Name", "Email", "Grade"],
        1: ["User Type"],
        2: [], // Dynamic based on user type
      },
      "add-book": {
        0: ["Title", "Author", "ISBN", "Category"],
        1: ["Location", "Condition"],
        2: [], // RFID Tag is optional
      },
      "issue-book": {
        0: ["Student RFID Tag"],
        1: ["Book RFID"],
      },
      "return-book": {
        0: ["Student RFID Tag"],
        1: ["Book RFID"],
      },
    };

    // Get required fields for current action and step
    let requiredFields = requiredFieldsMap[action]?.[currentStep] || [];

    // Handle dynamic step 2 for add-user
    if (action === "add-user" && currentStep === 2) {
      const userType = formData["User Type"]?.toLowerCase();
      if (userType === "student") {
        // RFID Tag is optional for students
        requiredFields = [];
      } else if (userType === "teacher" || userType === "admin") {
        requiredFields = ["Password", "Confirm Password"];
      }
    }

    // Check each required field
    requiredFields.forEach((fieldLabel) => {
      const value = formData[fieldLabel];
      const stringValue =
        typeof value === "string" ? value.trim() : String(value || "").trim();

      if (!stringValue) {
        errors[fieldLabel] = `${fieldLabel} is required`;
        hasErrors = true;
      }
    });

    // Also run format validation if value exists
    step.fields.forEach((field) => {
      const value = formData[field.label];
      const stringValue =
        typeof value === "string" ? value.trim() : String(value || "").trim();

      if (stringValue && !validateField(field.label, stringValue)) {
        hasErrors = true;
      }
    });

    setValidationErrors((prev) => ({
      ...prev,
      ...errors,
    }));

    return !hasErrors;
  };

  const handleNext = async () => {
    if (!validateRequiredFields()) {
      return;
    }

    if (action === "issue-book" || action === "return-book") {
      const newErrors: Record<string, string> = {};
      if (currentStep === 0) {
        const studentRfid = formData["Student RFID Tag"]?.trim();
        if (!studentRfid) {
          newErrors["Student RFID Tag"] = "Student RFID Tag is required";
          setValidationErrors(newErrors);
          return;
        }
        try {
          const studentResponse = await fetch(
            `/api/rfid/student/${encodeURIComponent(studentRfid)}`,
          );
          const studentData = await studentResponse.json();

          if (!studentResponse.ok) {
            newErrors["Student RFID Tag"] =
              studentData.error?.message || "Student not found";
            setValidationErrors(newErrors);
            return;
          }

          if (
            studentData.data.activeQuantity === studentData.data.maxBooks &&
            action == "issue-book"
          ) {
            newErrors["Student RFID Tag"] =
              "Student has reached the maximum number of borrowed books.";
            setValidationErrors(newErrors);
            return;
          }
          if (
            studentData?.data?.activeQuantity === 0 &&
            action === "return-book"
          ) {
            setValidationErrors({
              "Student RFID Tag":
                "This student does not have any borrowed books.",
            });
            return;
          }

          setFormData((prev) => ({
            ...prev,
            _studentData: studentData.data,
          }));

          setCurrentStep(currentStep + 1);
        } catch (error) {
          newErrors["Student RFID Tag"] = "Failed to verify student";
          setValidationErrors(newErrors);
          return;
        }
      } else if (currentStep === 1) {
        // Step 2: Only check Book RFID if student was found (required)
        const bookRfid = formData["Book RFID"]?.trim();
        if (!bookRfid) {
          newErrors["Book RFID"] = "Book RFID is required";
          setValidationErrors(newErrors);
          return;
        }
        try {
          const bookResponse = await fetch(
            `/api/rfid/book/${encodeURIComponent(bookRfid)}`,
          );
          const bookData = await bookResponse.json();

          if (!bookResponse.ok) {
            newErrors["Book RFID"] =
              bookData.error?.message || "Book not found";
            setValidationErrors(newErrors);
            return; // Stop here
          }

          if (bookData.data.status == "BORROWED" && action === "issue-book") {
            newErrors["Book RFID"] =
              bookData.error?.message || "This book is already borrowed.";
            setValidationErrors(newErrors);
            return; // Stop here
          }

          const studData = formData._studentData;
          const bkData = bookData.data;

          const matchedTransaction = studData?.transactions?.find(
            (trx: any) => trx.book?.rfidTag === bookRfid,
          );

          if (action === "return-book") {
            if (!matchedTransaction) {
              newErrors["Book RFID"] = "This student did not borrow this book.";
              setValidationErrors(newErrors);
              return;
            }
          }

          let dueDate =
            action === "return-book"
              ? new Date(matchedTransaction.dueDate).toLocaleDateString("en-US")
              : "";

          if (studData && bkData) {
            setFormData((prev) => ({
              ...prev,
              "Full Name": studData.name,
              "User ID": studData.id,
              Email: studData.email,
              "User Type": studData.role,
              "Current Borrow": studData.activeQuantity,
              "User Limit": String(studData.maxBooks),
              "User Status": studData.status,
              // Book info
              "Book Title": bkData.title,
              Author: bkData.author,
              ISBN: bkData.isbn,
              "Book ID": bkData.id,
              Category: bkData.category,
              Location: bkData.location,
              "Book Condition": bkData.condition,
              // Available: String(bkData.quantity),
              // "Total Copies": String(bkData.totalQuantity),
              "Due Date": dueDate,
            }));

            // Move to review step
            setCurrentStep(currentStep + 1);
            setValidationErrors({});
          }
        } catch (error) {
          newErrors["Book RFID"] = "Failed to verify book";
          setValidationErrors(newErrors);
          return; // Stop here
        }
      }
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      setValidationErrors({});
    } else {
      if (action === "add-user" || action === "add-book") {
        if (action === "add-user") {
          const response = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData["Full Name"],
              email: formData["Email"],
              rfidTag: formData["RFID Tag"],
              role: formData["User Type"],
              grade: formData["Grade"],
              password: formData["Password"],
            }),
          });
          if (!response.ok) throw new Error("Failed to create user");

          toast({
            title: "Success",
            description: "User added successfully!",
            duration: 3000,
          });
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
              condition: formData["Condition"],
            }),
          });
          if (!response.ok) throw new Error("Failed to create book");

          toast({
            title: "Success",
            description: "Book added successfully!",
            duration: 3000,
          });
        }

        setIsConfirmed(true);
        setTimeout(() => {
          onOpenChange(false);
          setCurrentStep(0);
          setFormData({});
          setIsConfirmed(false);
          setValidationErrors({});
        }, 2000);
      } else if (action === "issue-book") {
        try {
          const response = await fetch("/api/transactions/borrow", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: formData["User ID"],
              bookId: formData["Book ID"],
              title: formData["Book Title"],
              notes: "Borrowed via librarian",
            }),
          });
          if (!response.ok) throw new Error("Failed to issue book");

          toast({
            title: "Success",
            description: "Issued book successfully!",
            duration: 3000,
          });

          setIsConfirmed(true);
          setTimeout(() => {
            onOpenChange(false);
            setCurrentStep(0);
            setFormData({});
            setIsConfirmed(false);
            setValidationErrors({});
          }, 2000);
        } catch (error) {
          setValidationErrors({
            general:
              error instanceof Error ? error.message : "Failed to issue book",
          });
        }
      } else if (action === "return-book") {
        // Handle return book submission
        try {
          const response = await fetch("/api/transactions/return", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: formData["User ID"],
              bookId: formData["Book ID"],
              title: formData["Book Title"],
              notes: "Returned via librarian",
            }),
          });
          if (!response.ok) throw new Error("Failed to return book");

          toast({
            title: "Success",
            description: "Returned book successfully!",
            duration: 3000,
          });

          setIsConfirmed(true);
          setTimeout(() => {
            onOpenChange(false);
            setCurrentStep(0);
            setFormData({});
            setIsConfirmed(false);
            setValidationErrors({});
          }, 2000);
        } catch (error) {
          setValidationErrors({
            general:
              error instanceof Error ? error.message : "Failed to return book",
          });
        }
      } else {
        onOpenChange(false);
        setCurrentStep(0);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
    // Real-time validation for add-user and add-book
    if (action === "add-user" || action === "add-book") {
      validateField(name, value);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user selects
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Clear password fields when switching user types
    if (name === "User Type") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        Password: "",
        "Confirm Password": "",
        "RFID Tag": "",
      }));
    }

    // Real-time validation for add-user and add-book
    if (action === "add-user" || action === "add-book") {
      validateField(name, value);
    }
  };

  // Get credentials info for confirmation screen
  const getCredentialsInfo = () => {
    const userType = formData["User Type"]?.toLowerCase();
    if (userType === "student") {
      return formData["RFID Tag"]
        ? `RFID: ${formData["RFID Tag"]}`
        : "No RFID assigned";
    } else if (userType === "teacher" || userType === "admin") {
      return "Password protected account";
    }
    return "";
  };

  // Render review information for empty fields step
  const renderReviewInfo = () => {
    if (action === "add-book") {
      return (
        <div className="space-y-3 text-left">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Title:</span>
            <span className="font-medium">{formData["Title"] || "-"}</span>

            <span className="text-muted-foreground">Author:</span>
            <span className="font-medium">{formData["Author"] || "-"}</span>

            <span className="text-muted-foreground">ISBN:</span>
            <span className="font-medium">{formData["ISBN"] || "-"}</span>

            <span className="text-muted-foreground">Category:</span>
            <span className="font-medium">{formData["Category"] || "-"}</span>

            <span className="text-muted-foreground">Location:</span>
            <span className="font-medium">{formData["Location"] || "-"}</span>

            <span className="text-muted-foreground">Condition:</span>
            <span className="font-medium">{formData["Condition"] || "-"}</span>

            <span className="text-muted-foreground">RFID Tag:</span>
            <span className="font-medium">
              {formData["RFID Tag"] || "Not assigned"}
            </span>
          </div>
        </div>
      );
    } else if (action === "add-user") {
      const userType = formData["User Type"]?.toLowerCase();
      return (
        <div className="space-y-3 text-left">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Full Name:</span>
            <span className="font-medium">{formData["Full Name"] || "-"}</span>

            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{formData["Email"] || "-"}</span>

            <span className="text-muted-foreground">Grade:</span>
            <span className="font-medium">{formData["Grade"] || "-"}</span>

            <span className="text-muted-foreground">User Type:</span>
            <span className="font-medium capitalize">
              {formData["User Type"] || "-"}
            </span>

            {userType === "student" && (
              <>
                <span className="text-muted-foreground">RFID Tag:</span>
                <span className="font-medium">
                  {formData["RFID Tag"] || "Not assigned"}
                </span>
              </>
            )}
            {(userType === "teacher" || userType === "admin") && (
              <>
                <span className="text-muted-foreground">Password:</span>
                <span className="font-medium">••••••••</span>
              </>
            )}
          </div>
        </div>
      );
    } else if (action === "issue-book") {
      const dueDate = formData["Due Date"]
        ? new Date(formData["Due Date"]).toLocaleDateString()
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString();

      return (
        <div className="space-y-4 text-left">
          {/* User Summary */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {formData["Full Name"]?.charAt(0) || "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {formData["Full Name"] || "-"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formData["Email"] || "-"}
              </p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 capitalize">
              {formData["User Type"] || "-"}
            </span>
          </div>

          {/* Book Summary */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
              <svg
                className="h-5 w-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {formData["Book Title"] || "-"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formData["Author"] || "-"}
              </p>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 rounded border border-border">
              <p className="text-muted-foreground text-xs">Issue Date</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="p-2 rounded border border-border">
              <p className="text-muted-foreground text-xs">Due Date</p>
              <p className="font-medium text-orange-600">{dueDate}</p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            {/*  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
              Available: {formData["Available"] || 0}
            </span> */}
            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
              User Borrow: {formData["Current Borrow"] || 0}/
              {formData["User Limit"]}
            </span>
          </div>
        </div>
      );
    } else if (action === "return-book") {
      return (
        <div className="space-y-4 text-left">
          {/* User Summary */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {formData["Full Name"]?.charAt(0) || "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {formData["Full Name"] || "-"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formData["Email"] || "-"}
              </p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 capitalize">
              {formData["User Type"] || "-"}
            </span>
          </div>

          {/* Book Summary */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
              <svg
                className="h-5 w-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {formData["Book Title"] || "-"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formData["Author"] || "-"}
              </p>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 rounded border border-border">
              <p className="text-muted-foreground text-xs">Original Due Date</p>
              <p className="font-medium">{formData["Due Date"] || "-"}</p>
            </div>
            <div className="p-2 rounded border border-border">
              <p className="text-muted-foreground text-xs">Return Date</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Status */}
          {formData["Overdue"] === "true" && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 font-medium">
                ⚠️ Book is overdue by {formData["Days Overdue"]} days
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {isConfirmed &&
        (action === "add-user" ||
          action === "add-book" ||
          action === "issue-book" ||
          action === "return-book") ? (
          // Confirmation Screen
          <div className="text-center py-8 space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-bounce">
                <span className="text-3xl">✓</span>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                {action === "add-user"
                  ? "User Added Successfully"
                  : action === "add-book"
                    ? "Book Added Successfully"
                    : action === "issue-book"
                      ? "Book Issued Successfully"
                      : "Book Returned Successfully"}
              </h2>
              <p className="text-muted-foreground">
                {action === "add-user"
                  ? `${formData["Full Name"]} has been added to the system`
                  : action === "add-book"
                    ? `${formData["Title"]} has been added to inventory`
                    : action === "issue-book"
                      ? `${formData["Book Title"]} has been issued to ${formData["Full Name"]}`
                      : `${formData["Book Title"]} has been returned by ${formData["Full Name"]}`}
              </p>
              {action === "add-user" && (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  {getCredentialsInfo()}
                </p>
              )}
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 text-left space-y-2">
              <p className="text-sm font-medium text-foreground">Summary:</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                {action === "add-user" ? (
                  <>
                    <p>
                      Name:{" "}
                      <span className="text-foreground font-medium">
                        {formData["Full Name"]}
                      </span>
                    </p>
                    <p>
                      Email:{" "}
                      <span className="text-foreground font-medium">
                        {formData["Email"]}
                      </span>
                    </p>
                    <p>
                      Grade:{" "}
                      <span className="text-foreground font-medium">
                        {formData["Grade"]}
                      </span>
                    </p>
                    <p>
                      Type:{" "}
                      <span className="text-foreground font-medium capitalize">
                        {formData["User Type"]}
                      </span>
                    </p>
                    {formData["User Type"]?.toLowerCase() === "student" &&
                      formData["RFID Tag"] && (
                        <p>
                          RFID:{" "}
                          <span className="text-foreground font-medium">
                            {formData["RFID Tag"]}
                          </span>
                        </p>
                      )}
                  </>
                ) : action === "add-book" ? (
                  <>
                    <p>
                      Title:{" "}
                      <span className="text-foreground font-medium">
                        {formData["Title"]}
                      </span>
                    </p>
                    <p>
                      Author:{" "}
                      <span className="text-foreground font-medium">
                        {formData["Author"]}
                      </span>
                    </p>
                    <p>
                      ISBN:{" "}
                      <span className="text-foreground font-medium">
                        {formData["ISBN"]}
                      </span>
                    </p>
                    <p>
                      Category:{" "}
                      <span className="text-foreground font-medium">
                        {formData["Category"]}
                      </span>
                    </p>
                    <p>
                      Condition:{" "}
                      <span className="text-foreground font-medium">
                        {formData["Condition"]}
                      </span>
                    </p>
                  </>
                ) : (
                  // Issue Book & Return Book Summary
                  <>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">
                      Student Information
                    </p>
                    <p>
                      Name:{" "}
                      <span className="text-foreground font-medium">
                        {formData["Full Name"]}
                      </span>
                    </p>
                    <p>
                      User ID:{" "}
                      <span className="text-foreground font-medium">
                        {formData["User ID"]}
                      </span>
                    </p>
                    <p>
                      Email:{" "}
                      <span className="text-foreground font-medium">
                        {formData["Email"]}
                      </span>
                    </p>
                    <p>
                      User Type:{" "}
                      <span className="text-foreground font-medium capitalize">
                        {formData["User Type"]}
                      </span>
                    </p>

                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">
                      Book Information
                    </p>
                    <p>
                      Title:{" "}
                      <span className="text-foreground font-medium">
                        {formData["Book Title"]}
                      </span>
                    </p>
                    <p>
                      Author:{" "}
                      <span className="text-foreground font-medium">
                        {formData["Author"]}
                      </span>
                    </p>
                    <p>
                      ISBN:{" "}
                      <span className="text-foreground font-medium">
                        {formData["ISBN"]}
                      </span>
                    </p>
                    <p>
                      Book ID:{" "}
                      <span className="text-foreground font-medium">
                        {formData["Book ID"]}
                      </span>
                    </p>
                    <p>
                      Category:{" "}
                      <span className="text-foreground font-medium">
                        {formData["Category"]}
                      </span>
                    </p>
                    <p>
                      Location:{" "}
                      <span className="text-foreground font-medium">
                        {formData["Location"]}
                      </span>
                    </p>
                    {/* {action === "issue-book" && (
                      <p>
                        Available Copies:{" "}
                        <span className="text-foreground font-medium">
                          {formData["Available"]} / {formData["Total Copies"]}
                        </span>
                      </p>
                    )} */}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <DialogHeader className="pb-4 border-b">
              <div>
                <DialogTitle className="text-2xl">{step.title}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            </DialogHeader>

            {/* Progress Indicator */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  Step {currentStep + 1} of {totalSteps}
                </span>
                <span className="text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Steps Indicator */}
            <div className="flex gap-2 mt-6">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-2 rounded-full transition-colors ${
                    idx <= currentStep ? "bg-primary" : "bg-secondary"
                  }`}
                />
              ))}
            </div>

            {/* Form Fields */}
            <div className="space-y-4 my-6">
              {step.fields.length > 0 ? (
                step.fields.map((field, idx) => {
                  const hasError = validationErrors[field.label];
                  const isOptional = field.label === "RFID Tag";
                  const isSelect = field.type === "select";

                  return (
                    <div key={idx}>
                      <label className="text-sm font-medium text-foreground block mb-2">
                        {field.label}
                        {isOptional && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (optional)
                          </span>
                        )}
                      </label>
                      {isSelect ? (
                        <Select
                          value={formData[field.label] || ""}
                          onValueChange={(value) =>
                            handleSelectChange(field.label, value)
                          }
                        >
                          <SelectTrigger
                            className={`w-full ${hasError ? "border-red-500" : ""}`}
                          >
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.label === "User Type" &&
                              userTypeOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            {field.label === "Condition" &&
                              conditionOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={field.type}
                          placeholder={field.placeholder}
                          name={field.label}
                          value={formData[field.label] || ""}
                          onChange={handleInputChange}
                          className={`text-base ${hasError ? "border-red-500" : ""}`}
                        />
                      )}
                      {hasError && (
                        <p className="text-xs text-red-500 mt-1 font-medium">
                          {hasError}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-6 bg-secondary/50 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-4">
                    Review your information:
                  </p>
                  {renderReviewInfo()}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentStep > 0) setCurrentStep(currentStep - 1);
                }}
                disabled={currentStep === 0}
                className="flex-1"
              >
                Previous
              </Button>
              <Button onClick={handleNext} className="flex-1 group">
                {currentStep === totalSteps - 1 ? "Complete" : "Next"}
                {currentStep < totalSteps - 1 && (
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
