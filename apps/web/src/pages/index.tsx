import Head from 'next/head'
import { useState, useRef } from 'react'
import {
  mergePdfsWithInstrumentation,
  splitPdfWithInstrumentation,
  rotatePdfWithInstrumentation,
  compressPdfWithInstrumentation,
} from '@/lib/operations'

type Operation = 'merge' | 'split' | 'rotate' | 'compress'

interface OperationResult {
  type: Operation
  pdfBytes?: Uint8Array
  results?: Array<{ pdfBytes: Uint8Array; pageCount: number }>
  pageCount: number
  durationMs: number
  costUsd: number
}

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [currentOperation, setCurrentOperation] = useState<Operation>('merge')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<OperationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showCostDetails, setShowCostDetails] = useState(false)
  const [rotateDegrees, setRotateDegrees] = useState(90)
  const [compressQuality, setCompressQuality] = useState<'low' | 'medium' | 'high'>('medium')
  const [splitChunkSize, setSplitChunkSize] = useState(1)

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

  const handleExecuteOperation = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one PDF file')
      return
    }

    if (currentOperation === 'merge' && selectedFiles.length < 2) {
      setError('Merge requires at least 2 PDF files')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let operationResult

      switch (currentOperation) {
        case 'merge':
          operationResult = await mergePdfsWithInstrumentation(selectedFiles)
          setResult({
            type: 'merge',
            pdfBytes: operationResult.pdfBytes,
            pageCount: operationResult.pageCount,
            durationMs: operationResult.durationMs,
            costUsd: operationResult.costUsd,
          })
          break

        case 'split':
          operationResult = await splitPdfWithInstrumentation(selectedFiles[0], splitChunkSize === 1 ? undefined : splitChunkSize)
          setResult({
            type: 'split',
            results: operationResult.results,
            pageCount: operationResult.results.length,
            durationMs: operationResult.durationMs,
            costUsd: operationResult.costUsd,
          })
          break

        case 'rotate':
          operationResult = await rotatePdfWithInstrumentation(selectedFiles[0], rotateDegrees)
          setResult({
            type: 'rotate',
            pdfBytes: operationResult.pdfBytes,
            pageCount: operationResult.pageCount,
            durationMs: operationResult.durationMs,
            costUsd: operationResult.costUsd,
          })
          break

        case 'compress':
          operationResult = await compressPdfWithInstrumentation(selectedFiles[0], compressQuality)
          setResult({
            type: 'compress',
            pdfBytes: operationResult.pdfBytes,
            pageCount: operationResult.pageCount,
            durationMs: operationResult.durationMs,
            costUsd: operationResult.costUsd,
          })
          break
      }

      setSelectedFiles([])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `An error occurred while executing ${currentOperation}`
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = (pdfBytes?: Uint8Array, index?: number) => {
    if (!pdfBytes) return

    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    if (result?.type === 'split' && index !== undefined) {
      link.download = `page-${index + 1}-${Date.now()}.pdf`
    } else {
      link.download = `${result?.type}-${Date.now()}.pdf`
    }

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Head>
        <title>PDF Toolkit</title>
        <meta name="description" content="Merge, split, rotate, and compress PDFs. All operations under 2 seconds." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <h1>PDF Toolkit</h1>
        <p className="subtitle">Merge, split, rotate, and compress PDFs. No signup required.</p>

        {/* Operation Selector */}
        <div className="operation-selector">
          {(['merge', 'split', 'rotate', 'compress'] as Operation[]).map(op => (
            <button
              key={op}
              className={`op-button ${currentOperation === op ? 'active' : ''}`}
              onClick={() => {
                setCurrentOperation(op)
                setResult(null)
                setError(null)
              }}
            >
              {op.charAt(0).toUpperCase() + op.slice(1)}
            </button>
          ))}
        </div>

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
              multiple={currentOperation === 'merge'}
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

          {/* Operation-specific options */}
          {currentOperation === 'rotate' && selectedFiles.length > 0 && (
            <div className="operation-options">
              <label>
                Rotation: 
                <select value={rotateDegrees} onChange={(e) => setRotateDegrees(Number(e.target.value))}>
                  <option value={90}>90°</option>
                  <option value={180}>180°</option>
                  <option value={270}>270°</option>
                </select>
              </label>
            </div>
          )}

          {currentOperation === 'compress' && selectedFiles.length > 0 && (
            <div className="operation-options">
              <label>
                Quality:
                <select value={compressQuality} onChange={(e) => setCompressQuality(e.target.value as 'low' | 'medium' | 'high')}>
                  <option value="high">High (minimal compression)</option>
                  <option value="medium">Medium (balanced)</option>
                  <option value="low">Low (maximum compression)</option>
                </select>
              </label>
            </div>
          )}

          {currentOperation === 'split' && selectedFiles.length > 0 && (
            <div className="operation-options">
              <label>
                Pages per chunk:
                <input 
                  type="number" 
                  min="1" 
                  value={splitChunkSize} 
                  onChange={(e) => setSplitChunkSize(Number(e.target.value))}
                />
              </label>
            </div>
          )}

          <button
            className="merge-button"
            onClick={handleExecuteOperation}
            disabled={selectedFiles.length === 0 || isLoading}
          >
            {isLoading ? (
              <span className="loading">
                <span className="spinner" />
                Processing...
              </span>
            ) : (
              `${currentOperation.charAt(0).toUpperCase() + currentOperation.slice(1)} ${selectedFiles.length > 0 ? `(${selectedFiles.length} ${currentOperation === 'split' ? 'file' : 'files'})` : ''}`
            )}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {result && (
          <div className="result">
            <div className="result-title">✓ {result.type.charAt(0).toUpperCase() + result.type.slice(1)} completed successfully!</div>
            <div className="result-info">
              <div className="result-stat">
                <span className="result-stat-label">{result.type === 'split' ? 'Chunks' : 'Pages'}</span>
                <span className="result-stat-value">{result.pageCount}</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-label">Time</span>
                <span className="result-stat-value">{result.durationMs.toFixed(2)}ms</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-label">Cost (est.)</span>
                <span className="result-stat-value" style={{ cursor: 'pointer' }} onClick={() => setShowCostDetails(!showCostDetails)}>
                  ${result.costUsd.toFixed(6)}
                </span>
              </div>
            </div>
            
            {showCostDetails && (
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px', padding: '12px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                <p>Cost breakdown (estimated)</p>
                <p style={{ marginTop: '8px', fontWeight: 500 }}>This is tracked for analytics only and does not affect free usage.</p>
              </div>
            )}

            {/* Download buttons */}
            {result.type === 'split' && result.results ? (
              <div>
                <p style={{ fontSize: '12px', marginBottom: '8px', color: '#666' }}>
                  {result.results.length} page(s) to download
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                  {result.results.map((r, idx) => (
                    <button
                      key={idx}
                      className="download-button"
                      onClick={() => handleDownload(r.pdfBytes, idx)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Page {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button className="download-button" onClick={() => handleDownload(result.pdfBytes)}>
                Download {result.type.charAt(0).toUpperCase() + result.type.slice(1)} PDF
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
