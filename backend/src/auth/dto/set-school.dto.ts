import { IsUUID } from 'class-validator';

export class SetSchoolDto {
  @IsUUID()
  schoolId: string;
}
