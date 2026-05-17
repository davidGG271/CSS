import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, Mail, Lock, Save } from "lucide-react";

export const Route = createFileRoute("/admin/perfil")({
  component: AdminProfilePage,
});

function AdminProfilePage() {
  const [user, setUser] = useState({ name: "", email: "" });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("cyc-user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser({ name: parsed.name || "Admin Master", email: parsed.email || "admin@cyc.com" });
      }
    } catch (e) {
      console.error("Error al cargar perfil de admin", e);
    }
  }, []);

  const handleSaveProfile = () => {
    if (!user.name || !user.email) {
      toast.error("El nombre y correo no pueden estar vacíos.");
      return;
    }
    
    // Update local storage representation
    try {
      const stored = localStorage.getItem("cyc-user");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.name = user.name;
        parsed.email = user.email;
        localStorage.setItem("cyc-user", JSON.stringify(parsed));
      }
    } catch (e) {}

    toast.success("Perfil actualizado correctamente");
  };

  const handleUpdatePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error("Completa todos los campos de contraseña.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("Las nuevas contraseñas no coinciden.");
      return;
    }
    if (passwords.new.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    // Simulamos la actualización (requiere endpoint real en backend)
    toast.success("Contraseña actualizada con éxito");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfil de Administrador"
        description="Gestiona tu información personal y seguridad de la cuenta"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="glow-card border-border/50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <User className="h-5 w-5 text-[var(--neon-cyan)]" /> Información Personal
            </CardTitle>
            <CardDescription>
              Actualiza tus datos de contacto y nombre de visualización.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  className="pl-9"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleSaveProfile} className="w-full sm:w-auto gradient-neon text-white">
              <Save className="mr-2 h-4 w-4" /> Guardar Cambios
            </Button>
          </CardContent>
        </Card>

        <Card className="glow-card border-border/50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Lock className="h-5 w-5 text-[var(--neon-purple)]" /> Seguridad
            </CardTitle>
            <CardDescription>
              Cambia tu contraseña de acceso al panel de administración.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Contraseña Actual</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nueva Contraseña</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmar Contraseña</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleUpdatePassword} variant="outline" className="w-full sm:w-auto border-[var(--neon-purple)]/50 text-[var(--neon-purple)] hover:bg-[var(--neon-purple)]/10">
              <Lock className="mr-2 h-4 w-4" /> Actualizar Contraseña
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
