import type { TemplateId } from "./schemas";

const COMMON_RULES = `You are a resume data extractor. Read the attached resume file carefully and extract its content into the JSON structure described below.

STRICT OUTPUT RULES:
- Output ONLY a single valid JSON object. No markdown, no code fences, no comments, no explanations before or after.
- Every scalar field listed in the schema is required unless marked optional. If the resume does not contain a value, write a sensible short placeholder such as "N/A" rather than omitting the field.
- For list/array sections, only include entries that exist in the resume. If a whole section has no real entries (e.g. no projects), output an empty array [] — never fabricate a placeholder entry filled with "N/A".
- All values are strings or arrays as specified — never null or numbers.
- Do not invent facts. Rephrase only for brevity and professional tone; keep all real names, dates, technologies and figures from the resume.`;

const EXTERNAL_SCHEMA = `JSON SCHEMA (field -> description):
{
  "name": string,                  // Candidate full name, e.g. "Amit Dave"
  "jobTitle": string,              // Current/target designation, e.g. "Senior Project Lead"
  "experienceSummary": string,     // One line of total experience, e.g. "3+ years of Industry Experience"
  "specialization": string,        // Primary specialization line, e.g. "ServiceNow ITSM"
  "overview": string,              // 3-5 sentence professional summary paragraph
  "education": [                   // One entry per degree/training, most recent first
    { "year": string,              // Completion year, e.g. "2008"
      "qualification": string }    // Degree + institution, e.g. "Bachelor of Engineering (IT), RGPV Bhopal"
  ],
  "skills": [string],              // Flat list of skills, e.g. ["JavaScript", "ReactJS", "Team Management"]
  "toolsAndCertifications": [string], // Tools and certifications, e.g. ["JIRA", "GIT", "ServiceNow CSA"]
  "projects": [                    // One entry per project (numbering is added automatically); use [] if none
    { "client": string,            // Client/project name, e.g. "Bharti Airtel, Africa"
      "teamSize": string,          // e.g. "5"
      "role": string,              // Candidate's role on the project, e.g. "Developer and Tester"
      "description": string,       // 2-4 sentence paragraph describing the project and contribution
      "responsibilities": [string] // 4-8 bullet points, each a single past-tense sentence
    }
  ],
  "experience": [                  // One entry per employer, most recent first
    { "company": string,           // e.g. "Accenture"
      "position": string,          // e.g. "ServiceNow Developer"
      "duration": string,          // e.g. "2023 - Present"
      "highlights": [string]       // 4-8 achievement bullet points, each a single sentence
    }
  ]
}`;

const EXTERNAL_EXAMPLE = `EXAMPLE OUTPUT (format reference only — use the actual resume content):
{"name":"Amit Dave","jobTitle":"Senior Project Lead","experienceSummary":"3+ years of Industry Experience","specialization":"ServiceNow ITSM","overview":"ServiceNow professional with 3+ years of experience specializing in ITSM. Skilled in development, configuration and customization of ServiceNow modules. Experienced in workflow automation and cross-functional collaboration.","education":[{"year":"2008","qualification":"Bachelor of Engineering (IT), RGPV Bhopal"}],"skills":["JavaScript","WordPress","MySQL","ReactJS","Team Management"],"toolsAndCertifications":["JIRA","SVN","GIT"],"projects":[{"client":"Bharti Airtel, Africa","teamSize":"5","role":"Developer and Tester","description":"Worked on a client project involving report mapping and report generation using Crystal Reports, with end-to-end testing based on customized use cases.","responsibilities":["Worked on report mapping and report generation using Crystal Reports.","Designed and executed test cases for customized client requirements.","Performed end-to-end application testing and validation."]}],"experience":[{"company":"Accenture","position":"ServiceNow Developer","duration":"2023 - Present","highlights":["Configured and customized ITSM, HRSD, and ITBM modules to improve workflow efficiency by 40%.","Developed business rules, client scripts, and UI policies to enhance performance."]}]}`;

