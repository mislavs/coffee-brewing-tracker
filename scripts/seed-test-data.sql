-- =============================================================================
-- Coffee Brewing Tracker - Test Data Seed Script (PostgreSQL)
-- =============================================================================
-- Idempotent: deletes previously seeded rows by known IDs, then re-inserts.
-- Safe to run repeatedly without affecting non-seed data.
--
-- Scenarios covered:
--   Roasters   : full details / partial / name-only / no beans (orphan)
--   Beans      : SingleOrigin & Blend × Filter, Espresso, Omni, Unknown
--                all optional fields / minimal / many-few-no flavor notes
--                multiple / single origin countries / never brewed
--   Brewers    : with & without accessories / with & without recipes
--   Accessories: multi-brewer / single-brewer / standalone (no brewer)
--   Grinders   : heavily used / lightly used / never used
--   Recipes    : with & without description
--   Brew Logs  : all fields / minimal / every rating (1-5) + null
--                with & without recipe / with & without accessories
--                dates spread over ~4 months for dashboard stats
-- =============================================================================

BEGIN;

-- ─── ID constants ───────────────────────────────────────────────────────────
-- Roasters
-- r1  Onyx Coffee Lab          (full details, 3 beans)
-- r2  April Coffee Roasters    (city only,    2 beans)
-- r3  Square Mile Coffee       (name only,    1 bean)
-- r4  Tim Wendelboe            (full details, 0 beans - orphan)

-- Countries
-- c1 Ethiopia  c2 Colombia  c3 Kenya  c4 Brazil  c5 Guatemala  c6 Indonesia

-- FlavorNotes
-- f01 Blueberry  f02 Chocolate  f03 Citrus      f04 Caramel  f05 Floral
-- f06 Honey      f07 Nutty      f08 Stone Fruit  f09 Tropical Fruit  f10 Wine

-- Beans
-- bn1 Geometry (Onyx, SO/Filter, full fields, 3 flavors, 5 brews)
-- bn2 Southern Weather (Onyx, Blend/Espresso, minimal, 3 flavors, 2 brews)
-- bn3 Githembe AA (April, SO/Filter, 1 flavor, 2 brews)
-- bn4 Red Brick (Square Mile, Blend/Omni, 4 flavors, 2 brews)
-- bn5 Tropical Weather (Onyx, SO/Espresso, 2 flavors, 1 brew)
-- bn6 El Vergel Lactic (April, SO/Unknown, 0 flavors, 0 brews)

-- Brewers
-- br1 Hario V60     (accessories, 2 recipes, 7 brews)
-- br2 AeroPress     (accessories, 1 recipe,  3 brews)
-- br3 Chemex        (no accessories, no recipes, 2 brews)
-- br4 Kalita Wave   (accessories, no recipes, 0 brews)

-- Accessories
-- a1 Gooseneck Kettle  (V60, AeroPress, Kalita)
-- a2 Paper Filter      (V60, Kalita)
-- a3 Metal Filter      (AeroPress only)
-- a4 Digital Scale     (V60, AeroPress, Chemex, Kalita)
-- a5 WDT Tool          (no brewer - standalone)

-- Grinders
-- g1 Comandante C40    (9 brews)
-- g2 Baratza Encore    (3 brews)
-- g3 1Zpresso JX-Pro   (0 brews)

-- Recipes
-- re1 James Hoffmann V60   (V60, with description)
-- re2 AeroPress Inverted   (AeroPress, with description)
-- re3 Quick V60            (V60, no description)

-- BrewLogEntries: bl01 .. bl12 (see inline comments)


-- ─── Cleanup seed data (reverse dependency order) ───────────────────────────

DELETE FROM "BrewLogAccessory" WHERE "BrewLogEntryId" IN (
  'c1000001-0000-0000-0000-000000000001','c1000001-0000-0000-0000-000000000002',
  'c1000001-0000-0000-0000-000000000003','c1000001-0000-0000-0000-000000000004',
  'c1000001-0000-0000-0000-000000000005','c1000001-0000-0000-0000-000000000006',
  'c1000001-0000-0000-0000-000000000007','c1000001-0000-0000-0000-000000000008',
  'c1000001-0000-0000-0000-000000000009','c1000001-0000-0000-0000-000000000010',
  'c1000001-0000-0000-0000-000000000011','c1000001-0000-0000-0000-000000000012'
);

