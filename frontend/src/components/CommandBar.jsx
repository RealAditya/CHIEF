import React from 'react'

export default function CommandBar(){
  return (
    <div className="command-bar">
      <div className="prompt">Chief&gt;</div>
      <input className="cmd-input" placeholder="Chief..." disabled />
    </div>
  )
}
