/* ******* LAND RESOURCES ************ */
/* 28 JUNE 99 */

/* PLAYER START OBJECTS */

create_object TOWN_CENTER
{
  set_place_for_every_player
  group_placement_radius     18
  min_distance_to_players    0
  max_distance_to_players    0
}

create_object VILLAGER
{
  set_place_for_every_player
  min_distance_to_players       6
  max_distance_to_players       6
 }

create_object SCOUT
{
  number_of_objects             1
  set_place_for_every_player
  min_distance_to_players       7
  max_distance_to_players       9
 }

create_object RELIC
{
   number_of_objects            5
   min_distance_to_players     25
   temp_min_distance_group_placement 20
}
 
/* SPECIAL STUFF FOR REGICIDE */
/* FORTRESS AND MIGRATION NEED TO BE UPDATED */

if REGICIDE
create_object VILLAGER
{
  number_of_objects             7
  set_place_for_every_player
  min_distance_to_players       6
  max_distance_to_players       6
}

create_object KING
{
  set_place_for_every_player
  min_distance_to_players       6
  max_distance_to_players       6
}

create_object CASTLE
{
  set_place_for_every_player
  min_distance_to_players    10
  max_distance_to_players    10
}

endif

/* NEAR FORAGE */

create_object FORAGE
{
  number_of_objects          6
  group_placement_radius     3
  set_tight_grouping
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players    10
  max_distance_to_players    12
  min_distance_group_placement  6
}

/* NEAR GOLD */

create_object GOLD
{
  number_of_objects          7
  group_placement_radius     3
  set_tight_grouping
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players    12
  max_distance_to_players    16
  min_distance_group_placement  7
  max_distance_to_other_zones  7
}

/* MEDIUM GOLD */

create_object GOLD
{
  number_of_objects          4
  group_placement_radius     3
  set_tight_grouping
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players    18
  max_distance_to_players    26
  min_distance_group_placement  7
  max_distance_to_other_zones  7
}

/* FAR GOLD */

create_object GOLD
{
  number_of_objects          4
  group_placement_radius     3
  set_tight_grouping
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players    25
  max_distance_to_players    35
  min_distance_group_placement  7
  max_distance_to_other_zones  7
}

/* NEAR STONE */

create_object STONE
{
  number_of_objects          5
  group_placement_radius     2  
  set_tight_grouping 
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players    14
  max_distance_to_players    18
  min_distance_group_placement  7
  max_distance_to_other_zones  7
}

/* FAR STONE */

create_object STONE
{
  number_of_objects          4
  group_placement_radius     2  
  set_tight_grouping 
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players    20
  max_distance_to_players    26
  min_distance_group_placement  7
  max_distance_to_other_zones  7
}

/* BAA BAA */

if TROPICAL_MAP
create_object TURKEY
{
   number_of_objects 4
   set_loose_grouping
   set_gaia_object_only
   set_place_for_every_player
   min_distance_to_players    10
   max_distance_to_players    12
}
create_object TURKEY
{
   number_of_objects 2
   number_of_groups  2
   set_loose_grouping
   set_gaia_object_only
   set_place_for_every_player
   min_distance_to_players    14
   max_distance_to_players    30
}
else
create_object SHEEP
{
   number_of_objects 4
   set_loose_grouping
   set_gaia_object_only
   set_place_for_every_player
   min_distance_to_players    10
   max_distance_to_players    12
}
create_object SHEEP
{
   number_of_objects 2
   number_of_groups  2
   set_loose_grouping
   set_gaia_object_only
   set_place_for_every_player
   min_distance_to_players    14
   max_distance_to_players    30
}
endif

create_object DEER
{
  number_of_objects          4
  group_variance             1
  group_placement_radius     3
  set_loose_grouping
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players    14
  max_distance_to_players    30
}

