import NotFoundScreen from '@/components/NotFoundScreen/NotFoundScreen'

/**
 * Catch-all route — renders the not found screen inline so the
 * layout (navbar + footer) never unmounts during navigation.
 */
export default function CatchAll() {
  return <NotFoundScreen />
}
