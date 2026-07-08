import { z } from "zod";

const nonEmpty = (label: string) => z.string().trim().min(1, `${label} is required`);

export const educationEntrySchema = z.object({
  year: nonEmpty("year"),
  qualification: nonEmpty("qualification"),
});

/* ---------- External template ---------- */

export const externalProjectSchema = z.object({
  client: nonEmpty("client"),
  teamSize: nonEmpty("teamSize"),
  role: nonEmpty("role"),
  description: nonEmpty("description"),
  responsibilities: z.array(nonEmpty("responsibility")).min(1, "at least one responsibility"),
});

export const externalExperienceSchema = z.object({
  company: nonEmpty("company"),
  position: nonEmpty("position"),
  duration: nonEmpty("duration"),
  highlights: z.array(nonEmpty("highlight")).min(1, "at least one highlight"),
});

export const externalResumeSchema = z.object({
  name: nonEmpty("name"),
  jobTitle: nonEmpty("jobTitle"),
  experienceSummary: nonEmpty("experienceSummary"),
  specialization: nonEmpty("specialization"),
  overview: nonEmpty("overview"),
  education: z
    .array(educationEntrySchema)
    .length(1, "exactly one education entry — the highest qualification only"),
  skills: z.array(nonEmpty("skill")).min(1, "at least one skill"),
  tools: z.array(nonEmpty("tool")).min(1, "at least one tool"),
  certifications: z.array(nonEmpty("certification")).min(1, "at least one certification"),
  projects: z.array(externalProjectSchema),
  experience: z.array(externalExperienceSchema).min(1, "at least one experience entry"),
});

export type ExternalResume = z.infer<typeof externalResumeSchema>;

/* ---------- Internal template ---------- */

export const internalProjectSchema = z.object({
  duration: nonEmpty("duration"),
  title: nonEmpty("title"),
  toolsAndTechnologies: z.array(nonEmpty("tool/technology")).min(1, "at least one tool/technology"),
  teamSize: nonEmpty("teamSize"),
  role: nonEmpty("role"),
  projectLink: nonEmpty("projectLink"),
  description: nonEmpty("description"),
  responsibilities: z.array(nonEmpty("responsibility")).min(1, "at least one responsibility"),
});

export const internalSkillSchema = z.object({
  name: nonEmpty("skill name"),
  rating: nonEmpty("rating"),
});

export const internalResumeSchema = z.object({
  name: nonEmpty("name"),
  jobTitle: nonEmpty("jobTitle"),
  experienceSummary: nonEmpty("experienceSummary"),
  specialization: nonEmpty("specialization"),
  overview: nonEmpty("overview"),
  education: z
    .array(educationEntrySchema)
    .length(1, "exactly one education entry — the highest qualification only"),
  projects: z.array(internalProjectSchema),
  skills: z.array(internalSkillSchema).min(1, "at least one skill"),
  certifications: z.array(nonEmpty("certification")).min(1, "at least one certification"),
  tools: z.array(nonEmpty("tool")).min(1, "at least one tool"),
  managerialExperience: z.array(nonEmpty("managerial experience item")),
  domains: z.array(nonEmpty("domain")).min(1, "at least one domain"),
  languages: z.array(nonEmpty("language")).min(1, "at least one language"),
});

export type InternalResume = z.infer<typeof internalResumeSchema>;

export type TemplateId = "external" | "internal";

export type ResumeData = ExternalResume | InternalResume;

export const schemaFor = (id: TemplateId) =>
  id === "external" ? externalResumeSchema : internalResumeSchema;

/** An empty resume for the "fill in a blank form" flow: every section has one
 *  editable placeholder entry so all form fields render ready to be typed into. */
export function blankResume(id: TemplateId): ResumeData {
  if (id === "external") {
    return {
      name: "",
      jobTitle: "",
      experienceSummary: "",
      specialization: "",
      overview: "",
      education: [{ year: "", qualification: "" }],
      skills: [""],
      tools: [""],
      certifications: [""],
      projects: [{ client: "", teamSize: "", role: "", description: "", responsibilities: [""] }],
      experience: [{ company: "", position: "", duration: "", highlights: [""] }],
    };
  }
  return {
    name: "",
    jobTitle: "",
    experienceSummary: "",
    specialization: "",
    overview: "",
    education: [{ year: "", qualification: "" }],
    projects: [
      { duration: "", title: "", toolsAndTechnologies: [""], teamSize: "", role: "", projectLink: "", description: "", responsibilities: [""] },
    ],
    skills: [{ name: "", rating: "" }],
    certifications: [""],
    tools: [""],
    managerialExperience: [""],
    domains: [""],
    languages: [""],
  };
}
