**UPDATED NEW RANDOM MAP SCRIPTING GUIDE**

**(Age of Empires II: the Conquerors Expansion)**

**by Bultro**

**Updates for:**

**User Patch \[UP\], Age of Empires II HD \[HD\], Forgotten Expansion
\[AoF\], African Kingdoms \[AK\]**

**v2.0.2 by Zetnus (zetnus@outlook.com)**

> 0\. Introduction . . . . . . . . . . . . . . . . . . . . . . . 1
>
> 1\. Language Reference . . . . . . . . . . . . . . . . 1
>
> [*1.1. Scheme of a RMS. . . . . . . . . . 2*](#S11)
>
> [*1.2. Command Descriptions. . . . . . 4*](#S12)
>
> [*1.3. General Syntax . . . . . . . . . . . . 10*](#S13)
>
> 2\. Terrains & Objects . . . . . . . . . . . . . . . . . 12
>
> [*2.1. Terrains . . . . . . . . . . . . . . . . . 12*](#S2)
>
> [*2.2. Player Objects . . . . . . . . . . . . 13*](#S22)
>
> [*2.3. Gaia Objects . . . . . . . . . . . . .18*](#S23)
>
> [*2.4. AoF and AK Objects . . . . . . 22*](#S24)
>
> [*3. Testing . . . . . . . . . . . . . . . . . . . . . . . . . . .
> 27*](#S3)
>
> [*4. Example Script . . . . . . . . . . . . . . . . . . . . 27*](#S4)
>
> [*5. Links and Resources . . . . . . . . . . . . . . .30*](#S5)

**0. INTRODUCTION**

Random Map Scripts define new general types of map, such as the standard
Arabia or Baltic. DON'T confuse a random map with a scenario: random
maps look different at every game, and CAN'T be designed with the
"Editor" button.

The standard RMS guide is in the "DOCS" subdirectory of the game. It's
detailed, but has many missing things and mistakes.

Random maps must be plain text files with .RMS extension and names of no
more than 20 characters. Longer names no longer cause crashes in the HD
edition. However, if it is too long, only the first part of the name
will be visible in the ingame menus. You can edit them with any text
editor, such as Notepad (or Notepad++) or Word, just remember to set
plain text type in the "Save As" dialog. You can also use one of the
random map editors/generators described in [*section 5.2.*](#S52) of
this guide. Getting syntax highlighting for one of these editors will
help you spot typos!

Scripts must be placed in the "Random" subdirectory of the game. As of
patch 4.0 in the HD Edition, the directory is now located at
"resources\\\_common\\random-map-scripts" instead. They are
automatically transferred to other players in multiplayer, but if you
have a newer version with same name, other players must manually delete
the old one.

You should let people know if your map is suitable or not for
single-player, because the game won't make distinctions.

Computer players usually can play well on custom maps, if they're not
too tricky. Remember that computers:

-   Need large building space

-   Need easy access to all resources

-   Can't ferry villagers

-   Can't rescue neutral units

**1. LANGUAGE REFERENCE**

Scripts are divided in 7 sections, each one managing a category of map
features. Sections start with the following tags:

&lt;PLAYER\_SETUP&gt; Basic setup

&lt;LAND\_GENERATION&gt; Main lands or seas

&lt;ELEVATION\_GENERATION&gt; Hills

&lt;CLIFF\_GENERATION&gt; Rocky cliffs

&lt;TERRAIN\_GENERATION&gt; Terrain patches

&lt;CONNECTION\_GENERATION&gt; Terrain bridges/roads

&lt;OBJECTS\_GENERATION&gt; Units, buildings, resources, eye-candies

-   You don't need to write sections in that order, however that's the
    order the game uses them.

-   You might notice that in the standard maps they are in a different
    order with cliffs and connections (and sometimes elevation) at the
    end. However, it might be helpful to write them in the order above,
    because it makes it easier for you to visualize the map generation
    process and understand why things will happen; like terrain water on
    hills, objects on connections, or terrain avoiding cliffs.
    Ultimately the order in which you write the sections has no effect
    though.

-   Not all the sections are necessary (e.g. you may make a map without
    cliffs).

-   Each section contains some types of instructions. Most instructions
    look like this:

> create\_something WHAT
>
> {
>
> attribute TYPE
>
> attribute N
>
> set\_attribute
>
> (...)
>
> }

-   You can indent instructions however you want, just keep words
    separated by newlines or spaces.

-   Scripts are case-sensitive, pay attention to capital letters.

-   All "create" commands can be used multiple times in a RMS. Other
    commands can't.

-   Most "attributes" (subcommands inside brackets) have a default and
    can be omitted. Some { } can be empty!

-   Order of attributes inside brackets is not important.

-   If an item can't be created for some reason, the game will simply
    ignore it and go on. If you see something is missing, try to relax
    some constraints on its placement.

[]{#S11 .anchor}**1.1. Scheme of a RMS**

Here's the skeleton of a script with all possible commands, useful for
cutting & pasting. Everything is explained later.

-   **N** means an integer number, possibly within a range. Decimals and
    negatives are not allowed.

-   **%** means a percentage (0-100). Decimals are not allowed. Do not
    type the "%"!

-   **TYPE** means a constant identifier such as GRASS. Types are
    reported in "Terrains & Objects" chapter.

Nothing happens if you use a non-valid name (a type that doesn't exist).

-   Commands work in all versions of the game unless specifically stated
    otherwise.

-   / means that you should use either one or the other of these
    attributes, but not both.

&lt;PLAYER\_SETUP&gt;

random\_placement / grouped\_by\_team (requires UP/HD)

nomad\_resources (requires UP/HD)

&lt;LAND\_GENERATION&gt;

base\_terrain TYPE

create\_player\_lands

{

terrain\_type TYPE

land\_percent % / number\_of\_tiles N

> base\_size N
>
> base\_elevation N(1-7) (requires UP/HD)
>
> left\_border %, right\_border %, top\_border %, bottom\_border %
>
> border\_fuzziness %
>
> clumping\_factor %
>
> zone N / set\_zone\_randomly / set\_zone\_by\_team
>
> other\_zone\_avoidance\_distance N

}

create\_land

{

terrain\_type TYPE

land\_percent % / number\_of\_tiles N

> base\_size N
>
> base\_elevation N(1-7) (requires UP/HD)
>
> left\_border %, right\_border %, top\_border %, bottom\_border %
>
> land\_position %(0-100) %(0-99)
>
> border\_fuzziness %
>
> clumping\_factor %
>
> zone N / set\_zone\_randomly
>
> other\_zone\_avoidance\_distance N
>
> land\_id N

assign\_to\_player N(1-8)

}

&lt;ELEVATION\_GENERATION&gt;

create\_elevation N(1-7)

{

> base\_terrain TYPE
>
> number\_of\_tiles N
>
> number\_of\_clumps N
>
> set\_scale\_by\_size
>
> set\_scale\_by\_groups
>
> spacing N

}

&lt;CLIFF\_GENERATION&gt;

min\_number\_of\_cliffs N

max\_number\_of\_cliffs N

min\_length\_of\_cliff N

max\_length\_of\_cliff N

cliff\_curliness %

min\_distance\_cliffs N

min\_terrain\_distance N

&lt;TERRAIN\_GENERATION&gt;

create\_terrain TYPE

{

> base\_terrain TYPE
>
> land\_percent % / number\_of\_tiles N
>
> number\_of\_clumps N
>
> set\_scale\_by\_size
>
> set\_scale\_by\_groups
>
> spacing\_to\_other\_terrain\_types N
>
> set\_avoid\_player\_start\_areas
>
> height\_limits N(0-7) N(0-7)
>
> set\_flat\_terrain\_only
>
> clumping\_factor %

}

&lt;CONNECTION\_GENERATION&gt;

create\_connect\_all\_players\_land / create\_connect\_teams\_lands /

create\_connect\_all\_lands / create\_connect\_same\_land\_zones

{

default\_terrain\_replacement TYPE

> replace\_terrain TYPE TYPE
>
> terrain\_cost TYPE N(1-15)
>
> terrain\_size TYPE N N

}

&lt;OBJECTS\_GENERATION&gt;

create\_object TYPE

{

> number\_of\_objects N
>
> number\_of\_groups N
>
> group\_variance N
>
> set\_scaling\_to\_map\_size / set\_scaling\_to\_player\_number
>
> set\_place\_for\_every\_player
>
> set\_gaia\_object\_only
>
> terrain\_to\_place\_on TYPE
>
> min\_distance\_to\_players N, max\_distance\_to\_players N
>
> max\_distance\_to\_other\_zones N
>
> min\_distance\_group\_placement N
>
> temp\_min\_distance\_group\_placement N
>
> group\_placement\_radius N
>
> set\_tight\_grouping / set\_loose\_grouping
>
> place\_on\_specific\_land\_id N
>
> resource\_delta -N (UP only; not HD)

}

[]{#S12 .anchor}**1.2. Command Descriptions**

**1.2.1. &lt;PLAYER\_SETUP&gt;** default is *random\_placement*

*random\_placement*

Even if you don’t type it, it still applies because it is the default.

*grouped\_by\_team*

Position team members in close proximity on the map. This command and
*random\_placement* are mutually exclusive. The *base\_size* specified
in *create\_player\_lands* determines the distance between players on a
team. Will only work in UP/HD.

*nomad\_resources*

Modify starting resources to match the built-in nomad map. This means
that the cost of a town center (275W, 100S) is added to the stockpile.
Can be used even if your map is not a nomad map. Will only work in
UP/HD.

**1.2.2. &lt;LAND\_GENERATION&gt;**

Here basic territories are created, especially player starting lands;
e.g. you may place grass continents on a water base.

Land is all generated at the same time, so the order used in placing
land is not important.

**Commands**

*base\_terrain TYPE*

Initially, the map is filled with this terrain type. Default is GRASS.

*create\_player\_lands { ... }*

Creates starting lands for ALL players. Usually there's one and only one
*create\_player\_lands* statement.

-   If you use *create\_player\_lands* more than once, each player will
    have multiple starting towns!

-   Instead of *create\_player\_lands* you can use *assign\_to\_player*
    (see below)

-   If you create no player lands at all, you can't place starting units
    and resources (only a Town Center and Villagers will be placed
    somewhere at random – not evenly spaced – so this is generally not
    recommended)

*create\_land { ... }*

Creates a generic land. It's called "land" but it can also be a lake (or
any terrain type)!

**Attributes**

*terrain\_type TYPE *

Type of terrain... Default is GRASS.

*land\_percent % / number\_of\_tiles N*

Size of land. Use either *land\_percent* or *number\_of\_tiles*. Default
is 100%.

If total size of all lands exceeds the size of whole map, the game will
try to reduce them fairly.

*land\_percent %*

-   Percent on whole map; scales with map size

-   For Player Lands, it's total size (shared among ALL players), so you
    better set a high %

*number\_of\_tiles N *

-   It's a fixed size

-   For Player Lands, it means the size of each player's land; about
    1000 tiles should be ok.

*base\_size N *

Minimum square radius of the land. Default is 0 (the land may be thin
and exposed to naval fire).

This command can force land size to be bigger than that specified with
*land\_percent* / *number\_of\_tiles*. If *base\_size* is high in
comparison with land size, the land becomes square-like (or even a
perfect square!).

*base\_elevation N (1-7)*

Modify the base elevation for player and standard lands. Default is 1.
&lt;ELEVATION\_GENERATION&gt; must exist if used. Will only work in
UP/HD.

*left\_border %, right\_border %, top\_border %, bottom\_border %*

Make the land stay away from map edges, at least by specified distance
(defined by % of map width).

You can specify one or more of these attributes. Default is 0 (lands can
touch any edge).

Top border refers to the upper left edge.

You can use these attributes to create a land near the centre of the
map, but also to create a land near a particular edge: e.g.
*bottom\_border 90* would create a strip of land very close to top
border.

Using asymmetric borders can cause crashes under certain conditions. To
avoid this, follow the these steps:

-   Never use *top\_border* in isolation when creating player lands.

-   Using any one of right/left/bottom along with top will prevent
    crashes, as long as it has at least the magnitude of the
    *top\_border*.

Negative borders (recent discovery):

When creating player lands, negative numbers (-1 to -10) can be used to
allow (but NOT to force) the player lands towards the edge of the map.
Values less than -10 will give the same result as -10. WARNING – using a
value of -10 can lead to town centers which hang off the edge of the
map, so it is better to stick with numbers of a smaller magnitude.

Negative numbers can also be used for non-player lands. In this case
numbers even more negative than -10 can be used. Essentially this allows
(but does NOT force) lands to have their origin "outside" the map. If a
very negative number is used, the land may be entirely "outside" map.

*land\_position %(0-100) %(0-99) *

Defines the origin of a given land using X% and Y% coordinates. For
example, *land\_position 50 50* would place the land at the map center.
Default is random. Disabled for player lands and lands with
*assign\_to\_player*. Setting the second number to 100 will crash the
map. If *land\_position* specifies an origin that lies outside the area
specified by *left\_border %, right\_border %, top\_border %,
bottom\_border %*, the land will not be created.

*border\_fuzziness %*

Border regularity: lower values (5-20) tend to make land edges more
ragged and natural when lands are constrained by borders. Also, lower
values allow lands to exceed the boundaries set by top/bottom/left/right
borders. At *border\_fuzziness* 0, the land ignores borders entirely. At
100 (or any negative value), borders are not exceeded at all.

*clumping\_factor %(-100-99)*

Shape regularity: higher values tend to form roundish lands, lower
values tend to form weird, snaky lands. Default is 8.

If you want to guarantee that a land is wide enough, you better use
*base\_size*. Negative values will create extremely patchy and snaky
lands.

*zone N / set\_zone\_randomly / set\_zone\_by\_team *

Setting a zone is useful if combined with
*other\_zone\_avoidance\_distance* (see below). Zone number is just a
label, its value is not important. By default, every Player Land has a
different zone (as in Islands map), but non-player lands all have same
zone.

-   *set\_zone\_randomly* assigns a random zone. In
    *create\_player\_lands* it works separately for each player, so that
    some players share the same zone, some other don't (as in
    Archipelago map)

-   *set\_zone\_by\_team* works only for Player Lands, makes allies
    share the same zone (as in Team Islands map)

-   *zone 99* will crash the game; values greater than 99 work again
    though.

*other\_zone\_avoidance\_distance N*

Minimum distance, in tiles, from lands of other *zones* (see above).
Default is 0 (lands can touch each other).

Keeps isles separated. Useful also for creating *rivers*: even if the
lands cover the whole map, with this attribute they will still be
separated by strips of base terrain of constant width N.

-   If you want to be sure that two lands are separated, BOTH land
    definitions must contain this attribute!

-   If you give two lands different values, the smaller avoidance
    distance will be the one that applies

-   When used for player lands (and lands with *assign\_to\_player*), it
    only applies to the distance to other player lands and NOT to
    non-player lands

*land\_id N*

Assigns a numeric label to the land (it has nothing to do with *zone*
labels). Its value is not important.

This allows objects (see below) to be placed only on this land, using
*place\_on\_specific\_land\_id*.

-   Does not work with Player Lands

-   Land must be separated from others by water (or shallow / ice /
    beach for objects not allowed there)

-   Multiple lands can be given the same id – in this case the objects
    will be placed on all lands with this id

*assign\_to\_player N(1-8)*

To be used only in *create\_land*, makes this land player N's starting
land. An alternative to *create\_player\_lands*.

You should assign 8 different lands to 8 players, if you want your RMS
to support up to 8 players.

-   Player number refers to order, not color (player 1 is first name on
    list, not necessarily blue)

-   If some players are not playing, their lands won't be created at all

-   You can't assign the same land to more players

-   This attribute, along with *terrain\_to\_place\_on* can be used to
    create unequal starts. For example, to make a
    computer-player-friendly single player version of a map that
    computer players normally have trouble with. However, you cannot
    control the position of individual lands that are made using this
    attribute - all lands belonging to players will be in a circle or
    oval shape. The position of this circle is affected by the border
    attributes of the first player land only. (I think…)

**1.2.3. &lt;ELEVATION\_GENERATION&gt;**

Elevations are the smooth and walkable hills. They automatically avoid
players' start areas.

**Commands**

*create\_elevation N(1-7) { ... }*

Creates one or more hills with random height, up to N. Generally, hills
with larger base reach greater height.

**Attributes**

*base\_terrain TYPE*

Hills grow on this type of terrain. Default is GRASS.

*number\_of\_tiles N*

Total base size of ALL hills. Default is about 100 (I think...)

*number\_of\_clumps N*

Maximum number of distinct hills to create. Default is one hill.

*set\_scale\_by\_size*

Total base size is scaled to map size. Unscaled value refers to a
100x100 map.

*set\_scale\_by\_groups*

Number of hills is scaled to map size. Unscaled value refers to a
100x100 map.

*Spacing N*

Specifies the spacing between each height level on each clump of
elevation. Default is 1. Larger numbers produce hills with rings of flat
areas on each level. This can be used to increase buildable land and
prevent long sloped areas.

**1.2.4. &lt;CLIFF\_GENERATION&gt;**

Cliffs are the rocky, not walkable canyons. You can't create single
cliffs, but you can define general cliff statistics.

All commands have a reasonable default; typing just
&lt;CLIFF\_GENERATION&gt; is enough to create normal cliffs. If you
don’t want your map to have cliffs, then don’t put in a
&lt;CLIFF\_GENERATION&gt; section at all. Cliffs automatically avoid
player start areas as well as the centers of non-player lands.

**Commands**

*min\_number\_of\_cliffs N*

*max\_number\_of\_cliffs N*

Limits of total number of cliffs on map. They don't scale with map size
(you can scale only with "if" statements).

*min\_length\_of\_cliff N*

*max\_length\_of\_cliff N*

Length limits of each cliff (each one can have different length).

*cliff\_curliness %*

Chance of turning at each cliff tile. Low % makes straighter cliffs,
high % makes curlier cliffs.

*min\_distance\_cliffs N*

Minimum distance between cliffs, in tiles. Default is 2.

*min\_terrain\_distance N*

Minimum distance to the nearest body of water (including ice). Does not
apply to water created in &lt;TERRAIN\_GENERATION&gt;. Default is 2.

**1.2.5. &lt;TERRAIN\_GENERATION&gt;**

Here you can create a variety of terrain patches on the main lands.
Sometimes you may achieve the same result by creating a Land or by
creating a Terrain, but they can have different attributes. Also
remember:

-   Terrain order is important: if you want to place palm forest on
    desert, first you must declare desert

-   Terrain is placed *after* elevations, so be careful e.g. when
    placing water... you may get water on hills!

**Commands**

*create\_terrain TYPE { ... }*

Creates one or more patches of TYPE terrain.

**Attributes**

*base\_terrain TYPE*

What terrain type the new terrain will be placed on. Default is GRASS.

*land\_percent % / number\_of\_tiles N*

Total size of terrain patches. Use either *land\_percent* or
*number\_of\_tiles*. Default is about 200 tiles.

*land\_percent %*

-   Percent on whole map; scales with map size

*number\_of\_tiles N *

-   It's a fixed size

*number\_of\_clumps N*

Maximum number of distinct terrain patches to create. Default is one.

*set\_scale\_by\_size*

To be used with *number\_of\_tiles*; total terrain size is scaled to map
size. Unscaled value refers to a 100x100 map.

*set\_scale\_by\_groups*

Number of patches is scaled to map size. Unscaled value refers to a
100x100 map.

*spacing\_to\_other\_terrain\_types N*

Minimum distance, in tiles, from different types of terrains. Default is
none.

Recommended for keeping forests away from shores, otherwise they can
obstruct the way.

-   It doesn't force terrains placed later to stay away, only checks
    terrains placed before; so you better include this attribute for all
    terrains that must be separated

-   It also affects the minimum distance, in tiles, from cliffs

*set\_avoid\_player\_start\_areas*

Makes terrain stay away from the centre of Player Lands. Without it,
forests and lakes may swallow town centers!

*height\_limits N(0-7) N(0-7)*

Forces terrain to be placed within certain elevations. First number is
minimum height, second is maximum.

E.g. it lets you place snow only on hill tops.

*set\_flat\_terrain\_only*

Avoid elevation changes. Useful to prevent lakes form lying on slopes.

If it doesn't work (I saw sometimes it doesn't!) try using
*height\_limits 0 0*

*clumping\_factor %(-100-99)*

Shape regularity: higher values tend to form roundish patches, lower
values tend to form weird, snaky patches.

Default is 20 (different than in Land generation). Negative values will
create extremely patchy and snaky clumps.

**1.2.6. &lt;CONNECTION\_GENERATION&gt;**

Connections are lines of terrain that link Lands. Usually their job is
to ensure that units can walk to other lands.

You can't create single connections, only general systems of
connections.

If possible, connections reach centers of lands (town centers, if placed
with *max\_distance\_to\_players 0*).

**Commands**

*create\_connect\_all\_lands { ... }*

All Lands are connected. In general this doesn't include isles created
with &lt;TERRAIN\_GENERATION&gt;.

*create\_connect\_all\_players\_land { ... }*

All Player Lands are connected. Connections may pass thru nobody's lands
too, if that's the easiest way.

*create\_connect\_teams\_lands { ... }*

Allied Player Lands are connected. Connections may pass thru enemy and
nobody's lands too, if that's the easiest way.

*create\_connect\_same\_land\_zones { ... }*

Appears to behave the exactly same way as *create\_connect\_all\_lands*.
Previously undocumented and is not therefore not typically used.

**Attributes**

*default\_terrain\_replacement TYPE*

Creates connections by replacing ALL intervening terrain with the
specified terrain. Previously undocumented, and therefore not typically
used. If used, make sure to use before any *replace\_terrain*
attributes. Those *replace\_terrain* attributes can then be used to
specify a different terrain for parts of the connection. For example, to
replace all terrain with road, but water with shallows. When used after
a *replace\_terrain* attribute it overrides it and re-replaces terrain
along the connection.

*replace\_terrain TYPE TYPE*

Defines what base terrain should be replaced by what connection terrain.

Typically shallow replaces water, by typing *replace\_terrain WATER
SHALLOW*

By default, connections CAN pass through not specified terrain, however,
they are not visible if you do not have a *replace\_terrain* for a given
terrain. If you want to make sure a connection doesn’t pass through a
terrain, give that terrain a relatively high *terrain\_cost*.

You can replace a terrain with itself.

*terrain\_cost TYPE N(1-15)*

"Cost" of passing thru that terrain (can be set even if you don’t have a
corresponding *replace\_terrain*). Connections are more likely to pass
thru terrains with lower cost, and tend to avoid terrains with higher
cost (or take shorter ways). Default is 1.

*terrain\_size TYPE N N*

Connections width on that terrain (requires respective
*replace\_terrain*).

-   First number is mean width in tiles

-   Second number is maximum random variation of connections width in
    every point

E.g. *terrain\_size WATER 5 2* creates paths 3 to 7 tiles wide (5 ± 2).
Default is 1 0.

Specifying a variance greater or equal to mean width CAN reduce width to
0 (broken connections!).

If a connection looks wider than it should, actually it's two or more
parallel connections; try changing terrain cost.

**1.2.7. &lt;OBJECTS\_GENERATION&gt;**

Objects include units, buildings, resources and decorations such as
hawks.

**Commands**

*create\_object TYPE { ... }*

Creates one or more objects of TYPE, for players or for nature.

WARNING: I experienced crashes and bad results when using more than 99
distinct *create\_object* commands!

**Attributes**

*number\_of\_objects N*

How many to place. Default is 1.

*number\_of\_groups N*

Creates N groups, each of specified *number\_of\_objects*. Total objects
= *number\_of\_objects* X *number\_of\_groups*.

Default is no groups: objects are independent and completely scattered.

*group\_variance N*

Works only with *number\_of\_groups*: randomizes number of objects in
every group. It changes by a random amount ranging from -N to N (a group
of deer with *number\_of\_objects 5* and *group\_variance 2* can have 3
to 7 deer: 5 ± 2).

-   Each group can have a different amount

-   Groups always have at least one element

*set\_scaling\_to\_map\_size / set\_scaling\_to\_player\_number*

Use one or other. Scales number of groups; if *number\_of\_groups* isn't
defined, scales *number\_of\_objects*.

-   *set\_scaling\_to\_map\_size*: unscaled value refers to a 100x100
    map

-   *set\_scaling\_to\_player\_number*: Total groups =
    *number\_of\_groups* X number of players

> (it has only effect on number, don't get confused with
> *set\_place\_for\_every\_player*)

*set\_place\_for\_every\_player*

Places objects as "personal" objects for every player, such as the
starting villagers. Also works for non-player objects, e.g. everyone can
start with a personal gold mine nearby (but *set\_gaia\_object\_only* is
needed).

-   Places objects even if player doesn't have the ability to build
    them; e.g. you can create a stable also at Dark Age or for Aztecs,
    though it won't produce any horsemen

-   Works only if Player Lands are defined

-   You can't place units on lands that are separated by water from own
    Player Land (or shallow / ice / beach for buildings and other
    objects not allowed there)

-   Usually it doesn't work for water objects, so you CAN'T place
    starting ships, docks and so on, BUT...

    -   It works if Player Lands are made of dirt (DIRT, DIRT2, DIRT3,
        DIRT\_SNOW)

    -   It works for computer players

    -   It may work if water is part of the player land itself

    -   It does not work if *land\_id* is used

> I made a lot of experiments but still I can't find a logic in this!!

*set\_gaia\_object\_only*

Makes objects belong to NO player. By default, all objects are "gaia" if
you don't use *set\_place\_for\_every\_player.*

-   It MUST be used, together with *set\_place\_for\_every\_player*, for
    personal non-controllable objects

-   If used with controllable objects (units and buildings), makes them
    neutral (rescuable). Rescuable objects permanently join the first
    human player who passes by, but not computer players. They're
    west-European style.

*terrain\_to\_place\_on TYPE*

Only places on this type of terrain. By default, most common objects are
automatically placed on reasonable terrains (no fish on land, no relics
on water, no gold on road, etc...), and you can't put them on weird
terrain anyway.

But some types of eye-candies may be put on weird terrain (you can use
*terrain\_to\_place\_on* to avoid this).

*min\_distance\_to\_players N, max\_distance\_to\_players N*

Minimum and maximum distance, in tiles, from the centers of Player
Lands. You can specify one or both attributes.

By default, there are no distance limits. Usually the town center is
placed at *max\_distance\_to\_players 0*.

-   With *set\_place\_for\_every\_player,* distance refers only to
    respective player

-   Without *set\_place\_for\_every\_player*,
    *max\_distance\_to\_players* has NO effect, and
    *min\_distance\_to\_players* ensures a minimum distance from the
    centers of ALL LANDS. If you have many non-player lands this can
    restrict the placement of objects.

-   With *place\_on\_specific\_land\_id*, distance refers to that land's
    center

If *number\_of\_groups* is defined, distance refers to centers of
groups.

If these distance limits are very strict (e.g. min = max), objects tend
to appear mostly on the left.

*max\_distance\_to\_other\_zones N*

Minimum (NOT maximum!!) distance in tiles from borders of zones; useful
to keep objects away from shores.

If *number\_of\_groups* is defined, distance refers to centers of
groups.

*min\_distance\_group\_placement N*

Scatters objects, keeping them at least N tiles away from any other
object of any type.

Keeps away only objects created by the same *create\_object* command, or
placed later; does not work for objects placed earlier. To be sure that
two series of objects aren't close, add this attribute to both creation
statements.

If *number\_of\_groups* is defined, distance applies among centers of
groups, not among objects of same group.

WARNING: This attribute will affect ALL objects placed after this
command. If you want to scatter objects created in the same
*create\_object* command without restricting future object placement, it
is best to use *temp\_min\_distance\_group\_placement* to do so. Use
*min\_distance\_group\_placement* with smaller values to prevent objects
created in future commands from ending up directly next to the current
ones. Both attributes can be used together in the same *create\_object*
command. Inappropriate use of *min\_distance\_group\_placement* may
result in objects towards the end of your script not being placed at
all!

*temp\_min\_distance\_group\_placement N*

Scatters objects created by current *create\_object* command, keeping
them at least N tiles away from each other.

If *number\_of\_groups* is defined, distance applies among centers of
groups, not among objects of same group. Only used for relics in the
standard maps; however is often a good idea to use this attribute for
any objects that need to be scattered far apart from each other (like
wolves, or extra map resources).

*group\_placement\_radius N*

Force objects in every group to stay within N tiles from center of
group. Default is 3 tiles (7x7 square area).

-   *group\_placement\_radius* overrides other attributes, including
    *number\_of\_objects*. For large groups, you need a large
    *group\_placement\_radius*; by default, groups can contain no more
    than 7x7=49 objects

*set\_tight\_grouping / set\_loose\_grouping*

Use one or other. Tight groups have no space among objects (like gold
and stone in standard maps).

Loose groups can have 1 or 2 tiles among objects; *set\_loose\_grouping*
is default and can be omitted.

-   *set\_tight\_grouping* doesn't place objects that are larger than 1
    tile and can't overlap (like most buildings)

*place\_on\_specific\_land\_id N*

Places objects only on the Land marked by *land\_id N*.

-   Does not work with personal objects (with
    *set\_place\_for\_every\_player*)

-   Land must be separated from others by water (or shallow / ice /
    beach for objects not allowed there)

-   If there are multiple lands with the same id, the set number of
    objects is placed on each of them

*resource\_delta -N*

Modify the resources of a specific instance of an object. (only works
with UP, not in the HD Edition)

This allows you to, for example, produce a gold mine with only 300 gold
in it. Does not work in the scenario editor.

**1.2.8. Map Sizes** (the values provided in the original RMSG are not
accurate)

Scaling refers to map area, that is total number of tiles, not side
length.

*set\_scale\_by\_size* and *set\_scale\_by\_groups* (for terrain and
elevation) use a 100x100 = 10000 tiles reference map.

*set\_scaling\_to\_map\_size* (for objects) uses a 100x100 map as a
reference. So that is number of objects x area ratio from the table
below:

  ---------- -------------------- ----------------- -------------------------------
  **Size**   **Tiles on Sides**   **Total Tiles**   **Area ratio to 100x100 map**
  Tiny       120x120              14400             1.4
  Small      144x144              20736             2.1
  Medium     168x168              28224             2.8
  Large      200x200              40000             4.0
  Huge       220x220              48400             4.8
  Gigantic   240x240              57600             5.8
  LudiKRIS   480x480              230400            23.0
  ---------- -------------------- ----------------- -------------------------------

[]{#S13 .anchor}(LudiKRIS size is only available in The Forgotten and
African Kingdoms)

**1.2.9. AI Info**

*ai\_info\_map\_type* TYPE

This is an optional line at the start of a script to help the AI
(computer player) detect the type of map. For example:

ai\_info\_map\_type ARABIA /\* this tells an AI that your map is like
Arabia \*/

The following can be used:

ARABIA / ARCHIPELIGO / ARENA / BALTIC / BLACK\_FOREST / COASTAL /
CONTINENTAL / CRATER\_LAKE / FORTRESS / GHOST\_LAKE / GOLD\_RUSH /
HIGHLAND / ISLANDS / MEDITERRANEAN / MIGRATION / MONGOLIA / NOMAD /
OASIS / REAL\_WORLD\_\[NAME\] / RIVERS / SALT\_MARSH / SCANDINAVIA /
SCENARIO / YUCATAN

**New with HD/UP:**

*ai\_info\_map\_type*  TYPE N N N

The N values are for map styles. 1 is used if the style applies, 0 if it
does not apply.

The 1^st^ number is 1 if nomad, else 0

The 2^nd^ number is 1 if michi, else 0

The 3^rd^ number is 1 if extra style, else 0

- Nomad is any map where you start without a town center

- Michi is a type of map where teams are completely separated from each
other by forest and have to cut through.

- Extra Style can be used to create a special AI which will specifically
detect your map.

Example – a black forest nomad map would be:

ai\_info\_map\_type BLACK\_FOREST 1 0 0

There are several new map types defined for The Forgotten and African
Kingdoms:

STEPPE / BUDAPEST / VALLEY / ATLANTIC / LAND\_OF\_LAKES / LAND\_NOMAD /
CENOTES / GOLDEN\_HILL / MEGARANDOM / MICHI / AMBUSH / CUSTOM /
NILE\_DELTA / MOUNTAIN\_PASS / SERENGETI / SOCOTRA / KILIMANJARO

Remember – these will only help the AI if that AI has actually been
scripted to respond to a given map label. If your map is not very
similar to any of these maps, it may be best to leave out
*ai\_info\_map\_type*.

Also, most AIs will not be coded to respond to the new AoF/AK map
definitions, so you may want to pick a suitable map from the Conquerors
list instead.

**1.3. General Syntax**

These structures can be used anywhere in an RMS. Most of them allow a
RMS to change at every game.

**1.3.1. Comments**

*/\* This is a comment. It's ignored by the game, but useful to people
who read the RMS, especially yourself! \*/*

-   Comments can span on multiple lines

-   Comments can be nested. Nested comments can occasionally cause weird
    behavior when nested after *\#const*

-   There must be space or new line between the asterisks and the words,
    otherwise the whole rest of your script may be ignored!

**1.3.2. Conditionals**

*if LABEL\_1*

(...) /\* commands executed only if LABEL\_1 is defined \*/

*elseif LABEL\_2 *

(...) /\* commands executed only if LABEL\_2 is defined \*/

*elseif LABEL\_3 *

(...) /\* commands executed only if LABEL\_3 is defined \*/

*else*

(...) /\* commands executed only if none of the previous labels is
defined \*/

*endif*

Commands following an "if" statement (until next elseif/else/endif) are
executed ONLY if respective LABEL is true.

E.g. Kings should be created only if game mode is Regicide.

-   *"elseif"*s and *"else"* are optional:

    -   *elseif* checks another condition, if previously checked
        conditions fail

    -   *else* executes by default if none of the other conditions apply

-   An *if* structure can control whole commands, but can also be used
    inside any { } brackets, to control attributes

-   Whole *if* structures can be nested

-   A "NOT" can be implemented this way:

> if LABEL
>
> else
>
> (...) /\* this code is executed if LABEL is NOT true! \*/
>
> endif

Here are the possible condition labels defined by the game.

Game type:

> REGICIDE
>
> DEATH\_MATCH

Map dimension:

> TINY\_MAP
>
> SMALL\_MAP
>
> MEDIUM\_MAP
>
> LARGE\_MAP
>
> HUGE\_MAP
>
> GIGANTIC\_MAP
>
> LUDIKRIS\_MAP

Starting resources:

HIGH\_RESOURCES

MEDIUM\_RESOURCES

LOW\_RESOURCES

DEFAULT\_RESOURCES

Player positioning:

FIXED\_POSITIONS: defined if the "Team Together" box is checked

UserPatch-only Definitions:

RANDOM\_MAP: defined for Random Map games

TURBO\_RANDOM\_MAP defined for Turbo Random Map games

KING\_OT\_HILL: defined for King of the Hill games

WONDER\_RACE: defined for Wonder Race games

DEFEND\_WONDER: defined for Defend the Wonder games

CAPTURE\_RELICS: defined for the Relics victory condition

\[1-8\]\_PLAYER\_GAME: defined as the total number of players
(2\_PLAYER\_GAME, etc.)

UP\_AVAILABLE: defined for v1.4 and later; used to detect the patch

AoF/AK-only Definitions:

CAPTURE\_THE\_RELIC: Defined for the new "capture the relic" mode

In addition, it is possible to use any of the Item Constants (1.3.4.) in
conditionals. They will always be true if that constant is available in
the game. This can be used to implement conditional checks for mods or
DLC. For example:

if BEGUINE /\* this is a pre-defined constant in Age of Chivalry \*/\
create\_object JAGUAR /\* creates a Jaguar if you are using Age of
Chivalry \*/\
else\
create\_object WOLF /\* otherwise creates a wolf \*/\
endif\
{\
}

Currently (patch 5.1), this technique cannot be used to distinguish
between the basegame in the HD Edition and AoF/AK in the HD Edition
because both of them have access to the same full list of constants in
the game.

*\#define LABEL*

Defines whatever label you want, to be used as an *if* condition. It
will evaluate as true.

-   Condition names can contain ANY character ("\$%&òà" is a valid
    condition!!)

-   Be careful when choosing a name that is already defined as a
    constant. For example *\#define DESERT* caused me problems; probably
    because DESERT is a preexisting terrain name.

**1.3.3. Random Code**

*start\_random*

*percent\_chance %*

(...)

*percent\_chance % *

(...)

*end\_random*

Blocks of code following each *percent\_chance* instruction have that
percent probability at each game to be executed.

If percents don't add up to 100, the remaining percent is the chance
that nothing happens.

-   *Random* structures can control whole commands, but can also be used
    inside { } brackets, to control attributes

-   Whole *random* structures can be nested

-   You cannot use decimals (*percent\_chance* 12.5 is NOT valid)

Example:

> start\_random
>
> percent\_chance 30
>
> \#define ARABIAN\_MAP /\* map will be Arabian in 30% of games \*/
>
> percent\_chance 20
>
> \#define NORTHERN\_MAP /\* map will be northern in 20% of games \*/
>
> end\_random /\* map will be default (e.g. temperate) in remaining 50%
> of games \*/

**1.3.4. Item Constants**

*\#const NAME N*

Creates a constant name for a terrain or object type, suitable for
commands such as *create\_terrain*.

Items are identified by a number inside the game, but by a name (such as
GRASS) in a RMS; this command ties a practical name to an item number.
Numbers are reported in "Terrains & Objects" chapter.

-   Constant names can contain ANY character ("\$%&kòà" is a valid
    name!!)

-   Every item can have many names; original names remain valid

-   You can't redefine an existing name to a different number

Most items already have a predefined name, anyway *\#const* can be very
useful because:

-   Some items, e.g. snowy road, don't have a predefined name

-   You may want an alias for your convenience, e.g. in your language

-   You can define variable items with a single *if* structure, instead
    of checking every time an item is used.

> In this example you would use only GROUND and TREE from now on:
>
> If ARABIAN\_MAP
>
> \#const GROUND 14 /\* desert \*/
>
> \#const TREE 351 /\* palm \*/
>
> elseif NORTHERN\_MAP
>
> \#const GROUND 32 /\* snow \*/
>
> \#const TREE 413 /\* snowy pine \*/
>
> else
>
> \#const GROUND 0 /\* grass \*/
>
> \#const TREE 411 /\* oak \*/
>
> endif

*\#const* works only for terrain and object identifiers, not generic
numbers. You CAN'T do this:

\#const NUM 10

(...)

number\_of\_objects NUM

[[]{#S14 .anchor}]{#S2 .anchor}**2. TERRAINS & OBJECTS**

Here are the lists of available item types, including:

-   Predefined constant name, if any (otherwise use *\#const*).

-   Constant number N, to be used for name definitions: *\#const name N*

-   Comments, if needed

I reported only items that look good enough to be useful in a RMS. For a
complete list of constants, including defective stuff, see the Constant
Numbers Guides which I’ve linked in [*section 5.3.1.*](#S53)

**2.1. Terrains**

The HD Edition caused some confusion by renaming terrains in the
Scenario Editor. The table called **Terrain Names Spreadsheet**
([*section 5.3.1*](#S53)) may be of some help in explaining the
differences in nomenclature. For example ICE is called Ice2 in the HD
scenario editor, and DIRT is called Desert, and DIRT3 is Dirt 1 in the
in the HD Scenario Editor.

  --------------------------- --------------------- ------- -------------------------------------------------------------------------------------------
  **Type**                    **Predefined Name**   **N**   **Comments**
  Beach                       BEACH                 2       Automatically placed around coasts. Ships can sail on! No buildings except walls
  Beach, icy                                        37      Automatically placed around snowy coasts, acts like BEACH
  Dirt                        DIRT                  6       Includes some cactus objects
  Dirt, grass mix             DIRT2                 11      
  Dirt, grass mix, no beach                         27      Like DIRT2, but has no beaches, still dockable
  Dirt, greenish              DIRT3                 3       
  Dirt, snowy                 DIRT\_SNOW            33      Has icy beaches
  Dirt, snowy, sandy beach                          36      Like DIRT\_SNOW, but has no beaches, still dockable
  Desert                      DESERT                14      
  Farms, ploughed                                   29      Terrain only, not cultivable!
  Farms, growing                                    30      Terrain only, not cultivable!
  Farms, growing more                               31      Terrain only, not cultivable!
  Farms, planted                                    7       Terrain only, no food!
  Farms, expired                                    8       Terrain only, not replantable!
  Forest, Bamboo              BAMBOO                18      
  Forest                      FOREST                10      20 is same, but game thinks it's different (e.g. as base\_terrain)
  Forest, Oak                                       20      looks exactly like 10, but is called "Oak forest" when you click on a tree
  Forest, Jungle              JUNGLE                17      
  Forest, Leaves              LEAVES                5       Terrain left when temperate or tropical forest is chopped
  Forest, Palm                PALM\_DESERT          13      Leaves behind DESERT when chopped
  Forest, Pine                PINE\_FOREST          19      
  Forest, Snowy               SNOW\_FOREST          21      Leaves behind GRASS\_SNOW when chopped
  Grass                       GRASS                 0       Default terrain
  Grass, other                                      16      Like GRASS; automatically placed under all cliffs
  Grass, other2                                     41      Like GRASS, but black on the minimap. DO NOT USE – unit pathing is broken on this terrain
  Grass, brighter             GRASS2                12      
  Grass, brownish             GRASS3                9       
  Grass, snowy                GRASS\_SNOW           34      Terrain left when snowy forest is chopped
  Ice                         ICE                   35      Ships cannot sail through this
  Ice, other                                        26      Ships can sail through this
  Road                        ROAD                  24      You can't place gold, stone, berries on any type of road
  Road, other                                       40      No buildings, used in King of the Hill.
  Road, ruined                ROAD2                 25      
  Road, snowy                                       38      
  Road, grassy                                      39      
  Shallow                     SHALLOW               4       Grassy water; walkable and navigable
  Snow                        SNOW                  32      
  Water                       WATER                 1       
  Water, darker               MED\_WATER            23      Not dockable
  Water, darkest              DEEP\_WATER           22      Not dockable
  Water, no beach                                   15      Like WATER, but has no beaches, not dockable
  Water, walkable!                                  28      Like WATER, no beaches, walkable, no ships
  --------------------------- --------------------- ------- -------------------------------------------------------------------------------------------

[]{#S22 .anchor}**2.2. Player Objects**

These units and buildings can be controlled by a player. With
*set\_gaia\_object\_only*, they become rescuable.

CAPITAL names are valid predefined labels; other names are only
descriptive (use \#const for such objects).

2.2.1. Barracks Units 2.2.2. Archery Range Units

  ------------------------ ----- -- ------------------------ -----
  CHAMPION                 567      ARBALEST                 492
  EAGLE\_WARRIOR           751      ARCHER                   4
  ELITE\_EAGLE\_WARRIOR    752      CAVALRY\_ARCHER          39
  HALBERDIER               359      CROSSBOWMAN              24
  LONG\_SWORDSMAN          77       ELITE\_SKIRMISHER        6
  MAN\_AT\_ARMS            75       HAND\_CANNONEER          5
  MILITIA                  74       HEAVY\_CAVALRY\_ARCHER   474
  PIKEMAN                  358      SKIRMISHER               7
  SPEARMAN                 93    
  TWO\_HANDED\_SWORDSMAN   473   
  ------------------------ ----- -- ------------------------ -----

2.2.3. Stable Units

  ----------------------- ----- ---------------------------------------------------------------------
  CAMEL                   329   

  CAVALIER                283   

  HEAVY\_CAMEL            330   

  HUSSAR                  441   

  KNIGHT                  38    

  LIGHT\_CAVALRY          546   

  PALADIN                 569   

  SCOUT, SCOUT\_CAVALRY   448   Automatically places Eagle Warriors for Aztecs and Mayas.
                                
                                I couldn't find a way to place cavalry Scouts for Aztecs and Mayas!
  ----------------------- ----- ---------------------------------------------------------------------

2.2.4. Siege Engines 2.2.5. Ships

  ---------------------- ------------- ---- ------------------------- -----
  BATTERING\_RAM         35                 CANNON\_GALLEON           420
  BOMBARD\_CANNON        36                 DEMOLITION\_SHIP          527
  CAPPED\_RAM            422                ELITE\_CANNON\_GALLEON    691
  HEAVY\_SCORPION        542                FAST\_FIRE\_SHIP          532
  MANGONEL               280                FIRE\_SHIP                529
  ONAGER                 550                FISHING\_SHIP             13
  SCORPION               279                GALLEY                    539
  SIEGE\_ONAGER          588                GALLEON                   442
  SIEGE\_RAM             548                HEAVY\_DEMOLITION\_SHIP   528
  TREBUCHET (unpacked)   42                 TRADE\_COG                17
  TREBUCHET\_PACKED      331                TRANSPORT\_SHIP           545
                         WAR\_GALLEY   21
  ---------------------- ------------- ---- ------------------------- -----

2.2.6. Reserved Units

  ------------------ ----- -- ------------------------- -----
  BERSERK            692      ELITE\_BERSERK            694
  CATAPHRACT         40       ELITE\_CATAPHRACT         553
  CHU\_KO\_NU        73       ELITE\_CHU\_KO\_NU        559
  CONQUISTADOR       771      ELITE\_CONQUISTADOR       773
  HUSKARL            41       ELITE\_HUSKARL            555
  JAGUAR\_WARRIOR    725      ELITE\_JAGUAR\_WARRIOR    726
  JANISSARY          46       ELITE\_JANISSARY          557
  LONGBOAT           250      ELITE\_LONGBOAT           533
  LONGBOWMAN         8        ELITE\_LONGBOWMAN         530
  MAMELUKE           282      ELITE\_MAMELUKE           556
  MANGUDAI           11       ELITE\_MANGUDAI           561
  MISSIONARY         775      
  PLUMED\_ARCHER     763      ELITE\_PLUMED\_ARCHER     765
  SAMURAI            291      ELITE\_SAMURAI            560
  TARKAN             755      ELITE\_TARKAN             757
  TEUTONIC\_KNIGHT   25       ELITE\_TEUTONIC\_KNIGHT   554
  THROWING\_AXEMAN   281      ELITE\_THROWING\_AXEMAN   531
  TURTLE\_SHIP       831      ELITE\_TURTLE\_SHIP       832
  WAR\_ELEPHANT      239      ELITE\_WAR\_ELEPHANT      558
  WAR\_WAGON         827      ELITE\_WAR\_WAGON         829
  WOAD\_RAIDER       232      ELITE\_WOAD\_RAIDER       534
  ------------------ ----- -- ------------------------- -----

2.2.7. Other standard units

  -------------------- -------------------- ---------------------------------------------------------------------------------------------------------------------------------------------------
  KING                 434                  Must be manually placed for regicide (use: if REGICIDE...)
  MONK                 125                  
  PETARD               440                  
  SHEEP                594                  Can belong to a player at start
  TRADE\_CART          128                  
  Trade cart, packed   204                  Appears as packed, but it's not carrying gold
  TURKEY               833                  Can belong to a player at start
  VILLAGER                                  Randomly places man or woman. If you don't set number\_of\_objects, the game will automatically place 3 villagers (or 6 for Chinese, 4 for Mayas)
  Villager             293 woman, 83 man
  Villager, builder    212 woman, 118 man
  Villager, farmer     214 woman, 259 man
  Villager, fisher     57 woman, 56 man
  Villager, gatherer   354 woman, 120 man
  Villager, miner      581 woman, 579 man
  Villager, hunter     216 woman, 122 man
  Villager, chopper    218 woman, 123 man
  Villager, sheperd    590 woman, 592 man
  -------------------- -------------------- ---------------------------------------------------------------------------------------------------------------------------------------------------

2.2.8. Heroes

  -------------------------- ----- -----------------------------------------------------------
  ADMIRAL\_YI\_SUN\_SHIN     844   Turtle ship
  AETHELFIRTH                169   Woad raider
  Alexander Nevski           197   Cavalier. Predefined name is WILLIAM\_THE\_CONQUEROR2
  ARCHBISHOP                 177   Monk. Turns to a normal monk when picks up a relic
  ARCHERS\_OF\_THE\_EYES     686   Arbalest, not so tough
  ATTILA\_THE\_HUN           777   Cataphract
  BAD\_NEIGHBOR              682   Trebuchet, unpacked
  BAD\_NEIGHBOR\_PACKED      730   Trebuchet, packed
  BELISARIUS                 167   Cataphract
  CHARLEMAGNE                165   Throwing axeman
  CHARLES\_MARTEL            424   Throwing axeman
  CONSTABLE\_RICHEMONT       646   Knight with lance
  DUKE\_D\_ALENCON           638   Knight with lance
  EL\_CID                    198   Champion
  EL\_CID\_CAMPEADOR         824   Knight with lance
  EMPEROR\_IN\_A\_BARREL     733   Trade cart. Appears as packed, but it's not carrying gold
  ERIK\_THE\_RED             171   Berserk
  FRANKISH\_PALADIN          632   Knight with lance
  FRIAR\_TUCK                163   Monk. Turns to a normal monk when picks up a relic
  GAWAIN                     175   Cavalier
  GENGHIS\_KHAN              731   Mangudai, very tough
  GODS\_OWN\_SLING           683   Trebuchet, unpacked
  GODS\_OWN\_SLING\_PACKED   729   Trebuchet, packed
  GUY\_JOSSELYNE             648   Paladin
  HENRY\_V                   847   Paladin
  HROLF\_THE\_GANGER         428   Berserk
  HUNTING\_WOLF              700   Wolf. Only hero wolves can be controlled by players
  IMAM                       842   Monk. Turns to a normal monk when picks up a relic
  JEAN\_BUREAU               650   Bombard cannon, not so tough
  JEAN\_DE\_LORRAIN          644   Bombard cannon
  JOAN\_OF\_ARC              629   Knight, woman (different graphics!)
  JOAN\_THE\_MAID            430   Poor woman, not so tough
  KING\_ALFONSO              840   King. Hero kings don't work for regicide!
  KING\_ARTHUR               173   King. Hero kings don't work for regicide!
  KING\_SANCHO               838   King. Hero kings don't work for regicide!
  KITABATAKE                 195   Samurai
  KUSHLUK                    702   Cavalier
  LA\_HIRE                   640   Champion
  LANCELOT                   174   Paladin
  LORD\_DE\_GRAVILLE         642   Arbalest, not so tough
  MASTER\_OF\_THE\_TEMPLAR   680   Knight with lance
  MINAMOTO                   196   Samurai
  MORDRED                    176   Paladin
  NOBUNAGA                   845   Samurai
  ORNLU\_THE\_WOLF           707   Wolf, very tough, towers can't target him
  POPE\_LEO\_I               781   Monk. Turns to a normal monk when picks up a relic
  REYNALD\_DE\_CHATILLON     678   Knight with lance
  RICHARD\_THE\_LIONHARTED   160   Paladin
  ROBIN\_HOOD                200   Longbowman
  ROLAND                     166   Knight
  SCYTHIAN\_SCOUT            852   Light cavalry, not so tough
  SCYTHIAN\_WILD\_WOMAN      783   Poor woman (same as Joan the Maid), not so tough
  SHAH                       704   King. Hero kings don't work for regicide!
  SHERIFF\_OF\_NOTTINGHAM    164   Man at arms, not so tough
  SIEGFRIED                  170   Champion
  SIEUR\_BERTRAND            636   Knight
  SIEUR\_DE\_METZ            634   Knight
  SIR\_JOHN\_FASTOLF         652   Knight with lance
  SUBOTAI                    698   Heavy cavalry archer
  TAMERLANE                  172   Mangudai
  THE\_BLACK\_PRINCE         161   Cavalier
  THEODORIC\_THE\_GOTH       168   Huskarl
  WILLIAM\_THE\_CONQUEROR    849   Knight with lance
  WILLIAM\_WALLACE           432   Champion
  -------------------------- ----- -----------------------------------------------------------

2.2.9. Other Units

  ------------------------------ ----- ---------------------------------------------------------------------------------------------------------- --------------------------------------------------------------------------------
  Advanced heavy crossbowman     493   New ranged unit, with unique graphics!
  Alternative Berserk            94    New melee unit, with unique graphics!
  Car with machine guns!         748   The one of the cheat
  Converter Galley               536   A galley that converts enemies like a monk!
  ES\_FLAG                       851   Ensemble Studios flag
  FLAG\_A                        600   Tall flag
  FLAG\_B                        601   Bifurcate flag
  FLAG\_C                        602   Spotted flag
  FLAG\_D                        603   Crossed flag
  FLAG\_E                        604   Binged flag
  Furious the monkey boy         860   The one of the cheat. VERY powerful! If gaia, attacks as a wolf
  HORSE                          814   Can explore, but short sight
  Infiltrator                    299   Looks exactly as a Militia, but he's stronger
  Junk                           15    New ship, with unique graphics! Can explore. Turns invisible when it attacks; auto responds if attacked.
  MAP\_REVEALER                  837   Invisible ad immobile; gives sight of 4 tiles radius area
  SABOTEUR                       706   The one of the cheat. Stronger than Petard
  Shipwreck                      436   Can't move unless in group. A nice eye-candy, but counts as 4 population!
  Super armored Archer           571   Armor 1000, but attack only 1
  Super armored Cavalry Archer   577   Armor 1000, but attack only 1
  Super armored Light Cavalry    575   Armor 1000, but attack only 1
  Super armored Militia          573   Armor 1000, but attack only 1
  TORCH                          499   Can be placed even on water and forests. Not rescuable if gaia
  TORCH\_CONVERTING              854   As TORCH, but joins human players that come by (like sheep)
  ------------------------------ ----- ---------------------------------------------------------------------------------------------------------- --------------------------------------------------------------------------------

2.2.10. Standard Buildings

  ----------------- ----- -- ------------------- -----
  ARCHERY\_RANGE    87       MARKET              84
  BARRACKS          12       MILL                68
  BLACKSMITH        103      MINING\_CAMP        584
  BOMBARD\_TOWER    236      MONASTERY           104
  CASTLE            82       OUTPOST             598
  DOCK              45       PALISADE\_WALL      72
  FARM              50       SIEGE\_WORKSHOP     49
  FISH\_TRAP        199      STABLE              86
  FORTIFIED\_WALL   155      TOWN\_CENTER        109
  GUARD\_TOWER      234      UNIVERSITY          209
  HOUSE             70       WALL, STONE\_WALL   117
  KEEP              235      WATCH\_TOWER        79
  LUMBER\_CAMP      562      WONDER              276
  ----------------- ----- -- ------------------- -----

**2.2.11. Note on Walls**

Standard walls (palisade, stone or fortified) are automatically placed
in rings around player lands, including four gates (one per side),
whenever you use *set\_place\_for\_every\_player*. If you use palisade
walls, the stone gates will be placed in the original AoC, but HD will
place palisade gates instead.

E.g. this command would create square walls with 15 tiles radius:

create\_object WALL

{

> set\_place\_for\_every\_player
>
> min\_distance\_to\_players 15
>
> max\_distance\_to\_players 15

}

-   number\_of\_objects is ignored, so don't even type it

-   min\_distance and max\_distance must be specified, or you get bad
    results

-   If max\_distance is greater than min\_distance, you get a non-square
    ring, with varying radius

-   You can't place more than one wall ring per player. Any further
    walls after the first one will end up on top of the original ring,
    regardless of the min and max distance specified.

-   You can't place single pieces of wall (not rings) for players, and
    you can't place rings for gaia

-   You must place the wall AFTER placing a town center for every
    player. If you place it before a TC is placed, or if no TCs are
    placed, the wall will form a ring around the center of the map
    instead

-   Walls are not placed if the players are completely separated from
    each other by water

-   Walls are not placed on lands created with *assign\_to\_player*

**2.2.12. Other Buildings**

Most of these buildings do nothing and are eye-candy only. "Not working"
buildings generally can't train units, research, receive resources or
fire arrows; they only have sight and potentially population support.

  ----------------------------------------- ----------------------------------------------------------------------------------- ------------------------------------------------------------------------------------------------------------------
  Archery range, not working                10                                                                                  Castle age style

  Barracks, not working                     498                                                                                 Feudal age style

  Barracks, not working                     20                                                                                  Castle age style

  Blacksmith, not working                   105                                                                                 Feudal age style

  Blacksmith, not working                   18                                                                                  Castle age style

  Bridge A, bottom                          607                                                                                 Bridge A goes SW to NE.
                                                                                                                                
                                                                                                                                Bridge B goes NW to SE.
                                                                                                                                
                                                                                                                                They can't be attacked.
                                                                                                                                
                                                                                                                                They aren't rescuable if gaia.
                                                                                                                                
                                                                                                                                Middle parts always have some water underneath.

  Bridge A, mid                             606                                                                                 

  Bridge A, mid, mid broken                 738                                                                                 

  Bridge A, mid, top broken                 739                                                                                 

  Bridge A, mid, bottom broken              740                                                                                 

  Bridge A, top                             605                                                                                 

  Bridge B, bottom                          610                                                                                 

  Bridge B, mid                             609                                                                                 

  Bridge B, mid, mid broken                 741                                                                                 

  Bridge B, mid, top broken                 742                                                                                 

  Bridge B, mid, bottom broken              743                                                                                 

  Bridge B, top                             608                                                                                 

  Castle, not working                       33                                                                                  Does nothing, but can garrison 75 units! (they don't shoot)

  CATHEDRAL                                 599                                                                                 Does nothing. Looks like British wonder, but bigger

  Dock, not working                         133                                                                                 Feudal age style

  Dock, not working                         47                                                                                  Castle age style

  DOME\_OF\_THE\_ROCK                       690                                                                                 Does nothing. Great mid-east temple

  Fortified Gate                            / 63, \\ 85, — 660, | 668. Only central part actually looks like a fortified gate

  Fortified wall, corner                    80                                                                                  Has a fortified gate's HP and icon, but it's just a junction piece of wall.
                                                                                                                                
                                                                                                                                It's placed as a normal object, not in rings as FORTIFIED\_WALL

  Gate                                      / 64, \\ 88, — 659, | 667

  GREAT\_PYRAMID                            696                                                                                 Does nothing.

  House, feudal age                         463                                                                                 Works!

  House, castle age                         464                                                                                 Works!

  Lumber camp, not working                  563                                                                                 

  Market, not working                       116                                                                                 Castle age style

  Market, not working                       137                                                                                 Imperial age style

  Mill, not working                         129                                                                                 Feudal age style

  Mill, not working                         130                                                                                 Castle age style

  Mining camp, not working                  585                                                                                 

  Monastery, not working                    30                                                                                  

  MONUMENT                                  826                                                                                 Same as a wonder, but doesn't let you win

  MOSQUE                                    655                                                                                 Does nothing. Looks exactly as the Turkish wonder

  PAVILION                                  624                                                                                 Big tent. Works as a house, but only 500 HP

  PAVILION2                                 626                                                                                 Small tent. Works as a house, but only 500 HP

  PAVILION3                                 625                                                                                 Small tent. Works as a house, but only 500 HP

  Port, not working                         446                                                                                 A castle age style dock. Has special graphics for east-European and American civs. Slightly different for others

  PYRAMID                                   689                                                                                 Does nothing.

  Sea Gate (Palisade Gate in AoF)                                                                                               A wooden gate on water! Friendly ships can pass thru.
                                                                                                                                
                                                                                                                                Open: / 790, \\ 794, — 798, | 802. Closed: / 789, \\ 793, — 797, | 801
                                                                                                                                
                                                                                                                                Palisade gate can be placed on land in AoF

  Sea Tower                                 785                                                                                 New water building! Graphics aren't perfect but can shoot arrows.
                                                                                                                                
                                                                                                                                Graphics fixed in the HD Edition

  Sea Wall (part of palisade gate in AoF)   791                                                                                 A wooden wall on water! But it's not automatically placed in rings.
                                                                                                                                
                                                                                                                                Part of the Palisade gate graphics in AoF

  Siege workshop, not working               150                                                                                 

  Stable, not working                       101                                                                                 Castle age style

  THE\_ACCURSED\_TOWER                      684                                                                                 Powerful guard tower, similar to west-European ones. Great range

  THE\_TOWER\_OF\_FLIES                     685                                                                                 Powerful guard tower, similar to west-European ones.

  Town center, not working                  71                                                                                  Can garrison, fire arrows, and support pop. Graphics aren't perfect.

  TRADE\_WORKSHOP                           110                                                                                 Does nothing. Has west-European and far-east versions

  University, not working                   210                                                                                 Imperial age style

  Wall, corner                              81                                                                                  Has a gate's HP and icon, but it's just a junction piece of wall.
                                                                                                                                
                                                                                                                                It's placed as a normal object, not in rings as WALL

  YURT                                      712                                                                                 Big, wooden hut. Works as a house, but only 500 HP

  YURT2                                     713                                                                                 Small, wooden hut. Works as a house, but only 500 HP

  YURT3                                     714                                                                                 Small, wooden hut. Works as a house, but only 500 HP

  YURT4                                     715                                                                                 Small, wooden hut. Works as a house, but only 500 HP

  YURT5                                     716                                                                                 Small, leather hut. Works as a house, but only 500 HP

  YURT6                                     717                                                                                 Small, leather hut. Works as a house, but only 500 HP

  YURT7                                     718                                                                                 Small, leather hut. Works as a house, but only 500 HP

  YURT8                                     719                                                                                 Big, leather hut. Works as a house, but only 500 HP
  ----------------------------------------- ----------------------------------------------------------------------------------- ------------------------------------------------------------------------------------------------------------------

[]{#S23 .anchor}**2.3. Gaia Objects**

These objects can never belong to a player. *set\_gaia\_object\_only* is
required if *set\_place\_for\_every\_player* is used.

Again, capital letters names are predefined labels, while lower case
names are just descriptive (you must use *\#const*).

"Varies" means that the same type of object can actually have two or
more different aspects (like the villagers, that can randomly be men or
women), making a better eye-candy.

2.3.1. Animals

  ------------------------------- ----- ---------------------------------------------------------------------------------------
  BOAR                            48    
  DEER                            65    
  Deer, not huntable              333   
  DIRE\_WOLF                      89    A wolf with 100 HP, but low attack. Not so dire... AIs have trouble with these wolves
  DORADO, FISH\_DORADO            455   
  FISH                            53    Called Perch, 200 food like shore fish (normal fish have more)
  HAWK                            96    
  IRON\_BOAR                      810   Very strong, attacks villagers at sight, can't be hunted. Will cause AIs trouble
  JAGUAR                          812   
  JAVELINA                        822   Just a boar with different name, isn't it? :)
  MACAW                           816   Tropical bird, wandering like a hawk
  MARLIN1, GREAT\_FISH\_MARLIN    450   
  MARLIN2, GREAT\_FISH\_MARLIN2   451   
  RABID\_WOLF                     202   Slightly stronger. Sees and pursues villagers from far away.
  SALMON, FISH\_SALMON            456   
  SNAPPER, FISH\_SNAPPER          458   
  SHEEP                           594   Can also be placed as a player object
  SHORE\_FISH                     69    
  TUNA, FISH\_TUNA                457   
  TURKEY                          833   Can also be placed as a player object
  WILD\_HORSE                     835   Wanders like a deer. Use HORSE for a player-controlled horse
  WOLF                            126   
  ------------------------------- ----- ---------------------------------------------------------------------------------------

**2.3.2. Trees**

Unlike forest terrains, tree objects aren't visible on mini-map. Normal
trees have 100 wood each. The scenario editor trees (399-410) have 125
wood and cannot be cut down with siege onagers. AIs sometimes may not
recognize them as a wood source for the purpose of choosing initial
lumber camp sites.

  ------------------------------------------ ----- ----------------------------------------------
  BAMBOO\_TREE, BAMBOO\_FOREST\_TREE         348   Varies. Same created by BAMBOO terrain
  JUNGLETREE, JUNGLE\_TREE                   414   Varies. Same created by JUNGLE terrain
  OAKTREE, FOREST\_TREE, OAK\_FOREST\_TREE   349   Varies. Same created by FOREST terrain
  PALMTREE, PALM\_FOREST\_TREE               351   Varies. Same created by PALM\_DESERT terrain
  PINETREE, PINE\_FOREST\_TREE               350   Varies. Same created by PINE\_FOREST terrain
  SNOWPINETREE, SNOW\_PINE\_TREE             413   Varies. Same created by SNOW\_FOREST terrain
  TREE\_A, TREE1, TREE\_TD                   399   Oak forest
  TREE\_B, TREE2                             400   Oak forest
  TREE\_C, TREE3                             401   Oak forest
  TREE\_D, TREE4                             402   Oak forest
  TREE\_E, TREE5                             403   Oak forest
  TREE\_F                                    404   Dry, no leaves
  TREE\_G                                    405   Brown leaves
  TREE\_H                                    406   Oak forest
  TREE\_I                                    407   Dry, no leaves
  TREE\_J                                    408   Oak forest
  TREE\_K                                    409   Oak forest
  TREE\_L                                    410   Oak forest
  ------------------------------------------ ----- ----------------------------------------------

2.3.3. Other

  ------------------------------- --------------------------------------------------------------------------------------------------------------------------------------- ------------------------------------------------------------------------------
  Arrow                           315                                                                                                                                     Lying on ground. Can be on water. Varies

  Arrows                          54                                                                                                                                      Lying on ground. Can be on water. Varies

  BROKEN\_CART                    858                                                                                                                                     

  CACTUS                          709                                                                                                                                     Varies

  Car!                            749                                                                                                                                     The one of the cheat, but eye-candy only

  Cliff, alternative              273                                                                                                                                     A small cliff, with new rock color

  CRACKS                          241                                                                                                                                     

  CRATER                          723                                                                                                                                     Quite small

  EXPIRED\_FISHTRAP               278                                                                                                                                     Can be on land. Disappears quickly

  FLOWER\_BED                     859                                                                                                                                     

  FLOWERS\_1                      334                                                                                                                                     Can overlap water and other stuff

  FLOWERS\_2                      335                                                                                                                                     Can overlap water and other stuff

  FLOWERS\_3                      336                                                                                                                                     Can overlap water and other stuff

  FLOWERS\_4                      337                                                                                                                                     Can overlap water and other stuff

  FORAGE, FORAGE\_BUSH            59                                                                                                                                      Varies

  GOLD                            66                                                                                                                                      Varies

  GRAVE                           820                                                                                                                                     Varies

  HAY\_STACK                      857                                                                                                                                     

  HEAD                            821                                                                                                                                     Pole with human head

  MOUNTAIN\_1, MOUNTAIN1          310                                                                                                                                     Can't walk on. Grassy

  MOUNTAIN\_2, MOUNTAIN2          311                                                                                                                                     Can't walk on. Grassy

  MOUNTAIN\_3                     744                                                                                                                                     Can't walk on. Rocky

  MOUNTAIN\_4                     745                                                                                                                                     Can't walk on. Rocky

  NINE\_BANDS                     720                                                                                                                                     Pole with horn decorations

  OLD\_STONE\_HEAD                855                                                                                                                                     Pre-Columbian sculpture. Varies

  Outlaw                          158                                                                                                                                     Neutral archer. Attacks everyone he sees! Cool but only 15 HP

  PATH\_1                         339                                                                                                                                     Muddy trail. Can overlap water and other stuff

  PATH\_2                         340                                                                                                                                     Muddy trail. Can overlap water and other stuff

  PATH\_3                         341                                                                                                                                     Muddy trail. Can overlap water and other stuff

  PATH\_4                         338                                                                                                                                     Two muddy trails crossing. Can overlap water and other stuff

  PIECE\_OF\_THE\_TRUE\_CROSS     688                                                                                                                                     Black relic. Disappears when picked up...

  PLANT, PLANTS                   818                                                                                                                                     Small grass. Can be on water! Varies

  RELIC                           285                                                                                                                                     

  Relic, with civilization name   287 British, 288 Byzantine, 289 Chinese, 290 Frankish, 292 Gothic, 294 Japanese, 295 Persian, 296 Saracen, 297 Teutonic, 298 Turkish.
                                  
                                  Only name is different from a normal relic.
                                  
                                  They become normal relics when brought to a monastery.

  ROCK                            623                                                                                                                                     Can be on water, but looks good only on land. Varies.

  ROMAN\_RUINS                    856                                                                                                                                     Can be on water! Varies.

  RUBBLE\_1\_X\_1                 863                                                                                                                                     Like destroyed buildings, 1x1 tiles. Can be on water!

  Rubble 1x1, temporary           143                                                                                                                                     Can be on water! Disappears quickly

  RUBBLE\_2\_X\_2                 864                                                                                                                                     Can be on water!

  Rubble 2x2, temporary           144                                                                                                                                     Can be on water! Disappears quickly

  Rubble 2x2, different           147                                                                                                                                     Can be on water! Disappears quickly

  RUBBLE\_3\_X\_3                 865                                                                                                                                     Can be on water!

  Rubble 3x3, temporary           145                                                                                                                                     Can be on water! Disappears quickly

  Rubble 4x4, temporary           146                                                                                                                                     Can be on water! Disappears quickly

  Rubble 5x5, temporary           148                                                                                                                                     Can be on water! Disappears quickly

  RUGS                            711                                                                                                                                     Can be on water! Varies

  RUINS                           345                                                                                                                                     Quite big

  SEA\_ROCKS\_1                   389                                                                                                                                     

  SEA\_ROCKS\_2                   396                                                                                                                                     

  SHIPWRECK                       721                                                                                                                                     

  SHIPWRECK2                      722                                                                                                                                     

  SIGN                            819                                                                                                                                     Wooden road signal. Can be on water!

  SKELETON                        710                                                                                                                                     Varies

  Small white stone               417                                                                                                                                     

  STATUE                          817                                                                                                                                     The one of European universities. Can be on water!

  Stormy Dog                      862                                                                                                                                     Flying dog! The one of the cheat... wanders like a hawk

  STONE                           102                                                                                                                                     Varies

  STUMP                           809                                                                                                                                     What remains of a cut tree. Varies

  Stump, temporary                415                                                                                                                                     Disappears after some time. Varies

  Stumps of bamboo                737                                                                                                                                     Disappears after some time

  Trireme                         61                                                                                                                                      Eye-candy only. Disappears after some time. Can be on land. Varies (rotates)
  ------------------------------- --------------------------------------------------------------------------------------------------------------------------------------- ------------------------------------------------------------------------------

**2.3.4. Dead units**

These units, except for wild animals, can also be placed as player
objects (with *set\_place\_for\_every\_player* and without
*set\_gaia\_object\_only*); of course they're not controllable, and only
get owner's color.

All dead units decay and disappear after some time. They can be placed
on water.

  --------------------------- ----- -- ---------------------------------- -----
  Dead Adv. Hv. Crossbowman   497      Dead Scorpion                      149
  Dead Arbalest               687      Dead Sheep (no food)               595
  Dead Archer                 3        Dead Siege Onager                  589
  Dead Battering Ram          23       Dead Siege Ram                     549
  Dead Berserk                693      Dead Skirmisher                    238
  Dead Boar (no food)         356      Dead Spearman                      100
  Dead Bombard Cannon         16       Dead Tarkan                        480
  Dead Camel                  494      Dead Teutonic Knight               181
  Dead Capped Ram             423      Dead Throwing Axeman               154
  Dead Cataphract             27       Dead Trade Cart, unpacked          178
  Dead Cavalier               139      Dead Trade Cart, packed            205
  Dead Cavalry Archer         34       Dead Trebuchet, unpacked           194
  Dead Champion               151      Dead Trebuchet, packed             735
  Dead Conquistador           772      Dead Two Handed Swordsman          568
  Dead Crossbowman            26       Dead Unrecognized cavalry          135
  Dead Deer (no food)         43       Dead Unrecognized infantry         98
  Dead Eagle Warrior          754      Dead Unrecognized infantry         750
  Dead Heavy Camel            113      Dead Unrecognized infantry         22
  Dead Horse                  815      Dead Unrecognized infantry         99
  Dead Huskarl                62       Dead Villager, woman               60
  Dead Jaguar                 813      Dead Villager, woman, builder      213
  Dead Joan of Arc            630      Dead Villager, woman, farmer       215
  Dead Joan the Maid          431      Dead Villager, woman, forager      355
  Dead King                   839      Dead Villager, woman, miner        582
  Dead Knight                 111      Dead Villager, woman, hunter       217
  Dead Knight with Lance      633      Dead Villager, woman, lumberjack   219
  Dead Light Cavalry          547      Dead Villager, woman, shepherd     591
  Dead Long Swordsman         180      Dead Villager, man                 58
  Dead Mameluke               44       Dead Villager, man, builder        230
  Dead Man at Arms            157      Dead Villager, man, farmer         228
  Dead Mangonel               675      Dead Villager, man, forager        353
  Dead Militia                152      Dead Villager, man, miner          229
  Dead Missionary             776      Dead Villager, man, hunter         227
  Dead Monk                   134      Dead Villager, man, shepherd       226
  Dead Onager                 121      Dead War Elephant                  136
  Dead Paladin                570      Dead War Wagon                     828
  Dead Plumed Archer          764      Dead Woad Raider                   233
  Dead Pikeman                501      Dead Wolf                          237
  --------------------------- ----- -- ---------------------------------- -----

[]{#S24 .anchor}**2.4. New AoF and AK Objects**

These terrains and objects were added with The Forgotten expansion and
the African Kingdoms expansion to the HD Edition on Steam. For the most
part, they will cause the map to CRASH if you attempt to load a map that
contains them in any version of the game that does not have the required
expansions.

-   This list is complete as of Patch 4.8

-   See [*section 5.3.1.*](#S53) for a download link where you can check
    if there is a more up-to-date version available.

**2.4.1 New Terrains**

Terrains 42-50 are exclusive to African Kingdoms. (41 is present in the
base-game but is too buggy to be useful).

  --------------------- ------- -------------------------------------------------------------------------
  **Predefined Name**   **N**   **Comments**
  DLC\_ROCK             40      Grey rock (king of the hill; also in the base-game but looks like ROAD)
  DLC\_SAVANNAH         41      Savannah
  DLC\_DIRT4            42      A blend between DIRT and grass
  DLC\_DRYROAD          43      Road, Desert
  DLC\_MOORLAND         44      Muddy grass
  DLC\_CRACKED          45      Cracked desert (causes buildings on it to take 25% more damage)
  DLC\_QUICKSAND        46      Quicksand (has the same building restrictions as ICE)
  DLC\_BLACK            47      Pure black (no buildings)
  DLC\_DRAGONFOREST     48      Dragon Tree Forest (dense forest; placed on DIRT)
  DLC\_BAOBAFOREST      49      Baobab Forest (200 wood per tree; sparse forest; placed on savannah)
  DLC\_ACACIAFOREST     50      Acacia Forest (sparse forest; placed on dirt 4)
  --------------------- ------- -------------------------------------------------------------------------

African Kingdoms also adds a bunch of so-called "moddable terrains"
which look exactly like the existing terrains, but could be used if you
wanted to modify terrains and make a map using those modded terrains.
For example, you could make a terrain mod that turns a moddable water
into the appearance of lava and then make an RMS that specifically uses
this terrain. The upside is that someone with this terrain mod wouldn’t
see lava in the place of water on any of the standard maps – it would
only happen on your map (or others that make use of this specific
moddable terrain).

**2.4.2** Animals from both Expansions

  ---------------- ------ -------------------------------------------------
  Dolphin          61     AoF; behaves like great fish
  DLC\_BEAR        486    AoF; behaves like wolf
  DLC\_LLAMA       305    AoF; behaves like sheep
  DLC\_VULTURE     917    AoF; behaves like hawk, but larger and white
  DLC\_COW         705    AoF; behaves like sheep, but 150 food and 14 hp
  DLC\_ELEPHANT    936    AoF; behaves like boar, but 400 food
  DLC\_GOAT        1060   AK; behaves like sheep
  DLC\_ZEBRA       1019   AK; behaves like deer
  DLC\_OSTRICH     1026   AK; behaves like deer
  DLC\_STORK       1028   AK; behaves like hawk
  DLC\_CROCODILE   1031   AK; behaves like wolf
  DLC\_LION        1029   AK; behaves like wolf
  Falcon           1056   AK; behaves like hawk
  ---------------- ------ -------------------------------------------------

**2.4.3** Plants and Rocks from African Kingdoms

  --------------------- ------ ----------------------------------
  DLC\_ORANGEBUSH       1059   like forage bush
  DLC\_BAOBABTREE       1052   varies, 200 wood
  DLC\_DRAGONTREE       1051   varies, 100 wood
  DLC\_ACACIATREE       1063   varies, 100 wood
  DLC\_BOULDER\_A       1048   varies; small 1x1 rock formation
  DLC\_BOULDER\_B       1049   varies; tall 1x1 rock formation
  DLC\_BOULDER\_C       1050   3x3 rock formation
  DLC\_AFRICANBUSH      1053   various green bushes; 100 wood
  DLC\_AFRICANBUSH\_2   1054   various snowy bushes; 100 wood
  DLC\_SAVANNAHPATCH    1033   light brown grass
  DLC\_MOUNTAIN\_5      1041   like AoC mountains
  DLC\_MOUNTAIN\_6      1042   rocky
  DLC\_MOUNTAIN\_7      1043   rocky
  DLC\_MOUNTAIN\_8      1044   rocky
  DLC\_MOUNTAIN\_9      1045   snowy
  DLC\_MOUNTAIN\_10     1046   snowy
  DLC\_MOUNTAIN\_11     1047   snowy
  --------------------- ------ ----------------------------------

**2.4.4 Other eye-candy from African Kingdoms**

  --------------------- ------ -----------------
  DLC\_ANIMALSKELETON   1091    
  DLC\_STELAE\_A        1092   2x2 pillar
  DLC\_STELAE\_B        1093   1x1 pillar
  DLC\_STELAE\_C        1094   1x1 pillar
  DLC\_GALLOW           1095   tree with noose
  wooden rubble         1065   1x1
  --------------------- ------ -----------------

**2.4.5** Buildings from African Kingdoms

  -------------------- ------ ----------------------------------
  DLC\_FEITORIA        1021   generates resources
  DLC\_FENCE           1062   like walls, but only 1 HP
  DLC\_STORAGE         1081   2x2 structure
  DLC\_AFRICANHUT\_A   1082   5 housing space
  DLC\_AFRICANHUT\_B   1083   5 housing space
  DLC\_AFRICANHUT\_C   1084   5 housing space
  DLC\_AFRICANHUT\_D   1085   5 housing space
  DLC\_AFRICANHUT\_E   1086   5 housing space
  DLC\_AFRICANHUT\_F   1087   5 housing space
  DLC\_AFRICANHUT\_G   1088   5 housing space
  DLC\_GRANARY         1089   1x1 structure
  DLC\_BARRICADE       1090   a pile of rubbish; 1000 HP
  Palace               1096   wonder from random civilization
  Tent                 1097   5 housing space
  Tent                 1098   6 housing space
  Tent                 1099   7 housing space
  Tent                 1100   8 housing space
  Tent                 1101   9 housing space
  Sea Fortification    1102   Tower; cannot be placed on water
  -------------------- ------ ----------------------------------

2.4.6 Projectiles from African Kingdoms

  ---------------------- ------ ------------------------
  throwing knife         1056   spins and makes sounds
  heavy bolt             1057   stationary and silent
  heavy bolt (flaming)   1058   stationary and silent
  bolt                   1111   stationary and silent
  bolt (flaming)         1112   stationary and silent
  bolt                   1113   stationary and silent
  bolt (flaming)         1114   stationary and silent
  ---------------------- ------ ------------------------

**2.4.7** Units from African Kingdoms 2.4.8 Dead Units from African
Kingdoms

  ------------------------------- ------ -- -------------------------- ------
  DLC\_ORGANGUN                   1001      Dead Organ Gun             1002
  DLC\_ELITEORGANGUN              1003      Dead Organ Gun             1005
  DLC\_CARAVEL                    1004      Dead Camel Archer          1008
  DLC\_ELITECARAVEL               1006      Dead Genitour              1011
  DLC\_CAMELARCHER                1007      Dead Gbeto                 1014
  DLC\_ELITECAMELARCHER           1009      Dead Shotel Warrior        1017
  DLC\_GENITOUR                   1010      Dead Zebra                 1020
  DLC\_ELITEGENITOUR              1012      Dead Priest                1024
  DLC\_GBETO                      1013      Dead Ostrich               1027
  DLC\_ELITEGBETO                 1015      Dead Lion                  1030
  DLC\_SHOTELWARRIOR              1016      Dead Crocodile             1032
  DLC\_ELITESHOTELWARRIOR         1018      Dead Goat                  1061
  Monkboat (converts units)       1022      Dead Siege Tower           1107
  DLC\_AOE1PRIEST                 1023      Dead Dagnajan              1108
  Genitour (placeholder, 60 HP)   1079      Dead Gidajan               1110
  Priest with relic               1025      Dead Eagle Warrior         1116
  DLC\_FIREGALLEY                 1103      Dead Elite Eagle Warrior   1117
  DLC\_DEMOLITIONRAFT             1104   
  DLC\_SIEGETOWER                 1105   
  ------------------------------- ------ -- -------------------------- ------

**2.4.9** Heroes from African Kingdoms

  ---------------------- ------ --------------------------
  DLC\_MUSA              1034   camel archer
  DLC\_SUNDJATA          1035   light cavalry
  DLC\_TARIQ             1036   genitour
  DLC\_RICHARDDECLARE    1037   light cavalry
  DLC\_TRISTAN           1038   magyar huszar
  DLC\_YODIT             1039   queen; no attack
  DLC\_HENRY2            1040   two-handed swordsman
  DLC\_YEKUNOAMLAK       1064   shotel warrior
  DLC\_WARRIORYODIT      1066   gbeto
  DLC\_ITZCOATL          1067   jaguar warrior
  DLC\_MUSTAFA           1068   janissary
  DLC\_PACAL2            1069   plumed archer
  DLC\_BABUR             1070   imperial camel
  DLC\_ABRAHAELEPHANT    1071   war elephant
  DLC\_GUGLIELMO         1072   genoese crossbowman
  DLC\_SU\_DINGFANG      1073   chu-ko-nu
  DLC\_PACHACUTI         1074   kamayuk
  DLC\_HUAYNA\_CAPAC     1075   slinger
  DLC\_MIKLOSTOLDI       1076   magyar huszar
  DLC\_LITTLEJOHN        1077   spearman
  DLC\_ZAWISZATHEBLACK   1078   hussar
  DLC\_SUMANGURU         1080   cataphract
  DLC\_DAGNAJAN          1106   elephant archer
  Gidajan                1109   carries sword and shield
  ---------------------- ------ --------------------------

**2.5.1** Buildings from the Forgotten

  ------------------------- ---------
  Fortress                  33
  Fortified Palisade Wall   119
  Fire Tower                190
  Aqueduct                  231
  Amphitheatre              251
  Coliseum                  263
  Indestructible Outpost    308
  City Wall                 370
  Temple of Heaven          637
  Palisade Gate             789-804
  Quimter Cathedral         872
  Arch of Constantine       899
  ------------------------- ---------

**2.5.2** Eye-candy from the Forgotten

  ----------------- --------- ---------------------------------------------------------
  Rubble 2x2        191        
  Rubble 2x2        192       temporary
  Grass Patch       301       tall grass
  Bush              302       2 variations; from JUNGLE terrain
  Seagulls          303       in a patch
  Bonfire           304       can be placed as a player object to offer line of sight
  Black Tile        306       1x1 square of pure black
  Loot              472       pile of golden treasure
  Burned Building   635       varies
  Burned Building   758       varies
  Rock (Stone)      839       turns into stone when attacked by villagers
  Rock (Gold)       841       turns into gold when attacked by villagers
  Wild Camel        884       no food; behaves like wild horse
  Waterfall         896       3 rotations
  Rain              900       1x1 patch
  Flag F            901       with golden emblem
  Smoke             902       from blacksmith
  Boardwalk         904-909   narrow wooden bridge
  Impaled Corpse    910       varies; can be player object
  Boardwalk         911-913   narrow wooden bridge
  Quarry            914       pile of mined rocks
  Lumber            915       pile of logs
  Goods             916       fruit market stall
  Rock 2            918       varies; brown rocks
  Barrels           933       varies
  Flame 1           939       small
  Flame 2           940       small
  Flame 3           941       large
  Flame 4           942       large
  ----------------- --------- ---------------------------------------------------------

**2.5.3** Units from the Forgotten

  --------------------------- ----- -------------------------------------
  Legionary                   1      
  Royal Janissary             52     
  Spy                         138   high attack, looks like man-at-arms
  Condottiero                 184    
  Slinger                     185    
  Flamethrower                188   Dragon in AoFE
  Imperial Camel              207    
  CARAVAN                     275   Centurion; NOT a caravan
  Nordic Swordsman            361    
  Penguin                     639   cheat unit; not so strong
  Heavy Eagle Warrior         753    
  Canoe                       778    
  Amazon Warrior              825    
  Donkey                      846   no food
  Amazon Archer               850    
  Genoese Crossbowman         866    
  Elite Genoese Crossbowman   868    
  Magyar Huszar               869    
  Elite Magyar Huszar         871    
  Elephant Archer             873    
  Elite Elephant Archer       875    
  Boyar                       876    
  Elite Boyar                 878    
  Kamayuk                     879    
  Elite Kamayuk               881    
  Condottiero                 882    
  Siege Tower                 885    
  Tarkan                      886    
  Elite Tarkan                887    
  Incan Llama + Eagle Scout   888   invisible in scenario editor
  Incan Eagle Scout           889   invisible in scenario editor
  Incan Llama                 890   invisible in scenario editor
  Heavy Pikeman               892    
  Eastern Swordsman           894    
  Camel                       897   converting; behaves like horse
  Monk with Relic             922    
  Queen                       923   no attack; behaves like king
  Alfred the Alpaca           934   cheat unit; 120 attack
  Dragon Ship                 938    
  Relic Cart                  944    
  --------------------------- ----- -------------------------------------

**2.5.4** Heroes from the Forgotten

  ----------------------- ----- --------------------------
  Vlad Dracula            193   Boyar
  Quauhtemoc              307   Elite Eagle Warrior
  Francisco de Orellana   425   Elite Conquistador
  Gonzalo Pizarro         427   Elite Conquistador
  Frederick Barbarossa    429   Elite Teutonic Knight
  Prithviraj              437   Heavy Cavalry Archer
  Francesco Sforza        439   Samurai
  Sanyogita               925   Queen
  Prithvi                 926   Crossbowman
  Chand Bhai              927   Monk with unique graphic
  Saladin                 929   Elite Mameluke
  Khosrau                 930   Elite Elephant Archer
  Jarl                    931   Elite Tarkan
  Savaran                 932   Elite Cataphract
  Osman                   943   Heavy Cavalry Archer
  ----------------------- ----- --------------------------

**2.5.5** Dead Units from the Forgotten

  -------------------------- ----- -- ------------------------ -----
  Dead Legionary             2        Dead Boyar               877
  Dead Slinger               186      Dead Kamayuk             880
  Dead Flamethrower          189      Dead Condottiero         883
  Dead Centurion             277      Dead Siege Tower         891
  Dead Imperial Camel        300      Dead Heavy Pikeman       893
  Dead Nordic Swordsman      362      Dead Eastern Swordsman   895
  Dead Monk (?)              412      Dead Camel               898
  Dead Bear                  489      Dead Amazon Warrior      919
  Dead Penguin               641      Dead Amazon Archer       920
  Dead Llama                 780      Dead Imam                921
  Dead Cow                   843      Dead Queen               924
  Dead Donkey                848      Dead Chand Bhai          928
  Dead Genoese Crossbowman   867      Dead Alfred the Alpaca   935
  Dead Magyar Huszar         870      Dead Elephant            937
  Dead Elephant Archer       874      Dead Shaw                945
  -------------------------- ----- -- ------------------------ -----

[]{#S3 .anchor}**3. TESTING**

You'll have to do lots of tries before your RMS works fine... Sadly, the
"Generate Map" button in the Scenario Editor doesn't work for custom
maps, so you have to set up test games in "All Visible" mode to see your
map.

Note that if you click "Restart Game", the random seed won't be changed,
that is: it will generate exactly the same map! If you minimize the game
(alt + tab), modify the RMS, then click Restart Game, only the things
you modified will actually change. If you want to see a completely
different output of your RMS, you need to click "End Game" and then set
up a new game again (yeah, very boring...).

**Update:**

The UP and HD both give you the capability of generating custom RMS in
the Scenario Editor, using the "Generate Map" button! So there is no
need to start a new game for each test anymore. You can also select a
specific seed if you want to test with the same seed. The only reason to
test an actual game is if you need to see what team lands look like,
because the scenario editor treats all players as being on separate
teams.

**Warning:**

Occasionally things will generate slightly differently in the Scenario
Editor than they will in-game. For example: *resource\_delta* doesn’t
work, player objects on water behave differently and a few AoF units are
invisible. Most importantly, every player is always on their own team
for the purposes of map generation in the Scenario Editor. Thus you need
to test team lands and team connections in-game instead of in the
Scenario Editor.

**3.1. Editing *gamedata\_x1.drs* (unnecessary since the release of the
UP or HD Edition)**

This allows custom RMS to be generated with the "Generate Map" button in
the Scenario Editor!

However, it's a tricky method and normally I don't recommend it to RMS
designers.

*gamedata\_x1.drs* is a file in "Data" subdirectory of the game; it
contains the RMS code of standard maps (Arabia, Baltic, etc.). If you
open this file with any text editor, you can modify or replace any
standard map with your code.

Choose e.g. Arabia, replace it, then restart the game: now when you
generate an Arabia map (in a game or in the scenario editor), actually
your RMS will be generated.

RMSs in *gamedata\_x1.drs* can have a line that looks like:
*\#include\_drs land\_resources.inc 54102*

It creates standard resources, so remove it if you coded your resources.
Don't touch other lines you don't know!

-   I think this method is most useful to Scenario designers (but I'm
    not a Scenario designer :P )

-   It can easily crash the game, so ALWAYS make a backup copy of the
    original *gamedata\_x1.drs*!

-   You CAN'T play on multiplayer with modified maps

-   It allows to play custom maps even if you don't have The Conquerors
    expansion! Of course without expansion stuff such as snow... You
    have to edit *gamedata.drs* the same way

-   A program called **Setup Map** (see [*section 5.3.*](#S53)) can
    automatically edit and swap *gamedata\_x1.drs* files for you

-   It’s useful to know that you can find a copy of the standard maps
    simply by opening *gamedata\_x1.drs* with a text editor!

[]{#S4 .anchor}**4. EXAMPLE SCRIPT**

This is a short, commented example of a working RMS. The map is very
simple, just an example, not worth playing. I’ve rearranged it to
reflect the order in which the map components are actually generated.

/\* \*\*\*\*\* Example RMS: Relic isle \*\*\*\*\* \*/

start\_random

percent\_chance 50

\#define SUMMER /\* 50% chance of being a "summer" map \*/

percent\_chance 50

\#define WINTER /\* 50% chance of being a "winter" map \*/

end\_random

if SUMMER /\* define different items for every season \*/

\#const GROUND 0 /\* grass \*/

\#const WOODS 10 /\* oak forest \*/

\#const TREE 349 /\* oak \*/

else

> \#const GROUND 32 /\* snow \*/
>
> \#const WOODS 21 /\* snowy forest \*/
>
> \#const TREE 413 /\* snowy pine \*/

endif /\* this is more practical than doubling and if-ing every create
command! \*/

&lt;PLAYER\_SETUP&gt;

random\_placement /\* you have to type this... don't ask me why \*/
/\*Actually, you don’t have to type this because random\_placement
happens by default \*/

&lt;LAND\_GENERATION&gt;

base\_terrain WATER

create\_player\_lands

{

> terrain\_type GROUND /\* grass or snow, as defined above \*/
>
> land\_percent 60 /\* 60% is quite high, but will be divided among
> players \*/
>
> base\_size 10 /\* player lands are wide enough \*/
>
> zone 1 /\* all player lands are zone 1, they can touch each other \*/
>
> other\_zone\_avoidance\_distance 5 /\* but stay 5 tiles away from zone
> 2 \*/

}

create\_land /\* the "relic isle" :) \*/

{

> terrain\_type GROUND
>
> number\_of\_tiles 1000 /\* fixed size \*/
>
> left\_border 30 right\_border 30 /\* keep this isle near the center of
> the map \*/
>
> top\_border 30 bottom\_border 30
>
> clumping\_factor 15 /\* roundish \*/
>
> zone 2
>
> other\_zone\_avoidance\_distance 5
>
> land\_id 111

}

&lt;ELEVATION\_GENERATION&gt;

create\_elevation 5

{

> base\_terrain GROUND
>
> number\_of\_tiles 1000
>
> number\_of\_clumps 10 /\* about 100 tiles per hill \*/
>
> set\_scale\_by\_size /\* both total size and number of hills scale
> with map \*/
>
> set\_scale\_by\_groups /\* so bigger maps have more hills, of same
> size \*/

}

&lt;CLIFF\_GENERATION&gt;

min\_number\_of\_cliffs 5

max\_number\_of\_cliffs 20 /\* map can have 5 to 20 cliffs \*/

/\* other cliff statistics are left to default \*/

&lt;TERRAIN\_GENERATION&gt;

create\_terrain WOODS

{

> base\_terrain GROUND
>
> land\_percent 5
>
> number\_of\_clumps 10
>
> set\_scale\_by\_groups /\* number of clumps scales: bigger maps have
> more clumps, of same size \*/
>
> set\_avoid\_player\_start\_areas /\* we don't like forests around town
> centers... \*/
>
> clumping\_factor 1 /\* most irregular shapes \*/

}

create\_terrain MED\_WATER

{

> base\_terrain WATER
>
> land\_percent 10
>
> number\_of\_clumps 10 /\* number of clumps does not scale: bigger maps
> have bigger clumps \*/
>
> spacing\_to\_other\_terrain\_types 3 /\* keep away from shores \*/

}

&lt;CONNECTION\_GENERATION&gt;

create\_connect\_teams\_lands /\* connects allies with shallows \*/

{

> replace\_terrain WATER SHALLOW
>
> terrain\_cost WATER 7
>
> terrain\_size WATER 4 2 /\* each path on water is 2 to 6 tiles wide
> \*/
>
> replace\_terrain MED\_WATER SHALLOW
>
> terrain\_cost MED\_WATER 15 /\* medium water is preferably avoided \*/
>
> terrain\_size MED\_WATER 2 1

}

&lt;OBJECTS\_GENERATION&gt;

/\* players' personal objects (placed with
set\_place\_for\_every\_player) \*/

create\_object TOWN\_CENTER

{

> set\_place\_for\_every\_player
>
> max\_distance\_to\_players 0 /\* in the center of player lands (far
> from water) \*/

}

create\_object VILLAGER /\* automatically places 3, or 6 for Chinese,
etc. \*/

{

> set\_place\_for\_every\_player
>
> max\_distance\_to\_players 6 /\* near town center \*/

}

create\_object VILLAGER /\* this places 2 extra villagers, regardless of
race \*/

{

> number\_of\_objects 2
>
> set\_place\_for\_every\_player
>
> max\_distance\_to\_players 8

}

if REGICIDE /\* always place at least a king for regicide! \*/

create\_object KING

{

> set\_place\_for\_every\_player
>
> max\_distance\_to\_players 4

}

endif

create\_object GOLD /\* a group of 6 gold mines for everyone \*/

{

> set\_place\_for\_every\_player
>
> number\_of\_groups 1
>
> number\_of\_objects 6
>
> set\_gaia\_object\_only /\* NEEDED when you place non-player objects
> for players \*/
>
> min\_distance\_to\_players 10
>
> max\_distance\_to\_players 12 /\* 10 to 12 tiles away from respective
> player \*/
>
> set\_tight\_grouping /\* mine pieces are close to each other \*/

}

/\* general map objects, not linked to a specific player \*/

create\_object TREE

{

> number\_of\_objects 20
>
> set\_scaling\_to\_map\_size /\* a large map has 20 trees; other sizes
> scale \*/
>
> temp\_min\_distance\_group\_placement 10 /\* keeps trees 10 tiles way
> from the next tree \*/
>
> min\_distance\_group\_placement 2 /\* keeps all future objects 2 tiles
> away from these trees \*/

}

create\_object DEER

{

> number\_of\_groups 5
>
> number\_of\_objects 3
>
> group\_variance 1 /\* each group can have 2 to 4 deers \*/
>
> set\_scaling\_to\_map\_size /\* scales only number of groups \*/
>
> min\_distance\_to\_players 20 /\* at least 20 tiles from the center of
> every land \*/

}

create\_object RELIC

{

> number\_of\_objects 2
>
> set\_scaling\_to\_player\_number /\* total relics = 2 x player number
> \*/
>
> max\_distance\_to\_other\_zones 5 /\* keep away from shores \*/
>
> temp\_min\_distance\_group\_placement 5 /\* keep away from each other,
> \*/
>
> place\_on\_specific\_land\_id 111 /\* only on the "relic isle"! \*/

}

\#const Perch\[Fish\] 53 /\* there's no predefined name for perch fish
\*/ /\* actually, there is! It’s FISH \*/ /\* lol \*/

create\_object Perch\[Fish\]

{

> number\_of\_objects 20
>
> set\_scaling\_to\_map\_size
>
> terrain\_to\_place\_on MED\_WATER /\* only on medium water \*/

}

create\_object ARCHER

{

> start\_random
>
> percent\_chance 70 /\* 2 archers 70% of the times \*/
>
> number\_of\_objects 2
>
> percent\_chance 30 /\* one group of 5 archers 30% of the times \*/
>
> number\_of\_groups 1
>
> number\_of\_objects 5
>
> end\_random
>
> set\_gaia\_object\_only /\* rescuable units \*/
>
> min\_distance\_to\_players 20

}

if SUMMER

create\_object FLOWER\_BED /\* create 1 flower bush, only if it's summer
\*/

{ } /\* no attributes! but the brackets are needed anyway \*/

endif

[]{#S5 .anchor}**5. LINKS AND RESOURCES**

This section will only cover a few key sources and tools. For a more
complete overview please visit this forum post at the Age of Kings
Heaven:
[*http://aok.heavengames.com/cgi-bin/forums/display.cgi?action=ct&f=28,42485,,30*](http://aok.heavengames.com/cgi-bin/forums/display.cgi?action=ct&f=28,42485,,30)

Feel free to contact me if you know of any useful resources that I have
missed.

[]{#S51 .anchor}**5.1. Guides **

**Updated New Random Map Scripting Guide** by: Zetnus (this guide!)

Currently the most up-to-date guide. It might be worth checking the link
to see if I’ve published a newer version.
[*http://aok.heavengames.com/blacksmith/showfile.php?fileid=12178*](http://aok.heavengames.com/blacksmith/showfile.php?fileid=12178)

(outdated) **Random Map Scripting Guide (RMSG.doc)** by: Ensemble
Studios

Provided in the docs folder on your CD or in Age2HD\\Docs\\All if you
have the HD Edition on Steam. Has numerous errors, mistakes and
omissions; so don’t trust everything written there! Contains an
annotated version of the script for Coastal.
[*http://aok.heavengames.com/blacksmith/showfile.php?fileid=11773*](http://aok.heavengames.com/blacksmith/showfile.php?fileid=11773)

[]{#S52 .anchor}**5.2. Editors and Generators**

Yes, you can write your script in just about any text editor, but these
programs can make random map scripting much easier and faster. Some of
them let you auto-generate whole chunks of code, or whole map scripts.
Others provide features like syntax highlighting – which is very helpful
for finding typos.

**RMS Toolkit** by: chasqui

The most comprehensive editor currently available for random map
scripting. I strongly recommend using this if you are a somewhat
experienced scripter, or if you plan on spending any significant amount
of time working with rms files. It is a bit complicated to use at first,
but definitely worth learning. Comes with syntax highlighting and
various other useful features.
[*http://aok.heavengames.com/blacksmith/showfile.php?fileid=7921*](http://aok.heavengames.com/blacksmith/showfile.php?fileid=7921)

**RMS Creator** by: chasqui

Lets you auto-generate a script in Word, and offers quite a bit of scope
for customizing the auto-generation. Great for beginners or casual
scripters.
[*http://aok.heavengames.com/blacksmith/showfile.php?fileid=8023*](http://aok.heavengames.com/blacksmith/showfile.php?fileid=8023)

**RMS syntax support for Notepad++ (UDL)** by: Axa

An addon with syntax highlighting for free text editor Notepad++. Very
comprehensive.

[*http://steamcommunity.com/sharedfiles/filedetails/?id=439948511*](http://steamcommunity.com/sharedfiles/filedetails/?id=439948511)

**RMS Language For Notepad++** by: ephestion

Another addon with rms syntax highlighting for the free text editor
Notepad++. Not as advanced as the one above.

[*http://aok.heavengames.com/blacksmith/showfile.php?fileid=11633*](http://aok.heavengames.com/blacksmith/showfile.php?fileid=11633)

[]{#S53 .anchor}**5.3. Reference Lists and other Utilities**

**Setup Map** by: scripter64

This is a utility that lets you generate your script in the Scenario
Editor (by replacing one or two of the maps in the gamedata). If you are
using the HD Edition or the UP, you should NOT use this because both of
those already let you generate custom maps in the scenario editor. Also,
this will prevent you from playing multiplayer while it active.

[*http://aok.heavengames.com/blacksmith/showfile.php?fileid=10672*](http://aok.heavengames.com/blacksmith/showfile.php?fileid=10672)

**UserPatch Script Reference**
[*http://userpatch.aiscripters.net/reference.html*](http://userpatch.aiscripters.net/reference.html)

**AgeII HD Script Reference**
[*http://steamcommunity.com/app/221380/discussions/0/684839199943495537/*](http://steamcommunity.com/app/221380/discussions/0/684839199943495537/)

The official documentation of the new UP and HD scripting commands. The
HD one contains a few typos.

**5.3.1 RMS Constants**

The tables earlier in this guide include most of the useful constants.
However, if you want complete lists, those can be found here.

**Complete List** by: DiGiT (.csv)
[*http://aok.heavengames.com/blacksmith/showfile.php?fileid=5810*](http://aok.heavengames.com/blacksmith/showfile.php?fileid=5810)

Easily searchable, because it’s all in a single spreadsheet.

**Advanced List** by: OtmShankIiI (.htm)
[*http://aok.heavengames.com/blacksmith/showfile.php?fileid=8724*](http://aok.heavengames.com/blacksmith/showfile.php?fileid=8724)

Much better descriptions and slightly more up-to-date than the complete
list above. (This one is also "complete")

**AoF and AK Constants** by: Zetnus (.xls)
[*http://aok.heavengames.com/blacksmith/showfile.php?fileid=8724*](http://aok.heavengames.com/blacksmith/showfile.php?fileid=8724)

Only includes the constants from the expansions "The Forgotten" and
"African Kingdoms" on Steam.

**Terrain Names Spreadsheet** by: Zetnus (.xls)
[*http://aok.heavengames.com/blacksmith/showfile.php?fileid=12226*](http://aok.heavengames.com/blacksmith/showfile.php?fileid=12226)

All the terrain constants with descriptions of the terrains and their
functions.

**5.4. Online Tutorials **

**YouTube** **Tutorials** by: Mike Hasselbach (TheMadCADer)

Well-made videos that provide lots of useful information.

[*https://www.youtube.com/playlist?list=UU6\_krm5XWrLtuBzpiLffqew*](https://www.youtube.com/playlist?list=UU6_krm5XWrLtuBzpiLffqew)

**Checking Your Map** by: RF\_Gandalf

A guide to all the things you should check before publishing your map.

Full guide:
[*http://aok.heavengames.com/cgi-bin/forums/display.cgi?action=ct&f=4,35724,0,all*](http://aok.heavengames.com/cgi-bin/forums/display.cgi?action=ct&f=4,35724,0,all)

Concise checklist:
[*http://aok.heavengames.com/cgi-bin/forums/display.cgi?action=ct&f=4,35725,0,all*](http://aok.heavengames.com/cgi-bin/forums/display.cgi?action=ct&f=4,35725,0,all)

**Links to further online tutorials** about specific RMS topics can be
found in this post:

[*http://aok.heavengames.com/cgi-bin/forums/display.cgi?action=ct&f=28,42485,,30*](http://aok.heavengames.com/cgi-bin/forums/display.cgi?action=ct&f=28,42485,,30)

**5.5. Community sites**

I have focused on ones that could be specifically relevant for RM
scripting.

[*http://aok.heavengames.com/*](http://aok.heavengames.com/)

The "blacksmith" is one of the best repositories for Age of Empires II
content (including lots of random map scripts). Publish your maps here.
Check out the forums if you have any scripting-related questions that
need answering.

[*http://www.aoczone.net/*](http://www.aoczone.net/)

Home of the competitive international Age of Empires II community. If
you want to design a map for specifically for competitive gameplay, this
is might be a good site to look at.

[*http://www.hawkaoc.net/*](http://www.hawkaoc.net/)

Home of the Chinese Age of Empires II community. If you can read
Chinese, there are some good RMS-related resources available there.

[*http://steamcommunity.com/app/221380/*](http://steamcommunity.com/app/221380/)

Age II HD on Steam. If you want a large audience and immediate exposure,
then consider publishing your map in the Steam Workshop.
