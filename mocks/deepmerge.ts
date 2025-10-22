export type DeepPartial<T> = T extends Function
  ? T
  : T extends readonly (infer U)[]
    ? ReadonlyArray<DeepPartial<U>>
    : T extends (infer U)[]
      ? DeepPartial<U>[]
      : T extends object
        ? { [K in keyof T]?: DeepPartial<T[K]> }
        : T;

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

export const asDeepPartial = <T>(v: DeepPartial<T>) => v;
