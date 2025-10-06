import { useState, useEffect, useMemo } from 'react';
import { Plus, Menu, Download, Upload, Loader2, LayoutGrid, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { Sidebar, FilterType, SortType } from './components/Sidebar';
import { ClientCard } from './components/ClientCard';
import { ClientModal } from './components/ClientModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { CalendarView } from './components/CalendarView';
import { ClientDetailPage } from './components/ClientDetailPage';
import { fetchClientsWithTeam, addClient, addClientWithTeamAndPlan, updateClient, deleteClient } from './lib/api';
import { isOverdue, isDueToday, isDueThisWeek } from './lib/utils';
import type { Client, ClientInsert, ClientWithTeam } from './lib/database.types';

type ViewType = 'grid' | 'calendar';

function App() {
  const [clients, setClients] = useState<ClientWithTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('due_date');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<'any' | 'manager' | 'editor' | 'scripting'>('any');

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      setLoading(true);
      const data = await fetchClientsWithTeam();
      setClients(data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  }

  const allUsers = useMemo(() => {
    const userMap = new Map();
    clients.forEach(client => {
      if (client.manager) userMap.set(client.manager.id, client.manager);
      client.editors.forEach(e => userMap.set(e.id, e));
      client.scripting.forEach(s => userMap.set(s.id, s));
    });
    return Array.from(userMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [clients]);

  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.client_name.toLowerCase().includes(query) ||
          client.notes?.toLowerCase().includes(query) ||
          client.package?.toLowerCase().includes(query)
      );
    }

    switch (activeFilter) {
      case 'overdue':
        filtered = filtered.filter((client) => isOverdue(client.due_date));
        break;
      case 'today':
        filtered = filtered.filter((client) => isDueToday(client.due_date));
        break;
      case 'week':
        filtered = filtered.filter((client) => isDueThisWeek(client.due_date));
        break;
      case 'contract_renewal':
        filtered = filtered.filter((client) => client.contract_renewal_date);
        break;
      case 'shoot_not_booked':
        filtered = filtered.filter((client) => client.shoot_status === 'not_booked');
        break;
      case 'shoot_booked':
        filtered = filtered.filter((client) => client.shoot_status === 'booked');
        break;
    }

    if (assigneeFilter !== 'all') {
      filtered = filtered.filter(client => {
        if (client.manager?.id === assigneeFilter) return true;
        if (client.editors.some(e => e.id === assigneeFilter)) return true;
        if (client.scripting.some(s => s.id === assigneeFilter)) return true;
        return false;
      });
    }

    if (roleFilter !== 'any') {
      filtered = filtered.filter(client => {
        if (roleFilter === 'manager') return !!client.manager;
        if (roleFilter === 'editor') return client.editors.length > 0;
        if (roleFilter === 'scripting') return client.scripting.length > 0;
        return true;
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'due_date':
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'name':
          return a.client_name.localeCompare(b.client_name);
        case 'type':
          return (a.package || '').localeCompare(b.package || '');
        case 'contract_renewal':
          if (!a.contract_renewal_date) return 1;
          if (!b.contract_renewal_date) return -1;
          return new Date(a.contract_renewal_date).getTime() - new Date(b.contract_renewal_date).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [clients, searchQuery, activeFilter, sortBy, assigneeFilter, roleFilter]);

  const handleAddClient = async (
    clientData: ClientInsert,
    team?: { managerId?: string; editorIds: string[]; scriptingIds: string[] },
    monthlyPlan?: { month: string; posts_planned: number; ads_planned: number }
  ) => {
    try {
      if (team || monthlyPlan) {
        const newClient = await addClientWithTeamAndPlan(clientData, team, monthlyPlan);
        setClients([...clients, newClient]);
      } else {
        const newClient = await addClient(clientData);
        await loadClients();
      }
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateClient = async (clientData: ClientInsert) => {
    if (!editingClient) return;

    try {
      const updated = await updateClient(editingClient.id, clientData);
      setClients(clients.map((c) => (c.id === updated.id ? updated : c)));
      setEditingClient(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await deleteClient(id);
      setClients(clients.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  const handleAdvanceDate = async (client: Client, nextDate: string) => {
    try {
      const updated = await updateClient(client.id, {
        due_date: nextDate,
        last_recurring_update: new Date().toISOString(),
      });
      setClients(clients.map((c) => (c.id === updated.id ? updated : c)));
    } catch (error) {
      console.error('Failed to advance date:', error);
    }
  };

  const handleEdit = (client: Client) => {
    setDetailClient(client);
  };

  const handleQuickEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleCloseDetail = () => {
    setDetailClient(null);
  };

  const handleUpdateFromDetail = (updated: Client) => {
    setClients(clients.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
  };

  const exportToCSV = () => {
    const headers = ['Client Name', 'Contract Renewal Date', 'Content Due Date', 'Report Due Date', 'Posts Per Month', 'Package', 'Monthly Reporting Canva Link', 'Notes', 'Reminders'];
    const rows = clients.map((client) => [
      client.client_name,
      client.contract_renewal_date || '',
      client.content_due_date || '',
      client.due_date,
      client.posts_per_month || '',
      client.package || '',
      client.monthly_reporting_canva_link || '',
      client.notes || '',
      client.reminders || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hive-clients-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').slice(1);

        for (const line of lines) {
          if (!line.trim()) continue;

          const match = line.match(/(?:"([^"]*)"|([^,]*))/g);
          if (!match || match.length < 9) continue;

          const values = match.map((v) => v.replace(/^"|"$/g, '').replace(/""/g, '"'));

          const clientData: ClientInsert = {
            client_name: values[0],
            contract_renewal_date: values[1] || null,
            content_due_date: values[2] || null,
            due_date: values[3],
            posts_per_month: values[4] ? parseInt(values[4]) : null,
            package: values[5] || null,
            monthly_reporting_canva_link: values[6] || null,
            notes: values[7] || null,
            reminders: values[8] || null,
          };

          await addClient(clientData);
        }

        await loadClients();
      } catch (error) {
        console.error('Failed to import CSV:', error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const getFilterTitle = () => {
    switch (activeFilter) {
      case 'all': return 'All Clients';
      case 'overdue': return 'Overdue Reports';
      case 'today': return 'Due Today';
      case 'week': return 'Due This Week';
      case 'contract_renewal': return 'Contract Renewals';
      case 'shoot_not_booked': return 'Shoot Not Booked';
      case 'shoot_booked': return 'Shoot Booked';
      default: return 'Clients';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hive-black via-hive-darkGray to-hive-black text-white">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="flex">
        <Sidebar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                  <h2 className="text-2xl font-bold text-white">
                    {getFilterTitle()}
                    <span className="ml-3 text-hive-yellow">({filteredAndSortedClients.length})</span>
                  </h2>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                <div className="glass-dark rounded-xl p-1 flex items-center gap-1">
                  <button
                    onClick={() => setViewType('grid')}
                    className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                      viewType === 'grid'
                        ? 'bg-hive-yellow text-hive-black font-semibold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewType('calendar')}
                    className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                      viewType === 'calendar'
                        ? 'bg-hive-yellow text-hive-black font-semibold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">Calendar</span>
                  </button>
                </div>

                <button
                  onClick={exportToCSV}
                  disabled={clients.length === 0}
                  className="px-4 py-2 glass-dark text-white rounded-xl hover:glass transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title="Export to CSV"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>

                <label className="px-4 py-2 glass-dark text-white rounded-xl hover:glass transition-all cursor-pointer flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Import</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={importFromCSV}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-400">Team Member:</label>
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="px-3 py-2 glass-dark text-white rounded-xl border border-white/10 focus:border-hive-yellow focus:outline-none focus:ring-2 focus:ring-hive-yellow/20 transition-all text-sm"
                >
                  <option value="all">All</option>
                  {allUsers.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-400">Role:</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as 'any' | 'manager' | 'editor' | 'scripting')}
                  className="px-3 py-2 glass-dark text-white rounded-xl border border-white/10 focus:border-hive-yellow focus:outline-none focus:ring-2 focus:ring-hive-yellow/20 transition-all text-sm"
                >
                  <option value="any">Any</option>
                  <option value="manager">Manager</option>
                  <option value="editor">Editor</option>
                  <option value="scripting">Scripting</option>
                </select>
              </div>

              {(assigneeFilter !== 'all' || roleFilter !== 'any') && (
                <button
                  onClick={() => {
                    setAssigneeFilter('all');
                    setRoleFilter('any');
                  }}
                  className="px-3 py-2 text-xs glass-dark text-gray-400 hover:text-white rounded-xl transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-hive-yellow animate-spin" />
              </div>
            ) : viewType === 'calendar' ? (
              <CalendarView
                clients={filteredAndSortedClients}
                onClientClick={handleEdit}
              />
            ) : filteredAndSortedClients.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-16 h-16 glass-dark rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  {searchQuery || activeFilter !== 'all'
                    ? 'No clients found'
                    : 'No clients yet'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || activeFilter !== 'all'
                    ? 'Try adjusting your filters or search query'
                    : 'Get started by adding your first client'}
                </p>
                {!searchQuery && activeFilter === 'all' && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-hive-yellow text-hive-black rounded-xl font-bold hover:bg-yellow-400 transition-all transform hover:scale-105"
                  >
                    Add First Client
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredAndSortedClients.map((client, index) => (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ClientCard
                        client={client}
                        onEdit={handleEdit}
                        onDelete={(id) =>
                          setDeleteConfirm({ id, name: client.client_name })
                        }
                        onAdvanceDate={handleAdvanceDate}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-hive-yellow text-hive-black rounded-full shadow-hive-lg flex items-center justify-center hover:shadow-2xl transition-all z-30"
      >
        <Plus className="w-8 h-8" />
      </motion.button>

      <ClientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingClient ? handleUpdateClient : handleAddClient}
        editingClient={editingClient}
      />

      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            handleDeleteClient(deleteConfirm.id);
          }
        }}
        clientName={deleteConfirm?.name || ''}
      />

      {detailClient && (
        <ClientDetailPage
          client={detailClient}
          onClose={handleCloseDetail}
          onUpdate={handleUpdateFromDetail}
        />
      )}
    </div>
  );
}

export default App;