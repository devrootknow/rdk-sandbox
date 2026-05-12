"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: "2rem", fontFamily: "Inter, sans-serif", color: "#f5f8fa", background: "#1c2127", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Something went wrong</h2>
            <p style={{ color: "#abb3bf", marginBottom: "1.5rem" }}>{error.message || "An unexpected error occurred"}</p>
            <button
              onClick={reset}
              style={{ padding: "0.5rem 1.5rem", background: "#2d72d2", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.9rem" }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
