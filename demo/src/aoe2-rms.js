const CodeMirror = require('codemirror')

require('codemirror/addon/mode/simple')

CodeMirror.defineSimpleMode('aoe2-rms', {
  start: [
    { regex: /\/\*/, token: 'comment', next: 'comment' },
    { regex: /<[A-Z_]+>/, token: 'header' },
    { regex: /\b(if|elseif|else|endif)\b/, token: 'keyword' },
    { regex: /(\bstart_random|percent_chance|end_random)\b/, token: 'keyword' },
    { regex: /\{/, token: 'operator', indent: true },
    { regex: /\}/, token: 'operator', dedent: true },
    { regex: /#(const|define|include(_drs)?)/, token: 'def' },
    { regex: /(\B\-|\b)\d+\b/, token: 'number' },
    { regex: /[a-z_]+/, token: 'attribute' },
    { regex: /[A-Z_]+/, token: 'atom' }
  ],
  comment: [
    { regex: /.*?\*\//, token: 'comment', next: 'start' },
    { regex: /.*/, token: 'comment' }
  ]
})
