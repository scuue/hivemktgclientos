import { useState, useEffect } from 'react';
import { Users, Save } from 'lucide-react';
import type { User } from '../lib/database.types';

interface TeamAssignmentCardProps {
  users: User[];
  team: {
    manager?: User;
    editors: User[];
    scripting: User[];
  };
  onSave: (team: {
    managerId?: string;
    editorIds: string[];
    scriptingIds: string[];
  }) => void;
  saving: boolean;
}

export function TeamAssignmentCard({ users, team, onSave, saving }: TeamAssignmentCardProps) {
  const [managerId, setManagerId] = useState<string | undefined>(team.manager?.id);
  const [editorIds, setEditorIds] = useState<string[]>(team.editors.map(e => e.id));
  const [scriptingIds, setScriptingIds] = useState<string[]>(team.scripting.map(s => s.id));
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setManagerId(team.manager?.id);
    setEditorIds(team.editors.map(e => e.id));
    setScriptingIds(team.scripting.map(s => s.id));
    setHasChanges(false);
  }, [team]);

  useEffect(() => {
    const changed =
      managerId !== team.manager?.id ||
      JSON.stringify([...editorIds].sort()) !== JSON.stringify(team.editors.map(e => e.id).sort()) ||
      JSON.stringify([...scriptingIds].sort()) !== JSON.stringify(team.scripting.map(s => s.id).sort());
    setHasChanges(changed);
  }, [managerId, editorIds, scriptingIds, team]);

  function handleToggleEditor(userId: string) {
    setEditorIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  }

  function handleToggleScripting(userId: string) {
    setScriptingIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  }

  function handleSave() {
    onSave({ managerId, editorIds, scriptingIds });
  }

  function getUserInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <div className="glass rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-hive-yellow/10 rounded-xl">
            <Users className="w-6 h-6 text-hive-yellow" />
          </div>
          <h3 className="text-xl font-bold text-white">Team Assignments</h3>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-hive-yellow text-hive-black rounded-xl font-bold hover:bg-yellow-400 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Team'}
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Manager <span className="text-hive-yellow">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => setManagerId(user.id)}
                className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                  managerId === user.id
                    ? 'bg-hive-yellow/20 border-2 border-hive-yellow text-white'
                    : 'glass-dark border border-white/10 hover:border-hive-yellow/50 text-gray-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  managerId === user.id ? 'bg-hive-yellow text-hive-black' : 'bg-gray-700 text-gray-300'
                }`}>
                  {getUserInitials(user.name)}
                </div>
                <span className="text-sm font-medium truncate">{user.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Editors
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => handleToggleEditor(user.id)}
                className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                  editorIds.includes(user.id)
                    ? 'bg-blue-500/20 border-2 border-blue-500 text-white'
                    : 'glass-dark border border-white/10 hover:border-blue-500/50 text-gray-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  editorIds.includes(user.id) ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
                }`}>
                  {getUserInitials(user.name)}
                </div>
                <span className="text-sm font-medium truncate">{user.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Scripting
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => handleToggleScripting(user.id)}
                className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                  scriptingIds.includes(user.id)
                    ? 'bg-green-500/20 border-2 border-green-500 text-white'
                    : 'glass-dark border border-white/10 hover:border-green-500/50 text-gray-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  scriptingIds.includes(user.id) ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'
                }`}>
                  {getUserInitials(user.name)}
                </div>
                <span className="text-sm font-medium truncate">{user.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