if TROPICAL_MAP
create_object JAVELINA
else
create_object BOAR
endif
{
  number_of_objects          1
  set_loose_grouping  
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players    16
  max_distance_to_players    22
}

if TROPICAL_MAP
create_object JAVELINA
else
create_object BOAR
endif
{
  number_of_objects          1
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players    16
  max_distance_to_players    22
}

if TROPICAL_MAP
create_object JAGUAR
{
  number_of_objects          2
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players    30
  max_distance_to_players    40
}
else
create_object WOLF
{
  number_of_objects          2
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players    30
  max_distance_to_players    40
}
endif

/* *****RESOURCES BY MAP***** */

if LARGE_MAP
create_object FORAGE
{
  number_of_groups           1    
  number_of_objects          5
  group_placement_radius     3
  set_tight_grouping
  set_gaia_object_only
  min_distance_to_players       40
  max_distance_to_players       120
  min_distance_group_placement  9
}
endif

if HUGE_MAP
create_object FORAGE
{
  number_of_groups           2    
  number_of_objects          5
  group_placement_radius     3
  set_tight_grouping
  set_gaia_object_only
  min_distance_to_players       40
  max_distance_to_players       120
  min_distance_group_placement  9
}
endif

if GIGANTIC_MAP
create_object FORAGE
{
  number_of_groups           3    
  number_of_objects          5
  group_placement_radius     3
  set_tight_grouping
  set_gaia_object_only
  min_distance_to_players       40
  max_distance_to_players       120
  min_distance_group_placement  9
}
endif

/* EXTRA GOLD */

if TINY_MAP
create_object GOLD
{
  number_of_groups           2    
  number_of_objects          3
  group_placement_radius     2
  set_tight_grouping
  set_gaia_object_only
  min_distance_to_players       40
  min_distance_group_placement  9
}
endif

if SMALL_MAP
create_object GOLD
{
  number_of_groups           2    
  number_of_objects          3
  group_placement_radius     2
  set_tight_grouping
  set_gaia_object_only
  min_distance_to_players       40
  min_distance_group_placement  9
}
endif

if MEDIUM_MAP
create_object GOLD
{
  number_of_groups           3    
  number_of_objects          3
  group_variance             1
  group_placement_radius     2
  set_tight_grouping
  set_gaia_object_only
  min_distance_to_players       40
  min_distance_group_placement  9
}
endif

if LARGE_MAP
create_object GOLD
{
  number_of_groups           3    
  number_of_objects          3
  group_variance             1
  group_placement_radius     2
  set_tight_grouping
  set_gaia_object_only
  min_distance_to_players       40
  min_distance_group_placement  9
}
endif

if HUGE_MAP
create_object GOLD
{
  number_of_groups           4    
  number_of_objects          4
  group_variance             1
  group_placement_radius     2
  set_tight_grouping
  set_gaia_object_only
  min_distance_to_players       40
  min_distance_group_placement  9
}
endif

if GIGANTIC_MAP
create_object GOLD
{
  number_of_groups           5    
  number_of_objects          4
  group_variance             1
  group_placement_radius     2
  set_tight_grouping
  set_gaia_object_only
  min_distance_to_players       40
  min_distance_group_placement  9
}
endif

/* EXTRA STONE */

if TINY_MAP
create_object STONE
{
  number_of_groups           1    
  number_of_objects          4
  group_variance             1
  group_placement_radius     2
  set_tight_grouping
  set_gaia_object_only
  min_distance_to_players       40
  min_distance_group_placement  9
}
endif

if SMALL_MAP
create_object STONE
{
  number_of_groups           1    
  number_of_objects          4
  group_variance             1
  group_placement_radius     2
  set_tight_grouping
  set_gaia_object_only
  min_distance_to_players       40
  min_distance_group_placement  9
}
endif

if MEDIUM_MAP
create_object STONE
{
  number_of_groups           2    
  number_of_objects          4
  group_variance             1
  group_placement_radius     2
  set_tight_grouping
  set_gaia_object_only
  min_distance_to_players       40
  min_distance_group_placement  9
}
endif

