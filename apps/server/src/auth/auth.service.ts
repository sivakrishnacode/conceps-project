import { Injectable, UnauthorizedException, BadRequestException, Scope } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private async generateOtp(userId: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);
    
    await this.prisma.otpLog.create({
      data: {
        userId,
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });

    console.log(`[MOCK SMS] OTP for user ${userId} is ${otp}`);
    return otp;
  }

  async register(dto: RegisterDto) {
    if (!dto.isAgeCertified) {
      throw new BadRequestException('You must certify your age.');
    }

    let user = await this.prisma.user.findUnique({
      where: { mobile: dto.mobile },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          mobile: dto.mobile,
          isAgeCertified: dto.isAgeCertified,
          wallet: {
            create: {
              depositBalance: 0,
              winningsBalance: 0,
            }
          }
        },
      });
    }

    await this.generateOtp(user.id);
    return { message: 'OTP sent successfully' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { mobile: dto.mobile },
    });

    if (!user) {
      throw new BadRequestException('User not found. Please register.');
    }

    await this.generateOtp(user.id);
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { mobile: dto.mobile },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    const otpLog = await this.prisma.otpLog.findFirst({
      where: {
        userId: user.id,
        isUsed: false,
        expiresAt: { gt: new Date() },
        attempts: { lt: 3 },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpLog) {
      throw new UnauthorizedException('OTP expired or invalid');
    }

    const isMatch = await bcrypt.compare(dto.otp, otpLog.otpHash);
    
    if (!isMatch) {
      await this.prisma.otpLog.update({
        where: { id: otpLog.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Incorrect OTP');
    }

    await this.prisma.otpLog.update({
      where: { id: otpLog.id },
      data: { isUsed: true },
    });

    const isNewUser = !user.isVerified;
    const scope = isNewUser ? 'new_user' : 'full';

    const accessToken = await this.generateAccessToken(user.id, user.mobile, scope);
    
    if (isNewUser) {
      return { accessToken, isNewUser, user, message: 'OTP verified. Please set your name.' };
    }

    const refreshToken = await this.generateRefreshToken(user.id);
    return { accessToken, refreshToken, isNewUser, user };
  }

  async saveName(userId: string, name: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name, isVerified: true },
    });

    const accessToken = await this.generateAccessToken(user.id, user.mobile, 'full');
    const refreshToken = await this.generateRefreshToken(user.id);

    return { accessToken, refreshToken, user };
  }

  async refreshTokens(dto: RefreshTokenDto) {
    const record = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: { user: true },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    try {
      this.jwtService.verify(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      });
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = await this.generateAccessToken(record.userId, record.user.mobile, 'full');
    const newRefreshToken = await this.generateRefreshToken(record.userId);

    await this.prisma.refreshToken.delete({ where: { id: record.id } });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
    return { message: 'Logged out successfully' };
  }

  private async generateAccessToken(userId: string, mobile: string, scope: string) {
    const payload = { sub: userId, mobile, scope };
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'secret',
      expiresIn: '15m',
    });
  }

  private async generateRefreshToken(userId: string) {
    const token = this.jwtService.sign({ sub: userId }, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      expiresIn: '7d',
    });

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return token;
  }
}
