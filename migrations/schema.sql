-- 在WAL模式下, better-sqlite3可充分发挥性能
PRAGMA journal_mode = WAL;

CREATE TABLE derived_image (
  uuid     TEXT         NOT NULL
, filename TEXT         NOT NULL
, mtime    INTEGER      NOT NULL
, format   VARCHAR(255) NOT NULL
, quality  INTEGER      NOT NULL
, width    INTEGER      NOT NULL
, height   INTEGER      NOT NULL
, PRIMARY KEY (uuid)
, UNIQUE (filename, mtime, format, quality, width, height)
, CHECK (format IN ('jpeg', 'webp'))
, CHECK (quality BETWEEN 1 AND 100)
, CHECK (width >= 1)
, CHECK (height >= 1)
);

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
