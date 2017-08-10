# genie-rms

Age of Empires 2 Random Map Script parser for Node and the browser.

> This library aims to be as compatible with AoE2 as possible.
> This means that its implementation imitates all the quirks of the AoE2 parser, too.
> It does not use an AST and does not have separate lexing and parsing steps.
> If you need a parser for a subset of all valid RMS code, but that returns an AST that you can manipulate, try the [mangudai](https://github.com/mangudai/mangudai) library.

## Install

```bash
npm install genie-rms
```

## Usage

```js
const { Parser } = require('genie-rms')

const parser = new Parser()

// Read the default random map constants.
// `random_map.def` is file 54000 in gamedata_x1.drs.
parser.write(fs.readFileSync('./random_map.def', 'utf-8'))
parser.write(fs.readFileSync('./my-script.rms', 'utf-8'))
```

## License

[MIT](./LICENSE)
