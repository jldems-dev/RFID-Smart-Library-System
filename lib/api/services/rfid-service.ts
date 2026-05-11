import { prisma } from "@/lib/prisma";
import { validationError } from "@/lib/api/error-handler";

export interface CreateRfidInput {
  rfidTag: string;
  action: string;
  type: string;
  message: string;
}

export class RfidService {
  static async createRfid(data: CreateRfidInput) {
    if (!data.rfidTag) {
      throw validationError("RFID tag is required");
    }

    const trimmedTag = data.rfidTag.trim();

    let userId: string | null = null;
    let bookId: string | null = null;

    if (
      data.type == "STUDENT" ||
      data.type == "TEACHER" ||
      data.type == "STAFF"
    ) {
      const existingUser = await prisma.user.findUnique({
        where: { rfidTag: trimmedTag },
        select: {
          id: true,
        },
      });

      if (!existingUser) {
        throw validationError("User with this RFID tag not found");
      }

      userId = existingUser.id;
    } else {
      const existingBook = await prisma.book.findUnique({
        where: { rfidTag: trimmedTag },
        select: { id: true },
      });

      if (!existingBook) {
        throw validationError("Book with this RFID tag not found");
      }

      bookId = existingBook.id;
    }

    await prisma.rFIDLog.create({
      data: {
        rfidTag: trimmedTag,
        action: data.action,
        success: true,
        message: data.message,
        userId: userId,
        bookId: bookId,
      },
    });

    return {
      success: true,
      rfidTag: trimmedTag,
      message: "RFID tag processed successfully",
    };
  }
}
