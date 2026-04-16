import { useParams } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RsvpPage() {
  const { token } = useParams();
  const [status, setStatus] = useState<"going" | "maybe" | "not_going">("going");
  const [plusOnes, setPlusOnes] = useState(0);
  const [msg, setMsg] = useState("");

  const submit = async () => {
    setMsg("Skickar...");
    const { data, error } = await supabase.functions.invoke("rsvp", {
      body: { token, status, plusOnes },
    });

    if (error) setMsg("Något gick fel.");
    else if (data?.ok) setMsg("Tack! Din RSVP är sparad.");
    else setMsg("Kunde inte spara RSVP.");
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-semibold">RSVP</h1>

      <label className="block mt-4">Svar</label>
      <select
        className="mt-1 w-full border p-2 rounded"
        value={status}
        onChange={(e) => setStatus(e.target.value as any)}
      >
        <option value="going">Kommer</option>
        <option value="maybe">Kanske</option>
        <option value="not_going">Kommer inte</option>
      </select>

      <label className="block mt-4">Plus-ones</label>
      <input
        className="mt-1 w-full border p-2 rounded"
        type="number"
        min={0}
        max={10}
        value={plusOnes}
        onChange={(e) => setPlusOnes(parseInt(e.target.value || "0", 10))}
      />

      <button
        onClick={submit}
        className="mt-6 w-full bg-black text-white rounded p-2"
      >
        Skicka
      </button>

      {msg && <p className="mt-3 text-sm">{msg}</p>}
    </div>
  );
}
