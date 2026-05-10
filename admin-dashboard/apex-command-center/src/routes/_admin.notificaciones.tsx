import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Megaphone, Plus, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdmin, type NotificationCampaign } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/notificaciones")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const campaigns = useAdmin((s) => s.campaigns);
  const addCampaign = useAdmin((s) => s.addCampaign);
  const deleteCampaign = useAdmin((s) => s.deleteCampaign);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<NotificationCampaign, "id" | "sentAt" | "reach">>({
    title: "", message: "", type: "Promoción", audience: "Todos los clientes",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificaciones"
        description="Campañas, promociones y comunicaciones masivas"
        actions={<Button onClick={() => setOpen(true)} className="gradient-neon text-white"><Plus className="mr-1 h-4 w-4" />Nueva campaña</Button>}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((c) => (
          <Card key={c.id} className="glow-card glow-hover border-border/50">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-white">
                  {c.type === "Promoción" ? <Megaphone className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                </div>
                <Button size="icon" variant="ghost" onClick={() => { deleteCampaign(c.id); toast.success("Campaña eliminada"); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">{c.title}</h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">{c.message}</p>
              </div>
              <div className="flex items-center justify-between border-t border-border/40 pt-3 text-xs">
                <Badge variant="outline" className="border-[var(--neon-purple)]/30 text-[var(--neon-purple)]">{c.type}</Badge>
                <span className="text-muted-foreground">{c.reach.toLocaleString()} alcance</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Nueva campaña</DialogTitle></DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.title) { toast.error("Título requerido"); return; }
              addCampaign(form);
              toast.success("Campaña enviada", { description: form.title });
              setOpen(false);
              setForm({ title: "", message: "", type: "Promoción", audience: "Todos los clientes" });
            }}
          >
            <div className="space-y-1.5"><Label>Título</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Mensaje</Label><Textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as NotificationCampaign["type"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Promoción">Promoción</SelectItem>
                    <SelectItem value="Nuevo producto">Nuevo producto</SelectItem>
                    <SelectItem value="Newsletter">Newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Audiencia</Label><Input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" className="gradient-neon text-white"><Send className="mr-1 h-4 w-4" />Enviar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