DELETE FROM "BrewLogEntries" WHERE "Id" IN (
  'c1000001-0000-0000-0000-000000000001','c1000001-0000-0000-0000-000000000002',
  'c1000001-0000-0000-0000-000000000003','c1000001-0000-0000-0000-000000000004',
  'c1000001-0000-0000-0000-000000000005','c1000001-0000-0000-0000-000000000006',
  'c1000001-0000-0000-0000-000000000007','c1000001-0000-0000-0000-000000000008',
  'c1000001-0000-0000-0000-000000000009','c1000001-0000-0000-0000-000000000010',
  'c1000001-0000-0000-0000-000000000011','c1000001-0000-0000-0000-000000000012'
);

DELETE FROM "Recipes" WHERE "Id" IN (
  'b1000001-0000-0000-0000-000000000001',
  'b1000001-0000-0000-0000-000000000002',
  'b1000001-0000-0000-0000-000000000003'
);

DELETE FROM "AccessoryBrewer" WHERE "AccessoriesId" IN (
  'f0000001-0000-0000-0000-000000000001','f0000001-0000-0000-0000-000000000002',
  'f0000001-0000-0000-0000-000000000003','f0000001-0000-0000-0000-000000000004',
  'f0000001-0000-0000-0000-000000000005'
);

DELETE FROM "BeanFlavorNote" WHERE "BeanId" IN (
  'd0000001-0000-0000-0000-000000000001','d0000001-0000-0000-0000-000000000002',
  'd0000001-0000-0000-0000-000000000003','d0000001-0000-0000-0000-000000000004',
  'd0000001-0000-0000-0000-000000000005','d0000001-0000-0000-0000-000000000006'
);

DELETE FROM "BeanCountry" WHERE "BeanId" IN (
  'd0000001-0000-0000-0000-000000000001','d0000001-0000-0000-0000-000000000002',
  'd0000001-0000-0000-0000-000000000003','d0000001-0000-0000-0000-000000000004',
  'd0000001-0000-0000-0000-000000000005','d0000001-0000-0000-0000-000000000006'
);

DELETE FROM "Beans" WHERE "Id" IN (
  'd0000001-0000-0000-0000-000000000001','d0000001-0000-0000-0000-000000000002',
  'd0000001-0000-0000-0000-000000000003','d0000001-0000-0000-0000-000000000004',
  'd0000001-0000-0000-0000-000000000005','d0000001-0000-0000-0000-000000000006'
);

DELETE FROM "Accessories" WHERE "Id" IN (
  'f0000001-0000-0000-0000-000000000001','f0000001-0000-0000-0000-000000000002',
  'f0000001-0000-0000-0000-000000000003','f0000001-0000-0000-0000-000000000004',
  'f0000001-0000-0000-0000-000000000005'
);

DELETE FROM "Grinders" WHERE "Id" IN (
  'a1000001-0000-0000-0000-000000000001',
  'a1000001-0000-0000-0000-000000000002',
  'a1000001-0000-0000-0000-000000000003'
);

DELETE FROM "Brewers" WHERE "Id" IN (
  'e0000001-0000-0000-0000-000000000001','e0000001-0000-0000-0000-000000000002',
  'e0000001-0000-0000-0000-000000000003','e0000001-0000-0000-0000-000000000004'
);

DELETE FROM "FlavorNotes" WHERE "Id" IN (
  'c0000001-0000-0000-0000-000000000001','c0000001-0000-0000-0000-000000000002',
  'c0000001-0000-0000-0000-000000000003','c0000001-0000-0000-0000-000000000004',
  'c0000001-0000-0000-0000-000000000005','c0000001-0000-0000-0000-000000000006',
  'c0000001-0000-0000-0000-000000000007','c0000001-0000-0000-0000-000000000008',
  'c0000001-0000-0000-0000-000000000009','c0000001-0000-0000-0000-000000000010'
);

