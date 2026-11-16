import type { SavedWord, UserProfile } from '../types'
import { localDayKey } from './dateKey'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function wordsHtml(profile: UserProfile, words: SavedWord[]): string {
  const day = localDayKey()
  const rows = words
    .map((w, i) => {
      const ex = w.example
        ? `<div class="ex"><em>${escapeHtml(w.example)}</em>${
            w.exampleMy ? `<br/>${escapeHtml(w.exampleMy)}` : ''
          }</div>`
        : ''
      const tip = w.tipMy
        ? `<div class="tip">💡 ${escapeHtml(w.tipMy)}</div>`
        : ''
      const ctx = w.context
        ? `<div class="ctx">Context: ${escapeHtml(w.context.slice(0, 160))}</div>`
        : ''
      return `<tr>
        <td class="n">${i + 1}</td>
        <td class="w"><strong>${escapeHtml(w.word)}</strong>${
          w.pos ? ` <span class="pos">${escapeHtml(w.pos)}</span>` : ''
        }</td>
        <td class="m">${escapeHtml(w.meaningMy)}${ex}${tip}${ctx}</td>
      </tr>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="my">
<head>
<meta charset="utf-8"/>
<title>Saved Words — ${escapeHtml(profile.name)}</title>
<style>
  @page { margin: 18mm; }
  body { font-family: "Segoe UI", "Myanmar Text", sans-serif; color: #1a1a1a; line-height: 1.45; }
  h1 { font-size: 22pt; margin: 0 0 4px; }
  .meta { color: #555; margin-bottom: 18px; font-size: 11pt; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #ccc; padding: 10px 12px; vertical-align: top; }
  th { background: #f3f0ea; text-align: left; }
  .n { width: 36px; color: #666; }
  .w { width: 28%; }
  .pos { color: #666; font-size: 0.85em; font-weight: normal; }
  .ex, .tip, .ctx { margin-top: 6px; color: #444; font-size: 0.92em; }
  .foot { margin-top: 16px; color: #777; font-size: 9pt; }
  @media print {
    .no-print { display: none !important; }
    a { color: inherit; text-decoration: none; }
  }
</style>
</head>
<body>
  <h1>မှတ်ထားသော စကားလုံးများ</h1>
  <div class="meta">${escapeHtml(profile.name)} · Level ${profile.currentLevel} · ${words.length} words · ${day}</div>
  <p class="no-print meta">Print / Save as PDF: use your browser Print dialog (Ctrl+P).</p>
  <table>
    <thead><tr><th>#</th><th>Word</th><th>Meaning (မြန်မာ)</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="3">No saved words</td></tr>'}</tbody>
  </table>
  <p class="foot">Path to C2 · exported ${day}</p>
</body>
</html>`
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Word-compatible .doc (HTML Word can open) */
export function downloadWordsDoc(profile: UserProfile, words: SavedWord[]): void {
  const html = wordsHtml(profile, words)
  const blob = new Blob(['\ufeff', html], {
    type: 'application/msword;charset=utf-8',
  })
  downloadBlob(`path-to-c2-words-${localDayKey()}.doc`, blob)
}

/** Standalone HTML — open and Print → Save as PDF */
export function downloadWordsHtml(profile: UserProfile, words: SavedWord[]): void {
  const html = wordsHtml(profile, words)
  const blob = new Blob(['\ufeff', html], { type: 'text/html;charset=utf-8' })
  downloadBlob(`path-to-c2-words-${localDayKey()}.html`, blob)
}

/** Open printable window for PDF via browser print */
export function printWordsPdf(profile: UserProfile, words: SavedWord[]): void {
  const html = wordsHtml(profile, words)
  const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700')
  if (!w) {
    downloadWordsHtml(profile, words)
    return
  }
  w.document.open()
  w.document.write(html)
  w.document.close()
  w.focus()
  window.setTimeout(() => {
    w.print()
  }, 350)
}
