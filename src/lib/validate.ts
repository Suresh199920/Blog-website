const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * True when a value looks like a Postgres UUID.
 *
 * Dynamic `[id]` segments are not always ids — `/admin/videos/new`
 * matches `videos/[id]` with id="new". Without this guard the query
 * reaches Postgres and fails with
 * `invalid input syntax for type uuid: "new"`.
 */
export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}