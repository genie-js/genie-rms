# RMS notes

Random Map generation in AoE2 is a two-step process: parsing and generation. The parsing step turns a random map script into lists of lands, terrains, objects, elevations to generate and their settings, and lists of "hotspots" of different types. Notably, the parsing step evaluates `if` statements and the like that are found in the map script. In a sense a map script parsing step generates the settings for random map generation.

The generation step has several substeps, roughly corresponding to the `<SECTION>`s of a map script. Each section has a hardcoded "schedule", which indicates when it should be run. The sections are:

 - Lands (schedule 1.0)
 - Elevations (schedule 1.5)
 - Cliffs (schedule 1.75)
 - Terrains (schedule 2.0)
 - Connections (schedule 2.1)
 - Objects (schedule 3.0)

Not all sections are always run. That depends on whether they were included in the map script. eg, when the map script does not contain a `<CLIFF_GENERATION>` section, the Cliffs generator is not run.

There are two exceptions to that rule:
 - If a Terrains section exists, the Objects generator is also always run
 - If a Lands section exists, the Terrains generator is also always run (and therefore the Objects generator)

## Parser

The parser is built on a dynamic token list. A token is a word in the source code that means something. Each token has an ID, a type, a value, and an argument types list.

The argument types list always contains 4 elements. Tokens taking fewer than 4 arguments will list the null argument type to pad that out. There are 6 argument types:

0. No argument / null argument
1. Word
2. Number
3. Constant
4. Optional constant
5. Filename (used in #include)

The difference between Constants and Optional constants is subtle. It changes how the parser treats absence. Optional constants are used as `if` and `elseif` arguments: a constant referenced by that word existing means "true", and it not existing means "false". i.e., if the parser does not recognise the word, it keeps executing normally. However, when "normal" Constants do not exist, it results in a parse error. The RMS parser does not show parse errors to the user, but instead restarts-ish parsing at the next token.

For example, the `#define` token has ID 0, and argument types [1, 0, 0, 0]. The `land_position` token has ID 71 and argument types [2, 2, 0, 0]. The number of non-0 argument types is important for parsing. The RMS parser assumes the next command begins when the argument type is 0. So, the single-line string `#define X land_position 2 2` will parse as two commands.

(...)

## Generators

There are some concepts that are used extensively in all generators.

### Search Map

The Search Map is an array containing a single byte for each tile on the map. This is used during the generation process to store information, like the land ID during land generation, or whether objects can be placed on a specific tile's terrain during object generation.

### Map Stack

The Map Stack in essence is a doubly linked list of map tiles, with an optional associated "cost". There is a single node for each tile on the map. Most generators work by pushing valid map tiles to a Map Stack, and then later popping the tiles that will actually be used.
