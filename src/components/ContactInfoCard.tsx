import { Info } from 'lucide-react';
import type { User } from '../lib/database.types';

interface ContactInfoCardProps {
  team: {
    manager?: User;
    editors: User[];
    scripting: User[];
  };
}

export function ContactInfoCard({ team }: ContactInfoCardProps) {
  const editorsText = team.editors.length > 0
    ? team.editors.map(e => e.name).join(', ')
    : 'None assigned';

  const scriptingText = team.scripting.length > 0
    ? team.scripting.map(s => s.name).join(', ')
    : 'None assigned';

  return (
    <div className="glass rounded-2xl p-6 border border-white/10 bg-blue-500/5">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-500/10 rounded-xl flex-shrink-0">
          <Info className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-4">Who to Contact</h3>

          <div className="space-y-3">
            <div className="glass-dark rounded-xl p-3">
              <p className="text-sm font-medium text-gray-400 mb-1">Manager</p>
              <p className="text-white font-semibold">
                {team.manager ? team.manager.name : 'No manager assigned'}
              </p>
            </div>

            <div className="glass-dark rounded-xl p-3">
              <p className="text-sm font-medium text-gray-400 mb-1">Editors</p>
              <p className="text-white font-semibold">{editorsText}</p>
            </div>

            <div className="glass-dark rounded-xl p-3">
              <p className="text-sm font-medium text-gray-400 mb-1">Scripting</p>
              <p className="text-white font-semibold">{scriptingText}</p>
            </div>
          </div>

          <div className="mt-4 p-3 glass-yellow rounded-xl">
            <p className="text-sm text-gray-300 leading-relaxed">
              <span className="font-semibold text-white">Note:</span> Editors should DM the Manager for approvals.
              Scripting questions should be directed to the Scripting team lead.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
