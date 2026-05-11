"use client";

import { Plus, BookOpen, RotateCw, UserPlus } from "lucide-react";

interface QuickAction {
  id: "add-user" | "add-book" | "issue-book" | "return-book";
  label: string;
  icon: typeof Plus;
  description: string;
}

interface QuickActionsProps {
  onActionClick: (action: QuickAction["id"]) => void;
}

const quickActions: QuickAction[] = [
  {
    id: "add-user",
    label: "Add User",
    icon: UserPlus,
    description: "Create new students or staff",
  },
  {
    id: "add-book",
    label: "Add Book",
    icon: Plus,
    description: "Add new books to inventory",
  },
  {
    id: "issue-book",
    label: "Issue Book",
    icon: BookOpen,
    description: "Check out books to students",
  },
  {
    id: "return-book",
    label: "Return Book",
    icon: RotateCw,
    description: "Process book returns",
  },
];

export default function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => onActionClick(action.id)}
            className="p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
          >
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {action.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
