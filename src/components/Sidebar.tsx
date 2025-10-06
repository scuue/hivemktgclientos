import { Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type FilterType = 'all' | 'overdue' | 'today' | 'week' | 'contract_renewal' | 'shoot_not_booked' | 'shoot_booked';
export type SortType = 'due_date' | 'name' | 'type' | 'contract_renewal';

interface SidebarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const filters: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All Clients' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'today', label: 'Due Today' },
  { id: 'week', label: 'Due This Week' },
  { id: 'contract_renewal', label: 'Contract Renewals' },
  { id: 'shoot_not_booked', label: 'Shoot Not Booked' },
  { id: 'shoot_booked', label: 'Shoot Booked' },
];

const sortOptions: { id: SortType; label: string }[] = [
  { id: 'due_date', label: 'Due Date' },
  { id: 'name', label: 'Client Name' },
  { id: 'type', label: 'Type' },
  { id: 'contract_renewal', label: 'Contract Renewal' },
];

export function Sidebar({
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  isMobileOpen,
  onMobileClose,
}: SidebarProps) {
  const sidebarContent = (
    <div className="h-full flex flex-col glass p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-hive-yellow" />
          <h2 className="text-lg font-semibold text-white">Filters</h2>
        </div>
        <button
          onClick={onMobileClose}
          className="lg:hidden text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2 mb-8">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => {
              onFilterChange(filter.id);
              onMobileClose();
            }}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
              activeFilter === filter.id
                ? 'bg-hive-yellow text-hive-black font-semibold'
                : 'text-gray-300 glass-dark hover:glass hover:text-white'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="border-t border-white/10 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">SORT BY</h3>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortType)}
          className="w-full px-4 py-2 glass text-white rounded-xl border border-white/10 focus:border-hive-yellow focus:outline-none focus:ring-2 focus:ring-hive-yellow/20 transition-all"
        >
          {sortOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-64 border-r border-white/10">
        {sidebarContent}
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
