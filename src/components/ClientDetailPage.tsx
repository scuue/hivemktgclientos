import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2, Users, FileText, RotateCw, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMonths, subMonths } from 'date-fns';
import type { Client, User, MonthlyContentPlan } from '../lib/database.types';
import { fetchClientTeam, fetchUsers, updateClientTeam, fetchMonthlyPlan, upsertMonthlyPlan, updateClient } from '../lib/api';
import { TeamAssignmentCard } from './TeamAssignmentCard';
import { ContentPlanCard } from './ContentPlanCard';
import { ContactInfoCard } from './ContactInfoCard';

interface ClientDetailPageProps {
  client: Client;
  onClose: () => void;
  onUpdate: (client: Client) => void;
}

export function ClientDetailPage({ client, onClose, onUpdate }: ClientDetailPageProps) {
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [team, setTeam] = useState<{
    manager?: User;
    editors: User[];
    scripting: User[];
  }>({ editors: [], scripting: [] });
  const [monthlyPlan, setMonthlyPlan] = useState<MonthlyContentPlan | null>(null);
  const [isRecurring, setIsRecurring] = useState(client.is_recurring);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadMonthlyPlan();
  }, [currentMonth, client.id]);

  async function loadData() {
    try {
      setLoading(true);
      const [fetchedUsers, fetchedTeam] = await Promise.all([
        fetchUsers(),
        fetchClientTeam(client.id),
      ]);
      setUsers(fetchedUsers);
      setTeam(fetchedTeam);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMonthlyPlan() {
    try {
      const plan = await fetchMonthlyPlan(client.id, currentMonth);
      setMonthlyPlan(plan);
    } catch (error) {
      console.error('Failed to load monthly plan:', error);
    }
  }

  async function handleSaveTeam(newTeam: {
    managerId?: string;
    editorIds: string[];
    scriptingIds: string[];
  }) {
    if (!newTeam.managerId) {
      setSaveMessage({ type: 'error', text: 'Manager is required' });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    try {
      setSaving(true);
      await updateClientTeam(client.id, newTeam);
      const updatedTeam = await fetchClientTeam(client.id);
      setTeam(updatedTeam);
      setSaveMessage({ type: 'success', text: 'Team updated successfully' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save team:', error);
      setSaveMessage({ type: 'error', text: 'Failed to save team' });
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePlan(posts: number, ads: number) {
    try {
      setSaving(true);
      const updatedPlan = await upsertMonthlyPlan(client.id, currentMonth, {
        posts_planned: posts,
        ads_planned: ads,
      });
      setMonthlyPlan(updatedPlan);
      setSaveMessage({ type: 'success', text: 'Content plan saved' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save plan:', error);
      setSaveMessage({ type: 'error', text: 'Failed to save content plan' });
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleRecurring(enabled: boolean) {
    try {
      setSaving(true);
      const updated = await updateClient(client.id, { is_recurring: enabled });
      setIsRecurring(enabled);
      onUpdate(updated);
      setSaveMessage({ type: 'success', text: `Recurring plan ${enabled ? 'enabled' : 'disabled'}` });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Failed to toggle recurring:', error);
      setSaveMessage({ type: 'error', text: 'Failed to update recurring setting' });
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  }

  function handlePreviousMonth() {
    const prevMonth = format(subMonths(new Date(currentMonth + '-01'), 1), 'yyyy-MM');
    setCurrentMonth(prevMonth);
  }

  function handleNextMonth() {
    const nextMonth = format(addMonths(new Date(currentMonth + '-01'), 1), 'yyyy-MM');
    setCurrentMonth(nextMonth);
  }

  const monthLabel = format(new Date(currentMonth + '-01'), 'MMMM yyyy');
  const hasManager = !!team.manager;

  return (
    <AnimatePresence>
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
          className="relative w-full max-w-5xl glass rounded-2xl shadow-2xl border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 z-10 glass-dark border-b border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-white">{client.client_name}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 glass-dark hover:glass text-white rounded-xl transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="px-6 py-2 glass-dark rounded-xl">
                  <span className="text-lg font-semibold text-hive-yellow">{monthLabel}</span>
                </div>
                <button
                  onClick={handleNextMonth}
                  className="p-2 glass-dark hover:glass text-white rounded-xl transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {saveMessage && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                    saveMessage.type === 'success'
                      ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                      : 'bg-red-500/10 border border-red-500/30 text-red-400'
                  }`}
                >
                  {saveMessage.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">{saveMessage.text}</span>
                </motion.div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-hive-yellow animate-spin" />
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {!hasManager && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-400">Manager Required</p>
                      <p className="text-xs text-yellow-300 mt-0.5">
                        This client needs a manager assigned. Please assign one below.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <TeamAssignmentCard
                users={users}
                team={team}
                onSave={handleSaveTeam}
                saving={saving}
              />

              <ContentPlanCard
                monthlyPlan={monthlyPlan}
                isRecurring={isRecurring}
                onSavePlan={handleSavePlan}
                onToggleRecurring={handleToggleRecurring}
                saving={saving}
              />

              <ContactInfoCard team={team} />
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
