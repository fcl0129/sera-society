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

  useEffect(() => {
    void loadRequests();
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
