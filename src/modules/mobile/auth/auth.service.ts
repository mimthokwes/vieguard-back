import { prisma } from '../../../config/prisma';
import { comparePassword, hashPassword } from '../../../shared/utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../../shared/utils/jwt';
import { AppError } from '../../../middlewares/error-handler';
import { MailService } from '../../../shared/services/mail.service';
import crypto from 'crypto';

export class MobileAuthService {
  static async register(data: { name: string; email: string; password: string; phone?: string; role?: 'owner' | 'staff' }) {
    const existing = await prisma.admin.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError('Email admin sudah terdaftar.', 409);
    }

    const passwordHash = await hashPassword(data.password);
    const admin = await prisma.admin.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: data.role || 'staff',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    const payload = { id: admin.id.toString(), type: 'admin' as const, role: admin.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        accountType: 'admin',
        accountId: admin.id,
        tokenHash: crypto.createHash('sha256').update(refreshToken).digest('hex'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deviceName: 'Mobile Registration',
      },
    });

    return {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        profilePhoto: null,
      },
      accessToken,
      refreshToken,
    };
  }

  static async googleLogin(data: { idToken?: string; credential?: string; token?: string; email?: string; name?: string; picture?: string }) {
    const tokenToVerify = data.idToken || data.credential || data.token;
    let email = data.email;
    let name = data.name;

    if (tokenToVerify) {
      try {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenToVerify)}`);
        if (response.ok) {
          const payload = (await response.json()) as any;
          if (payload.email) email = payload.email;
          if (payload.name) name = payload.name;
        }
      } catch (_) {
        // Fallback to provided email if network call to Google tokeninfo fails
      }
    }

    if (!email) {
      throw new AppError('Kredensial atau email Google tidak valid.', 400);
    }

    let admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      const dummyPassword = crypto.randomBytes(16).toString('hex');
      const passwordHash = await hashPassword(dummyPassword);
      admin = await prisma.admin.create({
        data: {
          name: name || email.split('@')[0],
          email,
          passwordHash,
          role: 'staff',
        },
      });
    }

    const payload = { id: admin.id.toString(), type: 'admin' as const, role: admin.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        accountType: 'admin',
        accountId: admin.id,
        tokenHash: crypto.createHash('sha256').update(refreshToken).digest('hex'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deviceName: 'Mobile Google Login',
      },
    });

    return {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        profilePhoto: data.picture || null,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login(data: { email: string; password: string }, deviceName?: string) {
    const admin = await prisma.admin.findUnique({ where: { email: data.email } });
    if (!admin) {
      throw new AppError('Email atau password admin salah.', 401);
    }

    const isValid = await comparePassword(data.password, admin.passwordHash);
    if (!isValid) {
      throw new AppError('Email atau password admin salah.', 401);
    }

    const payload = { id: admin.id.toString(), type: 'admin' as const, role: admin.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        accountType: 'admin',
        accountId: admin.id,
        tokenHash: crypto.createHash('sha256').update(refreshToken).digest('hex'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deviceName: deviceName?.slice(0, 150),
      },
    });

    return {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        profilePhoto: null,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    if (payload.type !== 'admin') {
      throw new AppError('Invalid token type.', 403);
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        accountType: 'admin',
        accountId: BigInt(payload.id),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      throw new AppError('Refresh token tidak valid atau telah dicabut.', 401);
    }

    const admin = await prisma.admin.findUnique({
      where: { id: BigInt(payload.id) },
    });
    if (!admin) throw new AppError('Admin tidak ditemukan.', 401);

    const newAccessToken = generateAccessToken({
      id: admin.id.toString(),
      type: 'admin',
      role: admin.role,
    });

    return { accessToken: newAccessToken };
  }

  static async logout(refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  static async forgotPassword(email: string) {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return { message: 'Jika email terdaftar, kode OTP reset password telah dikirim.' };
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.passwordReset.create({
      data: {
        accountType: 'admin',
        accountId: admin.id,
        otpCode,
        expiresAt,
      },
    });

    try {
      await MailService.sendOtpEmail(admin.email, otpCode, admin.name);
    } catch (mailError) {
      console.error(`[MAIL ERROR] Failed to deliver admin OTP email to ${email}:`, mailError);
    }

    return { message: 'Kode OTP telah dikirim ke email admin.' };
  }

  static async resetPassword(data: { email: string; otpCode: string; newPassword: string }) {
    const admin = await prisma.admin.findUnique({ where: { email: data.email } });
    if (!admin) throw new AppError('Email admin tidak ditemukan.', 404);

    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        accountType: 'admin',
        accountId: admin.id,
        otpCode: data.otpCode,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!resetRecord) {
      throw new AppError('Kode OTP tidak valid atau telah kadaluwarsa.', 400);
    }

    const newHash = await hashPassword(data.newPassword);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: newHash },
    });

    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { isUsed: true },
    });

    return { message: 'Password admin berhasil diperbarui.' };
  }
}
