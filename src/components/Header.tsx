import { Search, Hexagon } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-dark border-b border-white/10 sticky top-0 z-50 shadow-lg"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Hexagon className="w-8 h-8 text-hive-yellow fill-hive-yellow" />
            <h1 className="text-2xl font-bold text-white">
              Hive <span className="text-hive-yellow">Marketing</span>
            </h1>
          </div>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients or notes..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glass text-white rounded-2xl border border-white/10 focus:border-hive-yellow focus:outline-none focus:ring-2 focus:ring-hive-yellow/20 transition-all placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
