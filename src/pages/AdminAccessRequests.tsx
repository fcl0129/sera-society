import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { AccessRequestView, TierLevel, UserTierAccessRow } from "@/types/db";

const TIER_OPTIONS: TierLevel[] = ["essential", "social", "host", "occasions"];

export default function AdminAccessRequests() {
  const [requests, setRequests] = useState<AccessRequestView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [tierEmail, setTierEmail] = useState("");
  const [tierValue, setTierValue] = useState<TierLevel>("essential");
  const [tierAssignments, setTierAssignments] = useState<UserTierAccessRow[]>([]);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("access_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError("Could not load requests.");
      setLoading(false);
      return;
    }

    setRequests((data ?? []) as AccessRequestView[]);
    setLoading(false);
  };

  const loadTierAssignments = async () => {
    const { data, error: fetchError } = await supabase
      .from("user_tier_access")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (fetchError) return;
    setTierAssignments((data ?? []) as UserTierAccessRow[]);
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
      setError("Could not update the request.");
      setProcessingId(null);
      return;
    }

    setProcessingId(null);
    await loadRequests();
  };

  const saveTierAssignment = async () => {
    if (!tierEmail.trim()) {
      setError("Enter an email address for the tier assignment.");
      return;
    }

    const normalizedEmail = tierEmail.trim().toLowerCase();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { data: existing, error: findError } = await supabase
      .from("user_tier_access")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (findError) {
      setError(`Could not read existing tier assignment: ${findError.message}`);
      return;
    }

    const payload = {
      email: normalizedEmail,
      max_tier: tierValue,
      assigned_by: session?.user.id ?? null,
    };

    const { error: writeError } = existing?.id
      ? await supabase.from("user_tier_access").update(payload).eq("id", existing.id)
      : await supabase.from("user_tier_access").insert(payload);

    if (writeError) {
      setError(`Could not save tier assignment: ${writeError.message}`);
      return;
    }

    setError(null);
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
            <Link to="/admin">Back</Link>
          </Button>
        </div>

        {error && <p className="text-sm text-destructive mb-6">{error}</p>}

        <div className="border border-sera-sand/70 bg-white p-5 mb-8">
          <h2 className="font-serif text-sera-navy text-2xl mb-2">Tier access control</h2>
          <p className="text-sm text-sera-warm-grey mb-4">
            Set the highest tier a user is allowed to operate. Organizers cannot select a tier above this level.
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
              onChange={(e) => setTierValue(e.target.value as TierLevel)}
              className="border border-sera-sand px-3 py-2 text-sm capitalize"
            >
              {TIER_OPTIONS.map((tier) => (
                <option key={tier} value={tier}>
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </option>
              ))}
            </select>
            <Button variant="sera" onClick={() => void saveTierAssignment()}>
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
            {tierAssignments.length === 0 && (
              <p className="text-sm text-sera-warm-grey">No tier assignments yet.</p>
            )}
          </div>
        </div>

        {loading ? (
          <p className="sera-body text-sera-warm-grey">Loading requests…</p>
        ) : requests.length === 0 ? (
          <p className="sera-body text-sera-warm-grey">No access requests yet.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border border-sera-sand/70 bg-white p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-sera-navy text-xl">{request.name}</h2>
                    <p className="text-sm text-sera-warm-grey">{request.email}</p>
                    <p className="text-xs text-sera-stone mt-1">
                      {new Date(request.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xs uppercase tracking-wider text-sera-oxblood">
                    Status: {request.status}
                  </p>
                </div>

                <div className="mt-4 space-y-2 text-sm text-sera-warm-grey">
                  {request.organization && (
                    <p>
                      <span className="sera-label text-sera-stone mr-2">Organization</span>
                      {request.organization}
                    </p>
                  )}
                  {request.reason ? (
                    <p className="whitespace-pre-wrap">{request.reason}</p>
                  ) : (
                    <p className="italic">No additional information provided.</p>
                  )}
                  {request.admin_notes && (
                    <p className="rounded-md bg-sera-ivory/50 p-2 text-xs italic">
                      <span className="sera-label text-sera-stone mr-2">Internal note</span>
                      {request.admin_notes}
                    </p>
                  )}
                </div>

                {request.status === "pending" && (
                  <div className="flex gap-3 mt-5">
                    <Button
                      variant="sera"
                      size="sm"
                      disabled={processingId === request.id}
                      onClick={() => reviewRequest(request.id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="sera-outline"
                      size="sm"
                      disabled={processingId === request.id}
                      onClick={() => reviewRequest(request.id, "rejected")}
                    >
                      Decline
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