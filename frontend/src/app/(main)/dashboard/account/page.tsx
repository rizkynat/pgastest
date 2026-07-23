import { cookies } from "next/headers";
import { TableCardsWrapper } from "./_components/table-cards-wrapper";
import { redirect } from "next/navigation";
import { ColumnMeta } from "@/components/data-table/dynamic-columns";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  // Definisikan meta kolom secara statis untuk contoh
  // Dalam praktiknya, ini bisa dari API juga
  const columnsMeta: ColumnMeta[] = [
    { key: "id", label: "ID", type: "number", sortable: false, hidden: true },
    { key: "full_name", label: "Nama Lengkap", type: "string", sortable: true },
    { key: "email", label: "Email", type: "string", sortable: true },
    { key: "role", label: "Peran", type: "badge", sortable: false },
    { key: "is_active", label: "Status Akun", type: "badge", sortable: false },
  ];

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <TableCardsWrapper
        title="Manajemen Akun"
        description="Atur dan kelola akun pengguna"
        columnsMeta={columnsMeta}
      />
    </div>
  );
}
