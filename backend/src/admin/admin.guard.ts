import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class DirectorGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const initData = req.headers['x-initdata'] as string;

    if (!initData) {
      throw new UnauthorizedException('Missing initData danil loh');
    }

    let validateUser;

    try {
      const { user } = await this.authService.validateDirector(initData);
      validateUser = user;
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException('Invalid init data dada');
    }

    (req as any).user = validateUser;

    return true;
  }
}
