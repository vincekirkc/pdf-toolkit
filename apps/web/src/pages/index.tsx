import Head from 'next/head'
import { useState, useRef } from 'react'
import { mergePdfs } from '@pdf-toolkit/pdf-core'

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    pdfBytes: Uint8Array
    pageCount: number
    durationMs: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList) => {
    const newFiles = Array.from(files).filter(file => file.type === 'application/pdf')
    if (newFiles.length === 0) {
      setError('Please select PDF files only')
      return
    }
    setSelectedFiles(prev => [...prev, ...newFiles])
    setError(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('dragover')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragover')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('dragover')
    handleFileSelect(e.dataTransfer.files)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files)
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleMerge = async () => {
    if (selectedFiles.length < 2) {
      setError('Please select at least 2 PDF files to merge')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const mergeResult = await mergePdfs(selectedFiles, { measure: true })
      setResult(mergeResult)
      setSelectedFiles([])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred while merging PDFs'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!result) return

    const blob = new Blob([result.pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `merged-${Date.now()}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Head>
        <title>PDF Toolkit - Merge PDFs</title>
        <meta name="description" content="Merge PDFs in under 2 seconds. No signup required." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <h1>Merge PDFs</h1>
        <p className="subtitle">Combine multiple PDF files into one. No signup required.</p>

        <div className="upload-section">
          <div
            className="upload-area"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <p>Drag and drop PDF files here</p>
            <p style={{ marginBottom: '16px' }}>or</p>
            <label htmlFor="file-input" className="file-input-label">
              Choose Files
            </label>
            <input
              id="file-input"
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileInputChange}
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                Selected Files ({selectedFiles.length})
              </h3>
              <ul className="file-list">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="file-item">
                    <span className="file-item-name">{file.name}</span>
                    <span className="file-item-size">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <button
                      className="file-item-remove"
                      onClick={() => removeFile(index)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            className="merge-button"
            onClick={handleMerge}
            disabled={selectedFiles.length < 2 || isLoading}
          >
            {isLoading ? (
              <span className="loading">
                <span className="spinner" />
                Merging...
              </span>
            ) : (
              `Merge ${selectedFiles.length > 0 ? `(${selectedFiles.length} files)` : ''}`
            )}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {result && (
          <div className="result">
            <div className="result-title">✓ PDFs merged successfully!</div>
            <div className="result-info">
              <div className="result-stat">
                <span className="result-stat-label">Pages</span>
                <span className="result-stat-value">{result.pageCount}</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-label">Time</span>
                <span className="result-stat-value">{result.durationMs.toFixed(2)}ms</span>
              </div>
            </div>
            <button className="download-button" onClick={handleDownload}>
              Download Merged PDF
            </button>
          </div>
        )}
      </div>
    </>
  )
}
