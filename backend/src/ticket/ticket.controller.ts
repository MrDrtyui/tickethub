import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { Request } from 'express';
import { CreateTicketDto } from './dto/createTicket.dto';
import { InitDataGuard } from 'src/auth/init-data.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from 'src/admin/admin.guardAdmin';
import { PutTicketAdminDto } from './dto/putTicketAdmin.dto';
import { TicketStatus } from '@prisma/client';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @UseGuards(InitDataGuard)
  @Post('')
  @UseInterceptors(FileInterceptor('image'))
  async createTicket(
    @Req() req: Request,
    @UploadedFile() image: Express.Multer.File,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    console.log(createTicketDto.name);
    const telegramId = (req as any).user.telegramId;
    const ticket = await this.ticketService.createTicket(
      createTicketDto,
      telegramId,
      image,
      createTicketDto.isAnonymous === 'true',
    );
    return ticket;
  }

  @UseGuards(InitDataGuard)
  @Get('my-tickets')
  async getMyTickets(@Req() req: Request, @Param() status?: TicketStatus) {
    const telegramId = (req as any).user.telegramId;
    const tickets = await this.ticketService.getMyTickets(telegramId, status);
    return tickets;
  }

  @UseGuards(InitDataGuard)
  @Get(':id')
  async getTicketById(@Param('id') id: string) {
    return await this.ticketService.getTicketById(id);
  }

  @UseGuards(AdminGuard)
  @Put()
  async putTicketAdmin(@Body() ticketDto: PutTicketAdminDto) {
    return await this.ticketService.putTicketAdmin(
      ticketDto.ticketId,
      ticketDto.status,
      ticketDto.response,
    );
  }
}
