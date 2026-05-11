import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import { unauthorizedError, validationError } from "@/lib/api/error-handler";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface LoginInput {
  email: string;
  password: string;
}

export interface Verify2FAInput {
  tempToken: string;
  code: string;
}

const allowedRoles = ["STUDENT", "TEACHER", "STAFF"] as const;

export class AuthService {
  static async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw unauthorizedError("Invalid email or password");
    }

    const restrictedRoles = ["STUDENT", "TEACHER", "STAFF"] as const;

    if (restrictedRoles.includes(user.role)) {
      throw validationError("You cannot access admin area.");
    }

    if (user.status !== "ACTIVE") {
      throw validationError(`Account is ${user.status.toLowerCase()}`);
    }

    if (!user.password) {
      throw unauthorizedError("Password is required");
    }

    const isValid = await bcrypt.compare(data.password.trim(), user.password);

    if (!isValid) {
      throw unauthorizedError("Invalid email or password");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        rfidTag: user.rfidTag,
        email: user.email,
        role: user.role,
        step: true,
      },
      JWT_SECRET,
      { expiresIn: "8h" },
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        requires2FA: user.twoFAEnabled,
        tempToken: user.twoFASecret,
        joinDate: user.createdAt.toISOString(),
      },
    };
  }
  static async verify2FA(data: Verify2FAInput) {
    const { tempToken, code } = data;

    let decoded: any;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET);
    } catch (error) {
      throw { status: 401, message: "Invalid or expired session" };
    }

    if (!decoded.step && decoded.exp - decoded.iat > 300) {
      throw { status: 401, message: "Invalid session type" };
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.twoFAEnabled || !user.twoFASecret) {
      throw validationError("2FA not enabled");
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token: code,
      window: 2,
    });

    if (!verified) {
      throw validationError("Invalid verification code");
    }

    // Generate final token after 2FA verification
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "8h" },
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        joinDate: user.createdAt.toISOString(),
      },
    };
  }
}
