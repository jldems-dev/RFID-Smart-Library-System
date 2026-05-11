import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";

//insights
export interface DashboardMetrics {
  todaysCheckouts: number;
  todaysReturns: number;
  overdueBooks: number;
  activeAlerts: number;
  circulationRate: number;
  totalBooks: number;
  activeLoans: number;
}

export interface AlertItem {
  id: string;
  type: string;
  message: string;
  severity: "warning" | "info" | "error";
  createdAt: Date;
}

export class DashboardService {
  /**
   * Get today's checkouts count
   */
  static async getTodaysCheckouts(): Promise<number> {
    const today = startOfDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.transaction.count({
      where: {
        type: "BORROW",
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
  }

  /**
   * Get today's returns count
   */
  static async getTodaysReturns(): Promise<number> {
    const today = startOfDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.transaction.count({
      where: {
        type: "RETURN",
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
  }

  /**
   * Get overdue books count
   */
  static async getOverdueBooks(): Promise<number> {
    return prisma.transaction.count({
      where: {
        status: "OVERDUE",
        dueDate: {
          lt: new Date(),
        },
      },
    });
  }

  /**
   * Get active loans count
   */
  static async getActiveLoans(): Promise<number> {
    return prisma.transaction.count({
      where: {
        status: "ACTIVE",
      },
    });
  }

  /**
   * Get active (unread) alerts count
   */
  static async getActiveAlerts(): Promise<number> {
    // Count failed notifications as active alerts
    const failedAlerts = await prisma.notificationLog.count({
      where: {
        emailStatus: "FAILED",
        sentAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    return failedAlerts;
  }

  /**
   * Get recent alerts for display
   */
  static async getRecentAlerts(limit: number = 5): Promise<AlertItem[]> {
    const alerts = await prisma.notificationLog.findMany({
      where: {
        OR: [
          { emailStatus: "FAILED" },
          {
            emailStatus: "SENT",
            sentAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        ],
      },
      orderBy: {
        sentAt: "desc",
      },
      take: limit,
      select: {
        id: true,
        message: true,
        type: true,
        emailStatus: true,
        errorMessage: true,
        sentAt: true,
      },
    });

    return alerts.map((alert) => ({
      id: alert.id,
      type: alert.type.toLowerCase(),
      message: alert.errorMessage
        ? `${alert.message} (Error: ${alert.errorMessage})`
        : alert.message,
      severity:
        alert.emailStatus === "FAILED"
          ? "error"
          : alert.type.includes("OVERDUE")
            ? "warning"
            : "info",
      createdAt: alert.sentAt,
    }));
  }

  /**
   * Calculate monthly circulation rate
   */
  static async getCirculationRate(): Promise<{
    rate: number;
    totalBooks: number;
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [monthlyBorrowed, totalBooks] = await Promise.all([
      prisma.transaction.count({
        where: {
          type: "BORROW",
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),
      prisma.book.count(),
    ]);

    const rate =
      totalBooks > 0 ? Math.round((monthlyBorrowed / totalBooks) * 100) : 0;

    return { rate, totalBooks };
  }

  /**
   * Get all dashboard metrics in one call
   */
  static async getAllMetrics(): Promise<DashboardMetrics> {
    const [
      todaysCheckouts,
      todaysReturns,
      overdueBooks,
      activeAlerts,
      { rate, totalBooks },
      activeLoans,
    ] = await Promise.all([
      this.getTodaysCheckouts(),
      this.getTodaysReturns(),
      this.getOverdueBooks(),
      this.getActiveAlerts(),
      this.getCirculationRate(),
      this.getActiveLoans(),
    ]);

    return {
      todaysCheckouts,
      todaysReturns,
      overdueBooks,
      activeAlerts,
      circulationRate: rate,
      totalBooks,
      activeLoans,
    };
  }
}

//library statistics
export interface LibraryStatsData {
  totalBooks: number;
  availableBooks: number;
  totalUsers: number;
  activeCheckouts: number;
  overdueItems: number;
  returnsToday: number;
}

export class LibraryStatsService {
  /**
   * Get total books count
   */
  static async getTotalBooks(): Promise<number> {
    return prisma.book.count();
  }

  /**
   * Get available books (sum of available field)
   */
  static async getAvailableBooks(): Promise<number> {
    // Get total quantity of all books
    const totalQuantity = await prisma.book
      .aggregate({
        _sum: { quantity: true },
      })
      .then((r) => r._sum.quantity || 0);

    const borrowed = await prisma.transaction.count({
      where: { type: "BORROW" },
    });

    // Available = total copies - currently borrowed
    return Math.max(0, totalQuantity - borrowed);
  }

  /**
   * Get active users count
   */
  static async getTotalUsers(): Promise<number> {
    return prisma.user.count({
      where: { status: "ACTIVE" },
    });
  }

  /**
   * Get active checkouts (borrowed transactions)
   */
  static async getActiveCheckouts(): Promise<number> {
    return prisma.transaction.count({
      where: { type: "BORROW" },
    });
  }

  /**
   * Get overdue items count
   */
  static async getOverdueItems(): Promise<number> {
    return prisma.transaction.count({
      where: {
        status: "OVERDUE",
        dueDate: { lt: new Date() },
      },
    });
  }

  /**
   * Get today's returns count
   */
  static async getReturnsToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.transaction.count({
      where: {
        type: "RETURN",
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
  }

  /**
   * Get all library statistics in one call
   */
  static async getAllStats(): Promise<LibraryStatsData> {
    const [
      totalBooks,
      availableBooks,
      totalUsers,
      activeCheckouts,
      overdueItems,
      returnsToday,
    ] = await Promise.all([
      this.getTotalBooks(),
      this.getAvailableBooks(),
      this.getTotalUsers(),
      this.getActiveCheckouts(),
      this.getOverdueItems(),
      this.getReturnsToday(),
    ]);

    return {
      totalBooks,
      availableBooks,
      totalUsers,
      activeCheckouts,
      overdueItems,
      returnsToday,
    };
  }
}

//recent activity
export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  book: string;
  time: string;
  timestamp: Date;
}

export class RecentActivityService {
  /**
   * Format transaction type to readable action
   */
  private static formatActionType(type: string): string {
    const actionMap: Record<string, string> = {
      BORROW: "Checked out",
      RETURN: "Returned",
      RESERVE: "Reserved",
    };
    return actionMap[type] || type;
  }

  /**
   * Format timestamp to relative time
   */
  private static formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffSecs < 60) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  /**
   * Get recent activity from transactions
   */
  static async getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
    const activities = await prisma.transaction.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
    });

    return activities.map((transaction) => ({
      id: transaction.id,
      user: transaction.user?.name || "Unknown User",
      action: this.formatActionType(transaction.type),
      book: `"${transaction.book?.title || "Unknown Book"}"`,
      time: this.formatTimeAgo(transaction.createdAt),
      timestamp: transaction.createdAt,
    }));
  }

  /**
   * Get activity for specific user
   */
  static async getUserActivity(
    userId: string,
    limit: number = 10,
  ): Promise<ActivityItem[]> {
    const activities = await prisma.transaction.findMany({
      where: { userId },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
    });

    return activities.map((transaction) => ({
      id: transaction.id,
      user: "You",
      action: this.formatActionType(transaction.type),
      book: `"${transaction.book?.title || "Unknown Book"}"`,
      time: this.formatTimeAgo(transaction.createdAt),
      timestamp: transaction.createdAt,
    }));
  }

  /**
   * Get activity for specific book
   */
  static async getBookActivity(
    bookId: string,
    limit: number = 10,
  ): Promise<ActivityItem[]> {
    const activities = await prisma.transaction.findMany({
      where: { bookId },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return activities.map((transaction) => ({
      id: transaction.id,
      user: transaction.user?.name || "Unknown User",
      action: this.formatActionType(transaction.type),
      book: "This book",
      time: this.formatTimeAgo(transaction.createdAt),
      timestamp: transaction.createdAt,
    }));
  }
}
