**Random Map Scripting Guide**

**Age of Empires II: The Conquerors Expansion**

**Important:** Age of Empires II: The Conquerors Expansion allows you to
create your own random map scripts. You may share these custom random
map scripts for the purposes of gameplay, but you may not sell or make
other commercial uses of the custom random map scripts. Microsoft
Corporation reserves all other rights to the editors and files.

***COPYRIGHT NOTICE***

**This information contained in this publication/document (the
“Information”) may be redistributed only as permitted by the text below
and provided that such Information and this copyright notice remain
intact. No part of the Information may in any form or by any electronic,
mechanical, photocopied, recorded or any other means be reproduced,
stored in a retrieval system, broadcast or transmitted without the prior
written permission of the publisher of the Information, Ensemble Studios
Corporation. Neither the Information nor any portion thereof may be
stored in a computer or other electronic storage device except for
personal and non-commercial use.**

**Users of the Information must seek permission from Ensemble Studios
Corporation for all uses that are not allowed by fair use and other
provisions of the U. S. Copyright Act, as amended from time to time (the
“Act”). This Information may not, under any circumstances, be resold or
redistributed for compensation of any kind without the prior written
permission of Ensemble Studios Corporation, 10440 N. Central Expressway,
Suite 1600, Dallas, TX 75231. **

**The Information may only be used as a source of data and may only be
used for non-commercial purposes. Any copy of this Information or
portion thereof must include this copyright notice.**

**Any published data contained in the Information, including URL and
other Internet Web Site references, is subject to change from time to
time without notice. **

**The Information does not carry a warranty of any kind, whether express
or implied. Although every effort is made to provide the most accurate
and up-to-date information possible, Ensemble Studios Corporation
acknowledges that this Information could include certain errors,
including typographical errors and technical inaccuracies. Additions and
changes will be made to the Information on an on-going basis; thus the
Information contained herein is subject to change without prior notice.
Complying with the Act and all other applicable federal or state
copyright laws is the sole responsibility of the user. The user hereby
is deemed to assume all such copyright law compliance responsibility by
his or her use of the Information.**

**Ensemble Studios Corporation may have U.S. federal and/or state
patents, patent applications, trademarks, service marks, trade names,
copyrights or other intellectual property rights covering subject matter
in the Information. Except as expressly provided in any written license
agreement from Ensemble Studios Corporation, the furnishing of the
Information does not give the user any license to such patents, patent
applications, trademarks, service marks, trade names, copyrights or
other intellectual property rights, which are expressly retained by
Ensemble Studios Corporation.**

