"use client";

import React from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BOOK_FORM_FIELDS, validateBookFields } from "@/lib/form-fields";

interface BookFormProps {
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  isLoading?: boolean;
  submitButtonLabel?: string;
}

export default function BookForm({
  initialData = {},
  onSubmit,
  isLoading = false,
  submitButtonLabel = "Save Book",
}: BookFormProps) {
  // Initialize form data
  const getInitialFormData = () => {
    const data: Record<string, any> = {};
    BOOK_FORM_FIELDS.forEach((field) => {
      data[field.label] = initialData[field.label] || "";
    });
    return data;
  };

  const [formValues, setFormValues] = React.useState(getInitialFormData());
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleRFIDKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      const nextInput = document.querySelector(
        'input[name="Title"]',
      ) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateBookFields(formValues);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formValues);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BOOK_FORM_FIELDS.map((field) => {
          // Use select for fields with options (Condition, Status, etc.)
          if (field.type === "select" && field.options) {
            return (
              <div key={field.label}>
                <label className="text-sm font-medium text-foreground block mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
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

          return (
            <div key={field.label}>
              <label className="text-sm font-medium text-foreground block mb-2">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
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
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isLoading ? "Saving..." : submitButtonLabel}
      </Button>
    </form>
  );
}
