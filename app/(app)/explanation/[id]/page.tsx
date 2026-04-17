import { redirect } from 'next/navigation'

/**
 * /explanation/[id]  redirects to the unified /records/[id] page.
 *
 * The AI explanation is now shown inline on the record page, so this route
 * exists only to preserve any bookmarked or shared links.
 */
export default async function ExplanationRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/records/${id}`)
}
