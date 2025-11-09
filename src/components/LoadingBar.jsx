import React from 'react'
import './LoadingBar.css'

function LoadingBar({ message = 'Loading...', progress = 0 }) {
  return (
    <div className="loading-bar-container">
      <div className="loading-bar-content">
        <h2 className="loading-bar-title">{message}</h2>
        <div className="loading-bar-wrapper">
          <div
            className="loading-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="loading-bar-percentage">{Math.round(progress)}%</div>
      </div>
    </div>
  )
}

export default LoadingBar