Table of Contents

  * Introduction [3](#introduction)
  * Syntax [3](#syntax)
  * Map sizes [4](#map-sizes)
  * Global instructions [4](#global-instructions)
  * Local instructions [5](#local-instructions)
  * Generation Instructions [5](#generation-instructions)
  * Script writing tips [15](#script-writing-tips)
  * Resources [15](#resources)
  * Setting zones [15](#setting-zones)
  * Testing player start areas [15](#testing-player-start-areas)
  * Scattering objects [15](#scattering-objects)
  * Making it all fit [15](#making-it-all-fit)
  * Standard resources [16](#standard-resources)
  * Object names [16](#object-names)
  * Annotated Random Map Script [23](#annotated-random-map-script)

Introduction
============

Random Map scripts are text files that can be composed in any text
editor. They must end with \*.RMS and must be placed in the RANDOM
directory. Random Map scripts are automatically transferred in
multiplayer games to players who do not have them.

Random Map scripts place the same starting terrain and resources for
every player. It is not possible to start different players with
different resources. Thus, all scripts in theory will be fair to all
players. However, knowledge of a map script can still help a player when
playing on that map. Perhaps the player knows that there is a lot of
gold generated in the center of the map (as in Gold Rush). When you play
on someone else’s Random Map script, you are placing some trust in that
person that the map is going to be interesting and fair.

Computer Players should be able to play on any Random Map script, but
unless you compose a new .AI file for that map, the Computer Player may
not play with optimal efficiency. For example, the Computer Player may
not build boats even if the map has ample water.

Making Random Maps that can consistently give each player the resources
they need can be difficult and may involve a lot of trial and error.
Don’t get frustrated. Internet fan sites are a great resource for hints,
tricks and other support for making maps that work.

A Random Map starts with Land first, then Elevation, then Terrain, and
finally Cliffs and Connections. The order is important.

Syntax
======

Random map scripts are case sensitive.

Braces {} enclose commands under specific instruction. Opening and
closing braces must be on their own line.

/\* Slashes and asterisks enclose comments that the scripting system
ignores, such as remarks, sub-headings, etc. Use /\* to open a comment
and \*/ to close it. Be sure to leave a space between the \* and other
characters.

Brackets &lt;&gt; enclose variables. These are not used in the random
map scripts themselves, only in the context of this document. If an
instruction says “&lt;number&gt;”, just type “35” not “&lt;35&gt;”.
Instructions that begin with “set” do not require a variable.

Map sizes
---------

| Map label     | Tiles on a side | Total tiles | Scaling factor |
|---------------|-----------------|-------------|----------------|
| tiny\_map     | 72x72           | 5,184       | 0.5            |
| small\_map    | 96x96           | 9,216       | 0.9            |
| medium\_map   | 120x120         | 14,400      | 1.4            |
| large\_map    | 144x144         | 20,736      | 2.1            |
| huge\_map     | 200x200         | 40,000      | 4.0            |
| gigantic\_map | 255x255         | 62,025      | 6.2            |

Scaling factor can be used to place more objects on a larger map
relative to a smaller map. A Gigantic Map is 12.4 times larger than a
Tiny Map, even though one side of each map is only 3.4 times larger. Map
labels can be used in if-then statements.

**Example: **

    If medium_map
    create_object STONE
    {
      number_of_objects 7
      number_of_groups 2
      group_placement_radius 3
    }
    endif

Global instructions
===================

Global instructions are used to control script flow, make the script
change from run to run, and make script control easier.

**\#define &lt;label&gt;**

Defines a variable that you can use later on.

**Example:**

    Start_random
    percent_chance 33
      #define DESERT_MAP
    end_random

This instruction gives a 33% chance of the map being a “DESERT\_MAP”.
You could then say if DESERT\_MAP later on to put down sand instead of
grass or palm trees instead of oaks.

**&lt;const\_name&gt; \#number**

Constants are used to tie a name, such as an object or terrain, with its
identifier in the database. Ensemble Studios has already pre-defined all
necessary constants in the random\_map.def file so they do not need to
be changed.

**if &lt;label&gt; **

**elseif &lt;label&gt;**

**else**

**endif**

Conditional statements are used when there is more than one option. For
example: If the map is gigantic, then add extra resources. If the map is
a desert map, then use sand instead of grass. “If” initiates the
conditional statement and “endif” completes it. Use “else” to specify
all other conditions, or “elseif” to specify a single other condition.

**Example:**

    if ALPINE_MAP
      base_terrain WATER
    elseif DESERT_MAP
      base_terrain DESERT
    else
      base_terrain GRASS2
    endif

**start\_random**

**percent\_chance &lt;percent&gt;**

**end\_random**

Random statements are used to specify an instruction running only part
of the time. The random chance is specified as a percent (1-100). If the
percents do not add up to 100, then the remaining percentage will apply
towards a default setting. Everything between start\_random and
end\_random is considered part of the same random instruction. Random
statements can be nested inside each other.

**Example:**

    start_random
    percent_chance 20
      #define DESERT_MAP
    percent_chance 20
      #define ALPINE_MAP
    end_random

The map will be a desert 20% of the time, an alpine map 20% of the time,
and a normal (probably grass) map the remaining 60% of the time.
Alternatively, the instruction could have had the line to define grass
map at 60%, but this is not necessary.

Local instructions
==================

The following instructions are used to create a random map. Some
instructions require a variable, which is generally a number \#, a
number of tiles \#tiles, or a terrain constant &lt;terrain constant&gt;.
Instructions that begin with “set” do not require a variable.

Generation Instructions
-----------------------

Before any specific instructions can be given, you must indicate what
part of the random map the instructions refer to. For example,
&lt;TERRAIN\_GENERATION&gt; tells the random map generator that the
instructions that follow refer to terrain. A Random Map starts with Land
first, then Elevation, then Terrain and finally Cliffs and Connections.
The order is important. The seven generation instructions are explained
below along with their specific instructions.

&lt;PLAYER\_SETUP&gt; Places players

&lt;LAND\_GENERATION&gt; Creates types of land, such as islands and
player lands

&lt;TERRAIN\_GENERATION&gt; Creates terrain, such as forests and desert

&lt;OBJECTS\_GENERATION&gt; Creates objects, such as trees, gold mines
and villagers

&lt;CONNECTION\_GENERATION&gt; Connects different land zones such as
shallows between islands

&lt;ELEVATION\_GENERATION&gt; Creates elevation to place hills

&lt;CLIFF\_GENERATION&gt; Creates cliffs

**&lt;PLAYER\_SETUP&gt;**

**random\_placement**

Places players randomly. This is the only valid entry under
&lt;PLAYER\_SETUP&gt;. All maps must have this line in them.

**&lt;LAND\_GENERATION&gt;**

Land is used to create something aside from the default terrain type,
most typically islands of grass in water. There are two types of land,
normal lands (just called Lands) and Player Lands. In most random maps,
Player Lands include a Town Center, Scout Cavalry, villagers, and the
starting resources placed near the Town Center. Player Lands is also
useful for telling terrain, such as forests, to avoid the player start
areas. Land is all generated at the same time, so the order used in
placing land is not important. (Terrain and objects, however, are placed
in order.)

**base\_terrain &lt;terrain constant&gt;**

Specifies what default terrain to start with. An island map probably
uses water, while a grassland map uses grass.

**Example:**

    base_terrain WATER

**create\_player\_lands {instructions}**

Starts creating Player Lands. The percentage of land allotted to player
lands is divided among all the players. Therefore, if player lands were
specified to take up 20% of the map, then 2 players would each get 10%,
but 4 players would each get 5%. It is important that player lands be
large enough to contain a player’s town. If player lands on an island
map are too small, then the Town Center might be susceptible to fire
from boats. On a hill country map, hills might be placed too close to
the Town Center. Player lands are always set at a constant elevation of
2.

**Example:**

    create_player_lands
    {
      terrain_type grass
      base_size 10
      land_percent 20
    }

Creates an area for each player that is 10 tiles of grass in size.

**create\_land {instructions}**

Creates an area of land that is not for players. What type of lands are
there to make? In an island map, you might want to lay down bonus
islands that contain gold. You might want to create a mountain range in
the middle of a map.

**terrain\_type &lt;terrain\_constant&gt;**

Specifies what type of terrain to make the land. For Player Lands, this
must be grass or desert to avoid goofy results.

**land\_percent &lt;percent&gt;**

Defines what percent of the map is taken up by the land area. For Player
Lands, this area will be divided by the number of players, so if the
number is set to 60% and there are 6 players, each will start with about
10% of the map. Best results seem to occur when using 60-80%.

**number\_of\_tiles &lt;\# tiles&gt;**

An alternate way of specifying land area size, in this case by number of
tiles. Unlike Land\_percent, these areas will not scale with map size.
It is necessary to use only Land\_percent or Number\_of\_tiles.

**base\_size &lt;\# tiles&gt;**

Specifies a minimum radius that the land grows from. This instruction is
useful for insuring that each player has an area large enough to build a
town and keep at least some buildings free from naval bombardment. If
Base\_size is not specified, Player Lands may be thin and snaky.

**left\_border &lt;percent&gt;**

**right\_border &lt;percent&gt;**

**top\_border &lt;percent&gt;**

**bottom\_border &lt;percent&gt;**

Percent from edge to stop land growth. This instruction recognizes the
distance to the map border, so it is useful for placing terrain near the
middle of the map. For example, defining a border of 25 will place land
near the center of the map, while a border of 5 will place land almost
to the edge of the map. In Mediterranean and Baltic maps, this
instruction places the inland sea near the center of the map. In
Continental maps, this instruction insures there is a border of water.
“Top” is random on the maps, so just specifying Top and Bottom but not
Left or Right can create a narrow strip of terrain. Note that the map
land had a hard-coded feature to round off edges to make land look more
natural. As maps get smaller (border &gt; 20%) they may look less like
rectangles and more like circles or octagons.

**border\_fuzziness &lt;percent&gt;**

The percent chance per tile of stopping at a border. If this instruction
is not used, borders will be straight lines. Specifying a low number,
5-20, will make edges ragged and more like real geography.

**zone &lt;\# zone&gt;**

This is a descriptive command, used to assign a label to a certain land
area. Zones with the same zone id can overlap, while land areas with
different id’s are distinct. If no zone is specified, each player will
be on their own island (though it will only look like an island if the
base terrain is water).

**land\_id &lt;\# id&gt;**

Assigns a label to a certain land area that can be used to assign
objects only to that land.

**set\_zone\_by\_team**

Will keep all players on a certain team in the same zone. For example,
on an island map this will allow a team to share an island. To keep
everyone on their own island, do not include this command.

**set\_zone\_randomly**

Will randomly determine zones, so that some players may be on the same
island, while others may not be.

**other\_zone\_avoidance\_distance &lt;\# tiles&gt;**

This instruction is the one that specifies how large a land should be,
so if it is not included, the land will not appear. Zone avoidance is
used to specify the width of rivers between player lands.

**assign\_to\_player &lt;\# player&gt;**

Assigns a land area to a certain player. Note, this does not work with
player lands.

**clumping\_factor &lt;\# factor&gt;**

Clumping affects how much land tends to form squares instead of
rectangles. The default value is 8, and the range is 1 to 15. Lower
numbers tend to produce snaky islands while higher numbers tend to
produce squares. Note that clumping\_factor for land and for terrain
have different ranges and defaults.

**&lt;TERRAIN\_GENERATION&gt;**

Terrain is different from Land. Land is used to create something aside
from the default terrain type, most typically islands of grass in water.
Terrain includes features on that land, such as desert and forests. An
important distinction is that land is placed down before elevation, but
terrain is placed down after elevation. The order terrain is placed is
also important. If you place palm desert on desert terrain before you
place any desert terrain on the map, then you aren’t going to see any
palm trees. Remember, land is placed all at once. Terrain and objects
are placed in order.

**create\_terrain &lt;terrain constant &gt; {instructions} **

Creates a clump of terrain

**Example:**

    create_terrain PALM_DESERT
    {
      base_terrain DESERT
      spacing_to_other_terrain_types 3
      land_percent 1
      number_of_clumps 3
      set_avoid_player_start_areas
    }

Creates 3 clumps of Palm Desert on Desert terrain. These clumps will
take up a total of 1% of all tiles and will be placed away from Player
Start Areas.

**base\_terrain &lt;terrain constant &gt;**

Specifies what terrain type the new terrain will be placed on. For
example, palm desert could be placed on desert, or grass3 could be
placed on grass1.

**land\_percent &lt;\#percent of map to cover&gt;**

The percent of total land that this terrain will cover. It is best to
use small percentages (1-10) for terrain if many different types of
terrain are going to be laid down.

**number\_of\_tiles &lt;\#size of terrain clump in tiles&gt;**

The size of terrain can be placed in terms of tiles instead of as a
percent. Percent is generally more useful as it will automatically scale
with map size.

**number\_of\_clumps &lt;\#number of clumps to place&gt;**

The percent or number of tiles of terrain are evenly distributed into
clumps. If number of clumps=3 and number of tile=18, the terrain will be
appear as 3 clumps of 6 tiles each.

**spacing\_to\_other\_terrain\_types &lt;\#distance from other terrain
types&gt;**

Specifies how far terrain should be from other terrain (including
terrain of the same type). This command is useful for preventing trees
from becoming connected walls, or keeping forests away from water. It is
a good idea to specify some distance for terrain that blocks movement,
but is not necessary for terrain such as desert and grass.

**set\_scale\_by\_groups **

Scales number of terrain clumps with map size (base 100x100 map). So, if
2 clumps are specified, then a large map would have 2 (2 x 1.4) clumps,
but a Gigantic map would have 13 (2 x 6.5) clumps.

**set\_scale\_by\_size**

Scales size of terrain patch with map size. So, if 10 tiles are
specified, then a large map would have 140 (10 x 1.4) tiles, but a
Gigantic map would have 650 (10 x 6.5) tiles.

**set\_avoid\_player\_start\_areas**

Most terrain, like forests and water, will avoid player start areas by
default, but this instruction can be used, for example, if you want
desert to avoid Town Centers.

**clumping\_factor** **&lt;\#factor&gt;**

Clumping affects how much land tends to form squares instead of
rectangles. The default value is 20. Lower numbers tend to produce snaky
patches while higher numbers tend to produce squares. Note that
clumping\_factor for land and for terrain have different ranges and
defaults.

**height\_limits &lt;\#minimum tile height&gt; &lt;\#maximum tile
height&gt;**

Specifies on what elevation terrain can be placed (from 0-8). This
instruction can be used to place grass on hill tops or place water only
in depressions.

**set\_flat\_terrain\_only**

Instructs terrain to avoid hills. Useful for making sure ponds don’t
cross more than one elevation.

**&lt;OBJECTS\_GENERATION&gt; **

Once land, elevation and terrain are placed, you are ready to place
objects. Note that some objects may already be placed by terrain.
Forests, for example, will be filled with tree objects. However, you
will need to specify starting units, resources and other objects needed
to make a map have more character and detail. Remember, land is placed
all at once. Terrain and objects are placed in order.

**create\_object &lt;object constant &gt; {instructions}**

Places an object.

**Example:**

create\_object GOLD

{

number\_of\_groups 2

number\_of\_objects 3

group\_placement\_radius 2

set\_tight\_grouping

set\_gaia\_object\_only

min\_distance\_to\_players 40

min\_distance\_group\_placement 9

}

Gives every player 2 piles of gold with 3 gold objects in each pile. The
pile is confined to a radius of 2 tiles and is placed from 9 to 40 tiles
from the center of a player’s lands.

**min\_distance\_to\_players &lt;\#number of tiles&gt;**

**max\_distance\_to\_players &lt;\#number of tiles&gt;**

Specifies the limits where the object can be placed relative to the
center of a piece of land. The object will appear at random anywhere
between the minimum and maximum. For example, a Town Center placed at
minimum 0 and maximum 0 will appear in the center of each player’s
lands. A gold mine placed at 10 to 12 will appear about one screen away
from the Town Center, but not too far away. The defaults for these
instructions are 0 and infinity, respectively, so if no distance is
specified, the object will appear somewhere on that land. Be careful not
to specify a minimum that is greater than the land radius, or the object
may not appear or may appear in the wrong location. Remember that when
used with place\_on\_specific\_land\_id instead of
set\_place\_for\_every\_player that the distances refer to the center of
that piece of land and not to the players.

**set\_scaling\_to\_map\_size**

Scales the number of groups to larger or smaller maps. When this
instruction is used, number\_of\_groups will apply only to Large Maps.
For example, if 6 groups are specified on a Large Map, then a Medium Map
will have 4 groups, and a Small Map will have 2. Note: If
number\_of\_groups is not used (essentially making all the objects
separate), then scaling will apply to the objects themselves. This is a
good way to scatter things like fish and trees on a map. Specify a large
number of objects but no groups and then use
set\_scaling\_of\_groups\_to\_map\_size. Alternatively, you can create a
large number of groups with one object each. The effect will be the
same. Note that scaling can be set to player number or map size, not
both. However, it is possible to have different objects of the same type
set to different scales. One gold mine could scale to player number,
while another scales to map size.

**Example:**

create\_object FISH

{

number\_of\_objects 50

set\_scaling\_to\_map\_size

terrain\_to\_place\_on WATER

set\_gaia\_object\_only

min\_distance\_group\_placement 4

}

Creates 50 fish (on a Large Map, fewer on a smaller map, more on a
larger map) scattered across the water, but never more than 4 tiles from
another fish.

**set\_scaling\_to\_player\_number**

Note that scaling can be set to player number or map size, not both.
However, it is possible to have different objects of the same type set
to different scales. One gold mine could scale to player number, while
another scales to map size.

**min\_distance\_group\_placement &lt;\#tiles&gt; **

Distance to separate center of a group—prevents a massive wad of gold,
stone and berries all together. Just as in
set\_scaling\_of\_groups\_to\_map\_size, if no groups are assigned, then
this instruction will apply to all objects. Note:
group\_placement\_radius, set\_loose\_grouping, and set\_tight\_grouping
will all override scattering of objects and keep a group together.

**Example:**

create\_object FISH

{

number\_of\_objects 50

set\_scaling\_of\_groups\_to\_map\_size

terrain\_to\_place\_on WATER

set\_gaia\_object\_only

min\_distance\_group\_placement 4

}

Creates 50 fish (on a Large Map, fewer on a smaller map, more on a
larger map) scattered across the water, but never more than 4 tiles from
another fish.

**max\_distance\_to\_other\_zones &lt;\#tiles&gt; **

Specifies how close the objects can be to other zones. This is useful it
keeping objects away from the shore (and enemy ships.)

**number\_of\_objects** **&lt;\# objects&gt;**

Specifies how many objects are placed, e.g. gold mines in a patch of
mines. If no groups are specified, then there will be one group for each
object. In other words, the objects will all be scattered.

**number\_of\_groups &lt;\# groups&gt;**

Specifies the number of groups placed. Each group will have the number
of objects specified in number\_of\_objects. If no groups are specified,
then there will be one group for each object. In other words, the
objects will all be scattered.

**group\_variance &lt;\# number added or subtracted from
number\_of\_groups&gt;**

Sometimes you want some randomness in the number of objects placed.
Group\_variance will add or subtract from the number of objects in a
group. For example, a group of 3 deer with a variance of 2 will actually
place from 1 to 5 deer at random.

**group\_placement\_radius** **&lt;\#tiles&gt;**

Specifies how much area is occupied by a group. Groups of large objects
can become very long if the objects are placed in a row. Specifying a
small group\_placement\_radius will confine a group to a smaller area.

**set\_loose\_grouping **

**set\_tight\_grouping **

Loose groups can have a tile or two of space among the objects, like
sheep or deer. Tight groups have no space among the objects, like gold
or stone.

**terrain\_to\_place\_on** **&lt;terrain constant &gt;**

Confines the group to a certain terrain. For example, you can place gold
mines only on desert terrain. If no terrain is specified, the object
will be placed anywhere on the map within reason. Be sensible--some
objects can only be placed on water (like fish) and others can only be
placed on land (like villagers and trees).

**set\_gaia\_object\_only **

Used if you want an object to be Gaia (belonging to no player), such as
sheep or bonus units hidden on the map. Will not affect objects with no
inherent ownership, like gold or trees.

**set\_place\_for\_every\_player**

Places a group for every player who joins the game. If you want there to
be one Relic for every player, or one Town Center for every player, use
this command. If you want every player to start with a pile of gold, use
this command. If you want an extra pile of gold lying out in the
wilderness, do not use this command.

**place\_on\_specific\_land\_id** **&lt;land id&gt;**

If you designated a piece of land as a particular id, you can now use
that id to place objects only on this land. On the Crater Lake map, this
command is used to place the bonus gold on the spire at the center of
the inland lake.

**&lt;ELEVATION\_GENERATION&gt;**

After land is placed, but before terrain is placed, you can specify how
hilly a section of land is. Elevation is laid down basically like
terrain. Base\_terrain, number\_of\_clumps, number\_of\_tiles,
set\_scale\_by\_groups and set\_scale\_by\_size all work for elevation
the way they do for terrain. Elevations always avoid player start areas.

**create\_elevation &lt;\# maximum height&gt; {instructions}**

Places hills. The range of elevation is from 1 to 7. Note that
elevations are not placed at the specified elevation but up to the
specified elevation. Thus if you state elevation 6, you will get some
elevations at 1-6. Stating elevation 7 will create 1-7.

**Example:**

create\_elevation 7

{

if DESERT\_MAP

base\_terrain DIRT

elseif ASIAN\_MAP

base\_terrain GRASS2

else

base\_terrain GRASS

endif

number\_of\_clumps 14

number\_of\_tiles 1000

set\_scale\_by\_groups

set\_scale\_by\_size

}

Places 1000 tiles of up to level 7 elevation on dirt, grass2 or grass.

**&lt;CLIFF\_GENERATION&gt; **

Cliffs can add extra diversity to maps with a lot of open space, though
they may crowd smaller islands.

**Example: **

min\_number\_of\_cliffs 5

max\_number\_of\_cliffs 8

min\_length\_of\_cliff 4

max\_length\_of\_cliff 10

cliff\_curliness 10

min\_distance\_cliffs 3

Places 5-8 cliffs of 4-10 length on the map, but keeps them 3 tiles away
from each other.

**min\_number\_of\_cliffs &lt;\#number of cliffs&gt; **

**max\_number\_of\_cliffs &lt;\#number of cliffs&gt;**

Specifies a range for how many cliffs are placed on a map. Specifying a
minimum of 1 and a maximum of 12 will place 1 to 12 cliffs on a map.

**min\_length\_of\_cliff &lt;\#number of tiles&gt; **

**max\_length\_of\_cliff &lt;\#number of tiles&gt; **

Specifies the length of each cliff.

**cliff\_curliness &lt;\#percent&gt;**

Specifies the percent chance a cliff will turn instead of continuing
straight. High numbers will produce zigzag cliffs, while low numbers
will produce straight lines. As with everything, experiment.

**min\_distance\_cliffs &lt;\#tiles&gt;**

In order to keep cliffs from forming too close to other cliffs, specify
a minimum distance.

**&lt;CONNECTION\_GENERATION&gt; **

Connections are lines drawn among player lands. Connections can be used
to place roads between Town Centers, to place shallows across rivers, or
to cut clearings through forests.

**create\_connect\_teams\_lands {Instructions}**

**create\_connect\_all\_lands {Instructions}**

**create\_connect\_all\_players\_land {Instructions}**

Land can be connected just among team members, among all players, or
among all lands placed on a map. More than one connection can be placed.
For Black Forest, one set of connections opens up paths among players
while another set places roads just among team members.

**Example:**

&lt;CONNECTION\_GENERATION&gt;

create\_connect\_all\_players\_land

{

replace\_terrain WATER SHALLOW

replace\_terrain MED\_WATER SHALLOW

replace\_terrain DEEP\_WATER SHALLOW

terrain\_cost WATER 7

terrain\_cost MED\_WATER 9

terrain\_cost DEEP\_WATER 15

terrain\_size WATER 3 1

terrain\_size MED\_WATER 3 1

terrain\_size DEEP\_WATER 3 1

}

Connects every player by placing shallows across water, with a
preference for shallow water over deep water.

**replace\_terrain &lt;terrain\_constant&gt; &lt;terrain\_constant&gt;**

Usually when you make connections, you want to replace one terrain with
another, such as replacing water with shallows or replacing forest with
road. You need to use a replace terrain command for each type of terrain
placed on a map. So, if you mix grass1, grass2 and grass3, you need a
replace terrain command for each.

**terrain\_cost &lt;terrain\_constant&gt; &lt;\#cost to pass through a
tile&gt;**

Assigning costs to terrain can force a connection to take a different
route. If you want your shallows to avoid deep water and try and follow
shallow water, then assign a high cost to deep water (like 15) and a
lower cost to shallow water (like 7).

**terrain\_size &lt;terrain\_constant&gt; &lt;\#tile radius&gt;
&lt;\#variance&gt;**

You need to specify how wide a connection is going to be. A three-tile
wide stretch of shallows will be easier to defend than a fifteen-tile
wide shallows. For each terrain through which a connection may pass,
specify a tile radius and a variance on that radius. For example,
terrain\_size MED\_WATER 3 1, create shallows that are 1-4 tiles (3 +/-
1) in width.

1.  Script writing tips
    ===================

    1.  Resources
        ---------

On Ensemble Studios map types, every player starts with a set number of
resources (two gold mines, for example). Additionally, extra resources
are added for each player using set\_scaling\_to\_map\_size or by adding
if statements using map size as the condition. Finally, the larger map
sizes have additional resources.

Setting zones
-------------

Many Ensemble Studios random maps use the random statement to specify
one of four zone types: set zone by team, set zone to a specific id, set
zone randomly, or don’t set zone at all. This ensures that some of the
time the players on a team will share a zone (set zone by team), some of
the time they all players will share a zone (set zone to a specific id),
some of the time some players will overlap (set zone randomly), and some
of the time players will all be separate (don’t set zone at all). Zones
have the greatest impact on play when the base terrain type is water,
which will make zones equivalent to islands. Note that in the following
script, the default (no zone at all) will occur 40% of the time.

start\_random

percent\_chance 20

set\_zone\_by\_team

percent\_chance 20

zone 1

percent\_chance 20

set\_zone\_randomly

end\_random

Testing player start areas
--------------------------

Different lands and player lands can be temporarily set to terrain types
to distinguish different land areas. Setting the base terrain to grass
and the player lands to desert will reveal where player lands occur. If
you are trying to have a large open area of any terrain type, a
Mediterranean-style map is a good place to start, as it creates a large
“lake” near the middle of the map.

Scattering objects
------------------

There are two ways to lay down objects, individually or in groups. If
number\_of\_groups is not specified, then each object is treated as its
own group and will respond to the
set\_scaling\_of\_groups\_to\_map\_size and
min\_distance\_group\_placement instructions, unless instructions to
keep the group together override it. Instructions to keep a group
together are group\_placement\_radius, set\_loose\_grouping, and
set\_tight\_grouping. Standard Ensemble Studios maps scatter fish, but
keep gold and stone mines in tight groups.

Making it all fit
-----------------

Land is placed all at once but terrain is placed in the order you
specify, and then objects are placed on top of terrain. If you place
down too much forest, for example, there might not be enough open space
for all of the gold and stone. The map generator does not try several
iterations until it creates a map that works—if there is not enough
space for boar for player 2, then player 2 will not have any boar. If
your maps seem like they are missing resources, you can try relaxing the
constraints on where the resources are placed. Try decreasing the
minimum and increasing the maximum distance the resources can be placed
from a Town Center. You may have to ultimately cut back on the amount of
water or forests on a map.

Standard resources
------------------

Many (but not all) Ensemble maps use the same amount of starting
resources so that players know what to expect. There are exceptions,
however, including Scandinavia’s lack of berries and Yucatan’s extra
food. You can find the standard resources placed according to map size
and player number in the map description below. It might be a good idea
to start with these resources so that your map will not seem too
difficult for other people to play on it.

The standard starting resources include:

> • 6 Berries
>
> • 1 group of 7 gold mines
>
> • 2 groups of 4 gold mines
>
> • 1 group of 5 stone mines
>
> • 1 group of 4 stone mines
>
> • 1 group of 4 sheep
>
> • 2 groups of 2 sheep
>
> • 1 group of 4 deer
>
> • 2 boar
>
> • 2 wolves
>
> • 1 group of 3 straggler trees
>
> • 1 group of 2 straggler trees

Object names
============

These are the names of objects and terrain that the Random Map generator
knows. You must refer to these names when placing terrain or objects.

#### MAP NAMES

ARABIA

ARCHIPELAGO

ARENA

BALTIC

BLACK\_FOREST

COASTAL

CONTINENTAL

CRATER\_LAKE

FORTRESS

GHOST\_LAKE

GOLD\_RUSH

HIGHLAND

ISLANDS

MEDITERRANEAN

MIGRATION

MONGOLIA

NOMAD

OASIS

RIVERS

SALT\_MARSH

SCANDANAVIA

TEAM\_ISLANDS

YUCATAN

#### GAME NAMES

KING\_OF\_THE\_HILL

REGICIDE

#### TERRAIN NAMES

BAMBOO

BEACH

DESERT

DIRT

DIRT2

DIRT3

FOREST

GRASS

GRASS2

GRASS3

ICE

SNOW

GRASS\_SNOW

DIRT\_SNOW

JUNGLE

LEAVES

PALM\_DESERT

PINE\_FOREST

SNOW\_FOREST

SHALLOW

WATER

MED\_WATER

DEEP\_WATER

ROAD

ROAD2

#### OBJECT NAMES, GAIA

BAMBOO\_FOREST\_TREE

BAMBOO\_TREE

BOAR

BROKEN\_CART

CACTUS

CARAVAN

CRACKS

CRATER

DEER

DIRE\_WOLF

DORADO

FLOWER\_BED

FLOWERS\_1

FLOWERS\_2

FLOWERS\_3

FLOWERS\_4

FORAGE

FORAGE\_BUSH

FOREST\_TREE

GOLD

GRAVE

HAWK

HAY\_STACK

HEAD

IRON\_BOAR

JAGUAR

JAVELINA

JUNGLE\_TREE

MACAW

MARLIN1

MARLIN2

MOUNTAIN\_1

MOUNTAIN\_2

MOUNTAIN\_3

MOUNTAIN\_4

OAK\_FOREST\_TREE

OAKTREE

OLD\_STONE\_HEAD

PALM\_FOREST\_TREE

PALMTREE

PATH\_1

PATH\_2

PATH\_3

PATH\_4

PIECE\_OF\_THE\_TRUE\_CROSS

PINE\_FOREST\_TREE

PINETREE

PLANT

RABID\_WOLF

RELIC

ROCK

ROMAN\_RUINS

RUGS

RUINS

SALMON

SEA\_ROCKS\_1

SEA\_ROCKS\_2

SHEEP

SHORE\_FISH

SIGN

SKELETON

SNAPPER

SNOW\_PINE\_TREE

STATUE

STONE

STUMP

TREE\_A

TREE\_B

TREE\_C

TREE\_D

TREE\_E

TREE\_F

TREE\_G

TREE\_H

TREE\_I

TREE\_J

TREE\_K

TREE\_L

TREE\_TD

TREE1

TREE2

TREE3

TREE4

TREE5

TUNA

TURKEY

WILD\_BOAR

WILD\_HORSE

WOLF

#### OBJECT NAMES, SCENARIO

CATHEDRAL

ES\_FLAG

FLAG\_A

FLAG\_B

FLAG\_C

FLAG\_D

FLAG\_E

GREAT\_PYRAMID

HORSE

KING

MAP\_REVEALER

MONUMENT

MOSQUE

NINE\_BANDS

PAVILION

PAVILION2

PAVILION3

PYRAMID

RUBBLE\_1\_X\_1

RUBBLE\_2\_X\_2

RUBBLE\_3\_X\_3

SHEEP

SHIPWRECK

SHIPWRECK2

TORCH

TORCH\_CONVERTING

TRADE\_WORKSHOP

YURT

YURT2

YURT3

YURT4

YURT5

YURT6

YURT7

YURT8

#### OBJECT NAMES, ARCHERY RANGE UNITS

ARCHER

CAVALRY\_ARCHER

HAND\_CANNONEER

SKIRMISHER

ARBALEST

CROSSBOWMAN

ELITE\_SKIRMISHER

HEAVY\_CAVALRY\_ARCHER

#### OBJECT NAMES, BARRACKS UNITS

EAGLE\_WARRIOR

MILITIA

SPEARMAN

CHAMPION

ELITE\_EAGLE\_WARRIOR

HALBERDIER

LONG\_SWORDSMAN

MAN\_AT\_ARMS

PIKEMAN

TWO\_HANDED\_SWORDSMAN

#### OBJECT NAMES, CASTLE UNITS

BERSERK

CATAPHRACT

CHU\_KO\_NU

CONQUISTADOR

HUSKARL

JAGUAR\_WARRIOR

JANISSARY

LONGBOWMAN

MAMELUKE

MANGUDAI

PETARD

PLUMED\_ARCHER

SAMURAI

TARKAN

TEUTONIC\_KNIGHT

THROWING\_AXEMAN

TREBUCHET

TREBUCHET\_PACKED

WAR\_ELEPHANT

WAR\_WAGON

WOAD\_RAIDER

ELITE\_BERSERK

ELITE\_CATAPHRACT

ELITE\_CHU\_KO\_NU

ELITE\_CONQUISTADOR

ELITE\_HUSKARL

ELITE\_JAGUAR\_WARRIOR

ELITE\_JANISSARY

ELITE\_LONGBOWMAN

ELITE\_MAMELUKE

ELITE\_MANGUDAI

ELITE\_PLUMED\_ARCHER

ELITE\_SAMURAI

ELITE\_TARKAN

ELITE\_TEUTONIC\_KNIGHT

ELITE\_THROWING\_AXEMAN

ELITE\_WAR\_ELEPHANT

ELITE\_WAR\_WAGON

ELITE\_WOAD\_RAIDER

#### OBJECT NAMES, CHURCH UNITS

MISSIONARY

MONK

#### OBJECT NAMES, DOCK UNITS

CANNON\_GALLEON

DEMOLITION\_SHIP

FIRE\_SHIP

FISHING\_SHIP

GALLEY

LONGBOAT

TRADE\_COG

TRANSPORT\_SHIP

TURTLE\_SHIP

ELITE\_CANNON\_GALLEON

ELITE\_LONGBOAT

ELITE\_TURTLE\_SHIP

FAST\_FIRE\_SHIP

GALLEON

HEAVY\_DEMOLITION\_SHIP

WAR\_GALLEY

#### OBJECT NAMES, HERO UNITS

ADMIRAL\_YI\_SUN\_SHIN

AETHELFIRTH

ARCHBISHOP

ARCHERS\_OF\_THE\_EYES

ATTILA\_THE\_HUN

BAD\_NEIGHBOR

BAD\_NEIGHBOR\_PACKED

BELISARIUS

BLEDA\_THE\_HUN

CHARLEMAGNE

CHARLES\_MARTEL

CONSTABLE\_RICHEMONT

DOME\_OF\_THE\_ROCK

DUKE\_D\_ALENCON

EL\_CID

EL\_CID\_CAMPEADOR

EMPEROR\_IN\_A\_BARREL

ERIK\_THE\_RED

FRANKISH\_PALADIN

FRIAR\_TUCK

GAWAIN

GENGHIS\_KHAN

GODS\_OWN\_SLING

GODS\_OWN\_SLING\_PACKED

GUY\_JOSSELYNE

HARALD\_HARDRAADE

HENRY\_V

HROLF\_THE\_GANGER

HUNTING\_WOLF

IMAM

JEAN\_BUREAU

JEAN\_DE\_LORRAIN

JOAN\_OF\_ARC

JOAN\_THE\_MAID

KING\_ALFONSO

KING\_ARTHUR

KING\_SANCHO

KITABATAKE

KUSHLUK

LA\_HIRE

LANCELOT

LORD\_DE\_GRAVILLE

MASTER\_OF\_THE\_TEMPLAR

MINAMOTO

MORDRED

NOBUNAGA

ORNLU\_THE\_WOLF

POPE\_LEO\_I

REYNALD\_DE\_CHATILLON

RICHARD\_THE\_LIONHEARTED

ROBIN\_HOOD

ROLAND

SABOTEUR

SCYTHIAN\_SCOUT

SCYTHIAN\_WILD\_WOMAN

SHAH

SHERIFF\_OF\_NOTTINGHAM

SIEGFRIED

SIEUR\_BERTRAND

SIEUR\_DE\_METZ

SIR\_JOHN\_FASTOLF

SUBOTAI

TAMERLANE

THE\_ACCURSED\_TOWER

THE\_BLACK\_PRINCE

THE\_TOWER\_OF\_FLIES

THEODORIC\_THE\_GOTH

WILLIAM\_WALLACE

WILLIAM\_THE\_CONQUEROR

WILLIAM\_THE\_CONQUEROR2

#### OBJECT NAMES, MARKET UNIT

TRADE\_CART

#### OBJECT NAMES, SIEGE WORKSHOP UNITS

BATTERING\_RAM

BOMBARD\_CANNON

MANGONEL

SCORPION

CAPPED\_RAM

HEAVY\_SCORPION

ONAGER

SIEGE\_ONAGER

SIEGE\_RAM

#### OBJECT NAMES, STABLE UNITS

CAMEL

KNIGHT

SCOUT

SCOUT\_CAVALRY

CAVALIER

HEAVY\_CAMEL

HUSSAR

LIGHT\_CAVALRY

PALADIN

#### OBJECT NAMES, TOWN CENTER UNIT

VILLAGER

#### OBJECT NAMES, BUILDING

ARCHERY\_RANGE

BARRACKS

BLACKSMITH

BOMBARD\_TOWER

CASTLE

DOCK

FARM

FISH\_TRAP

FORTIFIED\_WALL

GUARD\_TOWER

HOUSE

KEEP

LUMBER\_CAMP

MARKET

MILL

MINING\_CAMP

MONASTERY

OUTPOST

PALISADE\_WALL

SIEGE\_WORKSHOP

STABLE

STONE\_WALL

TOWN\_CENTER

UNIVERSITY

WALL

WATCH\_TOWER

WONDER

Annotated Random Map Script
---------------------------

The following script was created by Ensemble Studios for the Coastal
Random Map type. You can use it to figure out how to start maps of your
own and see what standard resources go into most maps. Remember that
everything between /\* slash marks \*/ is a comment and is not read by
the Map Generator.

/\* \*\*\*\*\*\*\*\*\*\*\*\* COASTAL \*\*\*\*\*\*\*\*\*\*\*\* \*/

/\* 29 MAR 00 \*/

/\*
\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*
\*/

&lt;PLAYER\_SETUP&gt;

random\_placement

/\*
\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*
\*/

&lt;LAND\_GENERATION&gt;

base\_terrain WATER

/\* Coastal is basically a large island placed on water, so water is the
base terrain. Using water1 (the shallow water) makes it easier to add
deeper water later \*/

start\_random

percent\_chance 15

\#define DESERT\_MAP

percent\_chance 15

\#define ALPINE\_MAP

percent\_chance 15

\#define ASIAN\_MAP

percent\_chance 15

\#define FROZEN\_MAP

percent\_chance 15

\#define TROPICAL\_MAP

end\_random

/\* Coastal maps can have different terrain, such as desert or rain
forest. There is a 15% chance of the map using one of these different
terrain sets. These names are just used as variables. You can define
your own. \*/

create\_player\_lands

{

if DESERT\_MAP

terrain\_type DIRT

elseif ALPINE\_MAP

terrain\_type GRASS2

elseif ASIAN\_MAP

terrain\_type GRASS2

elseif FROZEN\_MAP

terrain\_type SNOW

else

terrain\_type GRASS

endif

/\* Depending on what terrain type is chosen, we use a different base
terrain \*/

start\_random

percent\_chance 33

land\_percent 52

percent\_chance 33

land\_percent 60

percent\_chance 33

land\_percent 65

end\_random

/\* The amount of land used is random. Using 52% means there is often a
lake in the middle of the map. Using 65% means that there tends to be a
large, square landmass \*/

base\_size 8

start\_random

percent\_chance 25

left\_border 6

top\_border 8

bottom\_border 6

percent\_chance 25

left\_border 6

top\_border 6

right\_border 8

percent\_chance 25

right\_border 6

left\_border 6

bottom\_border 8

percent\_chance 25

right\_border 8

top\_border 6

bottom\_border 6

end\_random

/\* There is a random chance for various border sizes. Coastal always
has one edge that touches the border of the map, but it is random which
border this is \*/

border\_fuzziness 15

zone 1

other\_zone\_avoidance\_distance 7

clumping\_factor 15

}

/\*
\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*
\*/

&lt;TERRAIN\_GENERATION&gt;

/\* MIXING WATER \*/

create\_terrain MED\_WATER

{

base\_terrain WATER

number\_of\_clumps 10

spacing\_to\_other\_terrain\_types 2

land\_percent 40

}

create\_terrain MED\_WATER

{

base\_terrain WATER

number\_of\_clumps 30

spacing\_to\_other\_terrain\_types 1

land\_percent 1

}

create\_terrain DEEP\_WATER

{

base\_terrain MED\_WATER

number\_of\_clumps 8

spacing\_to\_other\_terrain\_types 3

land\_percent 20

}

create\_terrain DEEP\_WATER

{

base\_terrain MED\_WATER

number\_of\_clumps 30

spacing\_to\_other\_terrain\_types 1

land\_percent 1

}

create\_terrain MED\_WATER

{

base\_terrain DEEP\_WATER

number\_of\_clumps 30

spacing\_to\_other\_terrain\_types 1

land\_percent 1

}

create\_terrain WATER

{

base\_terrain MED\_WATER

number\_of\_clumps 30

spacing\_to\_other\_terrain\_types 1

land\_percent 1

}

/\* This adds deeper water to the shallow water. We use small
percentages and spacing of 1-3 tiles to make sure the shallow water is
closest to land and other waters are placed farther from land.
Experiment with different percentages of water so that there are not
large expanses of one color. \*/

/\* PRIMARY FOREST \*/

if DESERT\_MAP

create\_terrain PALM\_DESERT

{

base\_terrain DIRT

spacing\_to\_other\_terrain\_types 5

land\_percent 9

number\_of\_clumps 10

set\_avoid\_player\_start\_areas

set\_scale\_by\_groups

}

elseif ALPINE\_MAP

create\_terrain PINE\_FOREST

{

base\_terrain GRASS2

spacing\_to\_other\_terrain\_types 5

land\_percent 9

number\_of\_clumps 10

set\_avoid\_player\_start\_areas

set\_scale\_by\_groups

}

elseif FROZEN\_MAP

create\_terrain SNOW\_FOREST

{

base\_terrain SNOW

spacing\_to\_other\_terrain\_types 5

land\_percent 9

number\_of\_clumps 10

set\_avoid\_player\_start\_areas

set\_scale\_by\_groups

}

elseif ASIAN\_MAP

create\_terrain PINE\_FOREST

{

base\_terrain GRASS2

spacing\_to\_other\_terrain\_types 5

land\_percent 9

number\_of\_clumps 10

set\_avoid\_player\_start\_areas

set\_scale\_by\_groups

}

elseif TROPICAL\_MAP

create\_terrain JUNGLE

{

base\_terrain GRASS

spacing\_to\_other\_terrain\_types 5

land\_percent 9

number\_of\_clumps 10

set\_avoid\_player\_start\_areas

set\_scale\_by\_groups

}

else

create\_terrain FOREST

{

base\_terrain GRASS

spacing\_to\_other\_terrain\_types 5

land\_percent 9

number\_of\_clumps 10

set\_avoid\_player\_start\_areas

set\_scale\_by\_groups

}

endif

/\* The Primary Forest on Coastal covers 9% of the map and can be oak
forest, pine forest or even rain forest, depending on the kind of map we
want \*/

/\* PRIMARY PATCH \*/

if DESERT\_MAP

create\_terrain DESERT

{

base\_terrain DIRT

number\_of\_clumps 12

spacing\_to\_other\_terrain\_types 0

land\_percent 8

set\_scale\_by\_size

}

elseif ALPINE\_MAP

create\_terrain GRASS3

{

base\_terrain GRASS2

number\_of\_clumps 8

spacing\_to\_other\_terrain\_types 0

land\_percent 6

set\_scale\_by\_size

}

elseif FROZEN\_MAP

create\_terrain GRASS\_SNOW

{

base\_terrain SNOW

number\_of\_clumps 8

spacing\_to\_other\_terrain\_types 0

land\_percent 6

set\_scale\_by\_size

}

elseif ASIAN\_MAP

create\_terrain GRASS3

{

base\_terrain GRASS2

number\_of\_clumps 8

spacing\_to\_other\_terrain\_types 0

land\_percent 6

set\_scale\_by\_size

}

else

create\_terrain DIRT

{

base\_terrain GRASS

number\_of\_clumps 8

spacing\_to\_other\_terrain\_types 0

land\_percent 9

set\_scale\_by\_size

}

endif

/\* These patches and additional forests are used for variation. Adding
grass or dirt on top of the base terrain is really only for cosmetic
purposes. Forests affect how defensive the map can be and how hard it is
to path from one town to another \*/

/\* SECONDARY FOREST \*/

if DESERT\_MAP

create\_terrain FOREST

{

base\_terrain GRASS

spacing\_to\_other\_terrain\_types 3

land\_percent 1

number\_of\_clumps 3

set\_avoid\_player\_start\_areas

set\_scale\_by\_groups

}

elseif ALPINE\_MAP

create\_terrain FOREST

{

base\_terrain GRASS2

spacing\_to\_other\_terrain\_types 3

land\_percent 1

number\_of\_clumps 3

set\_avoid\_player\_start\_areas

set\_scale\_by\_groups

}

elseif FROZEN\_MAP

create\_terrain SNOW\_FOREST

{

base\_terrain GRASS\_SNOW

spacing\_to\_other\_terrain\_types 3

land\_percent 1

number\_of\_clumps 3

set\_avoid\_player\_start\_areas

set\_scale\_by\_groups

}

elseif ASIAN\_MAP

create\_terrain BAMBOO

{

base\_terrain GRASS2

spacing\_to\_other\_terrain\_types 3

land\_percent 1

number\_of\_clumps 3

set\_avoid\_player\_start\_areas

set\_scale\_by\_groups

}

else

create\_terrain PALM\_DESERT

{

base\_terrain DIRT

spacing\_to\_other\_terrain\_types 3

land\_percent 1

number\_of\_clumps 3

set\_avoid\_player\_start\_areas

set\_scale\_by\_groups

}

endif

/\* SECONDARY PATCH \*/

if DESERT\_MAP

create\_terrain DIRT3

{

base\_terrain DIRT

number\_of\_clumps 24

spacing\_to\_other\_terrain\_types 0

land\_percent 2

set\_scale\_by\_size

}

elseif ALPINE\_MAP

create\_terrain DIRT3

{

base\_terrain GRASS2

number\_of\_clumps 24

spacing\_to\_other\_terrain\_types 0

land\_percent 2

set\_scale\_by\_size

}

elseif FROZEN\_MAP

create\_terrain DIRT\_SNOW

{

base\_terrain SNOW

number\_of\_clumps 24

spacing\_to\_other\_terrain\_types 0

land\_percent 2

set\_scale\_by\_size

}

elseif ASIAN\_MAP

create\_terrain DIRT3

{

base\_terrain GRASS2

number\_of\_clumps 24

spacing\_to\_other\_terrain\_types 0

land\_percent 2

set\_scale\_by\_size

}

else

create\_terrain GRASS3

{

base\_terrain GRASS

number\_of\_clumps 24

spacing\_to\_other\_terrain\_types 0

land\_percent 2

set\_scale\_by\_size

}

endif

/\* TERTIARY PATCH \*/

if DESERT\_MAP

create\_terrain GRASS3

{

base\_terrain DIRT

number\_of\_clumps 30

spacing\_to\_other\_terrain\_types 0

land\_percent 2

set\_scale\_by\_size

}

elseif ALPINE\_MAP

create\_terrain GRASS

{

base\_terrain GRASS2

number\_of\_clumps 30

spacing\_to\_other\_terrain\_types 0

land\_percent 2

set\_scale\_by\_size

}

elseif FROZEN\_MAP

create\_terrain GRASS2

{

base\_terrain GRASS\_SNOW

number\_of\_clumps 30

spacing\_to\_other\_terrain\_types 0

land\_percent 2

set\_scale\_by\_size

}

elseif ASIAN\_MAP

create\_terrain GRASS

{

base\_terrain GRASS2

number\_of\_clumps 30

spacing\_to\_other\_terrain\_types 0

land\_percent 2

set\_scale\_by\_size

}

else

create\_terrain DIRT3

{

base\_terrain GRASS

number\_of\_clumps 30

spacing\_to\_other\_terrain\_types 0

land\_percent 2

set\_scale\_by\_size

}

endif

/\*
\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*
\*/

&lt;OBJECTS\_GENERATION&gt;

/\* PLAYER START OBJECTS \*/

create\_object TOWN\_CENTER

{

set\_place\_for\_every\_player

group\_placement\_radius 18

min\_distance\_to\_players 0

max\_distance\_to\_players 0

}

create\_object VILLAGER

{

set\_place\_for\_every\_player

min\_distance\_to\_players 6

max\_distance\_to\_players 6

}

create\_object SCOUT

{

number\_of\_objects 1

set\_place\_for\_every\_player

min\_distance\_to\_players 7

max\_distance\_to\_players 9

}

create\_object RELIC

{

number\_of\_objects 5

min\_distance\_to\_players 25

temp\_min\_distance\_group\_placement 20

}

/\* Each player starts with a Town Center, villagers and a scout. The
Map Generator knows that Chinese need 6 villagers and that Aztecs have
an Eagle Warrior. There are also 5 Relics placed on most map types. \*/

/\* SPECIAL STUFF FOR REGICIDE \*/

if REGICIDE

create\_object VILLAGER

{

number\_of\_objects 7

set\_place\_for\_every\_player

min\_distance\_to\_players 6

max\_distance\_to\_players 6

}

create\_object KING

{

set\_place\_for\_every\_player

min\_distance\_to\_players 6

max\_distance\_to\_players 6

}

create\_object CASTLE

{

set\_place\_for\_every\_player

min\_distance\_to\_players 10

max\_distance\_to\_players 10

}

endif

/\* Regicide games require a Castle, King and more villagers. Other game
types, such as Defend the Wonder, are handled automatically. \*/

/\* NEAR FORAGE \*/

create\_object FORAGE

{

number\_of\_objects 6

group\_placement\_radius 3

set\_tight\_grouping

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 10

max\_distance\_to\_players 12

min\_distance\_group\_placement 6

}

/\* On most maps, everyone gets berry bushes near their town \*/

/\* NEAR GOLD \*/

create\_object GOLD

{

number\_of\_objects 7

group\_placement\_radius 3

set\_tight\_grouping

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 12

max\_distance\_to\_players 16

min\_distance\_group\_placement 7

max\_distance\_to\_other\_zones 7

}

/\* MEDIUM GOLD \*/

create\_object GOLD

{

number\_of\_objects 4

group\_placement\_radius 3

set\_tight\_grouping

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 18

max\_distance\_to\_players 26

min\_distance\_group\_placement 7

max\_distance\_to\_other\_zones 7

}

/\* FAR GOLD \*/

create\_object GOLD

{

number\_of\_objects 4

group\_placement\_radius 3

set\_tight\_grouping

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 25

max\_distance\_to\_players 35

min\_distance\_group\_placement 7

max\_distance\_to\_other\_zones 7

}

/\* Everyone gets 3 sets of gold mines. Sometimes the far gold mine is
really far (35 tiles) from the player’s Town Center. \*/

/\* NEAR STONE \*/

create\_object STONE

{

number\_of\_objects 5

group\_placement\_radius 2

set\_tight\_grouping

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 14

max\_distance\_to\_players 18

min\_distance\_group\_placement 7

max\_distance\_to\_other\_zones 7

}

/\* FAR STONE \*/

create\_object STONE

{

number\_of\_objects 4

group\_placement\_radius 2

set\_tight\_grouping

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 20

max\_distance\_to\_players 26

min\_distance\_group\_placement 7

max\_distance\_to\_other\_zones 7

}

/\* We place stone last since it is more important to start with berries
and gold. If the map runs out of room it might not place stone. This is
not ideal, but it is better than losing gold. \*/

/\* BAA BAA \*/

if TROPICAL\_MAP

create\_object TURKEY

{

number\_of\_objects 4

set\_loose\_grouping

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 10

max\_distance\_to\_players 12

}

create\_object TURKEY

{

number\_of\_objects 2

number\_of\_groups 2

set\_loose\_grouping

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 14

max\_distance\_to\_players 30

}

else

create\_object SHEEP

{

number\_of\_objects 4

set\_loose\_grouping

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 10

max\_distance\_to\_players 12

}

create\_object SHEEP

{

number\_of\_objects 2

number\_of\_groups 2

set\_loose\_grouping

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 14

max\_distance\_to\_players 30

}

endif

/\* Sheep and Turkeys are small, so they are easy to place. If you
really want to confuse players, mix sheep and turkeys on a map. \*/

create\_object DEER

{

number\_of\_objects 4

group\_variance 1

group\_placement\_radius 3

set\_loose\_grouping

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 14

max\_distance\_to\_players 30

}

if TROPICAL\_MAP

create\_object JAVELINA

else

create\_object BOAR

endif

{

number\_of\_objects 1

set\_loose\_grouping

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 16

max\_distance\_to\_players 22

}

if TROPICAL\_MAP

create\_object JAVELINA

else

create\_object BOAR

endif

{

number\_of\_objects 1

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 16

max\_distance\_to\_players 22

}

/\* Stuff to hunt. \*/

if TROPICAL\_MAP

create\_object JAGUAR

{

number\_of\_objects 2

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_group\_placement 12

min\_distance\_to\_players 30

max\_distance\_to\_players 40

}

else

create\_object WOLF

{

number\_of\_objects 2

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_group\_placement 12

min\_distance\_to\_players 30

max\_distance\_to\_players 40

}

endif

/\* Bad guys. Leave them off if you want a rushing map. \*/

/\* RESOURCES BY MAP \*/

if LARGE\_MAP

create\_object FORAGE

{

number\_of\_groups 1

number\_of\_objects 5

group\_placement\_radius 3

set\_tight\_grouping

set\_gaia\_object\_only

min\_distance\_to\_players 40

max\_distance\_to\_players 120

min\_distance\_group\_placement 7

}

endif

/\* Because large maps have more open space, they need more resources.
These resources do not “belong” to anyone. They are scattered for the
taking. \*/

if HUGE\_MAP

create\_object FORAGE

{

number\_of\_groups 2

number\_of\_objects 5

group\_placement\_radius 3

set\_tight\_grouping

set\_gaia\_object\_only

min\_distance\_to\_players 40

max\_distance\_to\_players 120

min\_distance\_group\_placement 7

}

endif

if GIGANTIC\_MAP

create\_object FORAGE

{

number\_of\_groups 3

number\_of\_objects 5

group\_placement\_radius 3

set\_tight\_grouping

set\_gaia\_object\_only

min\_distance\_to\_players 40

max\_distance\_to\_players 120

min\_distance\_group\_placement 7

}

endif

/\* EXTRA GOLD \*/

if TINY\_MAP

create\_object GOLD

{

number\_of\_groups 2

number\_of\_objects 3

group\_placement\_radius 2

set\_tight\_grouping

set\_gaia\_object\_only

min\_distance\_to\_players 40

min\_distance\_group\_placement 9

}

endif

if SMALL\_MAP

create\_object GOLD

{

number\_of\_groups 2

number\_of\_objects 3

group\_placement\_radius 2

set\_tight\_grouping

set\_gaia\_object\_only

min\_distance\_to\_players 40

min\_distance\_group\_placement 9

}

endif

if MEDIUM\_MAP

create\_object GOLD

{

number\_of\_groups 3

number\_of\_objects 3

group\_variance 1

group\_placement\_radius 2

set\_tight\_grouping

set\_gaia\_object\_only

min\_distance\_to\_players 40

min\_distance\_group\_placement 9

}

endif

if LARGE\_MAP

create\_object GOLD

{

number\_of\_groups 3

number\_of\_objects 3

group\_variance 1

group\_placement\_radius 2

set\_tight\_grouping

set\_gaia\_object\_only

min\_distance\_to\_players 40

min\_distance\_group\_placement 9

}

endif

if HUGE\_MAP

create\_object GOLD

{

number\_of\_groups 4

number\_of\_objects 4

group\_variance 1

group\_placement\_radius 2

set\_tight\_grouping

set\_gaia\_object\_only

min\_distance\_to\_players 40

min\_distance\_group\_placement 9

}

endif

if GIGANTIC\_MAP

create\_object GOLD

{

number\_of\_groups 5

number\_of\_objects 4

group\_variance 1

group\_placement\_radius 2

set\_tight\_grouping

set\_gaia\_object\_only

min\_distance\_to\_players 40

min\_distance\_group\_placement 9

}

endif

/\* EXTRA STONE \*/

if TINY\_MAP

create\_object STONE

{

number\_of\_groups 1

number\_of\_objects 4

group\_variance 1

group\_placement\_radius 2

set\_tight\_grouping

set\_gaia\_object\_only

min\_distance\_to\_players 40

min\_distance\_group\_placement 9

}

endif

if SMALL\_MAP

create\_object STONE

{

number\_of\_groups 1

number\_of\_objects 4

group\_variance 1

group\_placement\_radius 2

set\_tight\_grouping

set\_gaia\_object\_only

min\_distance\_to\_players 40

min\_distance\_group\_placement 9

}

endif

if MEDIUM\_MAP

create\_object STONE

{

number\_of\_groups 2

number\_of\_objects 4

group\_variance 1

group\_placement\_radius 2

set\_tight\_grouping

set\_gaia\_object\_only

min\_distance\_to\_players 40

min\_distance\_group\_placement 9

}

endif

if LARGE\_MAP

create\_object STONE

{

number\_of\_groups 3

number\_of\_objects 4

group\_variance 1

group\_placement\_radius 2

set\_tight\_grouping

set\_gaia\_object\_only

min\_distance\_to\_players 40

min\_distance\_group\_placement 9

}

endif

if HUGE\_MAP

create\_object STONE

{

number\_of\_groups 4

number\_of\_objects 4

group\_variance 1

group\_placement\_radius 2

set\_tight\_grouping

set\_gaia\_object\_only

min\_distance\_to\_players 40

min\_distance\_group\_placement 9

}

endif

if GIGANTIC\_MAP

create\_object STONE

{

number\_of\_groups 5

number\_of\_objects 4

group\_variance 1

group\_placement\_radius 2

set\_tight\_grouping

set\_gaia\_object\_only

min\_distance\_to\_players 40

min\_distance\_group\_placement 9

}

endif

if DESERT\_MAP

create\_object PALMTREE

{

number\_of\_objects 2

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 4

max\_distance\_to\_players 5

min\_distance\_group\_placement 2

}

create\_object PALMTREE

{

number\_of\_objects 3

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 6

max\_distance\_to\_players 8

min\_distance\_group\_placement 2

}

elseif ALPINE\_MAP

create\_object PINETREE

{

number\_of\_objects 2

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 4

max\_distance\_to\_players 5

min\_distance\_group\_placement 2

}

create\_object PINETREE

{

number\_of\_objects 3

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 6

max\_distance\_to\_players 8

min\_distance\_group\_placement 2

}

elseif ASIAN\_MAP

create\_object BAMBOO\_TREE

{

number\_of\_objects 2

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 4

max\_distance\_to\_players 5

min\_distance\_group\_placement 2

}

create\_object PINETREE

{

number\_of\_objects 3

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 6

max\_distance\_to\_players 8

min\_distance\_group\_placement 2

}

elseif TROPICAL\_MAP

create\_object PALMTREE

{

number\_of\_objects 2

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 4

max\_distance\_to\_players 5

min\_distance\_group\_placement 2

}

create\_object OAKTREE

{

number\_of\_objects 3

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 6

max\_distance\_to\_players 8

min\_distance\_group\_placement 2

}

elseif FROZEN\_MAP

create\_object SNOWPINETREE

{

number\_of\_objects 2

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 4

max\_distance\_to\_players 5

min\_distance\_group\_placement 2

}

create\_object SNOWPINETREE

{

number\_of\_objects 3

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 6

max\_distance\_to\_players 8

min\_distance\_group\_placement 2

}

else

create\_object OAKTREE

{

number\_of\_objects 2

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 4

max\_distance\_to\_players 5

min\_distance\_group\_placement 2

}

create\_object OAKTREE

{

number\_of\_objects 3

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 6

max\_distance\_to\_players 8

min\_distance\_group\_placement 2

}

endif

/\* These are the “straggler” trees near every Town Center. \*/

if TROPICAL\_MAP

create\_object MACAW

{

number\_of\_objects 6

set\_scaling\_to\_map\_size

}

else

create\_object HAWK

{

number\_of\_objects 6

set\_scaling\_to\_map\_size

}

endif

if TROPICAL\_MAP

create\_object JAGUAR

{

number\_of\_groups 3

set\_loose\_grouping

start\_random

percent\_chance 75

number\_of\_objects 1

percent\_chance 25

number\_of\_objects 2

end\_random

set\_scaling\_to\_map\_size

set\_gaia\_object\_only

min\_distance\_group\_placement 12

min\_distance\_to\_players 40

max\_distance\_to\_players 120

}

else

create\_object WOLF

{

number\_of\_groups 3

set\_loose\_grouping

start\_random

percent\_chance 75

number\_of\_objects 1

percent\_chance 25

number\_of\_objects 2

end\_random

set\_scaling\_to\_map\_size

set\_gaia\_object\_only

min\_distance\_group\_placement 12

min\_distance\_to\_players 40

max\_distance\_to\_players 120

}

endif

/\* More wildlife. Birds have no affect on gameplay, but make the map
more interesting. \*/

create\_object FORAGE

{

number\_of\_groups 1

number\_of\_objects 5

group\_placement\_radius 3

set\_tight\_grouping

set\_gaia\_object\_only

min\_distance\_to\_players 19

max\_distance\_to\_players 120

min\_distance\_group\_placement 9

}

create\_object DEER

{

number\_of\_objects 4

group\_variance 1

set\_loose\_grouping

set\_gaia\_object\_only

set\_place\_for\_every\_player

min\_distance\_to\_players 19

}

if DESERT\_MAP

create\_object PALMTREE

{

number\_of\_objects 30

set\_gaia\_object\_only

set\_scaling\_to\_map\_size

min\_distance\_to\_players 8

}

elseif ALPINE\_MAP

create\_object PINETREE

{

number\_of\_objects 30

set\_gaia\_object\_only

set\_scaling\_to\_map\_size

min\_distance\_to\_players 8

}

elseif FROZEN\_MAP

create\_object SNOWPINETREE

{

number\_of\_objects 30

set\_gaia\_object\_only

set\_scaling\_to\_map\_size

min\_distance\_to\_players 8

}

elseif ASIAN\_MAP

create\_object BAMBOO\_TREE

{

number\_of\_objects 30

set\_gaia\_object\_only

set\_scaling\_to\_map\_size

min\_distance\_to\_players 8

}

elseif TROPICAL\_MAP

create\_object PALMTREE

{

number\_of\_objects 30

set\_gaia\_object\_only

set\_scaling\_to\_map\_size

min\_distance\_to\_players 8

}

else

create\_object OAKTREE

{

number\_of\_objects 30

set\_gaia\_object\_only

set\_scaling\_to\_map\_size

min\_distance\_to\_players 8

}

endif

/\* These are the lone trees scattered across the map. It makes the map
look more believable than if there were just forests and no straggler
trees. \*/

if DESERT\_MAP

create\_object DORADO

{

number\_of\_objects 15

set\_scaling\_to\_map\_size

set\_gaia\_object\_only

max\_distance\_to\_other\_zones 4

}

create\_object SNAPPER

{

number\_of\_objects 10

set\_scaling\_to\_map\_size

set\_gaia\_object\_only

max\_distance\_to\_other\_zones 4

}

elseif ALPINE\_MAP

create\_object SALMON

{

number\_of\_objects 15

set\_scaling\_to\_map\_size

set\_gaia\_object\_only

max\_distance\_to\_other\_zones 4

}

create\_object SNAPPER

{

number\_of\_objects 10

set\_scaling\_to\_map\_size

set\_gaia\_object\_only

max\_distance\_to\_other\_zones 4

}

elseif FROZEN\_MAP

create\_object SALMON

{

number\_of\_objects 15

set\_scaling\_to\_map\_size

set\_gaia\_object\_only

max\_distance\_to\_other\_zones 4

}

create\_object SNAPPER

{

number\_of\_objects 10

set\_scaling\_to\_map\_size

set\_gaia\_object\_only

max\_distance\_to\_other\_zones 4

}

elseif ASIAN\_MAP

create\_object TUNA

{

number\_of\_objects 15

set\_scaling\_to\_map\_size

set\_gaia\_object\_only

max\_distance\_to\_other\_zones 4

}

create\_object SNAPPER

{

number\_of\_objects 10

set\_scaling\_to\_map\_size

set\_gaia\_object\_only

max\_distance\_to\_other\_zones 4

}

else

create\_object DORADO

{

number\_of\_objects 5

set\_scaling\_to\_map\_size

set\_gaia\_object\_only

max\_distance\_to\_other\_zones 4

}

create\_object TUNA

{

number\_of\_objects 10

set\_scaling\_to\_map\_size

set\_gaia\_object\_only

max\_distance\_to\_other\_zones 4

}

create\_object SNAPPER

{

number\_of\_objects 10

set\_scaling\_to\_map\_size

set\_gaia\_object\_only

max\_distance\_to\_other\_zones 4

}

endif

create\_object SHORE\_FISH

{

number\_of\_objects 25

set\_scaling\_to\_map\_size

min\_distance\_group\_placement 3

set\_gaia\_object\_only

}

create\_object MARLIN1

{

number\_of\_groups 5

number\_of\_objects 1

set\_scaling\_to\_map\_size

set\_gaia\_object\_only

min\_distance\_group\_placement 10

max\_distance\_to\_other\_zones 7

}

create\_object MARLIN2

{

number\_of\_groups 5

number\_of\_objects 1

set\_scaling\_to\_map\_size

set\_gaia\_object\_only

min\_distance\_group\_placement 10

max\_distance\_to\_other\_zones 7

}

/\* One of our designers is picky about which fish live in which part of
the country. Only the Marlin and the Shore fish have different amounts
of food in them. The other fish are just for variety. \*/

/\*
\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*
\*/

&lt;ELEVATION\_GENERATION&gt;

create\_elevation 7

{

if DESERT\_MAP

base\_terrain DIRT

elseif ALPINE\_MAP

base\_terrain GRASS2

elseif FROZEN\_MAP

base\_terrain SNOW

elseif ASIAN\_MAP

base\_terrain GRASS2

else

base\_terrain GRASS

endif

number\_of\_clumps 14

number\_of\_tiles 2000

set\_scale\_by\_groups

set\_scale\_by\_size

}

/\* Notice that the elevation must be placed on a certain terrain,
whichever is the base terrain for the map. If you use lots of different
terrain, you may need to have multiple elevation statements. \*/

&lt;CLIFF\_GENERATION&gt;

min\_number\_of\_cliffs 5

max\_number\_of\_cliffs 8

min\_length\_of\_cliff 4

max\_length\_of\_cliff 10

cliff\_curliness 10

min\_distance\_cliffs 3

/\* Cliffs work okay on land maps but are best left off island maps. \*/

/\*
\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*
\*/

&lt;CONNECTION\_GENERATION&gt;

create\_connect\_all\_players\_land

{

if FROZEN\_MAP

replace\_terrain WATER ICE

replace\_terrain MED\_WATER ICE

replace\_terrain DEEP\_WATER ICE

else

replace\_terrain WATER SHALLOW

replace\_terrain MED\_WATER SHALLOW

replace\_terrain DEEP\_WATER SHALLOW

endif

/\* Every player on a team must be connected in Coastal. This part puts
shallows or ice across water to make sure no one is on an island. On an
Archipelago map, it is okay if some players are on their own islands.
\*/

terrain\_cost WATER 7

terrain\_cost MED\_WATER 9

terrain\_cost DEEP\_WATER 15

terrain\_cost FOREST 7

terrain\_cost PINE\_FOREST 7

terrain\_cost PALM\_DESERT 7

terrain\_cost SNOW\_FOREST 7

terrain\_cost JUNGLE 7

terrain\_cost SHALLOW 3

terrain\_cost DESERT 2

terrain\_cost DIRT 2

terrain\_cost DIRT2 2

terrain\_cost DIRT3 2

terrain\_cost DIRT\_SNOW 2

terrain\_cost GRASS 2

terrain\_cost GRASS2 2

terrain\_cost GRASS3 2

terrain\_cost GRASS\_SNOW 2

terrain\_cost SNOW 2

terrain\_cost BEACH 7

terrain\_size WATER 2 1

terrain\_size MED\_WATER 2 1

terrain\_size DEEP\_WATER 2 1

terrain\_size GRASS 0 0

terrain\_size GRASS2 0 0

terrain\_size GRASS3 0 0

terrain\_size GRASS\_SNOW 0 0

terrain\_size SNOW 0 0

terrain\_size DIRT 0 0

terrain\_size DIRT2 0 0

terrain\_size DIRT3 0 0

terrain\_size DIRT\_SNOW 0 0

terrain\_size SNOW\_FOREST 0 0

terrain\_size FOREST 0 0

terrain\_size PINE\_FOREST 0 0

terrain\_size PALM\_DESERT 0 0

terrain\_size JUNGLE 0 0

terrain\_size DESERT 0 0

}

/\* Terrain cost is used to make the connections try and go over land
and not through forests which looks fake, unless you pave the
connections with road, as in Black Forest. \*/
