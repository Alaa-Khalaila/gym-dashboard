const COLORS = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-pink-500',
]

function colorFor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i)
    hash |= 0
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

interface Props {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

export default function MemberAvatar({ name, size = 'md' }: Props) {
  return (
    <div className={`${SIZE[size]} ${colorFor(name)} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}>
      {initials(name)}
    </div>
  )
}
