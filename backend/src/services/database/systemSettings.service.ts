  import { prisma } from '../../prisma.js';
  import { DEFAULT_CONFIG } from '../../config/contracts.js';
  import { AppError } from '../../middlewares/errorHandler.js';
  import { validateAddress, validateFeeBps } from '../../utils/validation.js';

  export interface SystemSettingsInput {
    buyerFeeBps?: number;
    vendorFeeBps?: number;
    disputeFeeBps?: number;
    rewardRateBps?: number;
    rewardRatePer1E18?: string;
    arbiterAddress?: string;
    feeRecipientAddress?: string;
  }

  export class SystemSettingsService {
    private prisma = prisma;

    public async getSettings() {
      const existing = await this.prisma.system_settings.findUnique({
        where: { key: 'default' },
      });

      if (existing) {
        return existing;
      }

      return this.prisma.system_settings.create({
        data: {
          key: 'default',
          fee_bps: DEFAULT_CONFIG.feeBps,
          buyer_fee_bps: DEFAULT_CONFIG.buyerFeeBps,
          vendor_fee_bps: DEFAULT_CONFIG.vendorFeeBps,
          dispute_fee_bps: DEFAULT_CONFIG.disputeFeeBps,
          reward_rate_bps: DEFAULT_CONFIG.rewardRateBps,
          reward_rate_per_1_e_18: DEFAULT_CONFIG.rewardRatePer1E18,
          arbiter_address: DEFAULT_CONFIG.arbiter,
          fee_recipient_address: DEFAULT_CONFIG.feeRecipient,
        },
      });
    }

    public async updateSettings(payload: SystemSettingsInput) {
      const current = await this.getSettings();

      const buyerFeeBps = payload.buyerFeeBps ?? current.buyer_fee_bps;
      const vendorFeeBps = payload.vendorFeeBps ?? current.vendor_fee_bps;
      const feeBps = buyerFeeBps + vendorFeeBps;

      const disputeFeeBps = payload.disputeFeeBps ?? current.dispute_fee_bps;
      const rewardRateBps = payload.rewardRateBps ?? current.reward_rate_bps;
      const rewardRatePer1E18 = payload.rewardRatePer1E18 ?? current.reward_rate_per_1_e_18;
      const arbiterAddress = payload.arbiterAddress ?? current.arbiter_address;
      const feeRecipientAddress = payload.feeRecipientAddress ?? current.fee_recipient_address;

      if (!/^\d+$/.test(rewardRatePer1E18)) {
        throw new AppError('rewardRatePer1E18 must be a numeric string', 400, 'INVALID_REWARD_RATE');
      }

      validateAddress(arbiterAddress, 'arbiter');
      validateAddress(feeRecipientAddress, 'feeRecipient');
      validateFeeBps(buyerFeeBps, vendorFeeBps, feeBps);

      return this.prisma.system_settings.update({
        where: { key: 'default' },
        data: {
          fee_bps: feeBps,
          buyer_fee_bps: buyerFeeBps,
          vendor_fee_bps: vendorFeeBps,
          dispute_fee_bps: disputeFeeBps,
          reward_rate_bps: rewardRateBps,
          reward_rate_per_1_e_18: rewardRatePer1E18,
          arbiter_address: arbiterAddress,
          fee_recipient_address: feeRecipientAddress,
          updated_at: new Date(),
        },
      });
    }
  }

  export const systemSettingsService = new SystemSettingsService();
