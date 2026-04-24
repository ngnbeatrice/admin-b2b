'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { ReactNode } from 'react'

interface ImageWithFallbackProps {
  readonly src: string
  readonly alt: string
  readonly fallback: ReactNode
  readonly fill?: boolean
  readonly sizes?: string
  readonly quality?: number
  readonly className?: string
}

/**
 * Wraps next/image with an onError handler — renders fallback when the image
 * fails to load (404, 400, network error, etc.).
 */
export function ImageWithFallback({
  src,
  alt,
  fallback,
  fill,
  sizes,
  quality,
  className,
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false)

  if (failed) return <>{fallback}</>

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      quality={quality}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
