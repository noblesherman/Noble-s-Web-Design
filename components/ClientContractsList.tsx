import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Clock3, ExternalLink, FileSignature } from "lucide-react";

export type ClientContractItem = {
  id: string;
  contractId: string;
  title: string;
  version?: string;
  status: "Signed" | "Unsigned" | string;
  signedAt?: string | Date | null;
  signatureUrl?: string | null;
  pdfUrl?: string | null;
};

type Props = {
  contracts: ClientContractItem[];
  loading?: boolean;
  onRefresh?: () => void;
};

export const ClientContractsList: React.FC<Props> = ({
  contracts = [],
  loading = false,
  onRefresh,
}) => {
  if (loading) {
    return (
      <div className="grid gap-4">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse h-24"
          />
        ))}
      </div>
    );
  }

  if (!contracts.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted">
        No contracts assigned yet. When a contract is shared with you it will
        appear here for review and signature.
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="ml-3 inline-flex items-center text-primary hover:text-white transition-colors"
          >
            Refresh
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {contracts.map((contract) => {
        const isSigned =
          contract.status?.toLowerCase() === "signed" || !!contract?.signatureUrl;
        const dateLabel = contract.signedAt
          ? new Date(contract.signedAt).toLocaleString()
          : null;

        return (
          <div
            key={contract.id || contract.contractId}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FileSignature size={18} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm md:text-base">
                  {contract.title}
                </p>
                <p className="text-xs text-muted uppercase tracking-wide">
                  Version {contract.version || "1.0"}
                </p>
                {dateLabel && (
                  <p className="text-xs text-muted mt-1">
                    Signed: {dateLabel}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs ${
                  isSigned
                    ? "border-green-400/20 bg-green-400/10 text-green-300"
                    : "border-amber-400/20 bg-amber-400/10 text-amber-200"
                }`}
              >
                {isSigned ? (
                  <CheckCircle size={14} />
                ) : (
                  <Clock3 size={14} />
                )}
                {isSigned ? "Signed" : "Unsigned"}
              </span>

              {isSigned && contract.pdfUrl && (
                <a
                  href={contract.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-sm text-white hover:bg-white/10 transition-colors"
                >
                  <ExternalLink size={14} />
                  Download PDF
                </a>
              )}

              <Link
                to={`/client/contracts/${contract.contractId || contract.id}`}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors"
              >
                {isSigned ? "View Contract" : "Sign Contract"}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};
