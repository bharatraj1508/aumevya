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
    <section className="border-y border-border bg-card/60 py-16 md:py-20">
      <div className="container-page">
        <StaggerGroup className="grid gap-8 md:grid-cols-3 md:gap-10">
          {PROPS.map(({ icon: Icon, title, body }) => (
            <StaggerItem key={title} className="flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="text-lg leading-snug">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
