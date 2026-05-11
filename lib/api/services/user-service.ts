import { prisma } from "@/lib/prisma";
import {
  validationError,
  conflictError,
  notFoundError,
} from "@/lib/api/error-handler";
import {
  validateEmail,
  validateUserType,
  validateRequiredFields,
} from "@/lib/api/validation";
import { Role, Status } from "@prisma/client";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";

export interface CreateUserInput {
  name: string;
  email: string;
  status?: string;
  rfidTag: string;
  role?: Role;
  grade?: string;
  password: string;
  maxBooks?: number;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  status?: string;
  rfidTag?: string;
  grade?: string;
  password?: string;
  maxBooks?: number;
}

export class UserService {
  static async createUser(data: CreateUserInput) {
    if (data.role === "STUDENT") {
      if (!data.rfidTag) {
        throw validationError("RFID tag is required for students");
      }
    }

    if (data.role === "TEACHER" || data.role === "ADMIN") {
      if (!data.password) {
        throw validationError("Password is required!");
      }
      data.password = await bcrypt.hash(data.password, 10);
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.rfidTag ? [{ rfidTag: data.rfidTag }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw conflictError("Email already exists");
      }
      if (data.rfidTag && existingUser.rfidTag === data.rfidTag) {
        throw conflictError("RFID tag already assigned");
      }
    }

    try {
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          rfidTag: data.rfidTag || "",
          role: data.role || "STUDENT",
          grade: data.grade,
          maxBooks: data.maxBooks,
          password: data.password ? await bcrypt.hash(data.password, 10) : "",
          status: (data.status || "ACTIVE") as Status,
        },
      });

      return user;
    } catch (error) {
      console.error("FULL ERROR:", error);
      throw error;
    }
  }
  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        transactions: {
          where: {
            status: {
              in: ["ACTIVE", "OVERDUE"],
            },
          },
          include: { book: true },
          take: 5,
          orderBy: { borrowDate: "desc" },
        },
      },
    });

    if (!user) {
      throw notFoundError("User");
    }

    return user;
  }
  static async getUserByRfid(rfidTag: string) {
    const user = await prisma.user.findUnique({
      where: { rfidTag },
    });

    if (!user) {
      throw notFoundError("User");
    }

    // Get detailed ACTIVE + OVERDUE transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        status: {
          in: ["ACTIVE", "OVERDUE"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        book: true,
      },
    });

    const totalQuantity = transactions.length;

    return {
      ...user,
      activeQuantity: totalQuantity,
      transactions,
    };
  }

  static async getUsers(
    page: number = 1,
    limit: number = 10,
    filters?: { type?: string; status?: string; search?: string },
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.type) {
      where.role = filters.type.toUpperCase();
    }

    if (filters?.status) {
      where.status = filters.status.toUpperCase();
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { email: { contains: filters.search } },
        { rfidTag: { contains: filters.search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
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
              book: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  static async updateUser(id: string, data: UpdateUserInput) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw notFoundError("User");
    }

    if (data.email && data.email !== user.email) {
      validateEmail(data.email);
      const existingEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingEmail) {
        throw conflictError("Email already exists");
      }
    }

    if (data.rfidTag && data.rfidTag !== user.rfidTag) {
      const existingRfid = await prisma.user.findUnique({
        where: { rfidTag: data.rfidTag },
      });
      if (existingRfid) {
        throw conflictError("RFID tag already assigned");
      }
    }

    return prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.rfidTag && { rfidTag: data.rfidTag }),
        ...(data.grade && { grade: data.grade }),
        ...(data.maxBooks && { maxBooks: data.maxBooks }),
        ...(data.status && { status: data.status as any }),
        ...(data.password && {
          password: data.password ? await bcrypt.hash(data.password, 10) : "",
        }),
      },
    });
  }

  static async deleteUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw notFoundError("User");
    }

    return prisma.user.delete({
      where: { id },
    });
  }

  static async updatePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { password: true },
    });

    if (!user) {
      throw notFoundError("User");
    }

    if (!user.password) {
      throw validationError("User has no password set");
    }

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isValidPassword) {
      throw validationError("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return prisma.user.update({
      where: { id },
      data: {
        ...(newPassword && {
          password: hashedPassword,
        }),
      },
    });
  }

  static async generate2FASecret(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw notFoundError("User");
    }

    const secret = speakeasy.generateSecret({
      name: `LibraryAdmin:${user.email}`,
      issuer: "LibraryAdmin",
    });

    // Construct otpauth URL manually without URL encoding
    const otpauthUrl = `otpauth://totp/LibraryAdmin:${user.email}?secret=${secret.base32}&issuer=LibraryAdmin`;

    return {
      secret: secret.base32,
      qrCodeUrl: otpauthUrl, // Now it's not URL-encoded
    };
  }

  static async verify2FASetup(userId: string, code: string, secret: string) {
    /* const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: code,
      window: 2,
    });
    console.log("Verification result:", verified);
    /* if (!verified) {
      throw validationError("Invalid verification code");
    } */

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFASecret: secret,
        twoFAEnabled: true,
      },
    });

    return { enabled: true };
  }

  static async disable2FA(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw notFoundError("User");
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFASecret: null,
        twoFAEnabled: false,
      },
    });

    return { enabled: false };
  }

  static async findByRfidTag(rfidTag: string) {
    const user = await prisma.user.findUnique({
      where: { rfidTag },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        grade: true,
        status: true,
        maxBooks: true,
        _count: {
          select: {
            transactions: {
              where: {
                status: "ACTIVE",
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw notFoundError("Student");
    }

    if (user.role !== "STUDENT") {
      throw validationError("Invalid card - not a student");
    }

    if (user.status === "SUSPENDED") {
      throw validationError("Account suspended - please contact librarian");
    } else if (user.status === "INACTIVE") {
      throw validationError("Account inactive - please contact librarian");
    } else if (user.status === "BANNED") {
      throw validationError("Account banned - please contact librarian");
    }

    return user;
  }
}
