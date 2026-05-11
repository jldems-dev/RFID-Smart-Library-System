import { prisma } from "@/lib/prisma";
import { notFoundError, validationError } from "@/lib/api/error-handler";
import { validateRequiredFields } from "@/lib/api/validation";
import { addDays } from "date-fns";
import { sendBorrowConfirmation, sendReturnConfirmation } from "@/lib/email";

export interface CreateTransactionInput {
  userId: string;
  bookId: string;
  title: string;
  notes?: string;
}

export interface UpdateTransactionInput {
  status?: string;
  renewalCount?: number;
  notes?: string;
}

export class TransactionService {
  static async borrowBook(data: CreateTransactionInput) {
    validateRequiredFields(data, ["userId", "bookId"]);

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) {
      throw notFoundError("User");
    }

    const dueDate = addDays(new Date(), 7);

    const transaction = await prisma.transaction.create({
      data: {
        userId: data.userId,
        bookId: data.bookId,
        type: "BORROW",
        status: "ACTIVE",
        dueDate,
        notes: data.notes,
      },
      include: { book: true, user: true },
    });

    // Update book status
    await prisma.book.update({
      where: { id: data.bookId },
      data: {
        status: "BORROWED",
        borrowCount: { increment: 1 },
      },
    });

    let emailStatus = "SENT";
    let errorMessage = null;

    // Send confirmation email
    if (user.emailNotifications) {
      try {
        await sendBorrowConfirmation(
          user.email,
          user.name,
          data.title,
          dueDate.toLocaleDateString(),
        );
      } catch (error) {
        console.error("Failed to send borrow confirmation:", error);
        emailStatus = "FAILED";
        errorMessage = "Failed to send borrow confirmation";
      }
    }

    // Create a notification log in the database
    await prisma.notificationLog.create({
      data: {
        userId: user.id,
        type: "DUE_REMINDER", // or "OVERDUE" depending on context
        message: `Borrow confirmation for "${data.title}" due on ${dueDate.toLocaleDateString()}`,
        emailStatus,
        errorMessage,
      },
    });

    return transaction;
  }

  static async returnBook(data: CreateTransactionInput) {
    validateRequiredFields(data, ["userId", "bookId"]);

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) {
      throw notFoundError("User");
    }

    const now = new Date();

    const transaction = await prisma.transaction.create({
      data: {
        userId: data.userId,
        bookId: data.bookId,
        type: "RETURN",
        status: "COMPLETED",
        dueDate: new Date(),
        returnedAt: new Date(),
        notes: data.notes,
      },
    });

    //update book quantity and status
    await prisma.book.update({
      where: { id: data.bookId },
      data: {
        status: "AVAILABLE",
      },
    });

    //update transaction
    await prisma.transaction.updateMany({
      where: {
        bookId: data.bookId,
        userId: data.userId,
        status: "ACTIVE",
      },
      data: {
        status: "COMPLETED",
      },
    });

    let emailStatus = "SENT";
    let errorMessage = null;

    // Send return confirmation email
    if (user.emailNotifications) {
      try {
        await sendReturnConfirmation(user.email, user.name, data.title);
      } catch (error) {
        console.error("Failed to send return confirmation:", error);
        emailStatus = "FAILED";
        errorMessage = "Failed to send borrow confirmation";
      }
    }

    // Create a notification log in the database
    await prisma.notificationLog.create({
      data: {
        userId: user.id,
        type: "RETURN_CONFIRMATION",
        message: `Return confirmation: "${data.title}" was successfully returned on ${now.toLocaleDateString()}.`,
        emailStatus,
        errorMessage,
      },
    });

    return transaction;
  }

  static async getTransactionById(id: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        book: { select: { id: true, title: true, author: true } },
      },
    });

    if (!transaction) {
      throw notFoundError("Transaction");
    }

    return transaction;
  }

  static async getTransactions(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: string;
      type?: string;
      search?: string;
    },
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.status) {
      where.status = filters.status.toUpperCase();
    }

    if (filters?.type) {
      where.type = filters.type.toUpperCase();
    }

    // Add search functionality
    if (filters?.search) {
      where.OR = [
        { user: { name: { contains: filters.search } } }, // <-- removed mode/insensitive
        { book: { title: { contains: filters.search } } }, // <-- removed mode/insensitive
        { userId: { contains: filters.search } },
        { bookId: { contains: filters.search } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          book: { select: { id: true, title: true, author: true, isbn: true } },
        },
        orderBy: { borrowDate: "desc" },
      }),
      prisma.transaction.count({ where }),
    ]);

    return { transactions, total };
  }

  static async getOverdueTransactions(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const where = {
      status: "ACTIVE",
      dueDate: { lt: new Date() },
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          book: { select: { id: true, title: true } },
        },
        orderBy: { dueDate: "asc" },
      }),
      prisma.transaction.count({ where }),
    ]);

    return { transactions, total };
  }

  static async deleteTransaction(id: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw notFoundError("Transaction");
    }

    // If transaction is active, restore book status before deleting
    if (transaction.status === "ACTIVE") {
      await prisma.book.update({
        where: { id: transaction.bookId },
        data: { status: "AVAILABLE" },
      });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return { success: true };
  }
}
