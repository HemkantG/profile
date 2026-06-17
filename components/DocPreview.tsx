"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ResumeData, TemplateId } from "@/lib/schemas";
import { renderPdfBlob } from "@/lib/pdfClient";

export default function DocPreview({
  templateId,
  data,
  onClose,
}: {
  templateId: TemplateId;
  data: ResumeData;
  onClose: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);

  const refresh = useCallback(async () => {
    setRendering(true);
    setError(null);
    try {
      const blob = await renderPdfBlob(templateId, data);
      setUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setStale(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRendering(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, data]);

  // render once on mount; afterwards mark stale when data changes
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      refresh();
    } else {
      setStale(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, data]);

  // revoke the object URL on unmount
  useEffect(() => {
    return () => {
      setUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-700">PDF preview</h3>
          {stale && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">edits not reflected — refresh</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={rendering}
            className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {rendering ? "Rendering…" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
      {error && <div className="whitespace-pre-wrap p-4 text-sm text-red-700">{error}</div>}
      {url && !error && (
        <iframe src={url} title="Resume PDF preview" className="h-[75vh] w-full rounded-b-xl bg-gray-200" />
      )}
      {!url && !error && <div className="p-8 text-center text-sm text-gray-400">Rendering preview…</div>}
    </div>
  );
}
