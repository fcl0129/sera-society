import { useState } from "react";
import type { BuilderConfig, BuilderGuest, GuestStatus } from "@/lib/builder/types";

const STATUS_LABEL: Record<GuestStatus, string> = {
  not_invited: "Not invited",
  invited: "Invited",
  opened: "Opened",
  rsvp_pending: "RSVP pending",
  attending: "Attending",
  declined: "Declined",
};

interface Props {
  guests: BuilderGuest[];
  onChange: (next: BuilderGuest[]) => void;
}

function newId() {
  return Math.random().toString(36).slice(2);
}

export function GuestListStep({ guests, onChange }: Props) {
  const [draft, setDraft] = useState({ name: "", email: "", phone: "", plusOne: false, notes: "" });
  const [bulk, setBulk] = useState("");

  const labelCls = "text-[0.65rem] uppercase tracking-[0.28em] text-[hsl(var(--sera-warm-grey))]";
  const inputCls =
    "w-full bg-transparent border-b border-[hsl(var(--border))] py-2 outline-none focus:border-[hsl(var(--sera-deep-navy))] transition-colors";

  function addGuest() {
    if (!draft.name.trim() && !draft.email.trim()) return;
    onChange([
      ...guests,
      { id: newId(), status: "not_invited", ...draft, name: draft.name.trim(), email: draft.email.trim() },
    ]);
    setDraft({ name: "", email: "", phone: "", plusOne: false, notes: "" });
  }

  function importBulk() {
    const lines = bulk.split(/\n/).map((l) => l.trim()).filter(Boolean);
    const additions: BuilderGuest[] = lines.map((line) => {
      const [name, email = "", phone = ""] = line.split(",").map((s) => s.trim());
      return { id: newId(), name, email, phone, plusOne: false, status: "not_invited" };
    });
    onChange([...guests, ...additions]);
    setBulk("");
  }

  function update(id: string, patch: Partial<BuilderGuest>) {
    onChange(guests.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }

  function remove(id: string) {
    onChange(guests.filter((g) => g.id !== id));
  }

  // Suppress unused import warning by referencing BuilderConfig type in JSDoc-equivalent
  void undefined as unknown as BuilderConfig;

  return (
    <div className="space-y-10 max-w-3xl">
      <header className="space-y-2">
        <p className={labelCls}>Step 03 — Guests</p>
        <h2 className="font-serif text-3xl md:text-4xl text-[hsl(var(--sera-deep-navy))]">The list.</h2>
        <p className="text-[hsl(var(--sera-warm-grey))]">Who you invite shapes the evening.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto_auto] gap-3 items-end p-4 border border-[hsl(var(--border))] rounded">
        <div><label className={labelCls}>Name</label><input className={inputCls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
        <div><label className={labelCls}>Email</label><input className={inputCls} value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></div>
        <div><label className={labelCls}>Phone</label><input className={inputCls} value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></div>
        <label className="flex items-center gap-2 text-xs text-[hsl(var(--sera-warm-grey))] uppercase tracking-wide">
          <input type="checkbox" checked={draft.plusOne} onChange={(e) => setDraft({ ...draft, plusOne: e.target.checked })} /> +1
        </label>
        <button onClick={addGuest} className="px-4 py-2 bg-[hsl(var(--sera-deep-navy))] text-[hsl(var(--sera-ivory))] uppercase tracking-[0.18em] text-[0.7rem]">Add</button>
      </div>

      {guests.length === 0 ? (
        <p className="text-[hsl(var(--sera-warm-grey))] italic">No guests yet — your room is still quiet.</p>
      ) : (
        <div className="border border-[hsl(var(--border))] rounded divide-y divide-[hsl(var(--border))]">
          {guests.map((g) => (
            <div key={g.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-3 p-4 items-center">
              <div>
                <p className="font-serif text-lg">{g.name || <span className="text-[hsl(var(--sera-warm-grey))]">No name</span>}</p>
                <p className="text-xs text-[hsl(var(--sera-warm-grey))]">{g.email}{g.phone ? ` · ${g.phone}` : ""}{g.plusOne ? " · +1" : ""}</p>
              </div>
              <div className="text-xs text-[hsl(var(--sera-warm-grey))]">{g.notes}</div>
              <select
                className="bg-transparent border border-[hsl(var(--border))] rounded px-2 py-1 text-xs"
                value={g.status}
                onChange={(e) => update(g.id, { status: e.target.value as GuestStatus })}
              >
                {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <button onClick={() => remove(g.id)} className="text-xs text-[hsl(var(--sera-oxblood))] uppercase tracking-wider">Remove</button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <label className={labelCls}>Paste a list (name, email, phone — one per line)</label>
        <textarea className={inputCls + " min-h-[120px] resize-y"} value={bulk} onChange={(e) => setBulk(e.target.value)} />
        <button onClick={importBulk} className="text-xs uppercase tracking-[0.18em] text-[hsl(var(--sera-deep-navy))] underline">Import</button>
      </div>
    </div>
  );
}

export { STATUS_LABEL };