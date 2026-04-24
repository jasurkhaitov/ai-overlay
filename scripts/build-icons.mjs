import png2icons from 'png2icons'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'

mkdirSync('resources', { recursive: true })

const input = readFileSync('resources/icon.png')

const ico = png2icons.createICO(input, png2icons.BILINEAR, 0, true, true)
writeFileSync('resources/icon.ico', ico)

const icns = png2icons.createICNS(input, png2icons.BILINEAR, 0)
writeFileSync('resources/icon.icns', icns)

console.log('✓ icon.ico and icon.icns generated')
