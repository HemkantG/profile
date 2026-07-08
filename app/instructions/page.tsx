import { redirect } from "next/navigation";

// Bare /instructions has no audience context; default to the employee (internal-only) version.
export default function InstructionsRedirect() {
  redirect("/employee/instructions");
}
