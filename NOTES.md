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
