// Hub route metadata.
// Auth guard and BottomNav are handled by the parent app/(app)/layout.tsx.

export const metadata = {
  title: "Family Hub  Vitae",
};

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
