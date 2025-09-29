import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';

@Injectable()
export class OwnerService {
  constructor(private readonly prisma: PrismaService) {}

  async createSchool(dto: CreateSchoolDto) {
    const director = await this.prisma.user.findUnique({
      where: { id: dto.directorId },
    });
    if (!director) throw new NotFoundException('Director user not found');

    return this.prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          name: dto.name,
          street: dto.street,
          fullNameDirector: dto.fullNameDirector,
          institutionType: dto.institutionType,
          directorId: dto.directorId,
        },
      });

      await tx.admin.create({
        data: {
          userId: dto.directorId,
          schoolId: school.id,
          isDirector: true,
        },
      });

      return school;
    });
  }
}
