export type DeepPartial<T> = T extends Function
  ? T
  : T extends readonly (infer U)[]
    ? ReadonlyArray<DeepPartial<U>>
    : T extends (infer U)[]
      ? DeepPartial<U>[]
      : T extends object
        ? { [K in keyof T]?: DeepPartial<T[K]> }
        : T;

/**
 * Recursively merges a patch object into a target object.
 *
 * Behavior:
 * - Primitive values, nulls, and functions from patch replace target values
 * - Arrays from patch replace target arrays entirely
 * - Plain objects are recursively merged
 * - Undefined values in patch are skipped (target values are preserved)
 *
 * @template T - The type of the target object
 * @param target - The base object to merge into
 * @param patch - The partial object with values to merge; undefined/null values are ignored
 * @returns A new merged object of type T
 *
 * @example
 * const base = {
 *   name: "John",
 *   tags: ["a", "b"],
 *   address: { city: "NYC", zip: "10001" }
 * };
 * const patch = {
 *   tags: ["x", "y", "z"],  // array replaced entirely
 *   address: { city: "LA" }, // merged (zip kept from base)
 *   email: "john@example.com" // new property added
 * };
 * const result = deepMerge(base, patch);
 * // Result: {
 * //   name: "John",
 * //   tags: ["x", "y", "z"],
 * //   address: { city: "LA", zip: "10001" },
 * //   email: "john@example.com"
 * // }
 */
export function deepMerge<T>(target: T, patch: DeepPartial<T>): T {
  if (patch === undefined || patch === null) return target;

  // primitives / functions / dates, etc. — replace
  const isObj = (v: unknown): v is Record<string, unknown> =>
    Object.prototype.toString.call(v) === '[object Object]';

  if (!isObj(target) || !isObj(patch)) {
    // If patch is array, replace. If object mismatch, return patch as T.
    return patch as unknown as T;
  }

  // both are plain objects: shallow copy then recurse per key
  const out: Record<string, unknown> = { ...(target as any) };

  for (const [k, v] of Object.entries(patch)) {
    const tk = (target as any)[k];

    if (Array.isArray(v)) {
      out[k] = v.slice(); // replace array
    } else if (isObj(v) && isObj(tk)) {
      out[k] = deepMerge(tk, v as any); // recurse objects
    } else if (v !== undefined) {
      out[k] = v; // set primitive / null / fn
    }
    // if v is undefined, skip (keep target value)
  }

  return out as T;
}
