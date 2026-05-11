"use client";

import React from "react";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface SearchFilterBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onFilter?: (filter: string) => void;
  filters?: FilterOption[];
  activeFilters?: string[];
  onRemoveFilter?: (filterId: string) => void;
}

export default function SearchFilterBar({
  placeholder = "Search...",
  onSearch,
  onFilter,
  filters = [],
  activeFilters = [],
  onRemoveFilter,
}: SearchFilterBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterClick = (filterId: string) => {
    onFilter?.(filterId);
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-3 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 text-base"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="h-5 w-5" />
          {activeFilters.length > 0 && (
            <span className="absolute top-0 right-0 -mt-2 -mr-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
              {activeFilters.length}
            </span>
          )}
        </Button>
      </div>

      {/* Filter Options */}
      {showFilters && filters.length > 0 && (
        <div className="p-4 bg-secondary/50 rounded-lg border border-border">
          <p className="text-sm font-medium text-foreground mb-3">Filter by</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterClick(filter.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilters.includes(filter.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground hover:bg-secondary"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filter Tags */}
      {activeFilters.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {activeFilters.map((filterId) => {
            const filter = filters.find((f) => f.id === filterId);
            return (
              <div
                key={filterId}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm"
              >
                <span className="text-foreground">{filter?.label}</span>
                <button
                  onClick={() => onRemoveFilter?.(filterId)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
