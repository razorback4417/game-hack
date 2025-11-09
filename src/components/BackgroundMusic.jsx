import React, { useEffect, useRef } from 'react'

function BackgroundMusic({ isGamePreview = false }) {
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) return

    // Pause music if we're in game preview (game has its own music)
    if (isGamePreview) {
      audio.pause()
      return
    }

    // Try to play music, but handle autoplay restrictions
    const playMusic = async () => {
      try {
        audio.volume = 0.3 // Set volume to 30% so it's not too loud
        // Resume if already paused, otherwise play
        if (audio.paused) {
          await audio.play()
        }
      } catch (error) {
        // Autoplay was blocked - user will need to interact first
        console.log('Autoplay blocked, music will start on user interaction')

        // Set up a one-time click listener to start music
        const startMusic = () => {
          audio.play().catch(err => console.log('Could not start music:', err))
          document.removeEventListener('click', startMusic)
          document.removeEventListener('keydown', startMusic)
        }

        document.addEventListener('click', startMusic, { once: true })
        document.addEventListener('keydown', startMusic, { once: true })
      }
    }

    playMusic()

    // No cleanup needed - we want music to persist across phase changes
  }, [isGamePreview])

  return (
    <audio
      ref={audioRef}
      src="/assets/sound/opening.ogg"
      loop
      preload="auto"
    />
  )
}

export default BackgroundMusic

