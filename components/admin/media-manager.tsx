'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Upload, Trash2, Copy, Check, Info, FileIcon, Search, Image as ImageIcon } from 'lucide-react'
import type { Media } from '@/lib/db/types'
import { uploadMediaAction, deleteMediaAction } from '@/app/admin/media/actions'

interface MediaManagerProps {
  initialMedia: Media[]
}

export function MediaManager({ initialMedia }: MediaManagerProps) {
  const [mediaList, setMediaList] = useState(initialMedia)
  const [search, setSearch] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [altText, setAltText] = useState('')
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const filteredMedia = mediaList.filter(
    (m) =>
      m.filename.toLowerCase().includes(search.toLowerCase()) ||
      (m.alt_text && m.alt_text.toLowerCase().includes(search.toLowerCase())) ||
      (m.mime_type && m.mime_type.toLowerCase().includes(search.toLowerCase()))
  )

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('alt_text', altText)

    startTransition(async () => {
      const res = await uploadMediaAction(formData)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess('Media file uploaded successfully!')
        setSelectedFile(null)
        setAltText('')
        // Refresh page or reload media list
        window.location.reload()
      }
    })
  }

  const handleDelete = (id: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete file "${filename}"? This will remove it from Supabase Storage.`)) {
      return
    }

    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const res = await deleteMediaAction(id)
      if (res.error) {
        setError(res.error)
      } else {
        setMediaList((prev) => prev.filter((m) => m.id !== id))
        if (previewMedia?.id === id) setPreviewMedia(null)
        setSuccess(`Deleted ${filename}`)
      }
    })
  }

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-8">
      {/* Upload Box */}
      <div className="p-6 rounded-xl border border-border/40 bg-card/40 space-y-4">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Upload size={18} className="text-accent" />
          Upload New File to Supabase Storage
        </h2>

        {error && (
          <div className="p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 text-xs">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-lg border border-green-500/40 bg-green-500/10 text-green-400 text-xs">
            {success}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="media-file" className="block text-xs font-medium text-muted-foreground mb-1.5">
                Select File (Images, Documents)
              </label>
              <input
                id="media-file"
                type="file"
                required
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-accent/10 file:text-foreground hover:file:bg-accent/20 cursor-pointer"
              />
            </div>
            <div>
              <label htmlFor="alt-text" className="block text-xs font-medium text-muted-foreground mb-1.5">
                Alt Text / Description (Optional)
              </label>
              <input
                id="alt-text"
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Image description..."
                className="w-full px-3 py-2 rounded-lg border border-border/40 bg-card/50 focus:bg-card focus:border-accent focus:outline-none text-xs text-foreground"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedFile || isPending}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Upload size={14} />
            {isPending ? 'Uploading to Supabase...' : 'Upload File'}
          </button>
        </form>
      </div>

      {/* Search & Grid Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold">Media Library ({filteredMedia.length})</h2>
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search media files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-border/40 bg-card/50 text-xs text-foreground focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Grid View */}
      {filteredMedia.length === 0 ? (
        <div className="p-12 rounded-xl border border-border/40 bg-card/30 text-center space-y-2">
          <ImageIcon size={32} className="mx-auto text-muted-foreground/50" />
          <p className="text-foreground/70 font-medium text-sm">No media files found.</p>
          <p className="text-xs text-muted-foreground">Upload files above to store them in your Supabase Storage bucket.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => {
            const isImage = item.mime_type?.startsWith('image/')
            return (
              <div
                key={item.id}
                className="group relative rounded-xl border border-border/40 bg-card/40 overflow-hidden flex flex-col justify-between hover:border-accent/40 transition-all"
              >
                {/* Thumbnail / Icon */}
                <div
                  onClick={() => setPreviewMedia(item)}
                  className="aspect-square bg-background/50 relative flex items-center justify-center cursor-pointer overflow-hidden"
                >
                  {isImage ? (
                    <img
                      src={item.public_url}
                      alt={item.alt_text || item.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <FileIcon size={36} className="text-muted-foreground/60" />
                  )}
                </div>

                {/* File Details Bar */}
                <div className="p-3 space-y-1 bg-card/80 border-t border-border/30">
                  <p className="text-xs font-medium text-foreground truncate" title={item.filename}>
                    {item.filename}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {formatFileSize(item.size)}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item.public_url, item.id)}
                      className="text-[10px] text-accent hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check size={10} className="text-green-400" />
                          <span className="text-green-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={10} />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.filename)}
                      disabled={isPending}
                      className="text-muted-foreground hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete File"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 rounded-xl p-6 max-w-lg w-full space-y-4 relative">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-semibold text-sm truncate max-w-xs">{previewMedia.filename}</h3>
              <button
                onClick={() => setPreviewMedia(null)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕ Close
              </button>
            </div>

            {previewMedia.mime_type?.startsWith('image/') && (
              <div className="rounded-lg overflow-hidden border border-border/30 bg-background/50 flex items-center justify-center max-h-64">
                <img
                  src={previewMedia.public_url}
                  alt={previewMedia.alt_text || previewMedia.filename}
                  className="max-h-64 object-contain"
                />
              </div>
            )}

            <div className="space-y-2 text-xs text-foreground/80 font-mono">
              <p><strong className="text-muted-foreground font-sans">Storage Path:</strong> {previewMedia.storage_path}</p>
              <p><strong className="text-muted-foreground font-sans">MIME Type:</strong> {previewMedia.mime_type || 'Unknown'}</p>
              <p><strong className="text-muted-foreground font-sans">Size:</strong> {formatFileSize(previewMedia.size)}</p>
              <p className="break-all"><strong className="text-muted-foreground font-sans">Public URL:</strong> {previewMedia.public_url}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleCopyUrl(previewMedia.public_url, previewMedia.id)}
                className="flex-1 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy size={12} />
                Copy Public URL
              </button>
              <button
                onClick={() => handleDelete(previewMedia.id, previewMedia.filename)}
                className="py-2 px-4 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-semibold cursor-pointer"
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
