import { useEffect, useState } from 'react'
import { motion, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 }
  const x = useSpring(0, springConfig)
  const y = useSpring(0, springConfig)

  useEffect(() => {
    // Hide on touch devices
    if ('ontouchstart' in window) return

    const move = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
      if (!visible) setVisible(true)
    }

    const addHover = () => setHovered(true)
    const removeHover = () => setHovered(false)

    window.addEventListener('mousemove', move)

    const watchHoverables = () => {
      document.querySelectorAll('a, button, [role="button"], input, textarea, select, [data-cursor-hover]').forEach((el) => {
        el.addEventListener('mouseenter', addHover)
        el.addEventListener('mouseleave', removeHover)
      })
    }

    watchHoverables()
    const observer = new MutationObserver(watchHoverables)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', move)
      observer.disconnect()
    }
  }, [visible, x, y])

  if (!visible) return null

  return (
    <>
      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{ x, y }}
      >
        <motion.div
          className="rounded-full border border-white -translate-x-1/2 -translate-y-1/2"
          animate={{
            width: hovered ? 56 : 36,
            height: hovered ? 56 : 36,
            opacity: hovered ? 0.6 : 0.4,
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        />
      </motion.div>
      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{ x, y }}
      >
        <motion.div
          className="rounded-full bg-white -translate-x-1/2 -translate-y-1/2"
          animate={{
            width: hovered ? 8 : 5,
            height: hovered ? 8 : 5,
          }}
          transition={{ duration: 0.15 }}
        />
      </motion.div>
    </>
  )
}
