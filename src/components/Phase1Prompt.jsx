import React, { useState } from 'react'
import './Phase1Prompt.css'

function Phase1Prompt({ onSubmit }) {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (prompt.trim()) {
      onSubmit(prompt.trim())
    }
  }

  return (
    <div className="phase1-container">
      <div className="phase1-content">
        <h1 className="phase1-title">GameWeaver</h1>
        <p className="phase1-subtitle">Transform your game idea into reality</p>

        <form onSubmit={handleSubmit} className="phase1-form">
          <label htmlFor="game-prompt" className="phase1-label">
            Describe your game idea
          </label>
          <textarea
            id="game-prompt"
            className="phase1-textarea"
            placeholder="e.g., A pixel art game where a knight fights slimes in a magic forest to collect gems"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={8}
          />
          <button
            type="submit"
            className="phase1-button"
            disabled={!prompt.trim()}
          >
            Begin Creation
          </button>
        </form>
      </div>
    </div>
  )
}

export default Phase1Prompt

