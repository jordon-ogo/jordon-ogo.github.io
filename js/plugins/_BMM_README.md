# Intro

Things are getting a little more complex here, so I wanted to put together a 
file to explain how to use features of the plugins I've worked on without 
having to dig around through the entire code base, since that's exactly what 
I'm trying to avoid by making these.  

This likely won't be comprehensive, but if you notice anything missing, or you 
add any new features with rules that should be documented, feel free to add 
them to this document!

(Also, the formatting here isn't entirely Markdown friendly, so read the raw file if there is any confusion)

# Notes

Every event that uses the sequence system must include a note, formatted as 
follows.  Note that the order of the entries isn't required, but will help 
maintain a consistent format. The quotations used ARE important, make sure
you are using the right ones!  I know this is very verbose, and that the note 
box in the editor is stupid small and cannot grow, however you can use the 
default values for some values by excluding them (ONLY if they have a specified
default value), and you can copy and paste events between maps.

## Enemies
* MELEE:    {"type":"enemy", "class":"melee", "basehp":<positive int, DEFAULT 1>, "attack":<positive int, DEFAULT 1>, "mod":<mods array, DEFAULT "[]">}

* RANGED:   {"type":"enemy", "class":"ranged", "basehp":<positive int, DEFAULT 1>, "u":<projectile up ID>, "d":<projectile down ID>, "l":<projectile left ID>, "r":<projectile right ID>, "mod":<mods array, DEFAULT "[]">}

* BOMB:     {"type":"enemy", "class":"bomb", "basehp":<positive int, DEFAULT 1>, "attack":<positive int, DEFAULT 1>, "mod":<mods array, DEFAULT "[]">}

* HITSCAN:  {"type":"enemy", "class":"hitscan", "basehp":<positive int, DEFAULT 1>, "attack":<positive int, DEFAULT 1>, "maxrange":<number of tiles, 0 = infinite range, DEFAULT 0>, "mod":<mods array, DEFAULT "[]">}

### *Projectile IDs*
For ranged enemies, the projectile (dir) ID refers to the ID of the
object on the SPAWN_SOURCE map that would be used for that direction.  The projectile 
will have it's own values set by it's own note tag and is treated as a seperate 
entity once spawned.

### *Mods Array*
Formatted as "['<mod 1>', '<mod 2>',...]".  This array is optional, and if 
included the contents must be some combination of the following:
* "passive": will not move or attack

* "stationary": will not move, but will still attack

* "flying": can pass over holes, ignores spike traps

### *Invulnerable*
Note that while this is on the design document as a modifier it is not 
listed above, as it is a special case that is only used for certain parts of a boss 
fight, and no standard enemies can gain invulnerable.  

## Projectiles
* ARROWS:   {"type":"projectile", "class":"arrow", "direction":<direction>, "speed":<positive int, DEFAULT 3>, "damage":<positive int, DEFAULT 1>, "neutral":<true OR false, DEFAULT false>}

* BOMBS:    {"type":"projectile", "class":"bomb", "fuse":<positive int, DEFAULT 1>, "radius":<positive int, DEFAULT 1>, "damage":<positive int, DEFAULT 1>, "neutral":<true OR false, DEFAULT false>}

### *Direction*
Can be "up", "down", "left", or "right"  

### *Speed*
Number of tiles travelled by the projectile each turn.  Can be set to zero for 
stationary objects (ie. bombs)

### *Radius* 
Number of tiles effected in a circle.  Radius 1 = 3x3 square.  Radius 2 = 5x5...

### *Fuse*
Number of turns after placing the bomb BEFORE it explodes.  Thus you place the bomb, 
then it waits n turns.  When n = 1 it warns it will explode in an area determined by 
the radius value, then the turn after it is destroyed and the cells around it are damaged.

### *Neutral*
If a projectile is neutral it will damage anything it hits, including the player, 
boss, enemies...  Projectiles spawned by traps and by the player are neutral.  
If an enemy or a boss spawns a projectile it is not neutral, and will only damage 
the player, but will despawn if it hits an enemy.  Note that the value here is NOT 
a string, it is a boolean, so it must be written all lower case with no quotations.

## Traps
IN PROGRESS
* Spike:    {"type":"trap", "class":"spike"}

* Arrow:    {"type":"trap", "class":"arrow", "direction":<direction, see above>, "projectile":<projectile ID>}

## Bosses
IN PROGRESS

* Boss 1: {"type":"boss", "class":"golem"}

* Boss 2: {"type":"boss", "class":"spectre"}

* Boss 3: {"type":"boss", "class":"radiant"}

* Boss 4: {"type":"boss", "class":"deceiver"}


# RegionIDs

Region ID 1 is used to mark walls or other impassable regions that cannot be
dashed / flown over.  This likely cannot change in runtime, so if we need to 
add more walls they will have to be represented as an immobile event.