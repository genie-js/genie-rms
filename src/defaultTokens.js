// Format:
// [name, id, type, argTypes]
// argtype 0 = end of arg list
// argtype 1 = word
// argtype 2 = number
// argtype 3 = token (#const-d)
// argtype 4 = token (#define-d)
// argtype 5 = file

// Generated from the list of tokens in age2_x1.exe
exports.base = [
  ['#define', 0, 0, [1, 0, 0, 0]],
  ['#undefine', 1, 0, [1, 0, 0, 0]],
  ['#const', 2, 0, [1, 2, 0, 0]],
  ['if', 3, 0, [4, 0, 0, 0]],
  ['elseif', 4, 0, [4, 0, 0, 0]],
  ['else', 5, 0, [0, 0, 0, 0]],
  ['endif', 6, 0, [0, 0, 0, 0]],
  ['start_random', 7, 0, [0, 0, 0, 0]],
  ['percent_chance', 8, 0, [2, 0, 0, 0]],
  ['end_random', 9, 0, [0, 0, 0, 0]],
  ['#include', 10, 0, [5, 0, 0, 0]],
  ['<PLAYER_SETUP>', 11, 0, [0, 0, 0, 0]],
  ['random_placement', 12, 0, [0, 0, 0, 0]],
  ['grouped_by_team', 13, 0, [0, 0, 0, 0]],
  ['min_distance', 14, 0, [0, 0, 0, 0]],
  ['max_distance', 15, 0, [0, 0, 0, 0]],
  ['set_position', 16, 0, [0, 0, 0, 0]],
  ['<LAND_GENERATION>', 17, 0, [0, 0, 0, 0]],
  ['land_percent', 18, 0, [2, 0, 0, 0]],
  ['land_position', 71, 0, [2, 2, 0, 0]],
  ['land_id', 72, 0, [2, 0, 0, 0]],
  ['base_terrain', 19, 0, [3, 0, 0, 0]],
  ['create_player_lands', 20, 0, [0, 0, 0, 0]],
  ['terrain_type', 21, 0, [3, 0, 0, 0]],
  ['base_size', 22, 0, [2, 0, 0, 0]],
  ['left_border', 23, 0, [2, 0, 0, 0]],
  ['right_border', 24, 0, [2, 0, 0, 0]],
  ['top_border', 25, 0, [2, 0, 0, 0]],
  ['bottom_border', 26, 0, [2, 0, 0, 0]],
  ['border_fuzziness', 27, 0, [2, 0, 0, 0]],
  ['zone', 28, 0, [2, 0, 0, 0]],
  ['set_zone_by_team', 29, 0, [0, 0, 0, 0]],
  ['set_zone_randomly', 30, 0, [0, 0, 0, 0]],
  ['other_zone_avoidance_distance', 31, 0, [2, 0, 0, 0]],
  ['create_land', 32, 0, [0, 0, 0, 0]],
  ['assign_to_player', 33, 0, [2, 0, 0, 0]],
  ['<CLIFF_GENERATION>', 34, 0, [0, 0, 0, 0]],
  ['min_number_of_cliffs', 35, 0, [2, 0, 0, 0]],
  ['max_number_of_cliffs', 36, 0, [2, 0, 0, 0]],
  ['min_length_of_cliff', 37, 0, [2, 0, 0, 0]],
  ['max_length_of_cliff', 38, 0, [2, 0, 0, 0]],
  ['cliff_curliness', 39, 0, [2, 0, 0, 0]],
  ['min_distance_cliffs', 40, 0, [2, 0, 0, 0]],
  ['min_terrain_distance', 41, 0, [2, 0, 0, 0]],
  ['<TERRAIN_GENERATION>', 42, 0, [0, 0, 0, 0]],
  ['create_terrain', 43, 0, [3, 0, 0, 0]],
  ['percent_of_land', 44, 0, [2, 0, 0, 0]],
  ['number_of_clumps', 45, 0, [2, 0, 0, 0]],
  ['spacing_to_other_terrain_types', 46, 0, [2, 0, 0, 0]],
  ['<OBJECTS_GENERATION>', 47, 0, [0, 0, 0, 0]],
  ['create_object', 48, 0, [3, 0, 0, 0]],
  ['set_scaling_to_map_size', 49, 0, [0, 0, 0, 0]],
  ['number_of_groups', 50, 0, [2, 0, 0, 0]],
  ['number_of_objects', 51, 0, [2, 0, 0, 0]],
  ['group_variance', 52, 0, [2, 0, 0, 0]],
  ['group_placement_radius', 53, 0, [2, 0, 0, 0]],
  ['set_loose_grouping', 54, 0, [0, 0, 0, 0]],
  ['set_tight_grouping', 55, 0, [0, 0, 0, 0]],
  ['terrain_to_place_on', 56, 0, [3, 0, 0, 0]],
  ['set_gaia_object_only', 57, 0, [0, 0, 0, 0]],
  ['set_place_for_every_player', 58, 0, [0, 0, 0, 0]],
  ['place_on_specific_land_id', 59, 0, [2, 0, 0, 0]],
  ['min_distance_to_players', 60, 0, [2, 0, 0, 0]],
  ['max_distance_to_players', 61, 0, [2, 0, 0, 0]],
  ['<CONNECTION_GENERATION>', 62, 0, [0, 0, 0, 0]],
  ['create_connect_all_players_land', 63, 0, [0, 0, 0, 0]],
  ['create_connect_teams_land', 64, 0, [0, 0, 0, 0]],
  ['create_connect_same_land_zones', 65, 0, [0, 0, 0, 0]],
  ['create_connect_all_lands', 66, 0, [0, 0, 0, 0]],
  ['{', 67, 0, [0, 0, 0, 0]],
  ['}', 68, 0, [0, 0, 0, 0]],
  ['/*', 69, 0, [0, 0, 0, 0]],
  ['*/', 70, 0, [0, 0, 0, 0]],
  ['clumping_factor', 73, 0, [2, 0, 0, 0]],
  ['number_of_tiles', 74, 0, [2, 0, 0, 0]],
  ['set_scale_by_groups', 75, 0, [0, 0, 0, 0]],
  ['set_scale_by_size', 76, 0, [0, 0, 0, 0]],
  ['set_avoid_player_start_areas', 77, 0, [0, 0, 0, 0]],
  ['min_distance_group_placement', 78, 0, [2, 0, 0, 0]],
  ['<ELEVATION_GENERATION>', 79, 0, [0, 0, 0, 0]],
  ['create_elevation', 80, 0, [2, 0, 0, 0]],
  ['spacing', 81, 0, [2, 0, 0, 0]],
  ['default_terrain_placement', 82, 0, [3, 0, 0, 0]],
  ['replace_terrain', 83, 0, [3, 3, 0, 0]],
  ['terrain_cost', 84, 0, [3, 2, 0, 0]],
  ['terrain_size', 85, 0, [3, 2, 2, 0]],
  ['min_placement_distance', 86, 0, [2, 0, 0, 0]],
  ['set_scaling_to_player_number', 87, 0, [0, 0, 0, 0]],
  ['height_limits', 88, 0, [2, 2, 0, 0]],
  ['set_flat_terrain_only', 89, 0, [0, 0, 0, 0]],
  ['max_distance_to_other_zones', 91, 0, [2, 0, 0, 0]],
  ['#include_drs', 92, 0, [5, 2, 0, 0]],
  ['temp_min_distance_group_placement', 93, 0, [2, 0, 0, 0]]
]

// TODO check if these have IDs at all
// + check the argtypes
exports.userpatch14 = [
  ['grouped_by_team', 1001, 0, [0, 0, 0, 0]],
  ['nomad_resources', 1002, 0, [0, 0, 0, 0]],
  ['base_elevation', 1003, 0, [2, 0, 0, 0]],
  ['resource_delta', 1004, 0, [2, 0, 0, 0]]
]

// TODO check if these have IDs at all
// + check the argtypes
exports.userpatch15 = [
  ['weather_type', 2001, 0, [2, 2, 2, 2]],
  ['direct_placement', 2002, 0, [0, 0, 0, 0]],
  ['effect_amount', 2003, 0, [2, 0, 0, 0]],
  ['effect_percent', 2004, 0, [2, 0, 0, 0]],
  ['guard_state', 2005, 0, [2, 0, 0, 0]],
  ['terrain_state', 2005, 0, [2, 0, 0, 0]],
  ['assign_to', 2006, 0, [0, 0, 0, 0]]
]
