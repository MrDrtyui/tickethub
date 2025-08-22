import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(schoolId: string, userIdKey: string) {
    try {
      const admin = await this.prisma.admin.create({
        data: {
          schoolId: schoolId,
          userId: userIdKey,
        },
      });

      if (!admin) {
        throw new Error('Admin not created');
      }
      return admin;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async validateDirector(initData: string) {
    if (!initData) {
      throw new UnauthorizedException('Mising init data');
    }

    const data = this.parseInitData(initData);
    try {
      const userInfo = {
        telegramId: String(data.user.id),
        fullName:
          `${data.user.first_name ?? ''} ${data.user.last_name ?? ''}`.trim(),
      };

      console.log(`tgId: ${userInfo.telegramId}`);

      const user = await this.prisma.user.findFirst({
        where: { telegramId: userInfo.telegramId },
        include: { directedSchools: true, admin: true },
      });

      if (!user) {
        throw new UnauthorizedException('Start command /start in bot chat');
      }

      const isDirector = user.directedSchools.length > 0;

      if (!isDirector) {
        throw new UnauthorizedException('You are not a admin');
      }

      return { user };
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  async validateAdmin(initData: string) {
    if (!initData) {
      throw new UnauthorizedException('Mising init data');
    }

    const data = this.parseInitData(initData);
    try {
      const userInfo = {
        telegramId: String(data.user.id),
        fullName:
          `${data.user.first_name ?? ''} ${data.user.last_name ?? ''}`.trim(),
      };

      console.log(`tgId: ${userInfo.telegramId}`);

      const user = await this.prisma.user.findFirst({
        where: { telegramId: userInfo.telegramId },
        include: { directedSchools: true, admin: true },
      });

      if (!user) {
        throw new UnauthorizedException('Start command /start in bot chat');
      }

      const isDirector = user.directedSchools.length > 0;

      const isAdmin = !!user.admin;

      if (!isDirector && !isAdmin) {
        throw new UnauthorizedException('You are not a admin');
      }

      return { user };
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  parseInitData(initData: string) {
    const params = new URLSearchParams(initData);
    const result: Record<string, any> = {};

    for (const [key, value] of params.entries()) {
      if (key === 'user') {
        try {
          result[key] = JSON.parse(decodeURIComponent(value));
        } catch {
          result[key] = null;
        }
      } else {
        result[key] = value;
      }
    }

    return result;
  }
}
