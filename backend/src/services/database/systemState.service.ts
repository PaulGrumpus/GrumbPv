import { prisma } from '../../prisma.js';
import { Decimal } from '@prisma/client/runtime/client.js';

export class SystemStateService {
  private prisma = prisma;

  public async increaseFund(amount: Decimal) {
    const existing = await this.prisma.system_states.findUnique({
      where: { key: 'default' },
    });
    if (existing) {
        return this.prisma.system_states.update({
            where: { key: 'default' },
            data: {
              fund: { increment: amount },
            },
        });
    }

    return this.prisma.system_states.create({
      data: {
        key: 'default',
        fund: amount,
      },
    });
  }
  
  public async increaseWithdraw(amount: Decimal) {
    const existing = await this.prisma.system_states.findUnique({
      where: { key: 'default' },
    });
    if (existing) { 
        return this.prisma.system_states.update({
            where: { key: 'default' },
            data: {
              withdraw: { increment: amount },
            },
        });
    }
    return this.prisma.system_states.create({
      data: {
        key: 'default',
        withdraw: amount,
      },
    });
  }
}

export const systemStateService = new SystemStateService();