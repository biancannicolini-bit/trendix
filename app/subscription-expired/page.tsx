import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function SubscriptionExpiredPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4">
      <Card className="w-full space-y-4 text-center animate-fade-in-up">
        <h1 className="text-[22px] font-medium tracking-[-0.5px]">
          Suscripción finalizada
        </h1>
        <p className="text-sm text-text-secondary">
          Tu acceso expiró. Reactivá tu plan para seguir recibiendo contenido.
        </p>
        <Button href="/onboarding/payment">Reactivar suscripción</Button>
      </Card>
    </main>
  );
}
