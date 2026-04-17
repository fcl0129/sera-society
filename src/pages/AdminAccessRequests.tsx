// @ts-nocheck — legacy schema references; will be regenerated when platform tables exist
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";

type AccessRequest = Tables<"access_requests">;

export default function AdminAccessRequests() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [tierEmail, setTierEmail] = useState("");
  const [tierValue, setTierValue] = useState<"essential" | "social" | "host" | "occasions">("essential");
  const [tierAssignments, setTierAssignments] = useState<
    { id: string; email: string | null; user_id: string | null; max_tier: string; created_at: string }[]
  >([]);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("access_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError("Kunde inte hämta ansökningar.");
      setLoading(false);
      return;
    }

    setRequests(data ?? []);
    setLoading(false);
  };

  const loadTierAssignments = async () => {
    const { data, error: fetchError } = await supabase
      .from("user_tier_access")
      .select("id,email,user_id,max_tier,created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (fetchError) return;
    setTierAssignments(data ?? []);
  };

  useEffect(() => {
    void loadRequests();
    void loadTierAssignments();
  }, []);

  const reviewRequest = async (requestId: string, status: "approved" | "rejected") => {
    setProcessingId(requestId);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { error: updateError } = await supabase
      .from("access_requests")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: session?.user.id ?? null,
      })
      .eq("id", requestId);

    if (updateError) {
      setError("Kunde inte uppdatera ansökan.");
      setProcessingId(null);
      return;
    }

    setProcessingId(null);
    await loadRequests();
  };

  const saveTierAssignment = async () => {
    if (!tierEmail.trim()) {
      setError("Ange en e-postadress för tier-tilldelning.");
      return;
    }

    const normalizedEmail = tierEmail.trim().toLowerCase();
    const { error: upsertError } = await supabase.from("user_tier_access").upsert(
      {
        email: normalizedEmail,
        max_tier: tierValue,
      },
      { onConflict: "email" },
    );

    if (upsertError) {
      setError("Kunde inte spara tier-tilldelning.");
      return;
    }

    setTierEmail("");
    await loadTierAssignments();
  };

  return (
    <div className="min-h-screen sera-surface-light px-6 py-10 md:py-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="sera-label text-sera-stone mb-2">Master Admin</p>
            <h1 className="sera-heading text-sera-navy text-3xl md:text-4xl">Access applications</h1>
          </div>
          <Button variant="sera-outline" asChild>
            <Link to="/dashboard">Back</Link>
          </Button>
        </div>

        {error && <p className="text-sm text-red-700 mb-6">{error}</p>}

        <div className="border border-sera-sand/70 bg-white p-5 mb-8">
          <h2 className="font-serif text-sera-navy text-2xl mb-2">Tier access control</h2>
          <p className="text-sm text-sera-warm-grey mb-4">
            Sätt vilken max-tier en användare får använda. Organizers kan inte välja högre tier än denna nivå.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="email"
              value={tierEmail}
              onChange={(e) => setTierEmail(e.target.value)}
              className="border border-sera-sand px-3 py-2 text-sm"
              placeholder="user@email.com"
            />
            <select
              value={tierValue}
              onChange={(e) => setTierValue(e.target.value as "essential" | "social" | "host" | "occasions")}
              className="border border-sera-sand px-3 py-2 text-sm"
            >
              <option value="essential">Essential</option>
              <option value="social">Social</option>
              <option value="host">Host</option>
              <option value="occasions">Occasions</option>
            </select>
            <Button variant="sera" onClick={saveTierAssignment}>
              Save tier
            </Button>
          </div>

          <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
            {tierAssignments.map((assignment) => (
              <div key={assignment.id} className="border border-sera-sand/50 bg-sera-ivory p-3 text-xs flex justify-between gap-3">
                <span>{assignment.email || assignment.user_id}</span>
                <span className="uppercase tracking-wider text-sera-oxblood">{assignment.max_tier}</span>
              </div>
            ))}
            {tierAssignments.length === 0 && <p className="text-sm text-sera-warm-grey">Inga tier-tilldelningar ännu.</p>}
          </div>
        </div>

        {loading ? (
          <p className="sera-body text-sera-warm-grey">Laddar ansökningar...</p>
        ) : requests.length === 0 ? (
          <p className="sera-body text-sera-warm-grey">Inga ansökningar ännu.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border border-sera-sand/70 bg-white p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-sera-navy text-xl">{request.name}</h2>
                    <p className="text-sm text-sera-warm-grey">{request.email}</p>
                    <p className="text-xs text-sera-stone mt-1">
                      {new Date(request.created_at).toLocaleString("sv-SE")}
                    </p>
                  </div>
                  <p className="text-xs uppercase tracking-wider text-sera-oxblood">
                    Status: {request.status}
                  </p>
                </div>

                <p className="mt-4 text-sm text-sera-warm-grey whitespace-pre-wrap">
                  {request.events_details || "Ingen ytterligare information."}
                </p>

                {request.status === "pending" && (
                  <div className="flex gap-3 mt-5">
                    <Button
                      variant="sera"
                      size="sm"
                      disabled={processingId === request.id}
                      onClick={() => reviewRequest(request.id, "approved")}
                    >
                      Godkänn
                    </Button>
                    <Button
                      variant="sera-outline"
                      size="sm"
                      disabled={processingId === request.id}
                      onClick={() => reviewRequest(request.id, "rejected")}
                    >
                      Avslå
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
