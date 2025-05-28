import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { TicketService } from 'src/ticket/ticket.service';
import { MinioService } from 'src/minio/minio.service';

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    PrismaService,
    AuthService,
    TicketService,
    MinioService,
  ],
})
export class AdminModule {}
