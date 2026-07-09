import React from 'react'
import uiText from '../config/uiText'

export default function CommandBar(){
  return (
    <div className="command-bar">
      <div className="prompt">&gt;</div>
      <input className="cmd-input" placeholder={uiText.commandPlaceholder} disabled />
    </div>
  )
}
