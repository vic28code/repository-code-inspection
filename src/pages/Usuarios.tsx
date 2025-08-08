import React from "react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Plus } from "lucide-react";

// Tipos
interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  sucursal: string;
}

const sucursales = ["Sucursal Centro", "Sucursal Norte", "Sucursal Sur"];
const rolesPosibles = ["Técnico", "Gerente", "Administrador"];

// Esquema de validación
const schema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  correo: z
    .string()
    .email("Ingresa un correo válido"),
  rol: z.string().min(1, "El rol es obligatorio"),
  sucursal: z.string().min(1, "La sucursal es obligatoria"),
});

type FormValues = z.infer<typeof schema>;

const initialData: Usuario[] = [
  {
    id: 1,
    nombre: "María Gómez",
    correo: "maria.gomez@empresa.com",
    rol: "Gerente",
    sucursal: "Sucursal Centro",
  },
  {
    id: 2,
    nombre: "Juan Pérez",
    correo: "juan.perez@empresa.com",
    rol: "Técnico",
    sucursal: "Sucursal Norte",
  },
  {
    id: 3,
    nombre: "Ana López",
    correo: "ana.lopez@empresa.com",
    rol: "Administrador",
    sucursal: "Sucursal Sur",
  },
];

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialData);
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const { toast } = useToast();

  // SEO básico
  useEffect(() => {
    document.title = "Usuarios administrativos | Panel";
    const ensureMeta = (name: string) => {
      let m = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!m) {
        m = document.createElement("meta");
        m.setAttribute("name", name);
        document.head.appendChild(m);
      }
      return m;
    };
    const md = ensureMeta("description");
    md.setAttribute(
      "content",
      "Gestión de usuarios administrativos: listar, crear y editar con validaciones."
    );
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", `${window.location.origin}/usuarios`);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      correo: "",
      rol: "",
      sucursal: "",
    },
    mode: "onBlur",
  });

  const onNueva = () => {
    setEditando(null);
    form.reset({ nombre: "", correo: "", rol: "", sucursal: "" });
    setOpen(true);
  };

  const onEditar = (u: Usuario) => {
    setEditando(u);
    form.reset({
      nombre: u.nombre,
      correo: u.correo,
      rol: u.rol,
      sucursal: u.sucursal,
    });
    setOpen(true);
  };

  const correosExistentes = useMemo(
    () => new Set(usuarios.map((u) => u.correo.toLowerCase())),
    [usuarios]
  );

  const onSubmit = (values: FormValues) => {
    // Validación de duplicado (case-insensitive)
    const esMismoCorreo = (email: string) =>
      editando && editando.correo.toLowerCase() === email.toLowerCase();

    if (correosExistentes.has(values.correo.toLowerCase()) && !esMismoCorreo(values.correo)) {
      form.setError("correo", {
        type: "manual",
        message: "El correo ya existe",
      });
      return;
    }

    if (editando) {
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === editando.id
            ? { ...u, ...values }
            : u
        )
      );
      toast({ title: "Usuario actualizado", description: `${values.nombre} fue editado.` });
    } else {
      const nuevoId = Math.max(0, ...usuarios.map((u) => u.id)) + 1;
      const nuevo: Usuario = {
        id: nuevoId,
        nombre: values.nombre,
        correo: values.correo,
        rol: values.rol,
        sucursal: values.sucursal,
      };
      setUsuarios((prev) => [nuevo, ...prev]);
      toast({ title: "Usuario creado", description: `${values.nombre} fue agregado.` });
    }

    setOpen(false);
  };

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={onNueva}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editando ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
              <DialogDescription>
                {editando
                  ? "Actualiza los datos del usuario."
                  : "Completa el formulario para crear un nuevo usuario."}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="correo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo</FormLabel>
                      <FormControl>
                        <Input placeholder="correo@empresa.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="rol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rol</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent>
                              {rolesPosibles.map((r) => (
                                <SelectItem key={r} value={r}>
                                  {r}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sucursal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sucursal</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una sucursal" />
                            </SelectTrigger>
                            <SelectContent>
                              {sucursales.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit">{editando ? "Guardar cambios" : "Crear usuario"}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </header>

      <section>
        <Table>
          <TableCaption>Listado de usuarios administrativos</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Sucursal</TableHead>
              <TableHead className="w-[120px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.nombre}</TableCell>
                <TableCell>{u.correo}</TableCell>
                <TableCell>{u.rol}</TableCell>
                <TableCell>{u.sucursal}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => onEditar(u)}>
                    <Pencil className="mr-2 h-4 w-4" /> Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </main>
  );
}
