import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { InitDataGuard } from './init-data.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, InitDataGuard],
})
export class AuthModule {}
