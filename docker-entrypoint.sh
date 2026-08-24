#!/bin/sh
set -e

# The media dir may be a bind mount owned by a host user. Make sure the app user
# can read AND write it (existing images show; new admin uploads persist), then
# drop privileges and run the server as the non-root "nextjs" user.
mkdir -p /app/media
chown -R nextjs:nodejs /app/media 2>/dev/null || true

exec gosu nextjs "$@"
