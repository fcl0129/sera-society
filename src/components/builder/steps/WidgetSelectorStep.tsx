import type { BuilderConfig, WidgetKey } from "@/lib/builder/types";
import { ALL_WIDGETS } from "@/lib/builder/defaults";

interface Props {
  value: BuilderConfig["widgets"];
  onChange: (next: BuilderConfig["widgets"]) => void;
}

export function WidgetSelectorStep({ value, onChange }: Props) {
  const labelCls = "text-[0.65rem] uppercase tracking-[0.28em] text-[hsl(var(--sera-warm-grey))]";
  const setEnabled = (k: WidgetKey, on: boolean) =>
    onChange({ ...value, enabled: { ...value.enabled, [k]: on } });

  function move(k: WidgetKey, dir: -1 | 1) {
    const order = [...value.order];
    const i = order.indexOf(k);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    onChange({ ...value, order });
  }

  return (
    <div className="space-y-10 max-w-3xl">
      <header className="space-y-2">
        <p className={labelCls}>Step 05 — Event page</p>
        <h2 className="font-serif text-3xl md:text-4xl text-[hsl(var(--sera-deep-navy))]">
          Compose the page your guests will see.
        </h2>
        <p className="text-[hsl(var(--sera-warm-grey))]">
          Toggle what belongs. Reorder to set the rhythm of the page.
        </p>
      </header>

      <ul className="border border-[hsl(var(--border))] rounded divide-y divide-[hsl(var(--border))]">
        {value.order.map((k) => {
          const meta = ALL_WIDGETS.find((w) => w.key === k);
          if (!meta) return null;
          const on = value.enabled[k];
          return (
            <li key={k} className="flex items-center gap-4 p-4">
              <input
                type="checkbox"
                checked={on}
                onChange={(e) => setEnabled(k, e.target.checked)}
                className="h-4 w-4 accent-[hsl(var(--sera-deep-navy))]"
              />
              <div className="flex-1">
                <p className="font-serif text-lg">{meta.label}</p>
                <p className="text-xs text-[hsl(var(--sera-warm-grey))]">{meta.description}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => move(k, -1)} className="text-xs px-2 py-1 border border-[hsl(var(--border))] rounded">↑</button>
                <button onClick={() => move(k, 1)} className="text-xs px-2 py-1 border border-[hsl(var(--border))] rounded">↓</button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}