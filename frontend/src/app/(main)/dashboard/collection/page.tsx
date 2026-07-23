import { cookies } from "next/headers";
import { TableCardsWrapper } from "./_components/table-cards-wrapper";
import { redirect } from "next/navigation";
import { collectionColumnsMeta } from "./_components/columns-config";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <TableCardsWrapper
        title="Collection"
        description="Menu data collection"
        columnsMeta={collectionColumnsMeta}
      />
    </div>
  );
}
