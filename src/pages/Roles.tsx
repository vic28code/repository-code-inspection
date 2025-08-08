import React, { useEffect, useMemo, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Rol {
  id: number;
  nombre: string;
  permisos: string[];
}

const permisosDisponibles = [
  { id: "gestionar_kioskos", label: "Gestionar kioskos" },
  { id: "ver_reportes", label: "Ver reportes" },
  { id: "crear_usuarios", label: "Crear usuarios" },
  { id: "editar_usuarios", label: "Editar usuarios" },
  { id: "gestionar_roles", label: "Gestionar roles" },
  { id: "gestionar_publicidad", label: "Gestionar publicidad" },
  { id: "gestionar_pantallas", label: "Gestionar pantallas" },
] as const;

const schema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  permisos: z
    .array(z.string())
    .min(1, "Selecciona al menos un permiso"),
});

type FormValues = z.infer<typeof schema>;

const inicial: Rol[] = [
  { id: 1, nombre: "Técnico", permisos: ["gestionar_kioskos", "gestionar_pantallas"] },
  { id: 2, nombre: "Gerente", permisos: ["ver_reportes"] },
  { id: 3, nombre: "Administrador", permisos: permisosDisponibles.map(p => p.id) },
];

export default function Roles() {
  const [roles, setRoles] = useState<Rol[]>(inicial);
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState<Rol | null>(null);
  const { toast } = useToast();

  // SEO básico
  useEffect(() => {
    document.title = "Roles y permisos | Panel";
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
      "Crea y edita roles con permisos asignables. Prototipo con validaciones."
    );
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", `${window.location.origin}/roles`);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      permisos: [],
    },
    mode: "onBlur",
  });

  const onNuevo = () => {
    setEditando(null);
    form.reset({ nombre: "", permisos: [] });
    setOpen(true);
  };

  const onEditar = (r: Rol) => {
    setEditando(r);
    form.reset({ nombre: r.nombre, permisos: r.permisos });
    setOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    if (editando) {
      setRoles((prev) => prev.map((r) => (r.id === editando.id ? { ...r, ...values } : r)));
      toast({ title: "Rol actualizado", description: `${values.nombre} fue editado.` });
    } else {
      const nuevoId = Math.max(0, ...roles.map((r) => r.id)) + 1;
      const nuevo: Rol = {
        id: nuevoId,
        nombre: values.nombre,
        permisos: values.permisos,
      };
      setRoles((prev) => [nuevo, ...prev]);
      toast({ title: "Rol creado", description: `${values.nombre} fue agregado.` });
    }
    setOpen(false);
  };

  const etiquetaPermiso = (id: string) => permisosDisponibles.find((p) => p.id === id)?.label ?? id;

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Roles</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={onNuevo}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo rol
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editando ? "Editar rol" : "Nuevo rol"}</DialogTitle>
              <DialogDescription>
                {editando
                  ? "Actualiza el nombre y los permisos del rol."
                  : "Define un nombre y selecciona permisos para el nuevo rol."}
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
                        <Input placeholder="Nombre del rol" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="permisos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permisos</FormLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {permisosDisponibles.map((perm) => {
                          const checked = field.value?.includes(perm.id);
                          return (
                            <label key={perm.id} className="flex items-center gap-2">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(v) => {
                                  const isChecked = Boolean(v);
                                  if (isChecked) field.onChange([...(field.value ?? []), perm.id]);
                                  else field.onChange((field.value ?? []).filter((p: string) => p !== perm.id));
                                }}
                              />
                              <span>{perm.label}</span>
                            </label>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit">{editando ? "Guardar cambios" : "Crear rol"}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </header>

      <section>
        <Table>
          <TableCaption>Listado de roles y permisos</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Permisos</TableHead>
              <TableHead className="w-[120px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.nombre}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {r.permisos.map((p) => (
                      <Badge key={p} variant="secondary">{etiquetaPermiso(p)}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => onEditar(r)}>
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
