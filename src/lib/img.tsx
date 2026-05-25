/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useCallback, useRef, useEffect, type ImgHTMLAttributes } from "react"

const FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' fill='none'%3E%3Crect width='600' height='600' fill='%23f1f5f9' rx='12'/%3E%3Ccircle cx='300' cy='270' r='100' stroke='%23cbd5e1' stroke-width='6'/%3E%3Cpath d='M300 270V200' stroke='%23cbd5e1' stroke-width='6' stroke-linecap='round'/%3E%3Cpath d='M300 270l40 15' stroke='%23cbd5e1' stroke-width='6' stroke-linecap='round'/%3E%3Crect x='270' y='370' width='60' height='110' rx='6' fill='%23e2e8f0' stroke='%23cbd5e1' stroke-width='3'/%3E%3Crect x='255' y='370' width='90' height='14' rx='6' fill='%23e2e8f0' stroke='%23cbd5e1' stroke-width='3'/%3E%3C/svg%3E"

export function Img({ src, alt, className, width, height, loading, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [errored, setErrored] = useState(!src)
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const handleError = useCallback(() => {
    setErrored(true)
  }, [])

  const handleLoad = useCallback(() => {
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true)
    }
  }, [])

  return (
    <div className="relative overflow-hidden bg-muted">
      {!loaded && !errored && (
        <div className="absolute inset-0 skeleton" />
      )}
      <img
        ref={imgRef}
        src={errored ? FALLBACK : src}
        alt={alt || ""}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        width={width || undefined}
        height={height || undefined}
        loading={loading || "lazy"}
        style={{
          opacity: loaded || errored ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
        {...props}
      />
    </div>
  )
}
