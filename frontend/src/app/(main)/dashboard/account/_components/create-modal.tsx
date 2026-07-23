"use client"

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { number, z } from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileInput } from "@/components/ui/file-input";

interface CreateAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void,
  data: any | null
  onSuccess?: () => void
}

const FormSchema = z.object({
  full_name: z.string().min(2, { message: "Nama lengkap harus memiliki minimal 2 karakter." }),
  email: z.string().email({ message: "Silahkan masukkan alamat email yang valid." }),
  number_phone: z.string().optional(),
  nik: z.string().optional(),
  photo: z.any().optional(),
  password: z.string().min(6, { message: "Password harus memiliki minimal 6 karakter." }),
  role: z.enum(["ADMIN", "USER"], { message: "Peran harus dipilih." }),
  is_active: z.boolean().default(true),
  remember: z.boolean().optional(),
});

export default function CreateAccountModal({
  open,
  onOpenChange,
  data: dataSelected,
  onSuccess,
}: CreateAccountModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      number_phone: "",
      nik: "",
      photo: "",
      password: "",
      role: "MAKER",
      is_active: true,
      remember: false,
    },
  });

  useEffect(() => {
    if (!open) return;

    if (dataSelected) {
      form.reset({
        full_name: dataSelected.full_name || "",
        email: dataSelected.email || "",
        number_phone: dataSelected.number_phone || "",
        nik: dataSelected.nik || "",
        photo: dataSelected.photo || "",
        password: "", // biasanya password tidak diisi saat edit
        role: dataSelected.role || "MAKER",
        is_active: dataSelected.is_active ?? true,
        remember: false,
      });
      // 👉 set preview dari URL backend
      setPreview(`${process.env.NEXT_PUBLIC_BASE_URL}/uploads/` + dataSelected.photo || null);
    } else {
      form.reset({
        full_name: "",
        email: "",
        number_phone: "",
        nik: "",
        photo: "",
        password: "",
        role: "USER",
        is_active: true,
        remember: false,
      });
      setPreview(null);
    }
  }, [dataSelected?.id, open]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    try {
      const url = dataSelected
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${dataSelected.id}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/register`;

      const method = dataSelected ? "PATCH" : "POST";

      const formData = new FormData();

      formData.append("full_name", data.full_name);
      formData.append("email", data.email);
      formData.append("number_phone", data.number_phone || "");
      formData.append("nik", data.nik || "");
      formData.append("role", data.role);
      formData.append("is_active", String(data.is_active));
      formData.append("password", data.password);

      if (data.photo instanceof File) {
        formData.append("photo", data.photo);
      }

      const res = await fetch(url, {
        method: method,
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || "Anda gagal menambahkan akun. Silakan coba lagi.");
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
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input id="full_name" type="string" placeholder="John Doe" autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Email</FormLabel>
                  <FormControl>
                    <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="number_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon</FormLabel>
                  <FormControl>
                    <Input id="number_phone" type="number" placeholder="081234567890" autoComplete="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nik"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIK</FormLabel>
                  <FormControl>
                    <Input id="nik" type="number" placeholder="34329302773" autoComplete="nik" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto</FormLabel>
                  <FormControl>
                    <FileInput
                      id="photo"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        field.onChange(file);

                        if (file) {
                          const url = URL.createObjectURL(file);
                          console.log(url)
                          setPreview(url);
                        }
                      }}
                    />

                  </FormControl>
                  {preview && (
                    <div className="mt-3">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peran</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih peran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="USER">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Akun</FormLabel>
                  <FormControl>
                    <Checkbox
                      id="is_active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kata Sandi</FormLabel>
                  <FormControl>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...field}
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
