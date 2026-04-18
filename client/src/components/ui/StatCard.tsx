import type { ReactNode } from 'react'

interface Props {
  label: string
  value: string | number
  description?: string
  trend?: string
  icon: ReactNode
  iconBg: string
}

export default function StatCard({ label, value, description, trend, icon, iconBg }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <p className="text-sm text-zinc-400">{label}</p>
        <div className={`${iconBg} p-2.5 rounded-xl`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-white">{value}</p>
        {description && <p className="text-xs text-zinc-500 mt-1">{description}</p>}
        {trend && <p className="text-xs text-emerald-400 mt-1">{trend}</p>}
      </div>
    </div>
  )
}
