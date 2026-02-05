'use client';

import { useEffect, useState } from 'react';
import SmallLoading from '@/components/smallLoading';
import { getAdminSystemSettings, updateAdminSystemSettings } from '@/utils/adminFunctions';
import { AdminSystemSettings } from '@/types/admin';

type SettingsFormState = {
  buyer_fee_bps: string;
  vendor_fee_bps: string;
  dispute_fee_bps: string;
  reward_rate_bps: string;
  reward_rate_per_1_e_18: string;
  arbiter_address: string;
  fee_recipient_address: string;
};

const AdminSettingsParamSection = () => {
  const [settings, setSettings] = useState<AdminSystemSettings | null>(null);
  const [form, setForm] = useState<SettingsFormState>({
    buyer_fee_bps: '',
    vendor_fee_bps: '',
    dispute_fee_bps: '',
    reward_rate_bps: '',
    reward_rate_per_1_e_18: '',
    arbiter_address: '',
    fee_recipient_address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const result = await getAdminSystemSettings();
      if (result.success && result.data) {
        setSettings(result.data);
        setForm({
          buyer_fee_bps: String(result.data.buyer_fee_bps ?? ''),
          vendor_fee_bps: String(result.data.vendor_fee_bps ?? ''),
          dispute_fee_bps: String(result.data.dispute_fee_bps ?? ''),
          reward_rate_bps: String(result.data.reward_rate_bps ?? ''),
          reward_rate_per_1_e_18: result.data.reward_rate_per_1_e_18 ?? '',
          arbiter_address: result.data.arbiter_address ?? '',
          fee_recipient_address: result.data.fee_recipient_address ?? '',
        });
      } else {
        setError(result.error || 'Failed to load settings');
      }
      setLoading(false);
    };

    loadSettings();
  }, []);

  const handleChange = (key: keyof SettingsFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const totalFeeBps =
    (Number(form.buyer_fee_bps) || 0) + (Number(form.vendor_fee_bps) || 0);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    const payload = {
      buyer_fee_bps: Number(form.buyer_fee_bps),
      vendor_fee_bps: Number(form.vendor_fee_bps),
      dispute_fee_bps: Number(form.dispute_fee_bps),
      reward_rate_bps: Number(form.reward_rate_bps),
      reward_rate_per_1_e_18: form.reward_rate_per_1_e_18.trim(),
      arbiter_address: form.arbiter_address.trim(),
      fee_recipient_address: form.fee_recipient_address.trim(),
    };

    const result = await updateAdminSystemSettings(payload);
    if (result.success && result.data) {
      setSettings(result.data);
      setForm({
        buyer_fee_bps: String(result.data.buyer_fee_bps ?? ''),
        vendor_fee_bps: String(result.data.vendor_fee_bps ?? ''),
        dispute_fee_bps: String(result.data.dispute_fee_bps ?? ''),
        reward_rate_bps: String(result.data.reward_rate_bps ?? ''),
        reward_rate_per_1_e_18: result.data.reward_rate_per_1_e_18 ?? '',
        arbiter_address: result.data.arbiter_address ?? '',
        fee_recipient_address: result.data.fee_recipient_address ?? '',
      });
      setMessage('Settings updated successfully.');
    } else {
      setError(result.error || 'Failed to update settings');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <SmallLoading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-large font-bold text-black mb-2">Setting Params</h2>
        <p className="text-small text-gray-500">
          Update system fees and reward configuration used for escrow creation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-normal font-bold text-black">Fees</h3>
          <p className="text-small text-gray-500">Bps is the basis points of the fee. 100 bps is 1%.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-small text-gray-600">Buyer fee (bps)</span>
              <input
                type="number"
                min="0"
                value={form.buyer_fee_bps}
                onChange={(e) => handleChange('buyer_fee_bps', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7E3FF2]/20 focus:border-[#7E3FF2] text-black"
              />
            </label>

            <label className="space-y-2">
              <span className="text-small text-gray-600">Vendor fee (bps)</span>
              <input
                type="number"
                min="0"
                value={form.vendor_fee_bps}
                onChange={(e) => handleChange('vendor_fee_bps', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7E3FF2]/20 focus:border-[#7E3FF2] text-black"
              />
            </label>

            <label className="space-y-2">
              <span className="text-small text-gray-600">Total fee (bps)</span>
              <input
                type="number"
                value={totalFeeBps}
                readOnly
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
              />
            </label>

            <label className="space-y-2">
              <span className="text-small text-gray-600">Dispute fee (bps)</span>
              <input
                type="number"
                min="0"
                value={form.dispute_fee_bps}
                onChange={(e) => handleChange('dispute_fee_bps', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7E3FF2]/20 focus:border-[#7E3FF2] text-black"
              />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-normal font-bold text-black">Rewards</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-small text-gray-600">Reward rate (bps)</span>
              <input
                type="number"
                min="0"
                value={form.reward_rate_bps}
                onChange={(e) => handleChange('reward_rate_bps', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7E3FF2]/20 focus:border-[#7E3FF2] text-black"
              />
            </label>

            <label className="space-y-2">
              <span className="text-small text-gray-600">Reward token / BNB rate (per 1e18)</span>
              <input
                type="text"
                value={form.reward_rate_per_1_e_18}
                onChange={(e) => handleChange('reward_rate_per_1_e_18', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#7E3FF2]/20 focus:border-[#7E3FF2] text-black"
              />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-normal font-bold text-black">Addresses</h3>

          <div className="grid grid-cols-1 gap-4">
            <label className="space-y-2">
              <span className="text-small text-gray-600">Arbiter address</span>
              <input
                type="text"
                value={form.arbiter_address}
                onChange={(e) => handleChange('arbiter_address', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#7E3FF2]/20 focus:border-[#7E3FF2] text-black"
              />
            </label>

            <label className="space-y-2">
              <span className="text-small text-gray-600">Fee recipient address</span>
              <input
                type="text"
                value={form.fee_recipient_address}
                onChange={(e) => handleChange('fee_recipient_address', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#7E3FF2]/20 focus:border-[#7E3FF2] text-black"
              />
            </label>
          </div>
        </div>

        {(message || error) && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            {message && <p className="text-small text-green-600">{message}</p>}
            {error && <p className="text-small text-red-600">{error}</p>}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          {settings && (
            <p className="text-tiny text-gray-400">
              Last updated: {new Date(settings.updated_at).toLocaleString()}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-linear-to-r from-[#2F3DF6] to-[#7E3FF2] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsParamSection;
