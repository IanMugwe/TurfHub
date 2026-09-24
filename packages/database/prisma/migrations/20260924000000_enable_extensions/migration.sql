-- PostGIS: venue locations and "near me" search (implementation plan §2.8)
CREATE EXTENSION IF NOT EXISTS postgis;

-- btree_gist: lets the bookings exclusion constraint combine turf_id (=)
-- with a time range (&&) to prevent double booking (implementation plan §2.2)
CREATE EXTENSION IF NOT EXISTS btree_gist;
