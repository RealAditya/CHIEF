import React from 'react'
import uiText from '../config/uiText'

function IconPlaceholder({label}){
  // intentionally disabled placeholder with tooltip
  return <button className="icon-placeholder" title={uiText.comingSoon} disabled aria-hidden>{label}</button>
}

export default function TopNav(){
  const today = new Date().toLocaleDateString(undefined, {weekday:'long', month:'long', day:'numeric'})
  return (
    <header className="topnav">
      <div className="left">
        <div className="logo">CHIEF</div>
      </div>
      <div className="center">{today}</div>
      <div className="right">
        <IconPlaceholder label="Alerts" />
        <IconPlaceholder label="Settings" />
      </div>
    </header>
  )
}
