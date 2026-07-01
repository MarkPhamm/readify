import { useMemo, useState } from 'react'
import { serializeReadings } from '../lib/readings'

export default function DataManager({ readings, onImport }) {
  const json = useMemo(() => serializeReadings(readings), [readings])
  const [copied, setCopied] = useState(false)
  const [importText, setImportText] = useState('')
  const [importMsg, setImportMsg] = useState(null)

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  function downloadJson() {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'readings.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function handleImport() {
    try {
      const count = onImport(importText)
      setImportMsg({ type: 'success', text: `Imported — ${count} reading(s) now on this browser.` })
      setImportText('')
    } catch (err) {
      setImportMsg({ type: 'error', text: err?.message || 'Could not parse that JSON.' })
    }
  }

  return (
    <div className="data-manager">
      <section className="data-block">
        <h3 className="data-title">Export ({readings.length})</h3>
        <p className="data-hint">
          Readings you add in-app live in this browser only. To sync everywhere,
          replace <code>data/readings.json</code> in your repo with this, then commit
          &amp; push — the deployed site reads that file for everyone.
        </p>
        <textarea className="data-json" readOnly rows={8} value={json} />
        <div className="data-actions">
          <button type="button" className="btn-secondary" onClick={copyJson}>
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
          <button type="button" className="btn-secondary" onClick={downloadJson}>
            Download readings.json
          </button>
        </div>
      </section>

      <section className="data-block">
        <h3 className="data-title">Import</h3>
        <p className="data-hint">
          Paste a readings JSON array to load it into this browser (merged and
          deduped with what&apos;s already here).
        </p>
        <textarea
          className="data-json"
          rows={5}
          placeholder='[ { "date": "2026-06-30", "url": "https://…", "title": "…" } ]'
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
        />
        <div className="data-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleImport}
            disabled={!importText.trim()}
          >
            Import
          </button>
          {importMsg ? (
            <span className={`form-message ${importMsg.type}`}>{importMsg.text}</span>
          ) : null}
        </div>
      </section>
    </div>
  )
}
