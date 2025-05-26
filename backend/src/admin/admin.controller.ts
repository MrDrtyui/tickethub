import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { DirectorGuard } from './admin.guard';
import { CreateAdminDto } from './dto/create-admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(DirectorGuard)
  @Post()
  async createAdmin(
    @Req() req: Request,
    @Body() createAdminDto: CreateAdminDto,
  ) {
    const schoolId = (req as any).user.schoolId;

    return await this.adminService.create(schoolId, createAdminDto.userIdKey);
  }
}
