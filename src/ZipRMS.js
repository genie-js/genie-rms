const Struct = require('awestruct')
const ScriptController = require('./Controller.js')
const t = Struct.types

const localFileHeader = Struct([
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

const directoryHeader = Struct([
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

const endOfDirectory = Struct([
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
      const file = localFileHeader(opts)
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

  getController () {
    const file = this.files.find((file) => file.type === 'rms')
    return new ScriptController(file.buffer.toString('utf8'))
  }
}

const fs = require('fs')
const buffer = fs.readFileSync('ZR@Test.rms')

const rms = new ZipRMS(buffer)
rms.readFiles()
console.log(rms.files)
