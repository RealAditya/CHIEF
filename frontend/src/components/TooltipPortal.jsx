import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export default function TooltipPortal({ anchorRect, children }){
  const [el] = useState(() => document.createElement('div'))
  const [style, setStyle] = useState({ position: 'fixed', left: '0px', top: '0px', zIndex: 2000 })
  const tooltipRef = useRef(null)

  useEffect(() => {
    document.body.appendChild(el)
    return () => { try { document.body.removeChild(el) } catch (e) {} }
  }, [el])

  useLayoutEffect(() => {
    if (!anchorRect || !tooltipRef.current) return
    const tooltip = tooltipRef.current
    const width = tooltip.offsetWidth
    const height = tooltip.offsetHeight
    const margin = 12
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    let left = anchorRect.right + margin
    let top = anchorRect.top

    if (left + width + margin > screenWidth) {
      left = Math.max(margin, anchorRect.left - width - margin)
    }

    if (top + height + margin > screenHeight) {
      top = Math.max(margin, screenHeight - height - margin)
    }

    setStyle({ position: 'fixed', left: `${left}px`, top: `${top}px`, zIndex: 2000 })
  }, [anchorRect, children])

  if (!anchorRect) return null

  return createPortal(
    <div ref={tooltipRef} style={style} className="portal-tooltip">
      {children}
    </div>,
    el
  )
}
