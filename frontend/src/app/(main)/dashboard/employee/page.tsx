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
    { key: "employee_id", label: "ID", type: "number", sortable: false, hidden: true },
    { key: "employee_name", label: "Nama Karyawan", type: "string", sortable: true },
    { key: "department_id", label: "Departemen", type: "string", sortable: true }
  ];

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <TableCardsWrapper
        title="Manajemen Karyawan"
        description="Atur dan kelola karyawan"
        columnsMeta={columnsMeta}
      />
    </div>
  );
}
