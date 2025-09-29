import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const initData = req.headers['x-initdata'] as string | undefined;
    const authHeader = req.headers['authorization'];

    try {
      if (initData) {
        const { user } = await this.adminService.validateOwner(initData);
        if (!user.owner) {
          throw new ForbiddenException('User is not an owner');
        }
        (req as any).user = user;
        return true;
      }

      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const payload = await this.jwtService.verifyAsync(token);

        if (!payload.telegramId) {
          throw new UnauthorizedException('Token missing telegramId');
        }

        const user = await this.adminService.findAndValidateOwnerByTelegramId(
          payload.telegramId,
        );

        if (!user.owner) {
          throw new ForbiddenException('User is not an owner');
        }

        (req as any).user = user;
        return true;
      }

      throw new UnauthorizedException('Missing initData or JWT token');
    } catch (e) {
      if (
        e instanceof UnauthorizedException ||
        e instanceof ForbiddenException
      ) {
        throw e;
      }
      throw new UnauthorizedException(e.message || 'Invalid credentials');
    }
  }
}
