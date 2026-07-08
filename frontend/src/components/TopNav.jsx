import React from 'react'

function IconPlaceholder({label}){
  return <div className="icon-placeholder" aria-hidden>{label}</div>
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
        <IconPlaceholder label="🔔" />
        <IconPlaceholder label="⚙️" />
      </div>
    </header>
  )
}
