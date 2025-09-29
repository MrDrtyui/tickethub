import { InstitutionType } from '@prisma/client';

export class CreateSchoolDto {
  name: string;
  street: string;
  fullNameDirector: string;
  institutionType: InstitutionType;
  directorId: string;
}
