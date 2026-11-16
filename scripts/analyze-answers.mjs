import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const dir = 'src/data'
const files = readdirSync(dir).filter((f) => f.endsWith('.ts'))
let withOpts = 0
const idxCount = [0, 0, 0, 0, 0, 0]
let missing = 0
const byFile = {}

for (const f of files) {
  const text = readFileSync(join(dir, f), 'utf8')
  const re =
    /options:\s*(\[[^\]]*\])\s*,\s*answer:\s*('[^']*'|"[^"]*"|\[[^\]]*\])/gs
  let m
  while ((m = re.exec(text))) {
    let options
    try {
      options = eval(m[1])
    } catch {
      continue
    }
    if (!Array.isArray(options) || options.length < 2) continue
    withOpts++
    let answer
    try {
      answer = eval(m[2])
    } catch {
      continue
    }
    const answers = Array.isArray(answer) ? answer : [answer]
    let found = -1
    for (const a of answers) {
      const i = options.indexOf(a)
      if (i >= 0) {
        found = i
        break
      }
    }
    if (found < 0) missing++
    else {
      idxCount[Math.min(found, 5)]++
      byFile[f] = byFile[f] || [0, 0, 0, 0]
      if (found < 4) byFile[f][found]++
    }
  }
}

console.log(
  JSON.stringify(
    {
      withOpts,
      missing,
      idxCount,
      pct: idxCount.map((c) => (withOpts ? Math.round((100 * c) / withOpts) : 0)),
      byFile,
    },
    null,
    2,
  ),
)
