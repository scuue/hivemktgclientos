import { useState, useEffect } from 'react';
import { FileText, Save, RotateCw } from 'lucide-react';
import type { MonthlyContentPlan } from '../lib/database.types';

interface ContentPlanCardProps {
  monthlyPlan: MonthlyContentPlan | null;
  isRecurring: boolean;
  onSavePlan: (posts: number, ads: number) => void;
  onToggleRecurring: (enabled: boolean) => void;
  saving: boolean;
}

export function ContentPlanCard({
  monthlyPlan,
  isRecurring,
  onSavePlan,
  onToggleRecurring,
  saving,
}: ContentPlanCardProps) {
  const [postsPlanned, setPostsPlanned] = useState(monthlyPlan?.posts_planned || 0);
  const [adsPlanned, setAdsPlanned] = useState(monthlyPlan?.ads_planned || 0);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setPostsPlanned(monthlyPlan?.posts_planned || 0);
    setAdsPlanned(monthlyPlan?.ads_planned || 0);
    setHasChanges(false);
  }, [monthlyPlan]);

  useEffect(() => {
    const changed =
      postsPlanned !== (monthlyPlan?.posts_planned || 0) ||
      adsPlanned !== (monthlyPlan?.ads_planned || 0);
    setHasChanges(changed);
  }, [postsPlanned, adsPlanned, monthlyPlan]);

  function handleSave() {
    onSavePlan(postsPlanned, adsPlanned);
  }

  return (
    <div className="glass rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <FileText className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Content Plan</h3>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-hive-yellow text-hive-black rounded-xl font-bold hover:bg-yellow-400 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Plan'}
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Posts per month
            </label>
            <input
              type="number"
              min="0"
              value={postsPlanned}
              onChange={(e) => setPostsPlanned(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 glass text-white rounded-xl border border-white/10 focus:border-hive-yellow focus:outline-none focus:ring-2 focus:ring-hive-yellow/20 transition-all text-lg font-semibold"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ads per month
            </label>
            <input
              type="number"
              min="0"
              value={adsPlanned}
              onChange={(e) => setAdsPlanned(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 glass text-white rounded-xl border border-white/10 focus:border-hive-yellow focus:outline-none focus:ring-2 focus:ring-hive-yellow/20 transition-all text-lg font-semibold"
              placeholder="0"
            />
          </div>
        </div>

        <div className="glass-dark rounded-xl p-4">
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-5 h-5 text-hive-yellow" />
            <span className="text-lg font-semibold text-white">
              {postsPlanned > 0 || adsPlanned > 0 ? (
                <>
                  {postsPlanned} post{postsPlanned !== 1 ? 's' : ''} • {adsPlanned} ad{adsPlanned !== 1 ? 's' : ''}
                </>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => onToggleRecurring(e.target.checked)}
                  className="sr-only peer"
                  disabled={saving}
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-hive-yellow/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hive-yellow"></div>
              </label>
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <RotateCw className="w-4 h-4" />
                  Recurring Plan
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  When on, next month is prefilled with these values
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
