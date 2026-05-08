export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-2">You are offline</h1>
        <p className="text-sm text-slate-500">
          HantaMap requires an internet connection to display verified outbreak data. Please check your connection and try again.
        </p>
      </div>
    </div>
  )
}
