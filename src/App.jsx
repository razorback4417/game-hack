import React, { useState } from 'react'
import Phase1Prompt from './components/Phase1Prompt'
import Phase2AssetStudio from './components/Phase2AssetStudio'
import Phase3LogicStudio from './components/Phase3LogicStudio'
import Phase4GamePreview from './components/Phase4GamePreview'
import LoadingBar from './components/LoadingBar'
import BackgroundMusic from './components/BackgroundMusic'
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
      // Get API key from environment variable or use provided one
      const key = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyByg3gM3e-CQJTsz7GcCSZROIwsQmQFz0A';
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
          .filter(asset => !asset.fromBackup && asset.blob) // Don't save unedited backup tiles, only assets with blobs
          .map(asset => ({
            blob: asset.blob,
            filename: asset.name
          }))
        if (assetsToSave.length > 0) {
          // Check if server is available first
          const serverUrl = import.meta.env.VITE_ASSET_SERVER_URL || 'http://localhost:3002'
          try {
            // Use Promise.race for timeout compatibility
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), 2000)
            )
            const healthCheck = await Promise.race([
              fetch(`${serverUrl}/api/health`, { method: 'GET' }),
              timeoutPromise
            ])
            if (healthCheck.ok) {
              await generator.saveAssetsToServer(assetsToSave)
              console.log('✓ All generated assets saved to assets/images/')
            } else {
              console.warn('Asset server health check failed, skipping auto-save')
            }
          } catch (serverError) {
            // Server not available - silently skip (this is expected if server isn't running)
            console.warn('Asset server not available, skipping auto-save. Start with: npm run dev:server')
          }
        }
      } catch (saveError) {
        // Don't show error to user - asset generation succeeded, saving is optional
        console.warn('Failed to auto-save assets:', saveError.message)
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
      description: gamePrompt || 'An action RPG where you play as a hero fighting monsters in a pixel art world.',
      gameplay: {
        overview: 'A top-down action RPG where the player explores a large world, fights enemies, collects items, and battles powerful bosses.',
        controls: {
          movement: 'WASD keys to move in 8 directions',
          melee: 'Hold left mouse button to attack with a sword',
          spell: 'Press spacebar to cast a magical spell'
        },
        world: {
          size: 'Large open world (1920x1920 pixels)',
          camera: 'Camera follows the player',
          environment: 'Pixel art tileset with trees, obstacles, and decorative elements'
        }
      },
      player: {
        name: 'Hero',
        description: 'A customizable hero character that starts at level 1',
        stats: {
          health: 100,
          vitality: 100,
          strength: 25,
          speed: 125
        },
        abilities: {
          melee: 'Sword attack that rotates toward the mouse cursor',
          spell: 'Magical projectile spell with 6-frame animation'
        },
        progression: {
          startingLevel: 1,
          xpToNext: 20,
          levelUpBonus: 'Gains +5 health, +5 vitality, +1 strength, and +1 speed per level'
        }
      },
      enemies: {
        description: 'Five different enemy types spawn throughout the world',
        types: [
          {
            name: 'Skeleton',
            description: 'Common enemy with balanced stats. Appears 30% of the time.',
            stats: '100 health, 70 speed, 20 strength, rewards 5 XP'
          },
          {
            name: 'Slime',
            description: 'Slow but tanky enemy with high health. Appears 10% of the time.',
            stats: '300 health, 40 speed, 50 strength, rewards 10 XP'
          },
          {
            name: 'Bat',
            description: 'Fast but fragile flying enemy. Appears 20% of the time.',
            stats: '20 health, 200 speed, 10 strength, rewards 2 XP'
          },
          {
            name: 'Ghost',
            description: 'Moderate enemy with good stats. Appears 10% of the time.',
            stats: '200 health, 60 speed, 30 strength, rewards 7 XP'
          },
          {
            name: 'Spider',
            description: 'Quick enemy with moderate health. Appears 30% of the time.',
            stats: '50 health, 120 speed, 12 strength, rewards 4 XP'
          }
        ],
        spawning: {
          totalCount: 100,
          scaling: 'Enemies get stronger as player levels up, gaining +2 health, +1.5 speed, +1.5 strength, and +1.5 XP reward per level'
        }
      },
      bosses: {
        type: 'Dragon',
        description: 'Powerful boss enemy that spawns when the player collects enough gold',
        stats: {
          health: 2000,
          speed: 100,
          strength: 50,
          reward: 500
        },
        spawning: {
          threshold: 'Spawns when player collects 5000 gold',
          respawn: 'Each subsequent dragon requires 5000 more gold than the previous one',
          variants: '8 different color variants that cycle through'
        },
        attacks: {
          fireball: 'Shoots animated fireball projectiles at the player'
        },
        death: {
          effect: 'Explodes with 100 flame particles when defeated',
          drops: 'Always drops gold, chests, and stat potions'
        }
      },
      collectables: {
        gold: {
          description: 'Currency dropped by defeated enemies',
          dropRate: '20% chance to drop from any enemy',
          value: 'Base value multiplied by 2'
        },
        potions: {
          description: 'Consumable items that permanently boost player stats',
          dropRate: '33% chance to drop from defeated enemies',
          types: [
            {
              name: 'Health Potion',
              description: 'Restores 20-30 health points',
              dropChance: '70% of potion drops'
            },
            {
              name: 'Vitality Potion',
              description: 'Permanently increases maximum vitality by 4-14 points',
              dropChance: '10% of potion drops'
            },
            {
              name: 'Strength Potion',
              description: 'Permanently increases attack strength by 4-14 points',
              dropChance: '10% of potion drops'
            },
            {
              name: 'Speed Potion',
              description: 'Permanently increases movement speed by 4-14 points',
              dropChance: '10% of potion drops'
            }
          ]
        },
        chests: {
          description: 'Treasure chests dropped by defeated dragons',
          contents: 'Contains valuable rewards'
        }
      },
      progression: {
        leveling: {
          xpSystem: 'Gain XP by defeating enemies',
          xpToNext: 'Starts at 20 XP, increases by 10% each level',
          levelUpEffects: 'Celebratory particle effects when leveling up'
        },
        difficulty: {
          enemyScaling: 'Enemies become stronger as player levels up',
          bossSpawning: 'Bosses spawn more frequently as player collects more gold'
        }
      },
      audio: {
        music: {
          menu: 'Opening theme plays in the main menu',
          gameplay: 'Overworld music loops during gameplay'
        },
        soundEffects: {
          combat: 'Attack sounds for player and all enemy types',
          collection: 'Sounds for collecting gold and potions',
          progression: 'Level up sound effect',
          boss: 'Dragon spawn and combat sounds'
        }
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
      <BackgroundMusic isGamePreview={currentPhase === 4} />
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

