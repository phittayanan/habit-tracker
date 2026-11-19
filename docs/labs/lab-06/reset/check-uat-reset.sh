#!/usr/bin/env bash
# Test of uat-reset.sql (Issue #104, ADR 0059, docs/labs/lab-06/uat-reset.md R-1 to R-5).
# It starts its own disposable PostgreSQL (TCP, 127.0.0.1, trust auth, throw-away data directory),
# applies the project's migrations, runs the project's seed with throw-away passwords, adds the
# data the UAT cases leave behind, and checks the reset against that data. It never reads or
# writes DATABASE_URL from the environment and never touches another database.
# Needs: PostgreSQL 16 tools (initdb, pg_ctl, psql), Node, and `npm ci` already run in server/.
# Run from anywhere:  bash docs/labs/lab-06/reset/check-uat-reset.sh
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../../../.." && pwd)"
SQL="$HERE/uat-reset.sql"
PORT="${CHECK_PORT:-55432}"

if ! command -v initdb >/dev/null 2>&1 && [ -x /opt/homebrew/opt/postgresql@16/bin/initdb ]; then
  PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
fi
for tool in initdb pg_ctl psql node; do
  command -v "$tool" >/dev/null 2>&1 || { echo "missing tool: $tool"; exit 2; }
done

checks=0; failed=0
expect() { # label, expected, actual
  checks=$((checks + 1))
  if [ "$2" = "$3" ]; then echo "PASS  $1"; else failed=$((failed + 1)); echo "FAIL  $1"; echo "      expected: $2"; echo "      actual:   $3"; fi
}

if [ ! -f "$SQL" ]; then
  checks=1; failed=1
  echo "FAIL  uat-reset.sql exists"; echo "      expected: $SQL"; echo "      actual:   missing"
  echo "$checks check(s), $failed failed"; exit 1
fi

WORK="$(mktemp -d)"
cleanup() { pg_ctl -D "$WORK/data" -m immediate stop >/dev/null 2>&1; rm -rf "$WORK"; }
trap cleanup EXIT

initdb -D "$WORK/data" -U check --auth=trust >/dev/null || exit 2
pg_ctl -D "$WORK/data" -o "-p $PORT -k $WORK -c listen_addresses=127.0.0.1" -l "$WORK/pg.log" -w start >/dev/null || { cat "$WORK/pg.log"; exit 2; }
export PGHOST=127.0.0.1 PGPORT="$PORT" PGUSER=check
createdb uatreset || exit 2
export PGDATABASE=uatreset
export DATABASE_URL="postgresql://check@127.0.0.1:$PORT/uatreset"
q() { psql -X -Atq -v ON_ERROR_STOP=1 "$@"; }

( cd "$ROOT/server" \
  && npx prisma migrate deploy >/dev/null \
  && SEED_MANAGER_PASSWORD=check-only-manager SEED_PARTICIPANT_PASSWORD=check-only-participant SEED_DEMO_DATA=true node prisma/seed.js >/dev/null ) \
  || { echo "could not prepare the disposable database"; exit 2; }

# What the UAT cases leave behind (UAT-01 to UAT-04), a session, and one template that must survive.
q <<'SQL'
INSERT INTO "Template" (name, unit, min_value, max_value, created_by)
  SELECT n, u, mn, mx, (SELECT id FROM "User" WHERE username = 'manager1')
  FROM (VALUES ('UAT-02 Squats','reps',10,50), ('UAT-04 Stretch','minutes',1,60), ('Keep Me','x',1,5)) AS v(n,u,mn,mx);
INSERT INTO "Goal" (participant_id, template_id, daily_target, start_date, end_date)
  SELECT (SELECT id FROM "User" WHERE username = v.u), (SELECT id FROM "Template" WHERE name = v.t), v.target, v.s::date, v.e::date
  FROM (VALUES
    ('participant1','Water',8,'2026-11-18','2026-12-17'),
    ('participant1','UAT-04 Stretch',10,'2026-11-14','2026-11-18'),
    ('participant1','Walking',5000,'2026-11-19','2026-11-19'),
    ('participant2','Walking',5000,'2026-11-19','2026-11-25'),
    ('participant2','UAT-02 Squats',50,'2026-11-19','2026-11-25')) AS v(u,t,target,s,e);
INSERT INTO "Entry" (goal_id, entry_date, value)
  SELECT g.id, d::date, 7 FROM "Goal" g, (VALUES ('2026-11-18'), ('2026-11-19')) AS x(d) WHERE x.d::date BETWEEN g.start_date AND g.end_date;
INSERT INTO "Session" (id, user_id, created_at, expires_at)
  SELECT 'check-session', id, now(), now() + interval '8 hours' FROM "User" WHERE username = 'participant1';
