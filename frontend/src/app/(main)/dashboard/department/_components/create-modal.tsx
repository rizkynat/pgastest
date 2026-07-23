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

interface CreateDepartmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void,
  data: any | null
  onSuccess?: () => void
}

const FormSchema = z.object({
  department_name: z.string().min(2, { message: "Nama departemen harus memiliki minimal 2 karakter." }).max(100),
});

export default function CreateDepartmentModal({
  open,
  onOpenChange,
  data: dataSelected,
  onSuccess,
}: CreateDepartmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      department_name: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    if (dataSelected) {
      form.reset({
        department_name: dataSelected.department_name || "",
      });
    } else {
      form.reset({
        department_name: "",
      });
    }
  }, [dataSelected?.id, open, form]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    try {
      const url = dataSelected
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/departments/${dataSelected.id}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/api/departments/create`;

      const method = dataSelected ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          department_name: data.department_name,
        }),
      });

      if (res.status === 403) {
        throw new Error("Akses ditolak: Hanya Admin yang dapat melakukan aksi ini");
      }

      if (!res.ok) {
        let message = "Anda gagal menyimpan departemen. Silakan coba lagi.";
        try {
          const errorData = await res.json();
          message = errorData.message || message;
        } catch {
          // response bukan JSON, biarkan pakai pesan default
        }
        toast.error(message);
        return;
      }

      toast.success(dataSelected ? "Departemen berhasil diperbarui!" : "Departemen berhasil ditambahkan!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Anda gagal menyimpan departemen. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{dataSelected ? "Edit Departemen" : "Tambah Departemen"}</ModalTitle>
        </ModalHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="department_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Departemen</FormLabel>
                  <FormControl>
                    <Input id="department_name" type="text" placeholder="Contoh: Finance" {...field} />
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