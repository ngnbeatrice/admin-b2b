export default function Logo({ size = 32, id }: { readonly size?: number; readonly id?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      id={id}
      src="/logo.svg"
      alt="Logo"
      aria-hidden="true"
      style={{
        width: `${size}px`,
        height: 'auto',
        maxWidth: 'none',
        display: 'block',
        flexShrink: 0,
      }}
    />
  )
}
