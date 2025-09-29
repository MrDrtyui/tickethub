import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class InitDataGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const initData = req.headers['x-initdata'] as string | undefined;
    const authHeader = req.headers['authorization'];

    if (initData) {
      try {
        const { user } = await this.authService.validateInitData(initData);
        (req as any).user = user;
        return true;
      } catch (e) {
        throw new UnauthorizedException(e);
      }
    }

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = await this.jwtService.verifyAsync(token);
        console.log(payload);
        (req as any).user = payload;
        return true;
      } catch {
        throw new UnauthorizedException('Invalid or expired token');
      }
    }

    throw new UnauthorizedException('Missing initData or JWT token');
  }
}
