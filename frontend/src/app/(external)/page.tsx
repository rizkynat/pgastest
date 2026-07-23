import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard/main");
  return <>Coming Soon</>;
}
