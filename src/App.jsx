import React, { useState } from 'react'
import Phase1Prompt from './components/Phase1Prompt'
import Phase2AssetStudio from './components/Phase2AssetStudio'
import Phase3LogicStudio from './components/Phase3LogicStudio'
import Phase4GamePreview from './components/Phase4GamePreview'
import LoadingBar from './components/LoadingBar'
import AssetGenerationService from './services/assetGenerationService'
import { getAllAssetKeys, ASSET_CONFIG } from './config/assetConfig'
import './App.css'
import './styles/shared.css'

function App() {
  const [currentPhase, setCurrentPhase] = useState(1)
  const [gamePrompt, setGamePrompt] = useState('')
  const [assets, setAssets] = useState([])
  const [gamePRD, setGamePRD] = useState(null)
  const [gameGenerated, setGameGenerated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Loading...')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [apiKey, setApiKey] = useState(null)
  const [theme, setTheme] = useState(null)

  const handlePromptSubmit = async (gamePromptText) => {
    setGamePrompt(gamePromptText)
    setIsLoading(true)
    setLoadingMessage('Generating assets...')
    setLoadingProgress(0)

    try {
      // Use hardcoded API key
      const key = 'AIzaSyAdgJkSq5B28fOo8-X8P0msffTQ_GFN0wg';
      setApiKey(key) // Store for later use in Phase2AssetStudio

      const generator = new AssetGenerationService(key)
      await generator.init()

      // Extract theme from prompt (simple extraction - could be improved)
      const extractedTheme = extractThemeFromPrompt(gamePromptText)
      setTheme(extractedTheme) // Store theme for later use

      // Get all asset keys except tiles (use backup instead)
      const allAssetKeys = getAllAssetKeys()
      const assetKeys = allAssetKeys.filter(key => key !== 'tiles')

      // Generate assets with progress tracking
      const results = await generator.generateAssets(assetKeys, {
        theme,
        onProgress: (assetKey, progress) => {
          if (assetKey) {
            const category = getAssetCategory(assetKey)
            setLoadingMessage(`Generating ${category}...`)
          }
          setLoadingProgress(progress)
        }
      })

      // Convert results to asset format
      const generatedAssets = Object.entries(results).map(([key, result]) => {
        const config = ASSET_CONFIG[key]
        return {
          id: key,
          name: config.file,
          type: config.type,
          url: result.url,
          blob: result.blob,
          assetKey: key
        }
      })

      // Add tiles - edit specific tiles based on theme
      const tilesConfig = ASSET_CONFIG.tiles
      if (tilesConfig) {
        try {
          // Load backup tiles
          const tilesResponse = await fetch('/assets-backup/images/tiles.png')
          if (tilesResponse.ok) {
            let tilesBlob = await tilesResponse.blob()

            // If we have a theme, edit the specific grass tiles (row 9, cols 1-2)
            if (extractedTheme) {
              setLoadingMessage('Editing tiles for theme...')
              try {
                tilesBlob = await generator.editTilesForTheme(tilesBlob, extractedTheme)
                console.log(`✓ Edited tiles for ${extractedTheme} theme`)
              } catch (editError) {
                console.warn('Failed to edit tiles for theme, using original:', editError)
                // Continue with original tiles if editing fails
              }
            } else {
              console.log('✓ Using backup tiles from assets-backup/images/tiles.png')
            }

            const tilesUrl = URL.createObjectURL(tilesBlob)
            generatedAssets.push({
              id: 'tiles',
              name: tilesConfig.file,
              type: tilesConfig.type,
              url: tilesUrl,
              blob: tilesBlob,
              assetKey: 'tiles',
              fromBackup: !extractedTheme // Only mark as backup if we didn't edit it
            })
          }
        } catch (error) {
          console.warn('Could not load backup tiles:', error)
        }
      }

      setAssets(generatedAssets)

      // Automatically save all assets to server (except unedited backup tiles)
      try {
        const assetsToSave = generatedAssets
          .filter(asset => !asset.fromBackup) // Don't save unedited backup tiles
          .map(asset => ({
            blob: asset.blob,
            filename: asset.name
          }))
        if (assetsToSave.length > 0) {
          await generator.saveAssetsToServer(assetsToSave)
          console.log('✓ All generated assets saved to assets/images/')
        }
      } catch (saveError) {
        console.warn('Failed to auto-save assets (server may not be running):', saveError.message)
        console.warn('Start the server with: npm run dev:server')
      }

      setIsLoading(false)
      setCurrentPhase(2)
    } catch (error) {
      console.error('Error generating assets:', error)
      alert(`Failed to generate assets: ${error.message}`)
      setIsLoading(false)
    }
  }

  // Simple theme extraction - looks for common theme keywords
  const extractThemeFromPrompt = (gamePromptText) => {
    const lowerPrompt = gamePromptText.toLowerCase()

    // Check for multi-word themes first
    if (lowerPrompt.includes('star wars') || lowerPrompt.includes('starwars')) {
      return 'star wars'
    }
    if (lowerPrompt.includes('horror')) {
      return 'horror'
    }

    // Check for single-word themes
    const themes = ['cyberpunk', 'medieval', 'fantasy', 'sci-fi', 'space', 'western', 'steampunk', 'post-apocalyptic', 'zombie', 'viking', 'samurai', 'ninja']
    for (const theme of themes) {
      if (lowerPrompt.includes(theme)) {
        return theme
      }
    }
    return null // No specific theme found
  }

  // Map asset keys to generic category names for loading messages
  const getAssetCategory = (assetKey) => {
    const categoryMap = {
      sword: 'weapon',
      potions: 'items',
      fireball: 'projectiles',
      spell: 'projectiles',
      characters: 'characters',
      dragons: 'boss',
      things: 'items',
      dead: 'effects',
      flame: 'effects',
      'level-particle': 'particles',
      'spell-particle': 'particles'
    }
    return categoryMap[assetKey] || 'asset'
  }

  const handleAssetsComplete = async () => {
    setIsLoading(true)
    setLoadingMessage('Generating game logic...')
    setLoadingProgress(0)

    // Simulate PRD generation with progress
    for (let i = 0; i <= 100; i += 15) {
      await new Promise(resolve => setTimeout(resolve, 80))
      setLoadingProgress(i)
    }

    // Generate initial PRD based on prompt and assets
    const initialPRD = {
      game: {
        title: gamePrompt || 'Action RPG',
        worldSize: 1920,
        camera: { followPlayer: true }
      },
      player: {
        name: 'Hero',
        level: 1,
        health: 100,
        vitality: 100,
        strength: 25,
        speed: 125,
        invincibilityFrames: 500
      },
      enemies: {
        types: ['Skeleton', 'Slime', 'Bat', 'Ghost', 'Spider'],
        spawnCount: 100,
        scaling: { health: 2, speed: 1.5, strength: 1.5, reward: 1.5 }
      },
      bosses: {
        type: 'Dragon',
        health: 2000,
        speed: 100,
        strength: 50,
        reward: 500,
        spawnThreshold: 5000
      },
      collectables: {
        gold: { dropChance: 0.2, multiplier: 2 },
        potions: { dropChance: 0.33, types: ['health', 'vitality', 'strength', 'speed'] }
      },
      progression: {
        xpToNext: 20,
        xpMultiplier: 1.1,
        levelUpStats: { vitality: 5, health: 5, strength: 1, speed: 1 }
      }
    }
    setGamePRD(initialPRD)
    setIsLoading(false)
    setCurrentPhase(3)
  }

  const handleLogicComplete = async () => {
    setIsLoading(true)
    setLoadingMessage('Compiling game...')
    setLoadingProgress(0)

    // Simulate game compilation with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 120))
      setLoadingProgress(i)
    }

    setGameGenerated(true)
    setIsLoading(false)
    setCurrentPhase(4)
  }

  const handleBackToEditor = () => {
    setCurrentPhase(3)
  }

  return (
    <div className="app">
      {isLoading && (
        <LoadingBar message={loadingMessage} progress={loadingProgress} />
      )}
      {currentPhase === 1 && (
        <Phase1Prompt onSubmit={handlePromptSubmit} />
      )}
      {currentPhase === 2 && (
        <Phase2AssetStudio
          prompt={gamePrompt}
          assets={assets}
          onAssetsUpdate={setAssets}
          onComplete={handleAssetsComplete}
          onBack={() => setCurrentPhase(1)}
          apiKey={apiKey}
          theme={theme}
        />
      )}
      {currentPhase === 3 && (
        <Phase3LogicStudio
          prompt={gamePrompt}
          assets={assets}
          prd={gamePRD}
          onPRDUpdate={setGamePRD}
          onComplete={handleLogicComplete}
          onBack={() => setCurrentPhase(2)}
        />
      )}
      {currentPhase === 4 && (
        <Phase4GamePreview
          prd={gamePRD}
          assets={assets}
          onBackToEditor={handleBackToEditor}
        />
      )}
    </div>
  )
}

export default App

