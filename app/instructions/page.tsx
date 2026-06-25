import type { Metadata } from "next";
import Link from "next/link";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Instructions — Profile Generator",
};

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
        {n}
      </span>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <div className="mt-1 text-sm text-gray-600">{children}</div>
      </div>
    </li>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

export default function InstructionsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <div className="border-l-4 border-brand-500 pl-4">
        <h1 className="text-2xl font-bold text-ink-dark">How to generate a profile</h1>
        <p className="mt-1 text-sm text-ink-light">
          The generator fills one of two pre-styled Word templates with the candidate&apos;s data. The typography
          (Title, Subtitle, Heading&nbsp;1/2, Normal text) is applied automatically and follows the{" "}
          <Link href="/style-guide" className="font-medium text-brand-600 underline">Style Guide</Link>.
        </p>
      </div>

      <Card title="Two ways to provide the data">
        <p className="mb-3 text-sm text-gray-600">
          After picking a template on the{" "}
          <Link href="/" className="text-brand-600 underline">Generator</Link> page, choose how you want to enter the
          profile details:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>
            <strong>Use an LLM (fastest):</strong> copy the extraction prompt, run it against the candidate&apos;s
            existing resume in Claude / ChatGPT, then paste the returned JSON and validate. Best when you already have
            a resume to convert.
          </li>
          <li>
            <strong>Fill in a blank form (no LLM):</strong> click <strong>Start with a blank form</strong> to open an
            empty version of the template and type each field in directly. Best when there is no source resume, or for
            quick manual edits. Both paths land on the same <strong>Review &amp; Generate</strong> step.
          </li>
        </ul>
      </Card>

      <Card title="External Profile — client-facing resume">
        <p className="mb-4 text-sm text-gray-600">
          Single-column profile shared outside the organisation: overview, education, skills,
          tools/certifications, numbered project case studies and an employment history section.
        </p>
        <ol className="space-y-4">
          <Step n={1} title="Select the template">
            On the <Link href="/" className="text-brand-600 underline">Generator</Link> page, choose the{" "}
            <strong>External Profile</strong> card. To enter everything by hand instead, click{" "}
            <strong>Start with a blank form</strong> and skip to step 5.
          </Step>
          <Step n={2} title="Copy the extraction prompt">
            Click <strong>Copy LLM Prompt</strong>. The prompt contains the exact JSON schema the External template
            needs (profile header, overview, education, skills, tools &amp; certifications, projects with
            responsibilities, employment history with highlights).
          </Step>
          <Step n={3} title="Run it in your LLM">
            Open Claude, ChatGPT or any capable LLM. Attach the candidate&apos;s current profile (PDF/DOCX), paste the
            prompt, and send. The reply must be raw JSON only — if it comes wrapped in ``` fences, copy just the JSON
            inside.
          </Step>
          <Step n={4} title="Paste & validate">
            Back in the app, click <strong>I have the JSON</strong>, paste the reply and hit{" "}
            <strong>Validate &amp; Continue</strong>. Any missing or malformed fields are listed with their exact
            path (e.g. <code className="rounded bg-gray-100 px-1 text-xs">projects.0.responsibilities</code>) — fix
            them in the JSON or ask the LLM to correct its output.
          </Step>
          <Step n={5} title="Review & edit">
            Check every section: name, designation, experience summary and specialization; a 3–5 sentence overview;
            education entries (year + qualification); skills; tools/certifications; each project (client, team size,
            role, description, 4–8 responsibility bullets); each employer (company, position, duration, highlight
            bullets). Add, remove or reorder array items with the <strong>+ / ✕ / ↑ / ↓</strong> controls. Projects
            are numbered automatically in the order listed.
          </Step>
          <Step n={6} title="Preview">
            Click <strong>Preview</strong> to see the exact PDF rendered in the browser. After further edits press{" "}
            <strong>Refresh</strong> in the preview header.
          </Step>
          <Step n={7} title="Generate">
            Download <strong>DOCX</strong>, <strong>PDF</strong>, or <strong>Both</strong> — both download directly.
            Open the result in Word or Google Docs for a final check against the{" "}
            <Link href="/style-guide" className="text-brand-600 underline">Style Guide</Link>.
          </Step>
        </ol>
      </Card>

      <Card title="Internal Profile — bench/staffing resume">
        <p className="mb-4 text-sm text-gray-600">
          Two-column profile used internally: detailed projects on the left (duration, title, tools &amp;
          technologies, team size, role, project link, description, responsibilities); a sidebar with rated skills,
          certifications, tools, managerial experience, domains and languages on the right.
        </p>
        <ol className="space-y-4">
          <Step n={1} title="Select the template">
            On the <Link href="/" className="text-brand-600 underline">Generator</Link> page, choose the{" "}
            <strong>Internal Profile</strong> card. To enter everything by hand instead, click{" "}
            <strong>Start with a blank form</strong> and skip to step 5.
          </Step>
          <Step n={2} title="Copy the extraction prompt">
            Click <strong>Copy LLM Prompt</strong>. This prompt differs from the External one — it additionally asks
            for per-project duration, tools &amp; technologies and a project link, plus sidebar data: skill ratings,
            certifications, tools, managerial experience, domains and languages.
          </Step>
          <Step n={3} title="Run it in your LLM">
            Attach the candidate&apos;s profile, paste the prompt, send, and copy the raw JSON reply.
          </Step>
          <Step n={4} title="Paste & validate">
            Paste into the JSON step and click <strong>Validate &amp; Continue</strong>; fix any reported fields.
          </Step>
          <Step n={5} title="Review & edit">
            Pay special attention to the Internal-only fields:
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>
                <strong>Skill ratings</strong> — a plain number out of 5 (e.g. <em>3.8</em>), rendered as
                “(3.8/5)” in the sidebar. The LLM estimates these when the resume doesn&apos;t state them — adjust to
                the candidate&apos;s real level.
              </li>
              <li>
                <strong>Project link</strong> — a public URL, or <em>NDA</em> when it can&apos;t be shared.
              </li>
              <li>
                <strong>Project duration</strong> — shown in the project heading, e.g.{" "}
                <em>Project 1 - Feb 2020 - June 2020</em> (numbering is automatic).
              </li>
              <li>
                <strong>Managerial experience, domains, languages</strong> — short sidebar lists; keep each entry to a
                few words.
              </li>
            </ul>
          </Step>
          <Step n={6} title="Preview">
            Use <strong>Preview</strong> to verify the two-column layout — sidebar content should stay left-aligned
            and the document should start with the name banner followed by Overview on page&nbsp;1. The preview is
            the exact PDF you&apos;ll download.
          </Step>
          <Step n={7} title="Generate">
            Download <strong>DOCX</strong>, <strong>PDF</strong>, or <strong>Both</strong> — both download directly.
            Do a final check in Word / Google Docs.
          </Step>
        </ol>
      </Card>

      <Card title="Tips & troubleshooting">
        <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>
            <strong>Validation fails:</strong> the error list shows the exact field path. Easiest fix — paste the
            errors back to the LLM and ask it to return the corrected, complete JSON.
          </li>
          <li>
            <strong>“Template rendering failed … (tag: ...)”:</strong> a field reached the generator empty or with
            the wrong type; go back one step and re-validate the JSON.
          </li>
          <li>
            <strong>PDF vs DOCX:</strong> the PDF is built directly in the browser with the template&apos;s Lexend
            fonts and logo, and matches the preview exactly. The DOCX is produced from the original Word template —
            page breaks there are governed by Word / Google Docs, so the two can differ slightly.
          </li>
          <li>
            <strong>Editing the document afterwards:</strong> keep the typography consistent by selecting the styles
            named in the <Link href="/style-guide" className="text-brand-600 underline">Style Guide</Link> (Title
            for the name, Subtitle for the designation, Heading&nbsp;1 for section titles like Overview /
            Education&nbsp;&amp;&nbsp;Training, Heading&nbsp;2 for years and project headers, Normal text for body
            content and ratings).
          </li>
        </ul>
      </Card>
    </main>
  );
}
