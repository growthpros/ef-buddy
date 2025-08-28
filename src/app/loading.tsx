export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-300 border-t-primary-600 mb-4"></div>
        <p className="text-secondary-600 font-medium">Loading EF Buddy...</p>
      </div>
    </div>
  )
}