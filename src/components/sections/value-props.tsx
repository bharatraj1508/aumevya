import { HandHeart, Users, Sparkles } from 'lucide-react'
import { StaggerGroup, StaggerItem } from '@/components/motion/reveal'

const PROPS = [
  {
    icon: HandHeart,
    title: 'Handpicked & vetted',
    body: 'Every retreat is led by certified teachers we know and trust — no guesswork, just genuine practice.',
  },
  {
    icon: Users,
    title: 'Small, warm groups',
    body: 'Intimate sessions mean real attention, hands-on adjustment, and a community that remembers your name.',
  },
  {
    icon: Sparkles,
    title: 'Unplug. De-stress. Recharge.',
    body: 'Step away from the noise and return to yourself — every retreat is designed to leave you lighter.',
  },
]

export function ValueProps() {
  return (
    <section className="border-b border-border bg-background py-16 md:py-20">
      <div className="container-page">
        <StaggerGroup className="grid gap-6 md:grid-cols-3">
          {PROPS.map(({ icon: Icon, title, body }) => (
            <StaggerItem
              key={title}
              className="rounded-2xl border border-border bg-card p-7 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold leading-snug">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
