import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, CreditCard, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { cart, useCart } from "@/lib/cart-store";
import { checkoutCart } from "@/lib/orders-api";
import { FREE_SHIPPING_THRESHOLD_PEN, SHIPPING_FEE_PEN, formatPrice } from "@/lib/products";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
  head: () => ({ meta: [{ title: "Pago - CyC Computer" }] }),
});

function Checkout() {
  const { items, subtotal, activeCartId } = useCart();
  const user = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"info" | "pay" | "done">("info");
  const [method, setMethod] = useState<"card" | "yape" | "plin">("card");
  const [shippingForm, setShippingForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    dni: user?.dni ?? "",
    address: user?.address ?? "",
    city: user?.city ?? "",
    postalCode: "",
  });
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    holder: "",
    expiration: "",
    cvv: "",
  });
  const [shippingTouched, setShippingTouched] = useState<Record<keyof typeof shippingForm, boolean>>({
    name: false,
    email: false,
    phone: false,
    dni: false,
    address: false,
    city: false,
    postalCode: false,
  });
  const [paymentTouched, setPaymentTouched] = useState<Record<keyof typeof paymentForm, boolean>>({
    cardNumber: false,
    holder: false,
    expiration: false,
    cvv: false,
  });
  const [err, setErr] = useState("");
  const [paying, setPaying] = useState(false);

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD_PEN || subtotal === 0 ? 0 : SHIPPING_FEE_PEN;
  const total = subtotal + shipping;

  const onlyLetters = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
  const addressPattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,#°-]+$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const currentYear = new Date().getFullYear() % 100;

  const shippingErrors = {
    name:
      shippingForm.name.trim().length < 2 ||
      shippingForm.name.trim().length > 70 ||
      !onlyLetters.test(shippingForm.name.trim())
        ? "Ingresa un nombre valido: 2 a 70 letras, sin numeros ni caracteres especiales"
        : "",
    email:
      shippingForm.email.trim().length < 8 ||
      shippingForm.email.trim().length > 100 ||
      !emailPattern.test(shippingForm.email.trim())
        ? "Ingresa un correo valido de 8 a 100 caracteres"
        : "",
    phone: !/^9\d{8}$/.test(shippingForm.phone.trim()) ? "El telefono debe tener 9 digitos y empezar con 9" : "",
    dni: !/^\d{8}$/.test(shippingForm.dni.trim()) ? "El DNI debe tener 8 digitos" : "",
    address:
      shippingForm.address.trim().length < 6 ||
      shippingForm.address.trim().length > 120 ||
      !addressPattern.test(shippingForm.address.trim())
        ? "Ingresa una direccion valida: 6 a 120 caracteres; solo letras, numeros, espacios, punto, coma, #, guion o °"
        : "",
    city:
      shippingForm.city.trim().length < 3 ||
      shippingForm.city.trim().length > 60 ||
      !onlyLetters.test(shippingForm.city.trim())
        ? "Ingresa una ciudad valida: 3 a 60 letras, sin numeros ni caracteres especiales"
        : "",
    postalCode:
      shippingForm.postalCode.trim() && !/^\d{5}$/.test(shippingForm.postalCode.trim())
        ? "El codigo postal debe tener 5 digitos"
        : "",
  };

  const [expirationMonth, expirationYear] = paymentForm.expiration.split("/");
  const monthNumber = Number(expirationMonth);
  const yearNumber = Number(expirationYear);
  const expirationIsValid =
    /^\d{2}\/\d{2}$/.test(paymentForm.expiration) &&
    monthNumber >= 1 &&
    monthNumber <= 12 &&
    yearNumber >= currentYear;

  const paymentErrors = {
    cardNumber: !/^\d{16}$/.test(paymentForm.cardNumber.replace(/\s/g, "")) ? "La tarjeta debe tener 16 digitos" : "",
    holder:
      paymentForm.holder.trim().length < 2 ||
      paymentForm.holder.trim().length > 70 ||
      !onlyLetters.test(paymentForm.holder.trim())
        ? "Ingresa un titular valido: 2 a 70 letras, sin numeros ni caracteres especiales"
        : "",
    expiration: !expirationIsValid ? "Ingresa un vencimiento valido en formato MM/AA" : "",
    cvv: !/^\d{3}$/.test(paymentForm.cvv.trim()) ? "El CVV debe tener 3 digitos" : "",
  };

  const visibleShippingError = (key: keyof typeof shippingForm) =>
    shippingTouched[key] || Boolean(shippingForm[key]) ? shippingErrors[key] : "";

  const visiblePaymentError = (key: keyof typeof paymentForm) =>
    paymentTouched[key] || Boolean(paymentForm[key]) ? paymentErrors[key] : "";

  const updateShipping = (key: keyof typeof shippingForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setShippingForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const updatePayment = (key: keyof typeof paymentForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const touchShipping = (key: keyof typeof shippingForm) => () =>
    setShippingTouched((prev) => ({ ...prev, [key]: true }));

  const touchPayment = (key: keyof typeof paymentForm) => () =>
    setPaymentTouched((prev) => ({ ...prev, [key]: true }));

  const continueToPayment = (event: React.FormEvent) => {
    event.preventDefault();
    setShippingTouched({
      name: true,
      email: true,
      phone: true,
      dni: true,
      address: true,
      city: true,
      postalCode: true,
    });

    if (Object.values(shippingErrors).some(Boolean)) {
      setErr("Revisa los datos de envio antes de continuar.");
      return;
    }

    setErr("");
    setStep("pay");
  };

  if (!user?.idCliente && step !== "done") {
    return (
      <div className="container mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-muted-foreground">Necesitas iniciar sesion o crear una cuenta para finalizar la compra.</p>
        <Link to="/login" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Iniciar sesion
        </Link>
      </div>
    );
  }

  if (items.length === 0 && step !== "done") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Tu carrito esta vacio.</p>
        <Link to="/catalogo" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Ver productos
        </Link>
      </div>
    );
  }

  const finish = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.idCliente) return setErr("Inicia sesion para finalizar la compra.");
    if (!activeCartId) return setErr("No se encontro un carrito activo.");
    if (method === "card") {
      setPaymentTouched({ cardNumber: true, holder: true, expiration: true, cvv: true });
      if (Object.values(paymentErrors).some(Boolean)) {
        setErr("Revisa los datos de la tarjeta antes de confirmar la compra.");
        return;
      }
    }

    setPaying(true);
    setErr("");
    try {
      await checkoutCart({
        idCliente: user.idCliente,
        idCarrito: activeCartId,
        metodoPago: method,
      });
      cart.clearLocal();
      setStep("done");
      setTimeout(() => navigate({ to: "/" }), 4000);
    } catch {
      setErr("No se pudo confirmar la compra. Revisa el stock o intenta nuevamente.");
    } finally {
      setPaying(false);
    }
  };

  if (step === "done") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
        <h1 className="mt-4 font-display text-3xl font-bold">Compra confirmada</h1>
        <p className="mt-2 text-muted-foreground">Tu pedido quedo registrado en la API.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Finalizar compra</h1>

      <div className="mt-4 flex gap-2 text-sm">
        {[["info", "1. Datos"], ["pay", "2. Pago"]].map(([key, label]) => (
          <span key={key} className={`rounded-full px-3 py-1 ${step === key ? "bg-primary text-primary-foreground" : "border border-border bg-surface text-muted-foreground"}`}>
            {label}
          </span>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <form noValidate onSubmit={step === "info" ? continueToPayment : finish} className="space-y-6">
          {err && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}

          {step === "info" && (
            <section className="rounded-2xl border border-border bg-gradient-card p-6">
              <h2 className="font-display text-xl font-bold">Datos de envio</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Nombre completo" maxLength={70} value={shippingForm.name} onChange={updateShipping("name")} onBlur={touchShipping("name")} error={visibleShippingError("name")} />
                <Field label="Email" type="email" maxLength={100} value={shippingForm.email} onChange={updateShipping("email")} onBlur={touchShipping("email")} error={visibleShippingError("email")} />
                <Field label="Telefono" inputMode="numeric" maxLength={9} value={shippingForm.phone} onChange={updateShipping("phone")} onBlur={touchShipping("phone")} error={visibleShippingError("phone")} />
                <Field label="DNI" inputMode="numeric" maxLength={8} value={shippingForm.dni} onChange={updateShipping("dni")} onBlur={touchShipping("dni")} error={visibleShippingError("dni")} />
                <Field label="Direccion" maxLength={120} value={shippingForm.address} onChange={updateShipping("address")} onBlur={touchShipping("address")} error={visibleShippingError("address")} className="sm:col-span-2" />
                <Field label="Ciudad" maxLength={60} value={shippingForm.city} onChange={updateShipping("city")} onBlur={touchShipping("city")} error={visibleShippingError("city")} />
                <Field label="Codigo postal" inputMode="numeric" maxLength={5} value={shippingForm.postalCode} onChange={updateShipping("postalCode")} onBlur={touchShipping("postalCode")} error={visibleShippingError("postalCode")} />
              </div>
              <button type="submit" className="mt-6 w-full rounded-lg bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow">
                Continuar al pago
              </button>
            </section>
          )}

          {step === "pay" && (
            <section className="rounded-2xl border border-border bg-gradient-card p-6">
              <h2 className="font-display text-xl font-bold">Metodo de pago</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {([
                  ["card", "Tarjeta"],
                  ["yape", "Yape"],
                  ["plin", "Plin"],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMethod(key)}
                    className={`rounded-lg border p-4 text-left transition-smooth ${
                      method === key ? "border-primary bg-primary/10" : "border-border bg-surface hover:border-primary/40"
                    }`}
                  >
                    <div className="mt-1 text-sm font-semibold">{label}</div>
                  </button>
                ))}
              </div>

              {method === "card" && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Numero de tarjeta" inputMode="numeric" maxLength={16} value={paymentForm.cardNumber} onChange={updatePayment("cardNumber")} onBlur={touchPayment("cardNumber")} error={visiblePaymentError("cardNumber")} placeholder="1234567890123456" className="sm:col-span-2" />
                  <Field label="Titular" maxLength={70} value={paymentForm.holder} onChange={updatePayment("holder")} onBlur={touchPayment("holder")} error={visiblePaymentError("holder")} />
                  <Field label="Vencimiento" value={paymentForm.expiration} onChange={updatePayment("expiration")} onBlur={touchPayment("expiration")} error={visiblePaymentError("expiration")} placeholder="MM/AA" maxLength={5} />
                  <Field label="CVV" inputMode="numeric" maxLength={3} value={paymentForm.cvv} onChange={updatePayment("cvv")} onBlur={touchPayment("cvv")} error={visiblePaymentError("cvv")} placeholder="123" />
                </div>
              )}

              {method !== "card" && (
                <p className="mt-4 rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
                  El pago por {method === "yape" ? "Yape" : "Plin"} quedara registrado con estado aprobado para completar el flujo de prueba.
                </p>
              )}

              <div className="mt-6 flex items-center justify-between gap-3">
                <button type="button" onClick={() => setStep("info")} className="text-sm text-muted-foreground hover:text-foreground">
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={paying}
                  className="flex items-center gap-2 rounded-lg bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
                >
                  <Lock className="h-4 w-4" /> {paying ? "Procesando..." : `Pagar ${formatPrice(total)}`}
                </button>
              </div>
            </section>
          )}
        </form>

        <aside className="h-fit rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-display text-lg font-bold">Tu pedido</h2>
          <div className="mt-4 space-y-3">
            {items.map(({ product, qty, id }) => (
              <div key={id} className="flex gap-3 text-sm">
                <div className="grid h-12 w-12 place-items-center rounded-md bg-surface text-2xl">{product.emoji}</div>
                <div className="flex-1">
                  <p className="line-clamp-1 font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">x{qty}</p>
                </div>
                <span className="font-semibold">{formatPrice(product.price * qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Envio</span><span>{shipping === 0 ? "Gratis" : formatPrice(shipping)}</span></div>
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-3">
            <span className="font-semibold">Total</span>
            <span className="font-display text-xl font-bold text-gradient">{formatPrice(total)}</span>
          </div>
          <p className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
            <CreditCard className="h-3 w-3" /> Pago de prueba conectado a la API
          </p>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  className = "",
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        {...props}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-smooth focus:ring-2 ${
          error
            ? "border-destructive focus:border-destructive focus:ring-destructive/30"
            : "border-input focus:border-primary focus:ring-primary/30"
        }`}
      />
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