if LARGE_MAP
create_object STONE
{
  number_of_groups           3    
  number_of_objects          4
  group_variance             1
  group_placement_radius     2
  set_tight_grouping
  set_gaia_object_only
  min_distance_to_players       40
  min_distance_group_placement  9
}
endif

if HUGE_MAP
create_object STONE
{
  number_of_groups           4    
  number_of_objects          4
  group_variance             1
  group_placement_radius     2
  set_tight_grouping
  set_gaia_object_only
  min_distance_to_players       40
  min_distance_group_placement  9
}
endif

if GIGANTIC_MAP
create_object STONE
{
  number_of_groups           5    
  number_of_objects          4
  group_variance             1
  group_placement_radius     2
  set_tight_grouping
  set_gaia_object_only
  min_distance_to_players       40
  min_distance_group_placement  9
}
endif

if DESERT_MAP
create_object PALMTREE
{
  number_of_objects             2
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players       4
  max_distance_to_players       5
  min_distance_group_placement  2
}
create_object PALMTREE
{
  number_of_objects             3
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players       6
  max_distance_to_players       8
  min_distance_group_placement  2
}
elseif ALPINE_MAP
create_object PINETREE
{
  number_of_objects             2
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players       4
  max_distance_to_players       5
  min_distance_group_placement  2
}
create_object PINETREE
{
  number_of_objects             3
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players       6
  max_distance_to_players       8
  min_distance_group_placement  2
}
elseif ASIAN_MAP
create_object BAMBOO_TREE
{
  number_of_objects             2
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players       4
  max_distance_to_players       5
  min_distance_group_placement  2
}
create_object PINETREE
{
  number_of_objects             3
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players       6
  max_distance_to_players       8
  min_distance_group_placement  2
}
elseif TROPICAL_MAP
create_object PALMTREE
{
  number_of_objects             2
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players       4
  max_distance_to_players       5
  min_distance_group_placement  2
}
create_object OAKTREE
{
  number_of_objects             3
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players       6
  max_distance_to_players       8
  min_distance_group_placement  2
}
elseif FROZEN_MAP
create_object SNOWPINETREE
{
  number_of_objects             2
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players       4
  max_distance_to_players       5
  min_distance_group_placement  2
}
create_object SNOWPINETREE
{
  number_of_objects             3
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players       6
  max_distance_to_players       8
  min_distance_group_placement  2
}
else
create_object OAKTREE
{
  number_of_objects             2
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players       4
  max_distance_to_players       5
  min_distance_group_placement  2
}
create_object OAKTREE
{
  number_of_objects             3
  set_gaia_object_only
  set_place_for_every_player
  min_distance_to_players       6
  max_distance_to_players       8
  min_distance_group_placement  2
}
endif

if TROPICAL_MAP
create_object MACAW
{
   number_of_objects         6
   set_scaling_to_map_size
}
else
create_object HAWK
{
   number_of_objects         6
   set_scaling_to_map_size
}
endif

if TROPICAL_MAP
create_object JAGUAR
{
  number_of_groups          3
  set_loose_grouping
  start_random
  percent_chance 75
	number_of_objects 1
  percent_chance 25
	number_of_objects 2
  end_random
  set_scaling_to_map_size
  set_gaia_object_only
  min_distance_group_placement 12
  min_distance_to_players    40
  max_distance_to_players    120
} 
else
create_object WOLF
{
  number_of_groups          3
  set_loose_grouping
  start_random
  percent_chance 75
	number_of_objects 1
  percent_chance 25
	number_of_objects 2
  end_random
  set_scaling_to_map_size
  set_gaia_object_only
  min_distance_group_placement 12
  min_distance_to_players    40
  max_distance_to_players    120
} 
endif

/* Fish handled on individual maps */
