import { useState, useEffect } from 'react';
import { X, CalendarDays, StickyNote, FileText, Repeat, Bell, Link as LinkIcon, RotateCw, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import type { Client, ClientInsert } from '../lib/database.types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: ClientInsert) => Promise<void>;
  editingClient?: Client | null;
}

export function ClientModal({ isOpen, onClose, onSave, editingClient }: ClientModalProps) {
  const [formData, setFormData] = useState<ClientInsert>({
    client_name: '',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
    contract_renewal_date: '',
    content_due_date: '',
    posts_per_month: null,
    package: '',
    monthly_reporting_canva_link: '',
    reminders: '',
    recurring_enabled: false,
    recurring_interval: null,
    shoot_date: '',
    shoot_status: 'not_booked',
    shoot_notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingClient) {
      setFormData({
        client_name: editingClient.client_name,
        due_date: editingClient.due_date,
        notes: editingClient.notes || '',
        contract_renewal_date: editingClient.contract_renewal_date || '',
        content_due_date: editingClient.content_due_date || '',
        posts_per_month: editingClient.posts_per_month,
        package: editingClient.package || '',
        monthly_reporting_canva_link: editingClient.monthly_reporting_canva_link || '',
        reminders: editingClient.reminders || '',
        recurring_enabled: editingClient.recurring_enabled || false,
        recurring_interval: editingClient.recurring_interval || null,
        shoot_date: editingClient.shoot_date || '',
        shoot_status: editingClient.shoot_status || 'not_booked',
        shoot_notes: editingClient.shoot_notes || '',
      });
    } else {
      setFormData({
        client_name: '',
        due_date: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
        contract_renewal_date: '',
        content_due_date: '',
        posts_per_month: null,
        package: '',
        monthly_reporting_canva_link: '',
        reminders: '',
        recurring_enabled: false,
        recurring_interval: null,
        shoot_date: '',
        shoot_status: 'not_booked',
        shoot_notes: '',
      });
    }
    setError('');
  }, [editingClient, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.client_name.trim()) {
      setError('Client name is required');
      return;
    }

    if (!formData.due_date) {
      setError('Due date is required');
      return;
    }

    if (formData.recurring_enabled && !formData.recurring_interval) {
      setError('Please select a recurring interval');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        notes: formData.notes?.trim() || null,
        contract_renewal_date: formData.contract_renewal_date?.trim() || null,
        content_due_date: formData.content_due_date?.trim() || null,
        package: formData.package?.trim() || null,
        monthly_reporting_canva_link: formData.monthly_reporting_canva_link?.trim() || null,
        reminders: formData.reminders?.trim() || null,
        recurring_enabled: formData.recurring_enabled,
        recurring_interval: formData.recurring_enabled ? formData.recurring_interval : null,
        shoot_date: formData.shoot_date?.trim() || null,
        shoot_status: formData.shoot_status,
        shoot_notes: formData.shoot_notes?.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save client');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl glass rounded-2xl shadow-2xl border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 glass-dark z-10">
              <h2 className="text-2xl font-bold text-white">
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Client Name <span className="text-hive-yellow">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="w-full px-4 py-2 glass text-white rounded-xl border border-white/10 focus:border-hive-yellow focus:outline-none focus:ring-2 focus:ring-hive-yellow/20 transition-all placeholder-gray-500"
                    placeholder="Enter client name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <CalendarDays className="w-4 h-4 inline mr-1" />
                    Contract Renewal Date
                  </label>
                  <input
                    type="date"
                    value={formData.contract_renewal_date || ''}
                    onChange={(e) => setFormData({ ...formData, contract_renewal_date: e.target.value })}
                    className="w-full px-4 py-2 glass text-white rounded-xl border border-white/10 focus:border-hive-yellow focus:outline-none focus:ring-2 focus:ring-hive-yellow/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <CalendarDays className="w-4 h-4 inline mr-1" />
                    Content Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.content_due_date || ''}
                    onChange={(e) => setFormData({ ...formData, content_due_date: e.target.value })}
                    className="w-full px-4 py-2 glass text-white rounded-xl border border-white/10 focus:border-hive-yellow focus:outline-none focus:ring-2 focus:ring-hive-yellow/20 transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <CalendarDays className="w-4 h-4 inline mr-1" />
                    Report Due Date <span className="text-hive-yellow">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-4 py-2 glass text-white rounded-xl border border-white/10 focus:border-hive-yellow focus:outline-none focus:ring-2 focus:ring-hive-yellow/20 transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 mb-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.recurring_enabled}
                        onChange={(e) => setFormData({ ...formData, recurring_enabled: e.target.checked, recurring_interval: e.target.checked ? formData.recurring_interval : null })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-hive-yellow/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hive-yellow"></div>
                    </label>
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <RotateCw className="w-4 h-4" />
                        Enable Recurring Due Dates
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Automatically advance the report due date based on a schedule</p>
                    </div>
                  </div>

                  {formData.recurring_enabled && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Recurring Interval <span className="text-hive-yellow">*</span>
                      </label>
                      <select
                        value={formData.recurring_interval || ''}
                        onChange={(e) => setFormData({ ...formData, recurring_interval: e.target.value as 'monthly' | 'quarterly' | 'semi-annually' || null })}
                        className="w-full px-4 py-2 glass text-white rounded-xl border border-white/10 focus:border-hive-yellow focus:outline-none focus:ring-2 focus:ring-hive-yellow/20 transition-all"
                      >
                        <option value="" className="bg-hive-darkGray">Select interval...</option>
                        <option value="monthly" className="bg-hive-darkGray">Monthly (Every 1 month)</option>
                        <option value="quarterly" className="bg-hive-darkGray">Quarterly (Every 3 months)</option>
                        <option value="semi-annually" className="bg-hive-darkGray">Semi-Annually (Every 6 months)</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Repeat className="w-4 h-4 inline mr-1" />
                    Posts Per Month
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.posts_per_month || ''}
                    onChange={(e) => setFormData({ ...formData, posts_per_month: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2 glass text-white rounded-xl border border-white/10 focus:border-hive-yellow focus:outline-none focus:ring-2 focus:ring-hive-yellow/20 transition-all placeholder-gray-500"
                    placeholder="e.g., 12"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Package
                  </label>
                  <input
                    type="text"
                    value={formData.package || ''}
                    onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                    className="w-full px-4 py-2 glass text-white rounded-xl border border-white/10 focus:border-hive-yellow focus:outline-none focus:ring-2 focus:ring-hive-yellow/20 transition-all placeholder-gray-500"
                    placeholder="e.g., Social Media, SEO, Full Service"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <LinkIcon className="w-4 h-4 inline mr-1" />
                    Monthly Reporting Canva Link
                  </label>
                  <input
                    type="url"
                    value={formData.monthly_reporting_canva_link || ''}
                    onChange={(e) => setFormData({ ...formData, monthly_reporting_canva_link: e.target.value })}
                    className="w-full px-4 py-2 glass text-white rounded-xl border border-white/10 focus:border-hive-yellow focus:outline-none focus:ring-2 focus:ring-hive-yellow/20 transition-all placeholder-gray-500"
                    placeholder="https://canva.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Camera className="w-4 h-4 inline mr-1" />
                    Shoot Date
                  </label>
                  <input
                    type="date"
                    value={formData.shoot_date || ''}
                    onChange={(e) => setFormData({ ...formData, shoot_date: e.target.value })}
                    className="w-full px-4 py-2 glass text-white rounded-xl border border-white/10 focus:border-hive-yellow focus:outline-none focus:ring-2 focus:ring-hive-yellow/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Camera className="w-4 h-4 inline mr-1" />
                    Shoot Status
                  </label>
                  <select
                    value={formData.shoot_status}
                    onChange={(e) => setFormData({ ...formData, shoot_status: e.target.value as 'not_booked' | 'booked' | 'completed' })}
                    className="w-full px-4 py-2 glass text-white rounded-xl border border-white/10 focus:border-hive-yellow focus:outline-none focus:ring-2 focus:ring-hive-yellow/20 transition-all"
                  >
                    <option value="not_booked" className="bg-hive-darkGray">Not Booked</option>
                    <option value="booked" className="bg-hive-darkGray">Booked</option>
                    <option value="completed" className="bg-hive-darkGray">Completed</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Camera className="w-4 h-4 inline mr-1" />
                    Shoot Notes
                  </label>
                  <textarea
                    value={formData.shoot_notes || ''}
                    onChange={(e) => setFormData({ ...formData, shoot_notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 glass text-white rounded-xl border border-white/10 focus:border-hive-yellow focus:outline-none focus:ring-2 focus:ring-hive-yellow/20 transition-all resize-none placeholder-gray-500"
                    placeholder="Location, time, special requirements..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <StickyNote className="w-4 h-4 inline mr-1" />
                    Notes
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 glass text-white rounded-xl border border-white/10 focus:border-hive-yellow focus:outline-none focus:ring-2 focus:ring-hive-yellow/20 transition-all resize-none placeholder-gray-500"
                    placeholder="Add any additional notes..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Bell className="w-4 h-4 inline mr-1" />
                    Reminders
                  </label>
                  <textarea
                    value={formData.reminders || ''}
                    onChange={(e) => setFormData({ ...formData, reminders: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 glass text-white rounded-xl border border-white/10 focus:border-hive-yellow focus:outline-none focus:ring-2 focus:ring-hive-yellow/20 transition-all resize-none placeholder-gray-500"
                    placeholder="Set reminders or important dates..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 glass-dark text-white rounded-xl font-medium hover:glass transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-hive-yellow text-hive-black rounded-xl font-bold hover:bg-yellow-400 transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSubmitting ? 'Saving...' : editingClient ? 'Update' : 'Add Client'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
