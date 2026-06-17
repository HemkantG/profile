"use client";

import type { ExternalResume } from "@/lib/schemas";
import { AddButton, AreaField, Field, ItemCard, Section, StringListEditor, moveItem } from "./fields";

export default function ExternalForm({
  data,
  onChange,
}: {
  data: ExternalResume;
  onChange: (data: ExternalResume) => void;
}) {
  const set = <K extends keyof ExternalResume>(key: K, value: ExternalResume[K]) =>
    onChange({ ...data, [key]: value });

  return (
    <div className="space-y-5">
      <Section title="Profile">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={data.name} onChange={(v) => set("name", v)} />
          <Field label="Job title" value={data.jobTitle} onChange={(v) => set("jobTitle", v)} />
          <Field label="Experience summary" value={data.experienceSummary} onChange={(v) => set("experienceSummary", v)} />
          <Field label="Specialization" value={data.specialization} onChange={(v) => set("specialization", v)} />
        </div>
        <AreaField label="Overview" value={data.overview} onChange={(v) => set("overview", v)} />
      </Section>

      <Section
        title="Education & Training"
        actions={<AddButton label="Add entry" onClick={() => set("education", [...data.education, { year: "", qualification: "" }])} />}
      >
        {data.education.map((edu, i) => (
          <ItemCard
            key={i}
            title={`Entry ${i + 1}`}
            index={i}
            length={data.education.length}
            onMove={(from, to) => set("education", moveItem(data.education, from, to))}
            onRemove={(idx) => set("education", data.education.filter((_, j) => j !== idx))}
          >
            <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
              <Field label="Year" value={edu.year} onChange={(v) => set("education", data.education.map((e, j) => (j === i ? { ...e, year: v } : e)))} />
              <Field label="Qualification" value={edu.qualification} onChange={(v) => set("education", data.education.map((e, j) => (j === i ? { ...e, qualification: v } : e)))} />
            </div>
          </ItemCard>
        ))}
      </Section>

      <Section title="Skills">
        <StringListEditor items={data.skills} onChange={(v) => set("skills", v)} addLabel="Add skill" />
      </Section>

      <Section title="Tools / Certifications">
        <StringListEditor items={data.toolsAndCertifications} onChange={(v) => set("toolsAndCertifications", v)} addLabel="Add tool/certification" />
      </Section>

      <Section
        title="Projects"
        actions={
          <AddButton
            label="Add project"
            onClick={() =>
              set("projects", [...data.projects, { client: "", teamSize: "", role: "", description: "", responsibilities: [""] }])
            }
          />
        }
      >
        {data.projects.map((p, i) => {
          const setP = (patch: Partial<ExternalResume["projects"][number]>) =>
            set("projects", data.projects.map((x, j) => (j === i ? { ...x, ...patch } : x)));
          return (
            <ItemCard
              key={i}
              title={`Project ${i + 1}`}
              index={i}
              length={data.projects.length}
              onMove={(from, to) => set("projects", moveItem(data.projects, from, to))}
              onRemove={(idx) => set("projects", data.projects.filter((_, j) => j !== idx))}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Client" value={p.client} onChange={(v) => setP({ client: v })} />
                <Field label="Team size" value={p.teamSize} onChange={(v) => setP({ teamSize: v })} />
              </div>
              <Field label="Role" value={p.role} onChange={(v) => setP({ role: v })} />
              <AreaField label="Description" value={p.description} onChange={(v) => setP({ description: v })} />
              <StringListEditor
                label="Responsibilities (bullets)"
                items={p.responsibilities}
                onChange={(v) => setP({ responsibilities: v })}
                addLabel="Add responsibility"
                multiline
              />
            </ItemCard>
          );
        })}
      </Section>

      <Section
        title="Experience"
        actions={
          <AddButton
            label="Add employer"
            onClick={() => set("experience", [...data.experience, { company: "", position: "", duration: "", highlights: [""] }])}
          />
        }
      >
        {data.experience.map((e, i) => {
          const setE = (patch: Partial<ExternalResume["experience"][number]>) =>
            set("experience", data.experience.map((x, j) => (j === i ? { ...x, ...patch } : x)));
          return (
            <ItemCard
              key={i}
              title={`Employer ${i + 1}`}
              index={i}
              length={data.experience.length}
              onMove={(from, to) => set("experience", moveItem(data.experience, from, to))}
              onRemove={(idx) => set("experience", data.experience.filter((_, j) => j !== idx))}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Company" value={e.company} onChange={(v) => setE({ company: v })} />
                <Field label="Position" value={e.position} onChange={(v) => setE({ position: v })} />
                <Field label="Duration" value={e.duration} onChange={(v) => setE({ duration: v })} />
              </div>
              <StringListEditor
                label="Highlights (bullets)"
                items={e.highlights}
                onChange={(v) => setE({ highlights: v })}
                addLabel="Add highlight"
                multiline
              />
            </ItemCard>
          );
        })}
      </Section>
    </div>
  );
}
