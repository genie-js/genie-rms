# genie-rms

Age of Empires 2 Random Map Script parser for Node and the browser.

> This library aims to be as compatible with AoE2 as possible.
> This means that its implementation imitates all the quirks of the AoE2 parser, too.
> It does not use an AST and does not have separate lexing and parsing steps.
> If you need a parser for a subset of all valid RMS code, but that returns an AST that you can manipulate, try the [mangudai](https://github.com/mangudai/mangudai) library.

[Status](#status) - [Install](#install) - [Usage](#usage) - [Credits](#credits) - [License: GPL-3.0](#license)

## Status

Parsing is roughly complete.

Terrain generation more or less works, as does object generation. Both are probably inaccurate compared to AoC, though. Object generation does not support civilization bonuses.

Land positioning and generation is buggy. While lands are placed, sometimes they are placed outside the map, crashing the generator. Lands of enemy players may be placed directly next to each other instead of on near-opposite sides of the map. Team-based placement is not yet implemented.

Cliff generation more or less half-works. Cliff generation does two things: change the terrain and place cliff objects. The terrain update part is implemented, but cliff objects are not. It does not correctly avoid player lands, so cliffs may be placed near or underneath town centers and the like.

Elevation generation has some implementation but whether it works is unclear.

Connections between player lands are not implemented.

UserPatch and HD Edition commands are not implemented. The goal is to first finish 1.0c semi-compatibility. Ideally, compatibility modes for UP and HD could be introduced later. As such, Zip-RMS from UserPatch 1.5 are also not implemented, although there is a utility class for reading files from them without requiring a full zip library in [src/ZipRMS.js](./src/ZipRMS.js).

## Install

```bash
npm install genie-rms
```

## Usage

```js
const { Parser, CRandom } = require('genie-rms')

const seed = 32767
const parser = new Parser({
  random: new CRandom(seed)
})

// Read the default random map constants.
// `random_map.def` is file 54000 in gamedata_x1.drs.
parser.write(fs.readFileSync('./random_map.def', 'utf-8'))
parser.write(fs.readFileSync('./my-script.rms', 'utf-8'))
const result = parser.end()
console.log(result)
```

## Credits

Most of this is made possible by the reverse engineering work by Yvan-Burrie, JustTesting123 and others in [genie-reverse](https://github.com/yvan-burrie/genie-reverse).

## License

[GPL-3.0](./LICENSE.md)
