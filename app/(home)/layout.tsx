/**
 * (home) route group layout — homepage only.
 * No header/footer wrapping — the homepage renders its own nav + footer.
 */
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
