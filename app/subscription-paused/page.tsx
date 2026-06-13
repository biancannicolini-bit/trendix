import Link from "next/link";

export default function SubscriptionPausedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold">Suscripción pausada</h1>
      <p className="mt-2 text-sm text-gray-600">
        Tu suscripción está pausada. Contactanos o reactivá desde Mercado Pago.
      </p>
      <Link
        href="/dashboard/settings"
        className="mt-6 rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
      >
        Ir a ajustes
      </Link>
    </main>
  );
}