const INTERNAL_SCHEMA = `JSON SCHEMA (field -> description):
{
  "name": string,                  // Candidate full name, e.g. "Amit Dave"
  "jobTitle": string,              // Current/target designation, e.g. "Senior Project Lead"
  "experienceSummary": string,     // One line of total experience, e.g. "3+ years of Industry Experience"
  "specialization": string,        // Primary specialization line, e.g. "ServiceNow ITSM"
  "overview": string,              // 3-5 sentence professional summary paragraph
  "education": [                   // One entry per degree/training, most recent first
    { "year": string,              // Completion year, e.g. "2008"
      "qualification": string }    // Degree + institution, e.g. "Bachelor of Engineering (IT), RGPV Bhopal"
  ],
  "projects": [                    // One entry per project, most recent first (numbering is added automatically); use [] if none
    { "duration": string,          // Project period, e.g. "Feb 2020 - June 2020"
      "title": string,             // Project title, e.g. "National College Admissions Consulting site"
      "toolsAndTechnologies": [string], // e.g. ["Node", "HTML", "MySQL", "React"]
      "teamSize": string,          // e.g. "3"
      "role": string,              // e.g. "Project Lead"
      "projectLink": string,       // URL if public, otherwise "NDA"
      "description": string,       // 2-4 sentence paragraph describing the project
      "responsibilities": [string] // 4-8 bullet points, each a single past-tense sentence
    }
  ],
  "skills": [                      // One entry per skill, shown in the sidebar with a rating
    { "name": string,              // e.g. "ReactJS"
      "rating": string }           // Self-rating out of 5 as a plain number string, e.g. "3.8" (rendered as "(3.8/5)"). Estimate from prominence/experience if not stated.
  ],
  "certifications": [string],      // e.g. ["ServiceNow ITSM"]
  "tools": [string],               // e.g. ["JIRA", "SVN", "GIT"]
  "managerialExperience": [string],// Managerial capabilities, e.g. ["Project Management", "Team Building"]; use [] if none
  "domains": [string],             // Business domains worked in, e.g. ["Healthcare", "E-commerce"]
  "languages": [string]            // Spoken languages, e.g. ["English", "Hindi"]
}`;

const INTERNAL_EXAMPLE = `EXAMPLE OUTPUT (format reference only — use the actual resume content):
{"name":"Amit Dave","jobTitle":"Senior Project Lead","experienceSummary":"3+ years of Industry Experience","specialization":"ServiceNow ITSM","overview":"ServiceNow professional with 3+ years of industry experience specializing in ITSM. Skilled in development, configuration, customization and implementation of ITSM modules.","education":[{"year":"2008","qualification":"Bachelor of Engineering (IT), RGPV Bhopal"}],"projects":[{"duration":"Feb 2020 - June 2020","title":"National College Admissions Consulting site","toolsAndTechnologies":["Node","HTML","MySQL","CSS","React","PayPal"],"teamSize":"3","role":"Project Lead","projectLink":"NDA","description":"Developed a web-based college admissions consulting platform that connects students with experienced former admissions officers for personalized application reviews and guidance.","responsibilities":["Led end-to-end development of a college admissions consulting platform.","Developed frontend and backend modules using React, Node.js, and MySQL.","Integrated PayPal payment gateway for secure online transactions."]}],"skills":[{"name":"Java script","rating":"3.5"},{"name":"ReactJS","rating":"3.8"}],"certifications":["ServiceNow ITSM"],"tools":["JIRA","SVN","GIT"],"managerialExperience":["Project Management","Team Building"],"domains":["Healthcare","E-commerce"],"languages":["English","Hindi"]}`;

export function promptFor(id: TemplateId): string {
  const schema = id === "external" ? EXTERNAL_SCHEMA : INTERNAL_SCHEMA;
  const example = id === "external" ? EXTERNAL_EXAMPLE : INTERNAL_EXAMPLE;
  return `${COMMON_RULES}\n\n${schema}\n\n${example}`;
}
