"use client";

import React from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getUserFormFields, validateUserFields } from "@/lib/form-fields";

interface UserFormProps {
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  isLoading?: boolean;
  submitButtonLabel?: string;
}

export default function UserForm({
  initialData = {},
  onSubmit,
  isLoading = false,
  submitButtonLabel = "Save Member",
}: UserFormProps) {
  const [formValues, setFormValues] =
    React.useState<Record<string, any>>(initialData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [role, setRole] = React.useState<string>(
    initialData["Role"] || "STUDENT",
  );

  const formFields = getUserFormFields(role);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));

    if (name === "Role") {
      setRole(value);
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle RFID scanner - prevent form submission on Enter
  const handleRFIDKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();

      // Move to next field
      const form = e.currentTarget.form;
      if (form) {
        const nextInput = document.querySelector(
          'input[name="Full Name"]',
        ) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateUserFields(formValues, role);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Handle authentication based on role
    if (role === "STUDENT" || role === "TEACHER" || role === "STAFF") {
      formValues.rfidTag = formValues["RFID Tag"];
      formValues.Password = formValues["RFID Tag"];
      formValues.rfidAsPassword = false;
      formValues.maxBooks = role === "TEACHER" || role === "STAFF" ? 5 : 3;
    } else {
      formValues.maxBooks = 10;
      formValues.rfidTag = "0000000000";
      formValues.Password = formValues["Password"];
      formValues.rfidAsPassword = false;
    }
    onSubmit(formValues);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formFields.map((field) => {
          // Render select fields
          if (field.type === "select" && field.options) {
            return (
              <div
                key={field.label}
                className={field.label === "Role" ? "md:col-span-2" : ""}
              >
                <label className="text-sm font-medium text-foreground block mb-2">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <select
                  name={field.label}
                  value={formValues[field.label] || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground ${
                    errors[field.label] ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select {field.label.toLowerCase()}</option>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors[field.label] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors[field.label]}
                  </p>
                )}
              </div>
            );
          }

          // Render input fields
          return (
            <div key={field.label}>
              <label className="text-sm font-medium text-foreground block mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <Input
                type={field.type}
                name={field.label}
                placeholder={field.placeholder}
                value={formValues[field.label] || ""}
                onChange={handleChange}
                onKeyDown={
                  field.label === "RFID Tag" ? handleRFIDKeyDown : undefined
                }
                className={errors[field.label] ? "border-red-500" : ""}
                autoFocus={field.label === "RFID Tag" && role === "STUDENT"}
              />
              {errors[field.label] && (
                <p className="text-xs text-red-500 mt-1">
                  {errors[field.label]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-6"
      >
        {isLoading ? "Saving..." : submitButtonLabel}
      </Button>
    </form>
  );
}
