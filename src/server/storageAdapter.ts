import path from 'path'
import fs from 'fs'
import type { FaviconFormat } from '../core/types'
import { validateFaviconBuffer } from './faviconValidator'

export interface SaveFaviconOptions {
  tenantId?: string
  theme?: 'global' | 'light' | 'dark'
  format?: FaviconFormat
  filename?: string
}

export interface FaviconStorageAdapter {
  save(buffer: Buffer, options?: SaveFaviconOptions): Promise<string>
  get(urlOrPath: string): Promise<Buffer | null>
  delete?(urlOrPath: string): Promise<void>
}

/**
 * In-memory reference storage adapter for testing and lightweight backends
 */
export class InMemoryFaviconStorageAdapter implements FaviconStorageAdapter {
  private files = new Map<string, { buffer: Buffer; mime: string }>()

  async save(buffer: Buffer, options: SaveFaviconOptions = {}): Promise<string> {
    const validation = validateFaviconBuffer(buffer, options.filename)
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid favicon file.')
    }

    const tenant = options.tenantId || 'default'
    const theme = options.theme || 'global'
    const ext = validation.format || 'png'
    const key = `/media/favicons/${tenant}/${theme}-${Date.now()}.${ext}`

    this.files.set(key, { buffer, mime: validation.mime || 'image/png' })
    return key
  }

  async get(urlOrPath: string): Promise<Buffer | null> {
    const item = this.files.get(urlOrPath)
    return item ? item.buffer : null
  }

  async delete(urlOrPath: string): Promise<void> {
    this.files.delete(urlOrPath)
  }
}

/**
 * Local filesystem storage adapter with tenant subdirectory isolation
 */
export class DiskFaviconStorageAdapter implements FaviconStorageAdapter {
  constructor(
    private readonly baseDir: string,
    private readonly publicBaseUrl: string = '/media/favicons',
  ) {
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true })
    }
  }

  async save(buffer: Buffer, options: SaveFaviconOptions = {}): Promise<string> {
    const validation = validateFaviconBuffer(buffer, options.filename)
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid favicon file.')
    }

    const tenant = options.tenantId || 'shared'
    const theme = options.theme || 'global'
    const ext = validation.format || 'png'
    const tenantDir = path.join(this.baseDir, tenant)

    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true })
    }

    const filename = `${theme}-${Date.now()}.${ext}`
    const filepath = path.join(tenantDir, filename)

    fs.writeFileSync(filepath, buffer)
    return `${this.publicBaseUrl}/${tenant}/${filename}`
  }

  async get(urlOrPath: string): Promise<Buffer | null> {
    const relativePath = urlOrPath.replace(this.publicBaseUrl, '').replace(/^\/+/, '')
    const fullPath = path.join(this.baseDir, relativePath)

    if (!fs.existsSync(fullPath)) {
      return null
    }

    return fs.readFileSync(fullPath)
  }
}
