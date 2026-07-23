"use client"

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CreateAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void,
  data: any | null
  onSuccess?: () => void
}

const FormSchema = z.object({
  employee_name: z.string().min(2, { message: "Nama karyawan harus memiliki minimal 2 karakter." }),
  department_id: z.coerce
    .number({ invalid_type_error: "Departemen wajib diisi dengan angka." })
    .min(1, { message: "Departemen wajib dipilih." }),
});

export default function CreateAccountModal({
  open,
  onOpenChange,
  data: dataSelected,
  onSuccess,
}: CreateAccountModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      employee_name: "",
      department_id: undefined,
    },
  });

  useEffect(() => {
    if (!open) return;

    if (dataSelected) {
      form.reset({
        employee_name: dataSelected.employee_name || "",
        department_id: dataSelected.department_id ?? undefined,
      });
    } else {
      form.reset({
        employee_name: "",
        department_id: undefined,
      });
    }
  }, [dataSelected?.id, open, form]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    try {
      const url = dataSelected
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/employees/${dataSelected.id}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/api/employees/create`;

      const method = dataSelected ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_name: data.employee_name,
          department_id: data.department_id,
        }),
      });

      if (res.status === 403) {
        throw new Error("Akses ditolak: Hanya Admin yang dapat melakukan aksi ini");
      }

      if (!res.ok) {
        let message = "Anda gagal menambahkan akun. Silakan coba lagi.";
        try {
          const errorData = await res.json();
          message = errorData.message || message;
        } catch {
          // response bukan JSON, biarkan pakai pesan default
        }
        toast.error(message);
        return;
      }

      toast.success(dataSelected ? "Anda berhasil memperbarui akun!" : "Anda berhasil menambahkan akun!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Anda gagal menambahkan akun. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{dataSelected ? "Edit Akun" : "Tambah Akun"}</ModalTitle>
        </ModalHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employee_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Karyawan</FormLabel>
                  <FormControl>
                    <Input id="employee_name" type="text" placeholder="John Doe" autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departemen</FormLabel>
                  <FormControl>
                    <Input
                      id="department_id"
                      type="number"
                      placeholder="Masukkan ID departemen"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Submit"}
            </Button>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  )
}