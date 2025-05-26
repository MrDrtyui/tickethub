import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { SchoolModule } from './school/school.module';
import { TicketModule } from './ticket/ticket.module';
import { MinioService } from './minio/minio.service';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [AuthModule, SchoolModule, TicketModule, AdminModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, MinioService],
})
export class AppModule {}
