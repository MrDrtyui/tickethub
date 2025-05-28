import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { validate } from '@telegram-apps/init-data-node';
import { UserIdByTgIdDto } from './dto/userIdByTgId.dto';

@Injectable()
export class AuthService {
  private readonly botToken = process.env.TELEGRAM_BOT_TOKEN!;

  constructor(private readonly prisma: PrismaService) {}

  async start(initData: string, schoolId?: string) {
    if (!initData || !schoolId) {
      throw new UnauthorizedException('Mising init data');
    }

    console.log(initData);

    try {
      validate(initData, this.botToken);
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException('Invalid init data');
    }

    try {
      const isSchool = await this.prisma.school.findFirst({
        where: {
          id: schoolId,
        },
      });

      if (!isSchool) {
        throw new UnauthorizedException('Invalid school id');
      }
    } catch (e) {
      console.log(e);
      throw new Error(e.message);
    }

    const data = this.parseInitData(initData);
    try {
      const userInfo = {
        telegramId: String(data.user.id),
        fullName:
          `${data.user.first_name ?? ''} ${data.user.last_name ?? ''}`.trim(),
        schoolId: schoolId,
      };

      console.log(`tgId: ${userInfo.telegramId}`);

      const user = await this.prisma.user.upsert({
        where: { telegramId: userInfo.telegramId },
        update: {},
        create: userInfo,
      });

      return { user };
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  async validateDirector(initData: string) {
    if (!initData) {
      throw new UnauthorizedException('Mising init data');
    }

    try {
      validate(initData, this.botToken);
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException('Invalid init data');
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
        include: { directedSchools: true },
      });

      if (!user) {
        throw new UnauthorizedException('Start command /start in bot chat');
      }

      const isDirector = user.directedSchools.length > 0;

      if (!isDirector) {
        throw new UnauthorizedException('You are not a director');
      }

      return { user };
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  async validateInitData(initData: string) {
    if (!initData) {
      throw new UnauthorizedException('Mising init data');
    }

    try {
      validate(initData, this.botToken);
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException('Invalid init data');
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

      if (!user) {
        throw new UnauthorizedException('Start command /start in bot chat');
      }

      return { user };
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  async checkSchoolUser(telegramId: string) {
    try {
      const isSchoolId = await this.prisma.user.findUnique({
        where: { telegramId: telegramId },
        select: { schoolId: true },
      });

      if (!isSchoolId) {
        return false;
      }

      return { isId: true, schoolId: isSchoolId.schoolId };
    } catch (e) {
      console.warn(e);
      return { isId: false, schoolId: null };
    }
  }

  async setSchoolId(telegramId: string, schoolId: string) {
    const userUpdate = await this.prisma.user.update({
      where: { telegramId: telegramId },
      data: { schoolId },
    });

    if (!userUpdate) {
      return false;
    }
    return true;
  }

  async getUserByTelegramId(telegramId: string) {
    try {
      const userId: UserIdByTgIdDto = await this.prisma.user.findUnique({
        where: { telegramId },
        select: {
          id: true,
          telegramId: true,
          schoolId: true,
        },
      });
      if (!userId) {
        throw new Error('User not found');
      }
      return userId;
    } catch (e) {
      console.warn(e);
      throw new Error('Not id by telegramId');
    }
  }

  async getUsersBySchoolIdAdmin(schoolId: string) {
    try {
      const users = await this.prisma.user.findMany({
        where: { schoolId: schoolId },
        select: {
          id: true,
          fullName: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!users) {
        throw new NotFoundException('No users found for this school');
      }

      return users;
    } catch (e) {
      throw new Error(e.message);
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
