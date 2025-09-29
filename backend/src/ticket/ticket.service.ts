import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTicketDto } from './dto/createTicket.dto';
import { AuthService } from 'src/auth/auth.service';
import { MinioService } from 'src/minio/minio.service';
import {
  AiPrioritet,
  AiStatus,
  TicketStatus,
  TicketType,
} from '@prisma/client';

@Injectable()
export class TicketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
    private readonly minio: MinioService,
  ) {}

  async createTicket(
    createTicketDto: CreateTicketDto,
    telegramId: string,
    image?: Express.Multer.File,
    isAnonymous = false,
  ) {
    try {
      let imageUrl: string | undefined;

      if (image) {
        imageUrl = await this.minio.uploadImage(image);
      }

      const userIdAndSchoolId = await this.auth.getUserByTelegramId(telegramId);

      const ticket = await this.prisma.ticket.create({
        data: {
          name: createTicketDto.name,
          content: createTicketDto.content,
          type: TicketType[createTicketDto.type as keyof typeof TicketType],
          userId: userIdAndSchoolId.id,
          schoolId: userIdAndSchoolId.schoolId,
          isAnonymous,
          imageUrl,
        },
      });

      if (!ticket) {
        throw new Error('Ticket not created');
      }

      return ticket;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getTicketForAi() {
    try {
      const ticket = await this.prisma.ticket.findFirst({
        where: {
          ai_response: null,
          status: TicketStatus.PENDING,
        },
      });

      return ticket;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async putTicketAi(
    ticketId: string,
    ai_response: string,
    ai_status: AiStatus,
    ai_prioritet: AiPrioritet,
  ) {
    try {
      const ticket = await this.prisma.ticket.update({
        where: {
          id: ticketId,
        },
        data: {
          ai_response,
          ai_status,
          ai_prioritet,
        },
      });

      return ticket;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e.message);
    }
  }

  async putTicketAdmin(ticketId: string, status: string, response?: string) {
    try {
      const ticket = await this.prisma.ticket.update({
        where: {
          id: ticketId,
        },
        data: {
          status: TicketStatus[status as keyof typeof TicketStatus],
          response: response,
        },
      });

      if (!ticket) {
        throw new NotFoundException('Ticket not found');
      }

      return ticket;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getMyTickets(telegramId: string, status?: TicketStatus) {
    try {
      const tickets = await this.prisma.ticket.findMany({
        where: {
          user: {
            telegramId: telegramId,
          },
          ...(status ? { status } : {}),
        },
        include: {
          user: {
            select: {
              fullName: true,
              fio: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return tickets;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getAllTicketsBySchoolIdAdmin(schoolId: string, status?: TicketStatus) {
    try {
      const tickets = await this.prisma.ticket.findMany({
        where: {
          schoolId: schoolId,
          ...(status ? { status } : {}),
        },
        include: {
          user: {
            select: {
              fullName: true,
              fio: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!tickets) {
        throw new NotFoundException('No tickets found for this school');
      }

      return tickets.map((ticket) => ({
        ...ticket,
        user: ticket.isAnonymous ? { fio: 'Аноним' } : ticket.user,
      }));
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getTicketById(id: string) {
    try {
      const ticket = await this.prisma.ticket.findUnique({
        where: {
          id: id,
        },
      });
      if (!ticket) {
        throw new NotFoundException('Ticket not found');
      }
      return ticket;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
