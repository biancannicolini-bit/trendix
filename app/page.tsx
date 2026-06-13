import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg space-y-6 rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">TrendContent</h1>
        <p className="text-sm text-gray-600">
          Iniciá sesión para acceder a tu calendario semanal.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Ingresar
          </Link>
          <Link
            href="/register"
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </main>
  );
}
