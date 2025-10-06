import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCw, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import type { Client } from '../lib/database.types';

interface CalendarViewProps {
  clients: Client[];
  onClientClick: (client: Client) => void;
}

export function CalendarView({ clients, onClientClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getClientsForDate = (date: Date) => {
    return clients.filter(client => {
      const dueDate = isSameDay(new Date(client.due_date), date);
      const contentDue = client.content_due_date && isSameDay(new Date(client.content_due_date), date);
      const contractRenewal = client.contract_renewal_date && isSameDay(new Date(client.contract_renewal_date), date);
      const shootDate = client.shoot_date && isSameDay(new Date(client.shoot_date), date);
      return dueDate || contentDue || contractRenewal || shootDate;
    });
  };

  const getEventTypeForClient = (client: Client, date: Date) => {
    if (isSameDay(new Date(client.due_date), date)) return 'report';
    if (client.content_due_date && isSameDay(new Date(client.content_due_date), date)) return 'content';
    if (client.contract_renewal_date && isSameDay(new Date(client.contract_renewal_date), date)) return 'renewal';
    if (client.shoot_date && isSameDay(new Date(client.shoot_date), date)) return 'shoot';
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-hive-yellow" />
            <h2 className="text-2xl font-bold text-white">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 glass-dark rounded-xl hover:bg-hive-mediumGray transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 glass-dark rounded-xl text-sm font-medium text-white hover:bg-hive-mediumGray transition-all"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 glass-dark rounded-xl hover:bg-hive-mediumGray transition-all"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center py-2 text-sm font-semibold text-gray-400">
              {day}
            </div>
          ))}

          {days.map((day, index) => {
            const dayClients = getClientsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <motion.div
                key={day.toISOString()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className={`min-h-[120px] p-2 rounded-xl border transition-all ${
                  isToday
                    ? 'glass-yellow border-hive-yellow'
                    : isCurrentMonth
                    ? 'glass-dark border-hive-lightGray hover:border-hive-yellow/50'
                    : 'bg-hive-black/30 border-transparent'
                }`}
              >
                <div className={`text-sm font-semibold mb-2 ${
                  isToday
                    ? 'text-hive-yellow'
                    : isCurrentMonth
                    ? 'text-white'
                    : 'text-gray-600'
                }`}>
                  {format(day, 'd')}
                </div>

                <div className="space-y-1">
                  {dayClients.slice(0, 3).map(client => {
                    const eventType = getEventTypeForClient(client, day);
                    return (
                      <button
                        key={`${client.id}-${eventType}`}
                        onClick={() => onClientClick(client)}
                        className={`w-full text-left text-xs px-2 py-1 rounded-lg font-medium truncate transition-all hover:scale-105 flex items-center gap-1 ${
                          eventType === 'report'
                            ? 'bg-hive-yellow/20 text-hive-yellow border border-hive-yellow/30'
                            : eventType === 'content'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : eventType === 'shoot'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}
                        title={`${client.client_name} - ${eventType}${client.recurring_enabled ? ' (Recurring)' : ''}`}
                      >
                        {client.recurring_enabled && eventType === 'report' && (
                          <RotateCw className="w-2.5 h-2.5 flex-shrink-0" />
                        )}
                        {eventType === 'shoot' && (
                          <Camera className="w-2.5 h-2.5 flex-shrink-0" />
                        )}
                        <span className="truncate">{client.client_name}</span>
                      </button>
                    );
                  })}
                  {dayClients.length > 3 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{dayClients.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-hive-yellow/20 border border-hive-yellow/30"></div>
            <span className="text-sm text-gray-300">Report Due</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500/30"></div>
            <span className="text-sm text-gray-300">Content Due</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500/20 border border-purple-500/30"></div>
            <span className="text-sm text-gray-300">Contract Renewal</span>
          </div>
          <div className="flex items-center gap-2">
            <RotateCw className="w-4 h-4 text-hive-yellow" />
            <span className="text-sm text-gray-300">Recurring</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30"></div>
            <span className="text-sm text-gray-300">Shoot Date</span>
          </div>
        </div>
      </div>
    </div>
  );
}
