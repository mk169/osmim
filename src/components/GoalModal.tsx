import { useStore } from '../store/store';
import { patchGoal } from '../store/actions';
import {
  GOAL_FRAMEWORK,
  GOAL_FRAMEWORK_ORDER,
  GOAL_STATUS,
  options,
} from '../lib/labels';
import type { AreaKey, Goal, GoalFramework, GoalHorizon, GoalStatus } from '../types';
import {
  AutoTextarea,
  Modal,
  QuietLine,
  Select,
  TextField,
  cx,
} from './ui';

const HORIZON: Record<GoalHorizon, string> = {
  season: 'Diese Saison',
  year: 'Dieses Jahr',
  horizon: 'Am Horizont',
};

export function GoalModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { state, update } = useStore();
  const goal = state.goals.find((g) => g.id === id);
  if (!goal) return null;

  const patch = (p: Partial<Goal>) => update((s) => patchGoal(s, goal.id, p));
  const framework: GoalFramework = goal.framework ?? 'none';
  const def = GOAL_FRAMEWORK[framework];

  const setField = (key: string, value: string) =>
    patch({ fields: { ...(goal.fields ?? {}), [key]: value } });

  return (
    <Modal open onClose={onClose} title="Ziel" wide>
      <div className="space-y-5">
        <TextField
          label="Ziel"
          value={goal.title}
          onChange={(e) => patch({ title: e.target.value })}
        />
        <AutoTextarea
          label="Was heißt das konkret?"
          value={goal.detail ?? ''}
          placeholder="Ein, zwei Sätze genügen."
          onChange={(e) => patch({ detail: e.target.value })}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Bereich"
            value={goal.areaId}
            onChange={(v) => patch({ areaId: v as AreaKey })}
            options={state.areas.map((a) => ({ value: a.id, label: a.title }))}
          />
          <Select
            label="Zeithorizont"
            value={goal.horizon}
            onChange={(v) => patch({ horizon: v as GoalHorizon })}
            options={(Object.keys(HORIZON) as GoalHorizon[]).map((h) => ({
              value: h,
              label: HORIZON[h],
            }))}
          />
          <Select
            label="Status"
            value={goal.status}
            onChange={(v) => patch({ status: v as GoalStatus })}
            options={options(GOAL_STATUS)}
          />
        </div>

        <div>
          <p className="label mb-2">Fortschritt</p>
          <div className="flex items-center gap-4">
            <QuietLine value={goal.progress} tone="brass" />
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={goal.progress}
              aria-label="Fortschritt"
              onChange={(e) => patch({ progress: Number(e.target.value) })}
              className="h-1 w-32 shrink-0 cursor-pointer accent-forest-500"
            />
            <span className="w-10 shrink-0 text-right text-[0.8rem] tabular-nums text-ink-300">
              {goal.progress}%
            </span>
          </div>
        </div>

        <div className="border-t rule pt-5">
          <p className="label mb-3">Denkrahmen</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {GOAL_FRAMEWORK_ORDER.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => patch({ framework: f })}
                className={cx(
                  'rounded-full border px-3.5 py-1.5 text-[0.83rem] transition-colors duration-200 ease-calm',
                  framework === f
                    ? 'border-forest-500 text-forest-600 dark:border-forest-300 dark:text-forest-300'
                    : 'border-paper-300 text-ink-400 hover:border-ink-300 dark:border-ink-600 dark:text-paper-200/70 dark:hover:border-ink-500',
                )}
              >
                {GOAL_FRAMEWORK[f].label}
              </button>
            ))}
          </div>
          <p className="text-[0.85rem] leading-relaxed text-ink-300 dark:text-paper-200/50">
            {def.blurb}
          </p>
        </div>

        {def.fields.length > 0 && (
          <div className="space-y-4 rounded-card bg-paper-100/60 p-4 dark:bg-ink-900/40 sm:p-5">
            {def.fields.map((f) => (
              <AutoTextarea
                key={f.key}
                label={f.label}
                value={goal.fields?.[f.key] ?? ''}
                placeholder={f.hint}
                onChange={(e) => setField(f.key, e.target.value)}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t rule pt-5">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Dieses Ziel löschen?')) {
                update((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== goal.id) }));
                onClose();
              }
            }}
            className="text-[0.8rem] text-ink-300 underline-offset-2 hover:text-wine-500 hover:underline"
          >
            Ziel löschen
          </button>
          <button type="button" onClick={onClose} className="btn-quiet">
            Fertig
          </button>
        </div>
      </div>
    </Modal>
  );
}

export { HORIZON };
