# Fun Times with RMS

This document is an unordered collection of the RMS parser's quirks.

## Comment spacing

`/*` and `*/` _must_ be surrounded by whitespace to work.

```
/**
 * This is not a comment
 */
/* This is a comment */
/* This comment is never closed -*/
```

**Why?**

The parser works on a word-by-word basis. Words are any sequence of non-whitespace characters separated by whitespace. For example, `fun /* with*words**/` is made up of three words: `fun`, `/*`, `with*words**/`. Comments are only opened and closed if a full word is `/*` or `*/`.

**Workaround**

Put spaces around all the comments. `/* LIKE THIS */`, `/*NEVER LIKE THIS*/`.

## Comments in dead branches

Some commands are not ignored if they are in comments inside a dead branch.

```
<LAND_GENERATION>
start_random
percent_chance 50
  base_terrain SNOW
  /* percent_chance 50 */
  base_terrain DIRT
percent_chance 50
  base_terrain GRASS
end_random
if NOT_DEFINED
  /* or else … */
  #define WUT
endif
```

This will always generate `DIRT`.

In versions before UserPatch, this would also always define the `WUT` constant. In UserPatch 1.5, the `WUT` constant is not defined.

**Why?**

If the first `percent_chance` branch is taken, the terrain is first set to `SNOW` and then `DIRT`. If the first `percent_chance` branch is _NOT_ taken, the `percent_chance 50` comment is considered as a command, and the terrain is set to `DIRT`. The final branch for `GRASS` is never taken, because the previous two already add up to 100%.

The core cause is that open comment words (`/*`) are not parsed in a dead branch. A dead branch is any branch that was not taken. So, the parser continues reading and finds `percent_chance 50`, which is valid in this position! The `*/` is ignored, because no comments are open, and the `base_terrain DIRT` rule is executed.

**Workaround**

The safest thing is to never use comments inside `percent_chance` branches. This unfortunately makes it quite hard to put lots of code in a `percent_chance` branch. In UserPatch 1.5, you can still guard large chunks of code with randomness by only `#define`ing values in `percent_chance` branches, and then using them in `if` statements:

```
<LAND_GENERATION>
start_random
  percent_chance 50 #define BRANCH1
  percent_chance 50 #define BRANCH2
end_random

if BRANCH1
  base_terrain SNOW
  /* percent_chance 50 */
  base_terrain DIRT
endif
if BRANCH2
  base_terrain GRASS
endif
```

In older versions (before UserPatch 1.5), the same issue existed for `if` statements. As of UP 1.5, this has been fixed, and you can now safely use comments inside `if` branches.

In other versions, the only workaround is to never use words that have a special meaning in comments inside branching statements. Don't use constant names either!

## `rnd()` spacing

UserPatch 1.5 added `rnd()` expressions that can be used to specify random numbers anywhere a number can be specified. When using it, make sure that there are no spaces:

 - bad: `rnd(1, 10)`
 - bad: `rnd (1,10)`
 - good: `rnd(1,10)`

**Why?**

The game parses numbers by first reading a word, then parsing that word into a number. `rnd()` numbers work the same way—first a word is read, and if that word is `rnd(%d,%d)` it's replaced with a random number.
