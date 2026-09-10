import express from 'express'
import multer from 'multer'
import {
  validateFaviconBuffer,
  DiskFaviconStorageAdapter,
} from '@novexel/favicon/server'

const app = express()
const upload = multer({ limits: { fileSize: 2 * 1024 * 1024 } }) // 2MB limit
const storage = new DiskFaviconStorageAdapter('./uploads/favicons')

app.post('/api/favicon/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' })
    }

    // Binary magic-byte & SVG XSS inspection
    const validation = validateFaviconBuffer(req.file.buffer, req.file.originalname)
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }

    // Safe persistence
    const savedUrl = await storage.save(req.file.buffer, {
      tenantId: req.headers['x-tenant-id'] as string || 'default',
      theme: (req.body.theme as 'global' | 'light' | 'dark') || 'global',
      filename: req.file.originalname,
    })

    return res.json({
      success: true,
      url: savedUrl,
      format: validation.format,
      mime: validation.mime,
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})
