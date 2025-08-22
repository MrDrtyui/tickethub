import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminService } from './admin.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly adminService: AdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const initData = req.headers['x-initdata'] as string;

    if (!initData) {
      throw new UnauthorizedException('Missing initData danil loh');
    }

    let validateUser;

    try {
      const { user } = await this.adminService.validateAdmin(initData);
      validateUser = user;
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException(e);
    }

    (req as any).user = validateUser;

    return true;
  }
}
