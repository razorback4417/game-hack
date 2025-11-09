import React, { useEffect } from 'react'
import './Phase4GamePreview.css'

function Phase4GamePreview({ prd, assets, onBackToEditor }) {
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onBackToEditor()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onBackToEditor])

  const handleExitFullscreen = () => {
    onBackToEditor()
  }

  return (
    <div className={`phase4-container phase4-fullscreen`}>
      <div className="phase4-game-wrapper">
        <iframe
          src="/game.html"
          className="phase4-game-iframe"
          title="Game Preview"
          allow="fullscreen"
        />

        <button className="phase4-exit-fullscreen" onClick={handleExitFullscreen}>
          Exit Fullscreen (Esc)
        </button>
      </div>
    </div>
  )
}

export default Phase4GamePreview

