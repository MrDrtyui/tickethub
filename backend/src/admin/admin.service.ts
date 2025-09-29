import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
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
        include: { user: true },
      });

      if (!admin) {
        throw new Error('Admin not created');
      }
      return admin;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async validateDirectorByTelegrad(telegramId: string) {
    const user = await this.prisma.user.findFirst({
      where: { telegramId },
      include: { directedSchools: true, admin: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (user.directedSchools.length === 0) {
      throw new UnauthorizedException('You are not a director');
    }

    return { user };
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

  async getAdmins(schoolId: string) {
    try {
      const admins = this.prisma.admin.findMany({
        where: { schoolId: schoolId },
        include: {
          user: true,
          school: true,
        },
      });

      return admins;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async deleteAdmin(adminId: string) {
    try {
      const admin = await this.prisma.admin.delete({
        where: {
          userId: adminId,
        },
        include: { user: true },
      });
      return admin;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async findAndValidateAdminByTelegramId(telegramId: string) {
    const user = await this.prisma.user.findFirst({
      where: { telegramId },
      include: { directedSchools: true, admin: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isDirector = user.directedSchools.length > 0;
    const isAdmin = !!user.admin;

    if (!isDirector && !isAdmin) {
      throw new UnauthorizedException('You are not an admin');
    }

    return user;
  }

  async validateOwner(initData: string) {
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
      });

      if (!user || !user.owner) {
        throw new ForbiddenException('Start command /start in bot chat');
      }

      return { user };
    } catch (e) {
      throw new ForbiddenException(e.message);
    }
  }

  async findAndValidateOwnerByTelegramId(telegramId: string) {
    const user = await this.prisma.user.findFirst({
      where: { telegramId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.owner) {
      throw new ForbiddenException('User is not an owner');
    }

    return user;
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
