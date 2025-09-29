import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { DirectorGuard } from './admin.guard';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AdminGuard } from './admin.guardAdmin';
import { TicketService } from 'src/ticket/ticket.service';
import { AuthService } from 'src/auth/auth.service';
import { TicketStatus } from '@prisma/client';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly ticketService: TicketService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(DirectorGuard)
  @Post()
  async createAdmin(
    @Req() req: Request,
    @Body() createAdminDto: CreateAdminDto,
  ) {
    const schoolId = (req as any).user.schoolId;

    return await this.adminService.create(schoolId, createAdminDto.userIdKey);
  }

  @UseGuards(AdminGuard)
  @Get('tickets')
  async getAllTicketsAdmin(
    @Req() req: Request,
    @Param() status?: TicketStatus,
  ) {
    const schoolId = (req as any).user.schoolId;
    return await this.ticketService.getAllTicketsBySchoolIdAdmin(
      schoolId,
      status,
    );
  }

  @UseGuards(AdminGuard)
  @Get('admin')
  async getAllUsersAdmin(@Req() req: Request) {
    const schoolId = (req as any).user.schoolId;
    try {
      return this.adminService.getAdmins(schoolId);
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(DirectorGuard)
  @Delete()
  async deleteAdmin(@Req() req: Request, @Body() body: { userIdKey: string }) {
    try {
      const admin = await this.adminService.deleteAdmin(body.userIdKey);

      return admin;
    } catch (e) {
      throw e;
    }
  }
}