DELETE FROM "Countries" WHERE "Id" IN (
  'b0000001-0000-0000-0000-000000000001','b0000001-0000-0000-0000-000000000002',
  'b0000001-0000-0000-0000-000000000003','b0000001-0000-0000-0000-000000000004',
  'b0000001-0000-0000-0000-000000000005','b0000001-0000-0000-0000-000000000006'
);

DELETE FROM "Roasters" WHERE "Id" IN (
  'a0000001-0000-0000-0000-000000000001','a0000001-0000-0000-0000-000000000002',
  'a0000001-0000-0000-0000-000000000003','a0000001-0000-0000-0000-000000000004'
);


-- =============================================================================
-- INSERT: Roasters
-- =============================================================================

INSERT INTO "Roasters" ("Id", "Name", "City", "Country") VALUES
  -- Full details, multiple beans
  ('a0000001-0000-0000-0000-000000000001', 'Onyx Coffee Lab',         'Bentonville', 'United States'),
  -- Partial: city only, no country
  ('a0000001-0000-0000-0000-000000000002', 'April Coffee Roasters',   'Copenhagen',   NULL),
  -- Name only
  ('a0000001-0000-0000-0000-000000000003', 'Square Mile Coffee',       NULL,           NULL),
  -- Full details but no beans (orphan roaster)
  ('a0000001-0000-0000-0000-000000000004', 'Tim Wendelboe',           'Oslo',         'Norway');


-- =============================================================================
-- INSERT: Countries
-- =============================================================================

INSERT INTO "Countries" ("Id", "Name") VALUES
  ('b0000001-0000-0000-0000-000000000001', 'Ethiopia'),
  ('b0000001-0000-0000-0000-000000000002', 'Colombia'),
  ('b0000001-0000-0000-0000-000000000003', 'Kenya'),
  ('b0000001-0000-0000-0000-000000000004', 'Brazil'),
  ('b0000001-0000-0000-0000-000000000005', 'Guatemala'),
  ('b0000001-0000-0000-0000-000000000006', 'Indonesia');


-- =============================================================================
-- INSERT: FlavorNotes
-- =============================================================================

INSERT INTO "FlavorNotes" ("Id", "Name") VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Blueberry'),
  ('c0000001-0000-0000-0000-000000000002', 'Chocolate'),
  ('c0000001-0000-0000-0000-000000000003', 'Citrus'),
  ('c0000001-0000-0000-0000-000000000004', 'Caramel'),
  ('c0000001-0000-0000-0000-000000000005', 'Floral'),
  ('c0000001-0000-0000-0000-000000000006', 'Honey'),
  ('c0000001-0000-0000-0000-000000000007', 'Nutty'),
  ('c0000001-0000-0000-0000-000000000008', 'Stone Fruit'),
  ('c0000001-0000-0000-0000-000000000009', 'Tropical Fruit'),
  ('c0000001-0000-0000-0000-000000000010', 'Wine');


-- =============================================================================
-- INSERT: Beans
-- =============================================================================

INSERT INTO "Beans" ("Id", "Name", "RoasterId", "OriginType", "RoastProfile",
                     "Variety", "ProcessingMethod", "RoastDate", "Altitude",
                     "BagWeight", "Price")
