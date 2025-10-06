import { Pencil, Trash2, CalendarDays, FileText, Repeat, Bell, ExternalLink, RotateCw, ArrowRight, Camera, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import type { Client } from '../lib/database.types';
import { isOverdue, isDueToday, formatDueStatus, getRecurringIntervalLabel, calculateNextRecurringDate, getShootStatusLabel, getShootStatusColor, needsShootWarning } from '../lib/utils';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onAdvanceDate?: (client: Client, nextDate: string) => void;
}

export function ClientCard({ client, onEdit, onDelete, onAdvanceDate }: ClientCardProps) {
  const overdue = isOverdue(client.due_date);
  const dueToday = isDueToday(client.due_date);
  const statusText = formatDueStatus(client.due_date);
  const shootWarning = needsShootWarning(client.shoot_status, client.content_due_date);
  const shootColors = getShootStatusColor(client.shoot_status);

  const handleAdvanceDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (client.recurring_enabled && client.recurring_interval && onAdvanceDate) {
      const nextDate = calculateNextRecurringDate(client.due_date, client.recurring_interval);
      onAdvanceDate(client, nextDate);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`glass rounded-2xl p-6 border transition-all ${
        dueToday
          ? 'border-hive-yellow shadow-hive-lg'
          : 'border-white/10 hover:border-hive-yellow/50 shadow-lg hover:shadow-hive'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-white">{client.client_name}</h3>
            {client.recurring_enabled && client.recurring_interval && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-hive-yellow/10 border border-hive-yellow/30 rounded-full">
                <RotateCw className="w-3 h-3 text-hive-yellow" />
                <span className="text-xs text-hive-yellow font-medium">
                  {getRecurringIntervalLabel(client.recurring_interval)}
                </span>
              </div>
            )}
          </div>
          {client.package && (
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-hive-yellow" />
              <span className="text-sm text-gray-400">{client.package}</span>
            </div>
          )}
          {client.monthly_reporting_canva_link && (
            <a
              href={client.monthly_reporting_canva_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-hive-yellow hover:text-yellow-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Monthly Report</span>
            </a>
          )}
        </div>
      </div>

      {shootWarning && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-400">Shoot Not Booked!</p>
              <p className="text-xs text-red-300 mt-0.5">
                Content is due soon. Please schedule a shoot.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3 mb-4">
        <div className="glass-dark rounded-xl p-3">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <CalendarDays className="w-4 h-4" />
            <span className="font-medium">Report Due</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold">{format(new Date(client.due_date), 'MMM dd, yyyy')}</span>
            {overdue ? (
              <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                {statusText}
              </span>
            ) : dueToday ? (
              <span className="text-xs px-2 py-1 bg-hive-yellow/20 text-hive-yellow rounded-full border border-hive-yellow/30 font-semibold">
                {statusText}
              </span>
            ) : (
              <span className="text-xs text-gray-400">{statusText}</span>
            )}
          </div>
        </div>

        {client.content_due_date && (
          <div className="glass-dark rounded-xl p-3">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <CalendarDays className="w-4 h-4 text-blue-400" />
              <span className="font-medium">Content Due</span>
            </div>
            <span className="text-white">{format(new Date(client.content_due_date), 'MMM dd, yyyy')}</span>
          </div>
        )}

        {client.contract_renewal_date && (
          <div className="glass-dark rounded-xl p-3">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <CalendarDays className="w-4 h-4 text-purple-400" />
              <span className="font-medium">Contract Renewal</span>
            </div>
            <span className="text-white">{format(new Date(client.contract_renewal_date), 'MMM dd, yyyy')}</span>
          </div>
        )}

        {client.posts_per_month && (
          <div className="flex items-center gap-2 text-sm">
            <Repeat className="w-4 h-4 text-hive-yellow" />
            <span className="text-gray-400">
              <span className="text-white font-semibold">{client.posts_per_month}</span> posts/month
            </span>
          </div>
        )}

        <div className="glass-dark rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <Camera className="w-4 h-4" />
              <span className="font-medium">Shoot Status</span>
            </div>
            <span className={`text-xs px-2 py-1 ${shootColors.bg} ${shootColors.text} rounded-full border ${shootColors.border} font-semibold`}>
              {getShootStatusLabel(client.shoot_status)}
            </span>
          </div>
          {client.shoot_date && (
            <div className="mt-2 text-sm text-white">
              {format(new Date(client.shoot_date), 'MMM dd, yyyy')}
            </div>
          )}
          {client.shoot_notes && (
            <p className="mt-2 text-xs text-gray-400 line-clamp-1">{client.shoot_notes}</p>
          )}
        </div>
      </div>

      {client.notes && (
        <div className="mb-4 p-3 glass-dark rounded-xl">
          <p className="text-sm text-gray-300 line-clamp-2">{client.notes}</p>
        </div>
      )}

      {client.reminders && (
        <div className="mb-4 p-3 glass-yellow rounded-xl">
          <div className="flex items-start gap-2">
            <Bell className="w-4 h-4 text-hive-yellow flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300 line-clamp-2">{client.reminders}</p>
          </div>
        </div>
      )}

      {client.recurring_enabled && client.recurring_interval && onAdvanceDate && (
        <button
          onClick={handleAdvanceDate}
          className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-2 glass-dark text-hive-yellow hover:bg-hive-yellow/10 rounded-xl transition-all text-sm font-medium border border-hive-yellow/20 hover:border-hive-yellow/40"
          title="Advance to next due date"
        >
          <span>Advance to Next Due Date</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-center gap-2 pt-4 border-t border-white/10">
        <button
          onClick={() => onEdit(client)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 glass-dark text-white rounded-xl hover:glass transition-all"
        >
          <Pencil className="w-4 h-4" />
          <span className="font-medium">Edit</span>
        </button>
        <button
          onClick={() => onDelete(client.id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          <span className="font-medium">Delete</span>
        </button>
      </div>
    </motion.div>
  );
}
