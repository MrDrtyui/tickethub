import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SchoolService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllSchools() {
    try {
      const shcools = await this.prisma.school.findMany({
        select: {
          id: true,
          name: true,
          street: true,
          fullNameDirector: true,
          institutionType: true,
        },
      });

      return shcools;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