VALUES
  -- bn1: SingleOrigin/Filter, ALL optional fields filled, 5 brew logs
  ('d0000001-0000-0000-0000-000000000001',
   'Geometry', 'a0000001-0000-0000-0000-000000000001',
   'SingleOrigin', 'Filter',
   'Heirloom', 'Washed', CURRENT_DATE - INTERVAL '9 days', 2000,
   300, 24.00),

  -- bn2: Blend/Espresso, minimal optional fields, 2 brew logs
  ('d0000001-0000-0000-0000-000000000002',
   'Southern Weather', 'a0000001-0000-0000-0000-000000000001',
   'Blend', 'Espresso',
   NULL, NULL, NULL, NULL,
   350, 22.00),

  -- bn3: SingleOrigin/Filter, most fields, single flavor note, 2 brew logs
  ('d0000001-0000-0000-0000-000000000003',
   'Githembe AA', 'a0000001-0000-0000-0000-000000000002',
   'SingleOrigin', 'Filter',
   'SL28 / SL34', 'Washed', CURRENT_DATE - INTERVAL '14 days', 1800,
   250, 19.50),

  -- bn4: Blend/Omni, 3 origin countries, 4 flavor notes, 2 brew logs
  ('d0000001-0000-0000-0000-000000000004',
   'Red Brick', 'a0000001-0000-0000-0000-000000000003',
   'Blend', 'Omni',
   NULL, NULL, NULL, NULL,
   350, 14.00),

  -- bn5: SingleOrigin/Espresso, no price, 1 brew log
  ('d0000001-0000-0000-0000-000000000005',
   'Tropical Weather', 'a0000001-0000-0000-0000-000000000001',
   'SingleOrigin', 'Espresso',
   'Caturra', NULL, CURRENT_DATE - INTERVAL '35 days', NULL,
   300, NULL),

  -- bn6: SingleOrigin/Unknown, no flavor notes, NEVER BREWED
  ('d0000001-0000-0000-0000-000000000006',
   'El Vergel Lactic', 'a0000001-0000-0000-0000-000000000002',
   'SingleOrigin', 'Unknown',
   NULL, 'Lactic', NULL, 1600,
   200, 28.00);


-- =============================================================================
-- INSERT: BeanCountry (origin countries)
-- =============================================================================

INSERT INTO "BeanCountry" ("BeanId", "OriginCountriesId") VALUES
  -- bn1 Geometry: Ethiopia (single origin)
  ('d0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001'),
  -- bn2 Southern Weather: Brazil + Colombia (blend)
  ('d0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000004'),
  ('d0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000002'),
  -- bn3 Githembe: Kenya (single origin)
  ('d0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000003'),
  -- bn4 Red Brick: Brazil + Guatemala + Colombia (blend, 3 countries)
  ('d0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000004'),
  ('d0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000005'),
  ('d0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000002'),
  -- bn5 Tropical Weather: Colombia (single origin)
  ('d0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000002'),
  -- bn6 El Vergel: Colombia (single origin)
  ('d0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000002');


-- =============================================================================
-- INSERT: BeanFlavorNote
-- =============================================================================

INSERT INTO "BeanFlavorNote" ("BeanId", "FlavorNotesId") VALUES
  -- bn1 Geometry: Blueberry, Floral, Citrus (3 notes)
  ('d0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001'),
  ('d0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000005'),
  ('d0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000003'),
  -- bn2 Southern Weather: Chocolate, Caramel, Nutty (3 notes)
  ('d0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000002'),
  ('d0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000004'),
  ('d0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000007'),
  -- bn3 Githembe: Citrus only (1 note)
  ('d0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000003'),
  -- bn4 Red Brick: Chocolate, Nutty, Stone Fruit, Caramel (4 notes)
  ('d0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000002'),
  ('d0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000007'),
  ('d0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000008'),
  ('d0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000004'),
  -- bn5 Tropical Weather: Tropical Fruit, Honey (2 notes)
  ('d0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000009'),
  ('d0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000006');
  -- bn6 El Vergel: NO flavor notes


-- =============================================================================
-- INSERT: Brewers
-- =============================================================================

INSERT INTO "Brewers" ("Id", "Name") VALUES
  ('e0000001-0000-0000-0000-000000000001', 'Hario V60'),
  ('e0000001-0000-0000-0000-000000000002', 'AeroPress'),
  ('e0000001-0000-0000-0000-000000000003', 'Chemex'),
  ('e0000001-0000-0000-0000-000000000004', 'Kalita Wave');


-- =============================================================================
-- INSERT: Accessories
-- =============================================================================

INSERT INTO "Accessories" ("Id", "Name") VALUES
  ('f0000001-0000-0000-0000-000000000001', 'Gooseneck Kettle'),
  ('f0000001-0000-0000-0000-000000000002', 'Paper Filter'),
  ('f0000001-0000-0000-0000-000000000003', 'Metal Filter'),
  ('f0000001-0000-0000-0000-000000000004', 'Digital Scale'),
  ('f0000001-0000-0000-0000-000000000005', 'WDT Tool');


-- =============================================================================
-- INSERT: AccessoryBrewer (which accessories are compatible with which brewers)
-- =============================================================================

