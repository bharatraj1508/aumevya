import type { SVGProps } from 'react'

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14 8.5V6.8c0-.8.2-1.2 1.3-1.2H17V2.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v1.6H7.6V12h2.7v9.3H14V12h2.7l.4-3.5H14z" />
    </svg>
  )
}

export function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23 8.2s-.2-1.6-.9-2.3c-.8-.9-1.8-.9-2.2-1C16.7 4.6 12 4.6 12 4.6h0s-4.7 0-7.9.3c-.4.1-1.4.1-2.2 1C1.2 6.6 1 8.2 1 8.2S.8 10 .8 11.9v1.8C.8 15.5 1 17.3 1 17.3s.2 1.6.9 2.3c.8.9 1.9.9 2.4 1 1.8.2 7.7.3 7.7.3s4.7 0 7.9-.3c.4-.1 1.4-.1 2.2-1 .7-.7.9-2.3.9-2.3s.2-1.8.2-3.6v-1.8C23.2 10 23 8.2 23 8.2zM9.7 15.3V8.9l6.2 3.2-6.2 3.2z" />
    </svg>
  )
}
