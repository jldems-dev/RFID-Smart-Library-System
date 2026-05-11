export interface FormField {
  label: string;
  placeholder: string;
  type: "text" | "email" | "password" | "number" | "select" | "date";
  required?: boolean;
  options?: { value: string; label: string }[];
  showWhen?: (role: string) => boolean;
}

// Helper function to capitalize every word
const capitalizeWords = (text: string) => {
  return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

// Book form fields - updated for Prisma schema
export const BOOK_FORM_FIELDS: FormField[] = [
  {
    label: "Title",
    placeholder: "Enter book title",
    type: "text",
    required: true,
  },
  {
    label: "Author",
    placeholder: "Enter author name",
    type: "text",
    required: true,
  },
  {
    label: "ISBN",
    placeholder: "Enter ISBN number",
    type: "text",
    required: true,
  },
  {
    label: "Publisher",
    placeholder: "Enter publisher name (optional)",
    type: "text",
    required: false,
  },
  {
    label: "Category",
    placeholder: "e.g., Fiction, Science, History",
    type: "text",
    required: true,
  },
  {
    label: "Location",
    placeholder: "Shelf location",
    type: "text",
    required: true,
  },
  {
    label: "Condition",
    placeholder: "Select condition",
    type: "select",
    required: true,
    options: [
      { value: "NEW", label: "New" },
      { value: "GOOD", label: "Good" },
      { value: "FAIR", label: "Fair" },
      { value: "POOR", label: "Poor" },
    ],
  },
  {
    label: "RFID Tag",
    placeholder: "Scan or Enter RFID Tag",
    type: "text",
    required: true,
  },
];

// User form fields - updated for Prisma schema
const BASE_USER_FIELDS: FormField[] = [
  {
    label: "Full Name",
    placeholder: "Enter full name",
    type: "text",
    required: true,
  },
  {
    label: "Email",
    placeholder: "Enter email address",
    type: "email",
    required: true,
  },
  {
    label: "Role",
    placeholder: "Select role",
    type: "select",
    required: true,
    options: [
      { value: "STUDENT", label: "Student" },
      { value: "TEACHER", label: "Teacher" },
      { value: "STAFF", label: "Staff" },
      { value: "ADMIN", label: "Admin" },
    ],
  },
  {
    label: "Grade",
    placeholder: "e.g., 10th Grade (optional)",
    type: "text",
    required: false,
  },
  {
    label: "Status",
    placeholder: "Select status",
    type: "select",
    required: true,
    options: [
      { value: "ACTIVE", label: "Active" },
      { value: "INACTIVE", label: "Inactive" },
      { value: "SUSPENDED", label: "Suspended" },
      { value: "BANNED", label: "Banned" },
    ],
  },
];

// Dynamic user form fields based on role only
// Students get RFID, Staff (Admin/Teacher) get Password
export const getUserFormFields = (role: string = "STUDENT"): FormField[] => {
  const isRFID = role === "STUDENT" || role === "STAFF" || role === "TEACHER";
  const fields: FormField[] = [...BASE_USER_FIELDS];

  if (isRFID) {
    fields.push({
      label: "RFID Tag",
      placeholder: "Tap RFID card",
      type: "text",
      required: true,
    });
  } else if (role === "ADMIN") {
    fields.push({
      label: "Password",
      placeholder: "Enter secure password",
      type: "password",
      required: true,
    });
  }

  return fields;
};

// Backward compatibility - default to student fields
export const USER_FORM_FIELDS = getUserFormFields("STUDENT");

// Validation functions
export const validateBookFields = (
  book: Record<string, any>,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Auto capitalize Title
  if (book.Title) {
    book.Title = capitalizeWords(book.Title);
  }

  if (!book.Title?.trim()) {
    errors["Title"] = "Title is required";
  }

  if (!book.Author?.trim()) {
    errors["Author"] = "Author is required";
  }

  if (!book.ISBN?.trim()) {
    errors["ISBN"] = "ISBN is required";
  }

  if (!book.Category?.trim()) {
    errors["Category"] = "Category is required";
  }

  if (!book.Location?.trim()) {
    errors["Location"] = "Location is required";
  }

  if (!book["RFID Tag"]?.trim()) {
    errors["RFID Tag"] = "RFID Tag is required";
  }

  if (!book.Condition) {
    errors["Condition"] = "Condition is required";
  }

  return errors;
};

export const validateUserFields = (
  user: Record<string, any>,
  role: string = "STUDENT",
): Record<string, string> => {
  const errors: Record<string, string> = {};
  const isRFID = role === "STUDENT" || role === "STAFF" || role === "TEACHER";

  // Auto capitalize Full Name
  if (user["Full Name"]) {
    user["Full Name"] = capitalizeWords(user["Full Name"]);
  }

  if (!user["Full Name"]?.trim()) {
    errors["Full Name"] = "Full name is required";
  } else if (user["Full Name"].length < 2) {
    errors["Full Name"] = "Name must be at least 2 characters";
  }

  if (!user.Email?.trim()) {
    errors["Email"] = "Email is required";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.Email)) {
      errors["Email"] = "Please enter a valid email address";
    }
  }

  if (!user.Role) {
    errors["Role"] = "Role is required";
  }

  // Role-specific validation
  if (isRFID) {
    if (!user["RFID Tag"]?.trim()) {
      errors["RFID Tag"] = "RFID Tag is required for students";
    }
  } else if (role === "ADMIN") {
    if (!user.Password?.trim()) {
      errors["Password"] = "Password is required for staff members";
    } else if (user.Password.length < 6) {
      errors["Password"] = "Password must be at least 6 characters";
    }
  }

  return errors;
};