INSERT INTO "AccessoryBrewer" ("AccessoriesId", "CompatibleBrewersId") VALUES
  -- Gooseneck Kettle → V60, AeroPress, Kalita Wave
  ('f0000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000001'),
  ('f0000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000002'),
  ('f0000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000004'),
  -- Paper Filter → V60, Kalita Wave
  ('f0000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000001'),
  ('f0000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000004'),
  -- Metal Filter → AeroPress only
  ('f0000001-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000002'),
  -- Digital Scale → V60, AeroPress, Chemex, Kalita Wave
  ('f0000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000001'),
  ('f0000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000002'),
  ('f0000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000003'),
  ('f0000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000004');
  -- WDT Tool: NOT linked to any brewer (standalone accessory)


-- =============================================================================
-- INSERT: Grinders
-- =============================================================================

INSERT INTO "Grinders" ("Id", "Name") VALUES
  ('a1000001-0000-0000-0000-000000000001', 'Comandante C40'),
  ('a1000001-0000-0000-0000-000000000002', 'Baratza Encore'),
  ('a1000001-0000-0000-0000-000000000003', '1Zpresso JX-Pro');


-- =============================================================================
-- INSERT: Recipes
-- =============================================================================

INSERT INTO "Recipes" ("Id", "Name", "BrewerId", "Description") VALUES
  -- V60 recipe with description
  ('b1000001-0000-0000-0000-000000000001',
   'James Hoffmann V60',
   'e0000001-0000-0000-0000-000000000001',
   'The ultimate V60 technique. Bloom with 2x coffee weight for 45s, then single pour in concentric circles to target weight. Gentle swirl, let it draw down. Target 3:00-3:30 total.'),

  -- AeroPress recipe with description
  ('b1000001-0000-0000-0000-000000000002',
   'AeroPress Inverted',
   'e0000001-0000-0000-0000-000000000002',
   'Inverted method. Add coffee, pour water, stir 10 times, steep 2 minutes, flip and press gently for 30 seconds.'),

  -- V60 recipe WITHOUT description
  ('b1000001-0000-0000-0000-000000000003',
   'Quick V60',
   'e0000001-0000-0000-0000-000000000001',
   NULL);


-- =============================================================================
-- INSERT: BrewLogEntries
-- =============================================================================

INSERT INTO "BrewLogEntries"
  ("Id", "BeanId", "BrewerId", "GrinderId", "RecipeId",
   "Dose", "WaterAmount", "WaterTemperature", "GrindSize", "BrewTimeSeconds",
   "Rating", "Notes", "AdjustmentIdeas", "BrewedAt")
