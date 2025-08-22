import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { InitDataGuard } from './init-data.guard';
import { Request } from 'express';
import { StartDto } from './dto/start.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('start')
  async login(@Body('') startDto: StartDto) {
    return this.authService.start(
      startDto.initData,
      startDto.schoolId,
      startDto.fio,
    );
  }

  @UseGuards(InitDataGuard)
  @Post('set-school')
  async setSchoolId(@Req() req: Request, @Body() schoolId: string) {
    const telegramId = (req as any).user.telegramId;
    return this.authService.setSchoolId(telegramId, schoolId);
  }

  @UseGuards(InitDataGuard)
  @Get('checkuser')
  async checkSchoolIdByUser(@Req() req: Request) {
    const telegramId = (req as any).user.telegramId;
    return this.authService.checkSchoolUser(telegramId);
  }
}
