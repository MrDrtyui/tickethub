import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class InitDataGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const initData = req.headers['x-initdata'] as string;

    if (!initData) {
      throw new UnauthorizedException('Missing initData danil loh');
    }

    let validateUser;

    try {
      const { user } = await this.authService.validateInitData(initData);
      validateUser = user;
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException('Invalid init data');
    }

    (req as any).user = validateUser;

    return true;
  }
}
