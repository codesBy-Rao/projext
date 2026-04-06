import { useEffect, useRef, useState } from 'react'

const CursorAura = () => {
  const [enabled, setEnabled] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [trail, setTrail] = useState({ x: 0, y: 0 })

  const targetRef = useRef({ x: 0, y: 0 })
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      setEnabled(false)
      return
    }

    setEnabled(true)

    const handleMove = (event: MouseEvent) => {
      targetRef.current = { x: event.clientX, y: event.clientY }
      setPosition({ x: event.clientX, y: event.clientY })
    }

    const animate = () => {
      setTrail((previous) => {
        const nextX = previous.x + (targetRef.current.x - previous.x) * 0.14
        const nextY = previous.y + (targetRef.current.y - previous.y) * 0.14
        return { x: nextX, y: nextY }
      })

      frameRef.current = window.requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMove)
    frameRef.current = window.requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  if (!enabled) {
    return null
  }

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-[55]"
        style={{
          background: `radial-gradient(320px circle at ${trail.x}px ${trail.y}px, rgba(15, 23, 42, 0.14), rgba(2, 6, 23, 0) 62%)`,
        }}
      />
      <div
        className="cursor-aura pointer-events-none fixed z-[56] hidden md:block"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
    </>
  )
}

export default CursorAura
