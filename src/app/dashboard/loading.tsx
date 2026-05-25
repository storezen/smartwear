export default function DashboardLoading() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="flex w-full max-w-[1600px] animate-pulse flex-col gap-6">
        <div className="h-6 w-48 rounded bg-muted-foreground/10" />
        <div className="h-3 w-64 rounded bg-muted-foreground/10" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-muted" />
        <div className="h-48 rounded-xl bg-muted" />
      </div>
    </div>
  )
}
