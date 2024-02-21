--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE derived_font (
  uuid     TEXT         NOT NULL
, filename TEXT         NOT NULL
, mtime    INTEGER      NOT NULL
, format   VARCHAR(255) NOT NULL
, subset   TEXT         NOT NULL
, PRIMARY KEY (uuid)
, UNIQUE (filename, mtime, format, subset)
, CHECK (format IN ('woff', 'woff2'))
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE derived_font;
