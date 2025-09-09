import fs from 'fs'
import path from 'path'
import os from 'os'

const CACHE_DIR = path.join(os.homedir(), '.docworks', 'cache')
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true })
}

export function getCached(key: string): any {
  const cachePath = path.join(CACHE_DIR, `${key}.json`)

  if (!fs.existsSync(cachePath)) {
    return null
  }

  const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'))

  // Check if expired
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    fs.unlinkSync(cachePath)
    return null
  }

  return cached.data
}

export function setCached(key: string, data: any): void {
  const cachePath = path.join(CACHE_DIR, `${key}.json`)

  fs.writeFileSync(
    cachePath,
    JSON.stringify({
      timestamp: Date.now(),
      data,
    })
  )
}
//** */
