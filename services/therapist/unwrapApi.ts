/** Backend wraps JSON as `{ success: true, data: T }`. Unwrap to `T` (same pattern as `services/auth`). */
export function unwrapTherapistApi<T>(response: { success?: boolean; data?: T } | T): T {
  if (
    response &&
    typeof response === 'object' &&
    'success' in response &&
    (response as { data?: T }).data !== undefined
  ) {
    return (response as { data: T }).data
  }
  return response as T
}
