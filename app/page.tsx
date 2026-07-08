import { redirect } from "next/navigation";

// Bare domain lands on the least-privileged flow; HR uses the separate /hr URL.
export default function Home() {
  redirect("/employee");
}
