import { TicketStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class PutTicketAdminDto {
  @IsNotEmpty()
  @IsString()
  ticketId: string;

  @IsNotEmpty()
  @IsEnum(TicketStatus)
  status: string;

  response?: string;
}
