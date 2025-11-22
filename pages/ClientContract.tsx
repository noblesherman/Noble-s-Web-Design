import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ArrowLeft, Loader2, ShieldCheck, AlertTriangle, ExternalLink } from "lucide-react";
import { DocuSealEmbed } from "../components/DocuSealEmbed";

type ContractDetail = {
  id: string;
  assignmentId?: string;
  title: string;
  version: string;
  body: string;
  status?: string;
  signature?: {
    signedAt?: string;
    pdfUrl?: string;
    signatureUrl?: string;
  } | null;
  docusealEmbedUrl?: string | null;
};

export const ClientContract: React.FC = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const DOCUSEAL_EMBED_URL = import.meta.env.VITE_DOCUSEAL_EMBED_URL || "";

  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const alreadySigned = contract?.status === "signed" || !!contract?.signature;

  useEffect(() => {
    const token = localStorage.getItem("client_token");
    if (!token) {
      navigate("/client");
      return;
    }

    const loadContract = async () => {
      try {
        const [contractRes, meRes] = await Promise.all([
          fetch(`${API_BASE}/api/client/contracts/${contractId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/client/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const contractData = await contractRes.json();
        const meData = await meRes.json();
        if (!meData?.error && meData?.email) setUserEmail(meData.email);
        if (contractData?.contract) {
          setContract(contractData.contract);
        } else {
          setError(contractData?.error || "Contract not found");
        }
      } catch (err) {
        setError("Unable to load contract");
      } finally {
        setLoading(false);
      }
    };

    loadContract();
  }, [API_BASE, contractId, navigate]);

  const embeddedUrl = useMemo(() => {
    if (!contractId) return null;
    if (contract?.docusealEmbedUrl) return contract.docusealEmbedUrl;
    if (!DOCUSEAL_EMBED_URL) return null;
    return DOCUSEAL_EMBED_URL.replace("{contractId}", contractId);
  }, [DOCUSEAL_EMBED_URL, contract?.docusealEmbedUrl, contractId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <div className="bg-surface border border-white/10 rounded-xl p-6 text-center space-y-4 max-w-md">
          <AlertTriangle className="mx-auto text-amber-300" />
          <p className="text-sm text-muted">{error || "Contract not found"}</p>
          <Button variant="outline" onClick={() => navigate("/client")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <button
          onClick={() => navigate("/client")}
          className="inline-flex items-center gap-2 text-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </button>

        <div className="bg-surface border border-white/10 rounded-2xl p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.18em] text-muted uppercase">
                Contract
              </p>
              <h1 className="text-2xl font-bold text-white">
                {contract.title}
              </h1>
              <p className="text-sm text-muted">
                Version {contract.version} • Contract ID {contract.id}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs border ${
                  alreadySigned
                    ? "border-green-400/30 bg-green-400/10 text-green-300"
                    : "border-amber-400/30 bg-amber-400/10 text-amber-200"
                }`}
              >
                {alreadySigned ? "Signed" : "Awaiting signature"}
              </span>
            </div>
          </div>

          {alreadySigned && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-200 rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck size={18} className="mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold">This contract is signed.</p>
                {contract.signature?.signedAt && (
                  <p className="text-xs">
                    Signed on{" "}
                    {new Date(contract.signature.signedAt).toLocaleString()}
                  </p>
                )}
                {contract.signature?.pdfUrl && (
                  <a
                    href={contract.signature.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs underline"
                  >
                    <ExternalLink size={14} /> Download executed PDF
                  </a>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="border border-red-500/30 bg-red-500/10 text-red-200 rounded-xl p-3 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  DocuSeal signer
                </p>
                {embeddedUrl && (
                  <a
                    href={embeddedUrl}
                    className="text-xs text-primary hover:text-white underline inline-flex items-center gap-1"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in new tab <ExternalLink size={12} />
                  </a>
                )}
              </div>
              {embeddedUrl ? (
                <div className="rounded-xl border border-white/10 bg-black/60 min-h-[540px] h-[75vh] max-h-[900px] overflow-hidden">
                  <DocuSealEmbed
                    url={embeddedUrl}
                    email={userEmail || undefined}
                    onComplete={async (data) => {
                      setSuccessMessage("Document submitted. Thank you!");
                      const token = localStorage.getItem("client_token");
                      if (!token) return;
                      try {
                        await fetch(`${API_BASE}/api/client/contracts/${contractId}/docuseal-complete`, {
                          method: "POST",
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        const res = await fetch(`${API_BASE}/api/client/contracts/${contractId}`, {
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        const refreshed = await res.json();
                        if (refreshed?.contract) setContract(refreshed.contract);
                      } catch (err) {
                        console.error("docuseal completion notify failed", err);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="text-sm text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  Signing link unavailable. Please contact support or refresh once the DocuSeal embed URL is configured.
                </div>
              )}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-muted">
              <p className="font-semibold text-white mb-1 flex items-center gap-2">
                <ShieldCheck size={14} /> Secure signing
              </p>
              <p>
                This contract is executed through DocuSeal Cloud Embed for reliable PDF handling, identity capture, and a tamper-evident record.
              </p>
            </div>
            {successMessage && (
              <div className="border border-green-500/30 bg-green-500/10 text-green-200 rounded-lg p-3 text-sm">
                {successMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
