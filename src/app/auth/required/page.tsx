export default function ParentAuthenticationRequiredPage() {
  const parentUrl = process.env.BARANGAY_PLATFORM_URL || "http://localhost:3000";
  const loginUrl = new URL("/login", parentUrl).toString();

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold text-[var(--navy)]">Barangay Platform sign-in required</h1>
      <p className="text-sm text-[var(--muted)]">Open Game Center from the Game Center link in your signed-in Barangay Platform sidebar.</p>
      <a href={loginUrl} className="rounded-lg bg-[var(--navy)] px-4 py-2.5 text-sm font-semibold text-white">Return to Barangay Platform</a>
    </main>
  );
}