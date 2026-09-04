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
              className="group rounded-2xl border border-white/60 bg-white/55 p-7 backdrop-blur-xl transition-all duration-300 [box-shadow:0_1px_1px_rgba(0,0,0,0.03),0_12px_32px_-14px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.75)] hover:-translate-y-1.5 hover:[box-shadow:0_1px_1px_rgba(0,0,0,0.04),0_26px_54px_-18px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.9)] supports-[backdrop-filter]:bg-white/45"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] ring-1 ring-white/50">
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