VALUES

  -- bl01: ALL FIELDS POPULATED, Rating 5, today, with recipe + accessories
  ('c1000001-0000-0000-0000-000000000001',
   'd0000001-0000-0000-0000-000000000001', -- Geometry
   'e0000001-0000-0000-0000-000000000001', -- V60
   'a1000001-0000-0000-0000-000000000001', -- Comandante
   'b1000001-0000-0000-0000-000000000001', -- Hoffmann recipe
   15.0, 250.0, 96.0, '24', 210,
   5, 'Perfect cup — sweet, juicy, and clean. Blueberry notes really shine.',
   NULL,
   NOW() - INTERVAL '2 hours'),

  -- bl02: MINIMAL FIELDS, no rating, no recipe, no accessories, yesterday
  ('c1000001-0000-0000-0000-000000000002',
   'd0000001-0000-0000-0000-000000000001', -- Geometry
   'e0000001-0000-0000-0000-000000000001', -- V60
   'a1000001-0000-0000-0000-000000000001', -- Comandante
   NULL,
   18.0, 300.0, NULL, NULL, NULL,
   NULL, NULL, NULL,
   NOW() - INTERVAL '1 day'),

  -- bl03: Blend bean, AeroPress, Baratza, with recipe, Rating 4, 3 days ago
  ('c1000001-0000-0000-0000-000000000003',
   'd0000001-0000-0000-0000-000000000002', -- Southern Weather
   'e0000001-0000-0000-0000-000000000002', -- AeroPress
   'a1000001-0000-0000-0000-000000000002', -- Baratza
   'b1000001-0000-0000-0000-000000000002', -- AeroPress recipe
   14.0, 200.0, 85.0, '15', 120,
   4, 'Rich and smooth, nice body. The chocolate notes come through well.',
   'Try finer grind next time',
   NOW() - INTERVAL '3 days'),

  -- bl04: V60 + Quick recipe (no desc), Rating 3 (Average), 1 week ago
  ('c1000001-0000-0000-0000-000000000004',
   'd0000001-0000-0000-0000-000000000003', -- Githembe AA
   'e0000001-0000-0000-0000-000000000001', -- V60
   'a1000001-0000-0000-0000-000000000001', -- Comandante
   'b1000001-0000-0000-0000-000000000003', -- Quick V60 recipe
   15.0, 250.0, 93.0, '26', 195,
   3, 'A bit sour, likely under-extracted.',
   'Grind finer or increase water temperature to 96°C',
   NOW() - INTERVAL '7 days'),

  -- bl05: Chemex, no recipe, no accessories, Rating 2 (Poor), 2 weeks ago
  ('c1000001-0000-0000-0000-000000000005',
   'd0000001-0000-0000-0000-000000000004', -- Red Brick
   'e0000001-0000-0000-0000-000000000003', -- Chemex
   'a1000001-0000-0000-0000-000000000001', -- Comandante
   NULL,
   30.0, 500.0, 94.0, '28', 300,
   2, 'Over-extracted and bitter. Chemex draws down too slowly at this grind.',
   'Go significantly coarser, try 32 clicks',
   NOW() - INTERVAL '14 days'),

  -- bl06: Same bean+recipe as bl01, different grinder, Rating 5, 3 weeks ago
  ('c1000001-0000-0000-0000-000000000006',
   'd0000001-0000-0000-0000-000000000001', -- Geometry
   'e0000001-0000-0000-0000-000000000001', -- V60
   'a1000001-0000-0000-0000-000000000002', -- Baratza
   'b1000001-0000-0000-0000-000000000001', -- Hoffmann recipe
   15.0, 250.0, 96.0, '12', 225,
   5, 'Consistently great with this recipe. Slightly less clarity than Comandante.',
   NULL,
   NOW() - INTERVAL '21 days'),

  -- bl07: Rating 1 (Terrible), AeroPress, no recipe, 1 month ago
  ('c1000001-0000-0000-0000-000000000007',
   'd0000001-0000-0000-0000-000000000005', -- Tropical Weather
   'e0000001-0000-0000-0000-000000000002', -- AeroPress
   'a1000001-0000-0000-0000-000000000001', -- Comandante
   NULL,
   11.0, 200.0, 80.0, '20', 90,
   1, 'Way too weak and watery. Temperature too low for this bean.',
   'Use 14g dose, 92°C water, steep 2+ minutes',
   NOW() - INTERVAL '30 days'),

  -- bl08: No recipe, no accessories, Rating 4, ~5 weeks ago
  ('c1000001-0000-0000-0000-000000000008',
   'd0000001-0000-0000-0000-000000000001', -- Geometry
   'e0000001-0000-0000-0000-000000000001', -- V60
   'a1000001-0000-0000-0000-000000000001', -- Comandante
   NULL,
   16.0, 260.0, 95.0, '25', 200,
   4, NULL, NULL,
   NOW() - INTERVAL '35 days'),

  -- bl09: No rating, no optional fields, Chemex, 2 months ago
  ('c1000001-0000-0000-0000-000000000009',
   'd0000001-0000-0000-0000-000000000002', -- Southern Weather
   'e0000001-0000-0000-0000-000000000003', -- Chemex
   'a1000001-0000-0000-0000-000000000002', -- Baratza
   NULL,
   32.0, 500.0, NULL, NULL, NULL,
   NULL, 'Casual morning brew, did not track details.', NULL,
   NOW() - INTERVAL '60 days'),

  -- bl10: Hoffmann recipe reuse, Rating 5, 2.5 months ago
  ('c1000001-0000-0000-0000-000000000010',
   'd0000001-0000-0000-0000-000000000003', -- Githembe AA
   'e0000001-0000-0000-0000-000000000001', -- V60
   'a1000001-0000-0000-0000-000000000001', -- Comandante
   'b1000001-0000-0000-0000-000000000001', -- Hoffmann recipe
   15.0, 250.0, 96.0, '24', 210,
   5, 'Bright and complex, excellent clarity. Citrus acidity is vibrant.',
   NULL,
   NOW() - INTERVAL '75 days'),

  -- bl11: AeroPress recipe reuse, Rating 3, 3 months ago
  ('c1000001-0000-0000-0000-000000000011',
   'd0000001-0000-0000-0000-000000000004', -- Red Brick
   'e0000001-0000-0000-0000-000000000002', -- AeroPress
   'a1000001-0000-0000-0000-000000000001', -- Comandante
   'b1000001-0000-0000-0000-000000000002', -- AeroPress recipe
   15.0, 220.0, 88.0, '18', 150,
   3, 'Decent but nothing special with this blend.',
   'Try with a lighter single-origin instead',
   NOW() - INTERVAL '90 days'),

  -- bl12: Oldest entry, Rating 4, different grinder for comparison, ~3.5 months ago
  ('c1000001-0000-0000-0000-000000000012',
   'd0000001-0000-0000-0000-000000000001', -- Geometry
   'e0000001-0000-0000-0000-000000000001', -- V60
   'a1000001-0000-0000-0000-000000000002', -- Baratza
   NULL,
   15.0, 250.0, 94.0, '13', 230,
   4, 'Good but slightly less clean than with Comandante grinder.',
   NULL,
   NOW() - INTERVAL '105 days');


