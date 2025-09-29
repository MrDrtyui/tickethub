import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { OwnerGuard } from 'src/admin/admin.guardowner';
import { CreateSchoolDto } from './dto/create-school.dto';

@UseGuards(OwnerGuard)
@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Post('schools')
  createSchool(@Body() dto: CreateSchoolDto) {
    try {
      return this.ownerService.createSchool(dto);
    } catch (e) {
      throw e;
    }
  }
}
