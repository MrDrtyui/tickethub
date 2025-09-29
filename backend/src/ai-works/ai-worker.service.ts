import { GoogleGenAI, Type } from '@google/genai';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AiPrioritet, AiStatus } from '@prisma/client';
import { TicketService } from 'src/ticket/ticket.service';

@Injectable()
export class AiWorkerService implements OnModuleInit {
  ai = new GoogleGenAI({
    apiKey: 'AIzaSyDXKMOS0lQMql4zwVU0nCOKWAjXnMflgls',
    vertexai: false,
  });

  constructor(private readonly ticketService: TicketService) {}

  async onModuleInit() {
    setInterval(() => {
      this.run();
    }, 5000);
  }

  private async run() {
    console.log(Date.now());

    const ticket = await this.ticketService.getTicketForAi();

    if (!ticket) {
      console.log('no tickets');
      return;
    }

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Классифицируй тикет для администрации школы: "${ticket.content}" а так же дай на него свой короткий комментарий и приоритет`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              enum: ['USEFUL', 'NOT_USEFUL', 'SPAM'],
            },
            priority: {
              type: Type.STRING,
              enum: ['low', 'medium', 'critical'],
            },
            comment: {
              type: Type.STRING,
            },
          },
          required: ['status', 'comment'],
        },
      },
    });

    const raw = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) {
      console.error('Пустой ответ от AI');
      return;
    }
    let parsed: { status: string; comment: string; priority: string };
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error('Ошибка парсинга JSON:', e, raw);
      return;
    }

    const { status, comment, priority } = parsed;

    const status_type = status as AiStatus;
    const priority_type = priority as AiPrioritet;

    console.log('AI статус:', status);
    console.log('AI комментарий:', comment);

    const updateTicket = await this.ticketService.putTicketAi(
      ticket.id,
      comment,
      status_type,
      priority_type,
    );

    return updateTicket;
  }
}