-- =============================================================================
-- INSERT: BrewLogAccessory (accessories used per brew session)
-- =============================================================================

INSERT INTO "BrewLogAccessory" ("AccessoriesId", "BrewLogEntryId") VALUES
  -- bl01: Gooseneck Kettle, Paper Filter, Digital Scale (full setup)
  ('f0000001-0000-0000-0000-000000000001', 'c1000001-0000-0000-0000-000000000001'),
  ('f0000001-0000-0000-0000-000000000002', 'c1000001-0000-0000-0000-000000000001'),
  ('f0000001-0000-0000-0000-000000000004', 'c1000001-0000-0000-0000-000000000001'),
  -- bl02: no accessories
  -- bl03: Metal Filter
  ('f0000001-0000-0000-0000-000000000003', 'c1000001-0000-0000-0000-000000000003'),
  -- bl04: Gooseneck Kettle, Digital Scale
  ('f0000001-0000-0000-0000-000000000001', 'c1000001-0000-0000-0000-000000000004'),
  ('f0000001-0000-0000-0000-000000000004', 'c1000001-0000-0000-0000-000000000004'),
  -- bl05: no accessories
  -- bl06: Gooseneck Kettle, Paper Filter, Digital Scale (full V60 setup)
  ('f0000001-0000-0000-0000-000000000001', 'c1000001-0000-0000-0000-000000000006'),
  ('f0000001-0000-0000-0000-000000000002', 'c1000001-0000-0000-0000-000000000006'),
  ('f0000001-0000-0000-0000-000000000004', 'c1000001-0000-0000-0000-000000000006'),
  -- bl07: Metal Filter
  ('f0000001-0000-0000-0000-000000000003', 'c1000001-0000-0000-0000-000000000007'),
  -- bl08: no accessories
  -- bl09: no accessories
  -- bl10: Gooseneck Kettle, Paper Filter, Digital Scale
  ('f0000001-0000-0000-0000-000000000001', 'c1000001-0000-0000-0000-000000000010'),
  ('f0000001-0000-0000-0000-000000000002', 'c1000001-0000-0000-0000-000000000010'),
  ('f0000001-0000-0000-0000-000000000004', 'c1000001-0000-0000-0000-000000000010'),
  -- bl11: Metal Filter, Digital Scale
  ('f0000001-0000-0000-0000-000000000003', 'c1000001-0000-0000-0000-000000000011'),
  ('f0000001-0000-0000-0000-000000000004', 'c1000001-0000-0000-0000-000000000011'),
  -- bl12: Gooseneck Kettle only
  ('f0000001-0000-0000-0000-000000000001', 'c1000001-0000-0000-0000-000000000012');

COMMIT;
