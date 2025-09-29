import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserIdByTgIdDto } from './dto/userIdByTgId.dto';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly botToken = process.env.TELEGRAM_BOT_TOKEN!;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async start(
    initData: string,
    schoolId: string,
    fio: string,
    password: string,
    login: string,
  ) {
    if (!initData || !schoolId || !password) {
      throw new BadRequestException();
    }

    console.log(initData);

    try {
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

      console.log(schoolId);

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
        fio: fio,
        password: password,
        login: login,
      };

      console.log(`tgId: ${userInfo.telegramId}`);

      const passOk = await bcrypt.hash(password, 10);
      const user = await this.prisma.user.upsert({
        where: { telegramId: userInfo.telegramId },
        update: {},
        create: {
          telegramId: userInfo.telegramId,
          fullName: userInfo.fullName,
          fio: userInfo.fio,
          password: passOk,
          login: userInfo.login,
          school: schoolId ? { connect: { id: schoolId } } : undefined,
        },
      });

      return { user };
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  async login(login: string, password: string) {
    if (!login || !password) {
      throw new BadRequestException('Login and password required');
    }

    const user = await this.prisma.user.findUnique({
      where: { login },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = { sub: user.id, telegramId: user.telegramId };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user,
    };
  }

  async startaitu(
    schoolId: string,
    fio: string,
    password: string,
    login: string,
  ) {
    if (!schoolId || !password) {
      throw new BadRequestException();
    }

    try {
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

      console.log(schoolId);

      if (!isSchool) {
        throw new UnauthorizedException('Invalid school id');
      }
    } catch (e) {
      console.log(e);
      throw new Error(e.message);
    }

    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const userInfo = {
        telegramId: uuidv4(),
        fullName: 'aitu client',
        schoolId: schoolId,
        fio: fio,
        password: passwordHash,
        login: login,
      };

      console.log(`tgId: ${userInfo.telegramId}`);

      const user = await this.prisma.user.upsert({
        where: { telegramId: userInfo.telegramId },
        update: {},
        create: {
          telegramId: userInfo.telegramId,
          fullName: userInfo.fullName,
          fio: userInfo.fio,
          password: userInfo.password,
          login: userInfo.login,
          school: schoolId ? { connect: { id: schoolId } } : undefined,
        },
      });
      const payload = { sub: user.id, telegramId: user.telegramId };
      const access_token = this.jwtService.sign(payload);
      return { access_token, user };
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  async validateInitData(initData: string) {
    if (!initData) {
      throw new UnauthorizedException('Mising init data');
    }

    try {
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
      const user = await this.prisma.user.findUnique({
        where: { telegramId },
        include: {
          admin: true,
          directedSchools: true,
        },
      });

      if (!user) return null;

      let role: 'user' | 'admin' | 'director' | 'owner' = 'user';

      if (user.owner) {
        role = 'owner';
      } else if (
        (user.admin && user.admin.isDirector) ||
        user.directedSchools.length > 0
      ) {
        role = 'director';
      } else if (user.admin) {
        role = 'admin';
      } else {
        role = 'user';
      }

      return {
        ...user,
        role,
      };
    } catch (e) {
      console.warn(e);
      return { isId: false, schoolId: null };
    }
  }

  async generateJwt(user: User) {
    return this.jwtService.sign({
      sub: user.id,
      telegramId: user.telegramId,
    });
  }

  async getMySchool(telegramId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { telegramId },
        select: {
          school: true,
        },
      });
      return user;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
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
