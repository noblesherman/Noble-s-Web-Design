import React from "react";
import { DocusealForm } from "@docuseal/react";

type Props = {
  url: string;
  email?: string;
  onComplete?: (data: unknown) => void;
};

/**
 * Thin wrapper around DocuSeal React form embed.
 */
export const DocuSealEmbed: React.FC<Props> = ({ url, email, onComplete }) => {
  return (
    <div className="docuseal-embed w-full h-full overflow-auto">
      <DocusealForm
        src={url}
        email={email}
        onComplete={onComplete}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default DocuSealEmbed;
