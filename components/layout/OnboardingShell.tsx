import { Logo } from "@/components/brand/Logo";
import { BRAND } from "@/lib/brand";

export function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-secondary">
      <header
        className="border-b px-4 py-4 lg:px-8"
        style={{
          background: BRAND.DARK,
          borderColor: BRAND.BORDER,
        }}
      >
        <div className="mx-auto max-w-[640px]">
          <Logo size={26} variant="dark" />
        </div>
      </header>
      <div className="mx-auto max-w-[640px] px-4 py-10">{children}</div>
    </div>
  );
}
