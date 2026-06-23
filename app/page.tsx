"use client";

import { useState } from "react";
import Stepper from "@/components/Stepper";
import ExternalForm from "@/components/ExternalForm";
import InternalForm from "@/components/InternalForm";
import DocPreview from "@/components/DocPreview";
import { TEMPLATES } from "@/lib/templates";
import { promptFor } from "@/lib/prompts";
import { generateDocx } from "@/lib/generate";
import { generatePdf } from "@/lib/pdfClient";
import {
  schemaFor,
  type ExternalResume,
  type InternalResume,
  type ResumeData,
  type TemplateId,
} from "@/lib/schemas";

interface FieldError {
  path: string;
  message: string;
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [templateId, setTemplateId] = useState<TemplateId | null>(null);
  const [copied, setCopied] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [errors, setErrors] = useState<FieldError[] | null>(null);
  const [data, setData] = useState<ResumeData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const copyPrompt = async () => {
    if (!templateId) return;
    await navigator.clipboard.writeText(promptFor(templateId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateJson = (text: string): boolean => {
    if (!templateId) return false;
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      setErrors([{ path: "(document)", message: `Not valid JSON: ${e instanceof Error ? e.message : String(e)}` }]);
      return false;
    }
    const result = schemaFor(templateId).safeParse(parsed);
    if (!result.success) {
      setErrors(
        result.error.issues.map((issue) => ({
          path: issue.path.length ? issue.path.join(".") : "(root)",
          message: issue.message,
        })),
      );
      return false;
    }
    setErrors(null);
    setData(result.data);
    return true;
  };

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    if (errors) setErrors(null);
  };

  const continueToReview = () => {
    if (validateJson(jsonText)) setStep(2);
  };

  const handleGenerate = async (format: "docx" | "pdf" | "both") => {
    if (!templateId || !data) return;
    setGenerating(true);
    setGenerateError(null);
    setGenerated(null);
    try {
      const candidate = (data as { name?: string }).name?.trim().replace(/\s+/g, "_") || "resume";
      const baseName = `${candidate}_${templateId}_profile`;
      if (format === "docx" || format === "both") {
        await generateDocx(templateId, data, `${baseName}.docx`);
      }
      if (format === "pdf" || format === "both") {
        await generatePdf(templateId, data, `${baseName}.pdf`);
      }
      setGenerated(
        format === "docx"
          ? "DOCX downloaded — check your downloads."
          : format === "pdf"
            ? "PDF downloaded — check your downloads."
            : "DOCX and PDF downloaded — check your downloads.",
      );
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  };

  const goTo = (target: number) => {
    setStep(target);
    setGenerateError(null);
    setGenerated(null);
    setShowPreview(false);
  };

  return (
    <div className="w-full text-ink">
      {/* hero */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            InfoBeans Profiles
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink-dark sm:text-4xl">
            Profile Generator
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-light sm:text-base">
            Turn an LLM&apos;s JSON into a perfectly branded InfoBeans profile. Pick a template, paste, review, and download
            DOCX or PDF — <span className="font-semibold text-brand-500">Creating WOW!</span>
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-10">
          <Stepper current={step} onNavigate={goTo} />
        </div>

        {step === 0 && (
          <div className="animate-fade-up space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {TEMPLATES.map((t) => {
                const selected = templateId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplateId(t.id)}
                    className={`group relative overflow-hidden rounded-xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      selected ? "border-brand-500 ring-1 ring-brand-500" : "border-gray-200"
                    }`}
                  >
                    <span
                      className={`absolute inset-x-0 top-0 h-1 transition-colors ${
                        selected ? "bg-brand-500" : "bg-transparent group-hover:bg-brand-200"
                      }`}
                    />
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold text-ink-dark">{t.name}</span>
                      {selected && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs text-white">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="mb-3 text-sm text-ink-light">{t.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {t.highlights.map((h) => (
                        <span key={h} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                          {h}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {templateId && (
              <div className="animate-fade-up rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="mb-2 font-semibold text-ink-dark">Get the extraction prompt</h2>
                <p className="mb-4 text-sm text-ink-light">
                  Copy this prompt into your LLM (Claude, ChatGPT, …) together with the candidate&apos;s resume file.
                  It will reply with the JSON this app needs for the{" "}
                  <strong className="text-ink">{TEMPLATES.find((t) => t.id === templateId)?.name}</strong> template.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={copyPrompt}
                    className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
                  >
                    {copied ? "Copied ✓" : "Copy LLM Prompt"}
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(1)}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-ink hover:bg-gray-50"
                  >
                    I have the JSON →
                  </button>
                </div>
                <details className="mt-4">
                  <summary className="cursor-pointer text-xs text-ink-light hover:text-ink">Preview prompt</summary>
                  <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-ink-dark p-3 text-xs text-gray-100">
                    {promptFor(templateId)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        )}

        {step === 1 && templateId && (
          <div className="animate-fade-up space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-2 font-semibold text-ink-dark">Paste the JSON</h2>
              <p className="mb-3 text-sm text-ink-light">
                Paste the JSON output from your LLM for the{" "}
                <strong className="text-ink">{TEMPLATES.find((t) => t.id === templateId)?.name}</strong> template, then continue.
              </p>
              <textarea
                value={jsonText}
                onChange={(e) => handleJsonChange(e.target.value)}
                spellCheck={false}
                rows={16}
                placeholder='{"name": "…", "jobTitle": "…", …}'
                className="w-full rounded-md border border-gray-300 p-3 font-mono text-xs text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              {errors && (
                <div className="mt-3 rounded-md border border-brand-200 bg-brand-50 p-3">
                  <p className="mb-2 text-sm font-semibold text-brand-700">
                    {errors.length} validation {errors.length === 1 ? "issue" : "issues"}:
                  </p>
                  <ul className="space-y-1 text-sm text-brand-700">
                    {errors.map((err, i) => (
                      <li key={i}>
                        <code className="rounded bg-brand-100 px-1 py-0.5 text-xs">{err.path}</code> — {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => goTo(0)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-ink hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={continueToReview}
                disabled={!jsonText.trim()}
                className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-40"
              >
                Validate &amp; Continue →
              </button>
            </div>
          </div>
        )}

        {step === 2 && templateId && data && (
          <div className="animate-fade-up space-y-5">
            {templateId === "external" ? (
              <ExternalForm data={data as ExternalResume} onChange={(d) => setData(d)} />
            ) : (
              <InternalForm data={data as InternalResume} onChange={(d) => setData(d)} />
            )}

            {showPreview && <DocPreview templateId={templateId} data={data} onClose={() => setShowPreview(false)} />}

            {generateError && (
              <div className="whitespace-pre-wrap rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {generateError}
              </div>
            )}
            {generated && !generateError && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">{generated}</div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goTo(1)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-ink hover:bg-gray-50"
              >
                ← Back
              </button>
              <div className="flex flex-wrap items-center gap-2">
                {/* PDF output is currently aligned with the DOCX for the external template only */}
                <button
                  type="button"
                  onClick={() => setShowPreview((v) => !v)}
                  disabled={templateId !== "external"}
                  className="rounded-md border border-brand-300 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showPreview ? "Hide preview" : "Preview"}
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerate("docx")}
                  disabled={generating}
                  className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-50"
                >
                  {generating ? "Generating…" : "DOCX ↓"}
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerate("pdf")}
                  disabled={generating || templateId !== "external"}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  PDF ↓
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerate("both")}
                  disabled={generating || templateId !== "external"}
                  className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Download Both ↓
                </button>
              </div>
            </div>
            <p className="text-right text-xs text-ink-light">
              The preview shows the exact PDF that downloads. The DOCX uses the original Word template.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
