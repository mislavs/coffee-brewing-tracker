-- =============================================================================
-- Coffee Brewing Tracker - Delete ALL Data (PostgreSQL)
-- =============================================================================
-- Deletes every row from all tables in the correct order to respect
-- foreign key constraints (join tables first, then dependent entities,
-- then root entities).
--
-- WARNING: This is destructive and removes ALL data, not just seed data.
-- =============================================================================

BEGIN;

-- Join tables (no FK dependents, safe to clear first)
DELETE FROM "BrewLogAccessory";
DELETE FROM "AccessoryBrewer";
DELETE FROM "BeanFlavorNote";
DELETE FROM "BeanCountry";

-- Entities with FKs pointing to other entities
DELETE FROM "BrewLogEntries";
DELETE FROM "Recipes";
DELETE FROM "Beans";

-- Root / leaf entities
DELETE FROM "Accessories";
DELETE FROM "Grinders";
DELETE FROM "Brewers";
DELETE FROM "FlavorNotes";
DELETE FROM "Countries";
DELETE FROM "Roasters";

COMMIT;
