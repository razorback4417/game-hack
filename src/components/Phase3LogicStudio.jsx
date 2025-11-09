import React, { useState } from 'react'
import './Phase3LogicStudio.css'

function Phase3LogicStudio({ prompt, assets, prd, onPRDUpdate, onComplete, onBack }) {
  const [chatMessage, setChatMessage] = useState('')

  const handleChatSubmit = (e) => {
    e.preventDefault()
    if (chatMessage.trim()) {
      // In real implementation, this would use LLM to update PRD
      // For now, we'll just simulate some common updates
      const message = chatMessage.toLowerCase()
      const updatedPRD = { ...prd }

      if (message.includes('jump') || message.includes('higher')) {
        // Example: updating player jump (if it existed)
        console.log('Updating jump mechanics')
      }
      if (message.includes('health') || message.includes('hp')) {
        if (message.includes('more') || message.includes('increase')) {
          updatedPRD.player.health = Math.floor(updatedPRD.player.health * 1.2)
          updatedPRD.player.vitality = Math.floor(updatedPRD.player.vitality * 1.2)
        }
      }
      if (message.includes('speed') || message.includes('faster')) {
        if (message.includes('more') || message.includes('increase')) {
          updatedPRD.player.speed = Math.floor(updatedPRD.player.speed * 1.2)
        }
      }
      if (message.includes('strength') || message.includes('damage')) {
        if (message.includes('more') || message.includes('increase')) {
          updatedPRD.player.strength = Math.floor(updatedPRD.player.strength * 1.2)
        }
      }
      if (message.includes('enemy') || message.includes('monster')) {
        if (message.includes('weaker') || message.includes('less health')) {
          updatedPRD.enemies.scaling.health = updatedPRD.enemies.scaling.health * 0.8
        }
      }

      onPRDUpdate(updatedPRD)
      setChatMessage('')
    }
  }

  return (
    <div className="phase3-container">
      <div className="phase3-header">
        <button className="phase3-back-button" onClick={onBack}>
          ← Back
        </button>
        <h1 className="phase3-title">Logic Studio</h1>
      </div>

      <div className="phase3-content">
        <div className="phase3-split">
          <div className="phase3-chat-panel">
            <h2 className="phase3-panel-title">Logic Chat</h2>
            <div className="phase3-chat-messages">
              <div className="phase3-chat-message system">
                <p>Describe changes to your game logic. For example:</p>
                <ul>
                  <li>"Make the player jump higher"</li>
                  <li>"Enemies should have less health"</li>
                  <li>"Increase player speed by 50%"</li>
                  <li>"Make slimes defeated in one hit"</li>
                </ul>
              </div>
            </div>
            <form onSubmit={handleChatSubmit} className="phase3-chat-input">
              <textarea
                className="phase3-chat-textarea"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your logic changes here..."
                rows={3}
              />
              <button
                type="submit"
                className="phase3-chat-submit"
                disabled={!chatMessage.trim()}
              >
                Update Logic
              </button>
            </form>
          </div>

          <div className="phase3-prd-panel">
            <h2 className="phase3-panel-title">Game PRD (JSON)</h2>
            <div className="phase3-prd-viewer">
              <pre className="phase3-prd-json">
                {JSON.stringify(prd, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <div className="phase3-actions">
          <button className="phase3-generate-button" onClick={onComplete}>
            Generate Game →
          </button>
        </div>
      </div>
    </div>
  )
}

export default Phase3LogicStudio

