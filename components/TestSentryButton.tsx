import * as Sentry from "@sentry/react";

export function TestSentryButton() {
  return (
    <button
      style={{ padding: "10px", background: "red", color: "white" }}
      onClick={() => {
        throw new Error("🔥 Congrats, Sentry works!");
      }}
    >
      Break the world
    </button>
  );
}