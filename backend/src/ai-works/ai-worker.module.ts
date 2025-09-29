import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AiWorkerService } from './ai-worker.service';
import { TicketService } from 'src/ticket/ticket.service';
import { MinioService } from 'src/minio/minio.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [AiWorkerService, PrismaService, TicketService, MinioService],
})
export class AiWorkerModule {}
