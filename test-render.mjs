import fs from "node:fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const external = {
  name: "Jane Doe",
  jobTitle: "Lead Engineer",
  experienceSummary: "8+ years of Industry Experience",
  specialization: "Cloud Platforms",
  overview: "Seasoned engineer with broad platform experience.",
  education: [
    { year: "2015", qualification: "M.Tech (CS), IIT Delhi" },
    { year: "2012", qualification: "B.E. (IT), RGPV Bhopal" },
  ],
  skills: "AWS, Terraform, Go",
  toolsAndCertifications: "JIRA, GIT, AWS SA Pro",
  projects: [
    { number: 1, client: "Acme Corp", teamSize: "6", role: "Tech Lead", description: "Migrated workloads to AWS.", responsibilities: ["Led migration.", "Cut costs 30%."] },
    { number: 2, client: "Globex", teamSize: "4", role: "Developer", description: "Built data pipeline.", responsibilities: ["Designed ETL.", "Automated reports."] },
  ],
  experience: [
    { company: "Accenture", position: "Senior Engineer", duration: "2020 - Present", highlights: ["Shipped platform v2.", "Mentored 5 engineers."] },
    { company: "Infosys", position: "Engineer", duration: "2015 - 2020", highlights: ["Built APIs.", "Improved uptime."] },
  ],
};

const internal = {
  name: "Jane Doe",
  jobTitle: "Lead Engineer",
  experienceSummary: "8+ years of Industry Experience",
  specialization: "Cloud Platforms",
  overview: "Seasoned engineer with broad platform experience.",
  education: [
    { year: "2015", qualification: "M.Tech (CS), IIT Delhi" },
    { year: "2012", qualification: "B.E. (IT), RGPV Bhopal" },
  ],
  projects: [
    { number: 1, duration: "Jan 2023 - Dec 2023", title: "Payments Platform", toolsAndTechnologies: "Go, Postgres, K8s", teamSize: "6", role: "Tech Lead", projectLink: "NDA", description: "Built a payments platform.", responsibilities: ["Led design.", "Shipped v1."] },
    { number: 2, duration: "Feb 2022 - Nov 2022", title: "Analytics Hub", toolsAndTechnologies: "Python, Spark", teamSize: "3", role: "Developer", projectLink: "https://example.com", description: "Built analytics hub.", responsibilities: ["Built ETL.", "Created dashboards."] },
  ],
  skills: [
    { name: "Go", rating: "4.5" },
    { name: "AWS", rating: "4" },
    { name: "React", rating: "3.5" },
  ],
  certifications: ["AWS SA Pro", "CKA"],
  tools: "JIRA, GIT",
  managerialExperience: ["Project Management", "Team Building"],
  domains: ["Fintech", "Healthcare"],
  languages: ["English", "Hindi"],
};

// mirror prepareData: the internal template hides its "Projects" heading via {#hasProjects}
const prep = (id, data) =>
  id === "internal" ? { ...data, hasProjects: data.projects.length > 0 } : data;

function render(id, data) {
  const zip = new PizZip(fs.readFileSync(`public/templates/${id}.docx`));
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
  try {
    doc.render(prep(id, data));
  } catch (e) {
    console.error(`${id}: RENDER FAILED`);
    console.error(JSON.stringify(e.properties?.errors?.map((x) => x.properties) ?? e.message, null, 2));
    process.exit(1);
  }
  const xml = doc.getZip().file("word/document.xml").asText();
  const leftover = xml.replace(/<[^>]+>/g, "").match(/\{[^}]*\}/g);
  if (leftover) {
    console.error(`${id}: leftover tags: ${leftover}`);
    process.exit(1);
  }
  fs.writeFileSync(`/tmp/out-${id}.docx`, doc.getZip().generate({ type: "nodebuffer" }));
  return xml.replace(/<[^>]+>/g, "");
}

for (const [id, data] of [["external", external], ["internal", internal]]) {
  render(id, data);
  console.log(`${id}: rendered OK, leftover tags: none`);
}

// empty-projects case: the internal "Projects" heading must be fully omitted
const internalText = render("internal", { ...internal, projects: [] });
if (/Projects/.test(internalText)) {
  console.error("internal(empty projects): 'Projects' heading should be omitted but was found");
  process.exit(1);
}
render("external", { ...external, projects: [] }); // must still render (shared Projects/Experience heading)
console.log("empty-projects: internal heading omitted, external OK");
console.log("done");
