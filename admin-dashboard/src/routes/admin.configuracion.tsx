import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdmin } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/configuracion")({
  component: SettingsPage,
});

function SettingsPage() {
  const settings = useAdmin((s) => s.settings);
  const update = useAdmin((s) => s.updateSettings);
  const reset = useAdmin((s) => s.resetData);
  const { theme, setTheme } = useTheme();
  const [form, setForm] = useState(settings);

  return (
    <div className="space-y-6">
      <PageHeader title="Configuración" description="Ajustes generales del panel" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="glow-card border-border/50">
          <CardHeader><CardTitle className="font-display">Tienda</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5"><Label>Nombre de la tienda</Label><Input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Logo (texto)</Label><Input maxLength={3} value={form.logoText} onChange={(e) => setForm({ ...form, logoText: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Impuesto (%)</Label><Input type="number" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: +e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Moneda</Label><Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>Envío estándar</Label><Input type="number" value={form.shippingFlat} onChange={(e) => setForm({ ...form, shippingFlat: +e.target.value })} /></div>
            <Button onClick={() => { update(form); toast.success("Configuración guardada"); }} className="gradient-neon text-white">
              <Save className="mr-1 h-4 w-4" /> Guardar
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="glow-card border-border/50">
            <CardHeader><CardTitle className="font-display">Apariencia</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")} className={theme === "dark" ? "gradient-neon text-white" : ""}>Oscuro</Button>
                <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")} className={theme === "light" ? "gradient-neon text-white" : ""}>Claro</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glow-card border-border/50">
            <CardHeader><CardTitle className="font-display">Métodos de pago</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {form.paymentMethods.map((m) => (
                <Badge key={m} variant="outline" className="border-[var(--neon-cyan)]/30 text-[var(--neon-cyan)]">{m}</Badge>
              ))}
            </CardContent>
          </Card>

          <Card className="glow-card border-border/50">
            <CardHeader><CardTitle className="font-display">Datos demo</CardTitle></CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => { reset(); setForm(settings); toast.success("Datos restaurados"); }}>
                <RotateCcw className="mr-1 h-4 w-4" /> Restaurar datos demo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
