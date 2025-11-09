import React, { useState } from 'react'
import AssetGenerationService from '../services/assetGenerationService'
import './Phase2AssetStudio.css'

// Map asset keys to generic category names (in gold color via CSS)
const getAssetDisplayName = (assetKey) => {
  const displayNames = {
    'sword': 'Weapon',
    'potions': 'Items',
    'fireball': 'Projectile',
    'spell': 'Spell',
    'characters': 'Characters',
    'dragons': 'Boss',
    'tiles': 'Tiles',
    'things': 'Objects',
    'dead': 'Sprites',
    'flame': 'Effect',
    'level-particle': 'Particle',
    'spell-particle': 'Particle'
  }
  // Return display name or fallback to formatted key (no spaces)
  const name = displayNames[assetKey] || assetKey
  // Ensure no extra spaces
  return name.trim()
}

function Phase2AssetStudio({ prompt, assets, onAssetsUpdate, onComplete, onBack, apiKey, theme }) {
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [chatMessage, setChatMessage] = useState('')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generator, setGenerator] = useState(null)
  const [saveStatus, setSaveStatus] = useState(null)

  // Initialize generator on mount
  React.useEffect(() => {
    if (apiKey && !generator) {
      const gen = new AssetGenerationService(apiKey)
      gen.init().then(() => {
        setGenerator(gen)
      }).catch(err => {
        console.error('Failed to initialize generator:', err)
      })
    }
  }, [apiKey, generator])

  const handleAssetClick = (asset) => {
    // Don't allow editing tiles (they're from backup)
    if (asset.fromBackup) {
      alert('Tiles are from backup and cannot be regenerated. They are preserved as-is.')
      return
    }
    setSelectedAsset(asset)
    setChatMessage('')
  }

  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatMessage.trim() || !selectedAsset || !generator || isRegenerating) {
      return
    }

    setIsRegenerating(true)
    try {
      // Regenerate the asset with custom edit
      const assetKey = selectedAsset.assetKey || selectedAsset.id
      const newBlob = await generator.generateAsset(assetKey, {
        theme,
        customEdit: chatMessage.trim()
      })

      // Create new URL for the regenerated asset
      const newUrl = URL.createObjectURL(newBlob)

      // Update the asset in the assets array
      const updatedAssets = assets.map(asset => {
        if (asset.id === selectedAsset.id) {
          // Revoke old URL to free memory
          if (asset.url && asset.url.startsWith('blob:')) {
            URL.revokeObjectURL(asset.url)
          }
          return {
            ...asset,
            url: newUrl,
            blob: newBlob
          }
        }
        return asset
      })

      onAssetsUpdate(updatedAssets)

      // Update selected asset to show new image
      setSelectedAsset({
        ...selectedAsset,
        url: newUrl,
        blob: newBlob
      })

      // Automatically save to server
      try {
        await generator.saveAssetToServer(newBlob, selectedAsset.name)
        const displayName = getAssetDisplayName(selectedAsset.assetKey || selectedAsset.id)
        setSaveStatus({ type: 'success', message: `Saved ${displayName} to assets/images/` })
        setTimeout(() => setSaveStatus(null), 3000)
      } catch (saveError) {
        console.error('Error saving asset:', saveError)
        setSaveStatus({ type: 'error', message: `Failed to save: ${saveError.message}` })
        setTimeout(() => setSaveStatus(null), 5000)
      }

      setChatMessage('')
    } catch (error) {
      console.error('Error regenerating asset:', error)
      alert(`Failed to regenerate asset: ${error.message}`)
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleSaveAllAssets = async () => {
    if (!generator || isSaving) return

    setIsSaving(true)
    setSaveStatus({ type: 'info', message: 'Saving all assets...' })

    try {
      const assetsToSave = assets
        .filter(asset => asset.blob && !asset.fromBackup) // Only save generated assets, not backup tiles
        .map(asset => ({
          blob: asset.blob,
          filename: asset.name
        }))

      if (assetsToSave.length === 0) {
        setSaveStatus({ type: 'error', message: 'No assets to save' })
        setIsSaving(false)
        return
      }

      const result = await generator.saveAssetsToServer(assetsToSave)

      const successCount = result.results.filter(r => r.success).length
      const failCount = result.results.length - successCount

      if (failCount === 0) {
        setSaveStatus({ type: 'success', message: `Successfully saved ${successCount} assets to assets/images/` })
      } else {
        setSaveStatus({ type: 'warning', message: `Saved ${successCount} assets, ${failCount} failed` })
      }

      setTimeout(() => setSaveStatus(null), 5000)
    } catch (error) {
      console.error('Error saving assets:', error)
      setSaveStatus({ type: 'error', message: `Failed to save assets: ${error.message}` })
      setTimeout(() => setSaveStatus(null), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCleanPink = async () => {
    if (!selectedAsset || !generator || isCleaning) {
      return
    }

    setIsCleaning(true)
    try {
      // Clean pink pixels from the asset
      const cleanedBlob = await generator.cleanPinkPixels(selectedAsset.blob)

      // Create new URL for the cleaned asset
      const newUrl = URL.createObjectURL(cleanedBlob)

      // Update the asset in the assets array
      const updatedAssets = assets.map(asset => {
        if (asset.id === selectedAsset.id) {
          // Revoke old URL to free memory
          if (asset.url && asset.url.startsWith('blob:')) {
            URL.revokeObjectURL(asset.url)
          }
          return {
            ...asset,
            url: newUrl,
            blob: cleanedBlob
          }
        }
        return asset
      })

      onAssetsUpdate(updatedAssets)

      // Update selected asset to show cleaned image
      setSelectedAsset({
        ...selectedAsset,
        url: newUrl,
        blob: cleanedBlob
      })

      // Automatically save to server
      try {
        await generator.saveAssetToServer(cleanedBlob, selectedAsset.name)
        const displayName = getAssetDisplayName(selectedAsset.assetKey || selectedAsset.id)
        setSaveStatus({ type: 'success', message: `Cleaned and saved ${displayName} to assets/images/` })
        setTimeout(() => setSaveStatus(null), 3000)
      } catch (saveError) {
        console.error('Error saving cleaned asset:', saveError)
        setSaveStatus({ type: 'error', message: `Failed to save: ${saveError.message}` })
        setTimeout(() => setSaveStatus(null), 5000)
      }
    } catch (error) {
      console.error('Error cleaning pink pixels:', error)
      alert(`Failed to clean pink pixels: ${error.message}`)
    } finally {
      setIsCleaning(false)
    }
  }

  const closeModal = () => {
    setSelectedAsset(null)
    setChatMessage('')
  }

  return (
    <div className="phase2-container">
      <div className="phase2-header">
        <button className="phase2-back-button" onClick={onBack}>
          ← Back
        </button>
        <h1 className="phase2-title">Asset Studio</h1>
        <div className="phase2-prompt-display">
          <strong>Game Idea:</strong> {prompt}
        </div>
      </div>

      <div className="phase2-content">
        <div className="phase2-assets-grid">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="phase2-asset-card"
              onClick={() => handleAssetClick(asset)}
            >
              <div className="phase2-asset-image-container">
                <img
                  src={asset.url}
                  alt={getAssetDisplayName(asset.assetKey || asset.id)}
                  className="phase2-asset-image"
                />
              </div>
              <div className="phase2-asset-info">
                <div className="phase2-asset-name">
                  {getAssetDisplayName(asset.assetKey || asset.id)}
                </div>
                <div className="phase2-asset-type">{asset.type}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="phase2-actions">
          <button
            className="phase2-save-button"
            onClick={handleSaveAllAssets}
            disabled={isSaving || !generator}
          >
            {isSaving ? 'Saving...' : 'Save All Assets to Disk'}
          </button>
          <button className="phase2-next-button" onClick={onComplete}>
            Next: Define Logic →
          </button>
        </div>
        {saveStatus && (
          <div className={`phase2-save-status phase2-save-status-${saveStatus.type}`}>
            {saveStatus.message}
          </div>
        )}
      </div>

      {selectedAsset && (
        <div className="phase2-modal-overlay" onClick={closeModal}>
          <div className="phase2-modal" onClick={(e) => e.stopPropagation()}>
            <div className="phase2-modal-header">
              <h2>Edit: {getAssetDisplayName(selectedAsset.assetKey || selectedAsset.id)}</h2>
              <button className="phase2-modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="phase2-modal-content">
              <div className="phase2-modal-preview">
                <img
                  src={selectedAsset.url}
                  alt={getAssetDisplayName(selectedAsset.assetKey || selectedAsset.id)}
                  className="phase2-modal-image"
                />
              </div>
              <form onSubmit={handleChatSubmit} className="phase2-modal-chat">
                <label className="phase2-modal-label">
                  Describe changes or new theme (e.g., "Make it a laser gun", "Give him a red cape", "cyberpunk style", "add a 3x3 walk cycle")
                </label>
                <textarea
                  className="phase2-modal-textarea"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type your changes here... (e.g., 'Make it a laser gun' or 'cyberpunk style')"
                  rows={4}
                />
                <div className="phase2-modal-buttons">
                  <button
                    type="button"
                    className="phase2-modal-clean-button"
                    onClick={handleCleanPink}
                    disabled={isCleaning || isRegenerating || !generator}
                  >
                    {isCleaning ? 'Cleaning...' : 'Clean Pink'}
                  </button>
                  <button
                    type="submit"
                    className="phase2-modal-submit"
                    disabled={!chatMessage.trim() || isRegenerating || isCleaning || !generator}
                  >
                    {isRegenerating ? 'Regenerating...' : 'Regenerate Asset'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Phase2AssetStudio

