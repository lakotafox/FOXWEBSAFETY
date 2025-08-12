interface StoreHoursProps {
  title?: string
  className?: string
  textClassName?: string
}

export default function StoreHours({
  title = "HOURS",
  className = "",
  textClassName = "text-zinc-300"
}: StoreHoursProps) {
  return (
    <div className={className}>
      <h4 className="text-2xl font-black mb-6 tracking-wide">{title}</h4>
      <div className={`space-y-3 ${textClassName}`}>
        <p className="text-lg font-bold">Monday–Friday: 10:00am–5:00pm</p>
        <p className="text-lg font-bold">Saturday–Sunday: By Appointment</p>
      </div>
    </div>
  )
}