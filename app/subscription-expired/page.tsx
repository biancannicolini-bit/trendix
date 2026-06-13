import Link from "next/link";

export default function SubscriptionExpiredPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold">Suscripción finalizada</h1>
      <p className="mt-2 text-sm text-gray-600">
        Tu acceso expiró. Reactivá tu plan para seguir recibiendo contenido.
      </p>
      <Link
        href="/onboarding/payment"
        className="mt-6 rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
      >
        Reactivar suscripción
      </Link>
    </main>
  );
}
