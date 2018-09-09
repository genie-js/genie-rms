const struct = require('awestruct')
const ScriptController = require('./Controller.js')
const t = struct.types

const LocalFileHeader = struct([
  ['signature', t.uint32],
  ['version', t.uint16],
  ['flag', t.uint16],
  ['compression', t.uint16],
  ['mtime', t.uint16],
  ['mdate', t.uint16],
  ['crc32', t.uint32],
  ['compressedSize', t.uint32],
  ['uncompressedSize', t.uint32],
  ['nameLength', t.uint16],
  ['extraLength', t.uint16],
  ['name', t.string('nameLength')],
  ['extra', t.buffer('extraLength')]
])

// eslint-disable-next-line no-unused-vars
const DirectoryHeader = struct([
  ['signature', t.uint32],
  ['version', t.uint16],
  ['flag', t.uint16],
  ['compression', t.uint16],
  ['mtime', t.uint16],
  ['mdate', t.uint16],
  ['crc32', t.uint32],
  ['compressedSize', t.uint32],
  ['uncompressedSize', t.uint32],
  ['nameLength', t.uint16],
  ['extraLength', t.uint16],
  ['commentLength', t.uint16],
  ['diskNumber', t.uint16],
  ['internalAttributes', t.uint16],
  ['externalAttributes', t.uint32],
  ['localHeaderOffset', t.uint32],
  ['name', t.string('nameLength')],
  ['extra', t.buffer('extraLength')],
  ['comment', t.string('commentLength')]
])

// eslint-disable-next-line no-unused-vars
const EndOfDirectory = struct([
  ['signature', t.uint32],
  ['diskNumber', t.uint16],
  ['centralDirectoryDisk', t.uint16],
  ['currentCentralDirectories', t.uint16],
  ['centralDirectories', t.uint16],
  ['centralDirectorySize', t.uint32],
  ['centralDirectoryOffset', t.uint32],
  ['commentLength', t.uint16],
  ['comment', t.string('commentLength')]
])

class ZipRMS {
  constructor (buffer) {
    this.buffer = buffer
  }

  readFiles () {
    const opts = { buf: this.buffer, offset: 0 }
    const files = []
    while (opts.buf.readUInt32LE(opts.offset) === 0x04034b50 /* local file magic */) {
      const file = LocalFileHeader(opts)
      if (file.compression !== 0) {
        throw new Error('Zip RMS files must not be compressed')
      }
      const fileBuffer = t.buffer(file.compressedSize)(opts)

      files.push({
        type: file.name.split('.').pop(),
        name: file.name,
        buffer: fileBuffer
      })
    }

    this.files = files
  }

  getScenario () {
    const file = this.files.find((file) => file.type === 'scx')
    return file ? file.buffer : null
  }

  getScript () {
    const file = this.files.find((file) => file.type === 'rms')
    return file.buffer.toString('utf8')
  }

  getController () {
    const script = this.getScript()
    return new ScriptController(script)
  }

  getTerrains () {
    const files = this.files.filter((file) => file.type === 'slp')
    const terrains = Object.create(null)
    for (const file of files) {
      const id = parseInt(file.name.replace(/\.slp$/, ''), 10)
      if (id < 15000 || id >= 15050) {
        // TODO issue a warning
        continue
      }
      terrains[id] = file.buffer
    }
    return terrains
  }
}

const fs = require('fs')
const buffer = fs.readFileSync('ZR@Test.rms')

const rms = new ZipRMS(buffer)
rms.readFiles()
console.log(rms.files)
