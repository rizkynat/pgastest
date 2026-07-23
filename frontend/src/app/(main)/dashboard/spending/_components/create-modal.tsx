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

interface CreateSpendingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void,
  data: any | null
  onSuccess?: () => void
}

const FormSchema = z.object({
  employee_id: z.coerce
    .number({ invalid_type_error: "ID Karyawan wajib berupa angka." })
    .int()
    .positive({ message: "ID Karyawan wajib diisi." }),
  spending_date: z
    .string()
    .min(1, { message: "Tanggal spending wajib diisi." }),
  value: z.coerce
    .number({ invalid_type_error: "Nilai wajib berupa angka." })
    .positive({ message: "Nilai harus lebih besar dari 0." }),
});

function toDateInputValue(value: any) {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function CreateSpendingModal({
  open,
  onOpenChange,
  data: dataSelected,
  onSuccess,
}: CreateSpendingModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      employee_id: undefined,
      spending_date: "",
      value: undefined,
    },
  });

  useEffect(() => {
    if (!open) return;

    if (dataSelected) {
      form.reset({
        employee_id: dataSelected.employee_id ?? undefined,
        spending_date: toDateInputValue(dataSelected.spending_date),
        value: dataSelected.value !== undefined ? Number(dataSelected.value) : undefined,
      });
    } else {
      form.reset({
        employee_id: undefined,
        spending_date: "",
        value: undefined,
      });
    }
  }, [dataSelected?.id, open, form]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    try {
      const url = dataSelected
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/spendings/${dataSelected.id}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/api/spendings/create`;

      const method = dataSelected ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: data.employee_id,
          spending_date: data.spending_date,
          value: data.value,
        }),
      });

      if (res.status === 403) {
        throw new Error("Akses ditolak: Hanya Admin yang dapat melakukan aksi ini");
      }

      if (!res.ok) {
        let message = "Anda gagal menyimpan spending. Silakan coba lagi.";
        try {
          const errorData = await res.json();
          message = errorData.message || message;
        } catch {
          // response bukan JSON, biarkan pakai pesan default
        }
        toast.error(message);
        return;
      }

      toast.success(dataSelected ? "Spending berhasil diperbarui!" : "Spending berhasil ditambahkan!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Anda gagal menyimpan spending. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{dataSelected ? "Edit Spending" : "Tambah Spending"}</ModalTitle>
        </ModalHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Karyawan</FormLabel>
                  <FormControl>
                    <Input
                      id="employee_id"
                      type="number"
                      placeholder="Contoh: 1"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="spending_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Spending</FormLabel>
                  <FormControl>
                    <Input id="spending_date" type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nilai</FormLabel>
                  <FormControl>
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      placeholder="Contoh: 150000"
                      {...field}
                      value={field.value ?? ""}
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
