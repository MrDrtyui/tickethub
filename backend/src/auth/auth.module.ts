import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { InitDataGuard } from './init-data.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'beach',
      signOptions: { expiresIn: '375d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, InitDataGuard],
  exports: [JwtModule, AuthService, InitDataGuard],
})
export class AuthModule {}