SQL

# A fingerprint of everything the reset must not change, and the counts it must change.
keep() { q -c "SELECT 'users ' || md5(string_agg(t::text, '|' ORDER BY id)) FROM \"User\" t
  UNION ALL SELECT 'sessions ' || md5(string_agg(t::text, '|' ORDER BY id)) FROM \"Session\" t
  UNION ALL SELECT 'templates ' || md5(string_agg(t::text, '|' ORDER BY id)) FROM \"Template\" t WHERE name NOT LIKE 'UAT-%'"; }
all() { q -c "SELECT 'goals ' || md5(coalesce(string_agg(t::text, '|' ORDER BY id), '')) FROM \"Goal\" t
  UNION ALL SELECT 'entries ' || md5(coalesce(string_agg(t::text, '|' ORDER BY id), '')) FROM \"Entry\" t
  UNION ALL SELECT 'templates ' || md5(string_agg(t::text, '|' ORDER BY id)) FROM \"Template\" t"; }
counts() { q -c "SELECT (SELECT count(*) FROM \"Goal\" g JOIN \"User\" u ON u.id = g.participant_id WHERE u.username IN ('participant1','participant2')) || ' goals, ' ||
  (SELECT count(*) FROM \"Entry\" e JOIN \"Goal\" g ON g.id = e.goal_id JOIN \"User\" u ON u.id = g.participant_id WHERE u.username IN ('participant1','participant2')) || ' entries, ' ||
  (SELECT count(*) FROM \"Template\" WHERE name LIKE 'UAT-%') || ' UAT templates'"; }
run_reset() { { cat "$SQL"; echo "$1"; } | psql -X -q -v ON_ERROR_STOP=1 -o /dev/null; }

expect "fixture: the cases leave 5 goals, 6 entries and 2 UAT templates" "5 goals, 6 entries, 2 UAT templates" "$(counts)"
KEEP0="$(keep)"; ALL0="$(all)"

# R-3: ROLLBACK changes nothing
run_reset "ROLLBACK;"; rc=$?
expect "R-3 the script runs to the end with ROLLBACK (exit 0)" "0" "$rc"
expect "R-3 after ROLLBACK every goal, entry and template is unchanged" "$ALL0" "$(all)"
expect "R-3 after ROLLBACK counts are unchanged" "5 goals, 6 entries, 2 UAT templates" "$(counts)"

# R-4: a UAT template that another account still uses stops the script and deletes nothing
q -c "INSERT INTO \"User\" (username, display_name, role, password_hash) VALUES ('other-participant','Other','PARTICIPANT','x');
      INSERT INTO \"Goal\" (participant_id, template_id, daily_target, start_date, end_date)
      SELECT (SELECT id FROM \"User\" WHERE username='other-participant'), id, 20, '2026-11-19', '2026-11-19' FROM \"Template\" WHERE name = 'UAT-04 Stretch'"
ALL1="$(all)"
run_reset "COMMIT;"; rc=$?
expect "R-4 the script fails (non-zero exit) when another account uses a UAT template" "yes" "$([ "$rc" -ne 0 ] && echo yes || echo no)"
expect "R-4 nothing was deleted after the failure" "$ALL1" "$(all)"
q -c "DELETE FROM \"Goal\" WHERE participant_id = (SELECT id FROM \"User\" WHERE username='other-participant'); DELETE FROM \"User\" WHERE username='other-participant'"
KEEP1="$(keep)"

# R-1, R-2: COMMIT deletes the UAT data and only that
run_reset "COMMIT;"; rc=$?
expect "R-1 the script runs to the end with COMMIT (exit 0)" "0" "$rc"
expect "R-1 the two participants have no goal and no entry, and no UAT template exists" "0 goals, 0 entries, 0 UAT templates" "$(counts)"
expect "R-2 users, sessions and non-UAT templates are unchanged" "$KEEP1" "$(keep)"
expect "R-2 the seeded templates and 'Keep Me' are still there" "Keep Me,Reading,Walking,Water" "$(q -c "SELECT string_agg(name, ',' ORDER BY name) FROM \"Template\"")"
expect "R-2 the three accounts and the session are still there" "3 users, 1 session" "$(q -c "SELECT (SELECT count(*) FROM \"User\") || ' users, ' || (SELECT count(*) FROM \"Session\") || ' session'")"

# R-5: a second run deletes nothing and gives no error
ALL2="$(all)"
run_reset "COMMIT;"; rc=$?
expect "R-5 a second run ends without an error" "0" "$rc"
expect "R-5 a second run changes nothing" "$ALL2" "$(all)"

echo "$checks check(s), $failed failed"
[ "$failed" -eq 0 ]
