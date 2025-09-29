import { Module } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AdminService } from 'src/admin/admin.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [OwnerController],
  providers: [OwnerService, PrismaService, AdminService],
})
export class OwnerModule {}
