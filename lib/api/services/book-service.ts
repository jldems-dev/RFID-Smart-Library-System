import { prisma } from "@/lib/prisma";
import { conflictError, notFoundError } from "@/lib/api/error-handler";
import { validateRequiredFields } from "@/lib/api/validation";

export interface CreateBookInput {
  title: string;
  author: string;
  isbn: string;
  rfidTag: string;
  publisher?: string;
  category: string;
  location: string;
  condition: string;
}

export interface UpdateBookInput {
  title?: string;
  author?: string;
  status?: string;
  condition?: string;
  rfidTag?: string;
  category?: string;
  location?: string;
}

export class BookService {
  static async createBook(data: CreateBookInput) {
    validateRequiredFields(data, [
      "title",
      "author",
      "isbn",
      "rfidTag",
      "category",
      "location",
    ]);

    const existingBook = await prisma.book.findUnique({
      where: { isbn: data.isbn },
    });

    if (existingBook) {
      throw conflictError("Book with this ISBN already exists");
    }

    const existingRfid = await prisma.book.findUnique({
      where: { rfidTag: data.rfidTag },
    });

    if (existingRfid) {
      throw conflictError("RFID tag already assigned");
    }

    const book = await prisma.book.create({
      data: {
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        rfidTag: data.rfidTag,
        publisher: data.publisher,
        category: data.category,
        location: data.location,
        condition: data.condition,
      },
    });

    return book;
  }

  static async getBookById(id: string) {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        transactions: {
          include: { user: true },
          take: 5,
          orderBy: { borrowDate: "desc" },
        },
      },
    });

    if (!book) {
      throw notFoundError("Book");
    }

    return book;
  }

  static async getBooks(
    page: number = 1,
    limit: number = 10,
    filters?: { status?: string; search?: string },
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.status) {
      where.status = filters.status.toUpperCase();
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { author: { contains: filters.search } },
        { isbn: { contains: filters.search } },
      ];
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          transactions: {
            where: {
              status: {
                in: ["ACTIVE", "OVERDUE"],
              },
            },
            include: {
              user: true,
            },
            take: 1,
          },
        },
      }),
      prisma.book.count({ where }),
    ]);

    return { books, total };
  }

  static async getAllBooks({
    startDate,
    endDate,
  }: { startDate?: Date; endDate?: Date } = {}) {
    // Filter for transactions
    const transactionDateFilter =
      startDate && endDate
        ? {
            createdAt: { gte: startDate, lte: endDate },
          }
        : {};

    const [books, total, available, borrowed, maintenance] = await Promise.all([
      prisma.book.findMany({
        include: {
          transactions: {
            where: {
              status: { in: ["ACTIVE", "OVERDUE"] },
              ...transactionDateFilter,
            },
            include: { user: true },
          },
        },
      }),

      prisma.book.count(),

      prisma.book.count({ where: { status: "AVAILABLE" } }),

      prisma.book.count({ where: { status: "BORROWED" } }),

      prisma.book.count({ where: { status: "MAINTENANCE" } }),
    ]);

    // CATEGORY STATS
    const categoriesRaw = await prisma.book.groupBy({
      by: ["category"],
      _count: true,
    });

    const categories = categoriesRaw.map((c) => ({
      name: c.category || "Others",
      count: c._count,
      percentage: Math.round((c._count / total) * 100),
    }));

    // CONDITION STATS
    const conditionRaw = await prisma.book.groupBy({
      by: ["condition"],
      _count: true,
    });

    const conditionColors: Record<string, string> = {
      Excellent: "bg-emerald-500",
      Good: "bg-blue-500",
      Fair: "bg-amber-500",
      Poor: "bg-red-500",
    };

    const conditionStats = conditionRaw.map((c) => ({
      condition: c.condition,
      count: c._count,
      color: conditionColors[c.condition] || "bg-gray-400",
    }));

    return {
      books,
      total,
      stats: {
        totalBooks: total,
        available,
        borrowed,
        maintenance,
        categories,
        conditionStats,
      },
    };
  }

  static async updateBook(id: string, data: UpdateBookInput) {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw notFoundError("Book");
    }

    if (data.rfidTag && data.rfidTag !== book.rfidTag) {
      const existingRfid = await prisma.book.findUnique({
        where: { rfidTag: data.rfidTag },
      });
      if (existingRfid && existingRfid.id !== id) {
        throw conflictError("RFID tag already assigned to another book");
      }
    }
    return prisma.book.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.author && { author: data.author }),
        ...(data.status && { status: data.status.toUpperCase() as any }),
        ...(data.condition && { condition: data.condition }),
        ...(data.rfidTag && { rfidTag: data.rfidTag }),
        ...(data.category && { category: data.category }),
        ...(data.location && { location: data.location }),
      },
    });
  }

  static async deleteBook(id: string) {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw notFoundError("Book");
    }

    return prisma.book.delete({
      where: { id },
    });
  }

  static async getBookByRfid(rfidTag: string) {
    const book = await prisma.book.findUnique({
      where: { rfidTag },
    });

    if (!book) {
      throw notFoundError("Book");
    }

    return book;
  }

  static async searchBooks(query: string) {
    const books = await prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { author: { contains: query, mode: "insensitive" } },
          { isbn: { contains: query } },
        ],
      },
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
        status: true,
        _count: {
          select: {
            transactions: { where: { status: "ACTIVE" } },
          },
        },
      },
      take: 20,
    });

    // Map to include available count based on status
    return books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      status: book.status,
      available: book.status,
    }));
  }
}
