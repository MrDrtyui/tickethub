import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { MinioService } from 'src/minio/minio.service';
import { AdminGuard } from 'src/admin/admin.guardAdmin';
import { AdminService } from 'src/admin/admin.service';

@Module({
  controllers: [TicketController],
  providers: [
    TicketService,
    PrismaService,
    AuthService,
    MinioService,
    AdminGuard,
    AdminService,
  ],
})
export class TicketModule {}
