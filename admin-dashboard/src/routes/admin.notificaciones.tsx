import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Mail, Megaphone, Plus, Send, Trash2, Users, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdmin } from "@/lib/store";
import { getClientes, getProducts, sendCampaign } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/notificaciones")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const queryClient = useQueryClient();
  const campaigns = useAdmin((s) => s.campaigns);
  const addCampaign = useAdmin((s) => s.addCampaign);
  const deleteCampaign = useAdmin((s) => s.deleteCampaign);

  const { data: clients = [] } = useQuery({ queryKey: ["clientes"], queryFn: getClientes });
  const { data: products = [] } = useQuery({ queryKey: ["productos"], queryFn: getProducts });

  const [open, setOpen] = useState(false);
  const [clientsModalOpen, setClientsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"Promoción" | "Nuevo producto">("Promoción");
  
  // Selection State
  const [audienceType, setAudienceType] = useState<"Todos" | "Elegir">("Todos");
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const reset = () => {
    setTitle("");
    setMessage("");
    setType("Promoción");
    setAudienceType("Todos");
    setSelectedClientIds([]);
    setSelectedProductIds([]);
  };

  const sendMutation = useMutation({
    mutationFn: async () => {
      // 1. Determinar clientes
      const targetClients = audienceType === "Todos" 
        ? clients 
        : clients.filter(c => selectedClientIds.includes(c.id));
        
      if (targetClients.length === 0) throw new Error("No hay clientes seleccionados o la lista está vacía.");

      // 2. Determinar productos
      const targetProducts = products.filter(p => selectedProductIds.includes(p.id));

      // 3. Payload
      const payload = {
        titulo: title,
        mensaje: message,
        tipo: type,
        clientes: targetClients.map(c => ({ nombre: c.name, correo: c.email })),
        productos: targetProducts.map(p => ({
          id: p.id,
          nombre: p.name,
          precio: p.price,
          imagen: p.image || "",
          stock: p.stock
        }))
      };

      await sendCampaign(payload);
      return targetClients.length;
    },
    onSuccess: (reach) => {
      addCampaign({
        title,
        message,
        type,
        audience: audienceType === "Todos" ? "Todos los clientes" : `${reach} clientes seleccionados`,
        reach,
      });
      toast.success("Campaña enviada exitosamente", { description: `Se enviaron correos a ${reach} clientes.` });
      setOpen(false);
      reset();
    },
    onError: (e: any) => {
      toast.error(e.message || "Error al enviar la campaña");
    }
  });

  const toggleProduct = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleClient = (id: string) => {
    setSelectedClientIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificaciones"
        description="Campañas, promociones y comunicaciones masivas por correo HTML"
        actions={
          <Button onClick={() => { reset(); setOpen(true); }} className="gradient-neon text-white">
            <Plus className="mr-1 h-4 w-4" /> Nueva campaña
          </Button>
        }
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

      {/* MODAL NUEVA CAMPAÑA */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display text-gradient text-xl">Crear Nueva Campaña</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Asunto del correo (Título)</Label>
              <Input placeholder="Ej. ¡Llegó la nueva serie RTX 5000!" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            
            <div className="space-y-1.5">
              <Label>Mensaje principal</Label>
              <Textarea placeholder="Escribe el cuerpo del correo..." rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tipo de Campaña</Label>
                <Select value={type} onValueChange={(v) => setType(v as "Promoción" | "Nuevo producto")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Promoción">Promoción</SelectItem>
                    <SelectItem value="Nuevo producto">Nuevo producto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Audiencia</Label>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant={audienceType === "Todos" ? "default" : "outline"} 
                    className={audienceType === "Todos" ? "bg-[var(--neon-purple)] text-white hover:bg-[var(--neon-purple)]/80 flex-1" : "flex-1"}
                    onClick={() => setAudienceType("Todos")}
                  >
                    <Users className="mr-2 h-4 w-4" /> Todos
                  </Button>
                  <Button 
                    type="button" 
                    variant={audienceType === "Elegir" ? "default" : "outline"}
                    className={audienceType === "Elegir" ? "bg-[var(--neon-blue)] text-white hover:bg-[var(--neon-blue)]/80 flex-1" : "flex-1"}
                    onClick={() => { setAudienceType("Elegir"); setClientsModalOpen(true); }}
                  >
                    <CheckSquare className="mr-2 h-4 w-4" /> Elegir
                  </Button>
                </div>
                {audienceType === "Elegir" && (
                  <p className="text-xs text-muted-foreground mt-1">{selectedClientIds.length} clientes seleccionados</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Productos a destacar en el correo (Opcional)</Label>
              <div className="max-h-40 overflow-y-auto rounded-md border border-border/50 bg-muted/20 p-2 space-y-1">
                {products.length === 0 && <p className="text-xs text-muted-foreground p-2">No hay productos disponibles.</p>}
                {products.map(p => (
                  <div key={p.id} className="flex items-center space-x-3 p-2 hover:bg-muted/40 rounded-md transition-colors cursor-pointer" onClick={() => toggleProduct(p.id)}>
                    <Checkbox id={`prod-${p.id}`} checked={selectedProductIds.includes(p.id)} onCheckedChange={() => toggleProduct(p.id)} />
                    <div className="flex-1 flex justify-between items-center">
                      <label htmlFor={`prod-${p.id}`} className="text-sm font-medium leading-none cursor-pointer">{p.name}</label>
                      <span className="text-xs text-[var(--neon-blue)] font-bold">S/ {p.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button 
              className="gradient-neon text-white" 
              onClick={() => {
                if (!title) { toast.error("El asunto es obligatorio"); return; }
                if (audienceType === "Elegir" && selectedClientIds.length === 0) { toast.error("Debes seleccionar al menos un cliente"); return; }
                sendMutation.mutate();
              }}
              disabled={sendMutation.isPending}
            >
              {sendMutation.isPending ? "Enviando correos..." : <><Send className="mr-2 h-4 w-4" /> Enviar campaña</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL ELEGIR CLIENTES */}
      <Dialog open={clientsModalOpen} onOpenChange={setClientsModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Seleccionar Clientes</DialogTitle>
            <DialogDescription>Elige a quiénes se enviará este correo de marketing.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto space-y-1 mt-2">
            {clients.map(c => (
              <div key={c.id} className="flex items-center space-x-3 p-2 hover:bg-muted/40 rounded-md cursor-pointer" onClick={() => toggleClient(c.id)}>
                <Checkbox id={`client-${c.id}`} checked={selectedClientIds.includes(c.id)} onCheckedChange={() => toggleClient(c.id)} />
                <div className="flex flex-col">
                  <label htmlFor={`client-${c.id}`} className="text-sm font-medium leading-none cursor-pointer">{c.name}</label>
                  <span className="text-xs text-muted-foreground mt-1">{c.email}</span>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="ghost" onClick={() => setSelectedClientIds(clients.map(c => c.id))} className="text-xs">
              Seleccionar Todos
            </Button>
            <Button onClick={() => setClientsModalOpen(false)}>Listo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
