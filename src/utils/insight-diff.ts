import { InsightType } from "../type/InsightType";

type Difference<T> = {
  field: keyof T;
  oldValue: T[keyof T];
  newValue: T[keyof T];
};

type CompareOptions<T> = {
  ignoreFields?: (keyof T)[];
};

function isObject(value: unknown): value is Record<string, any> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}

function deepEqual(a: any, b: any): boolean {
  // Same reference or primitive equality
  if (a === b) return true;

  // Different types
  if (typeof a !== typeof b) return false;

  // Null checks
  if (a == null || b == null) return false;

  // Arrays
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return false;

    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {
        return false;
      }
    }

    return true;
  }

  // Objects
  if (isObject(a)) {
    if (!isObject(b)) return false;

    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) {
      return false;
    }

    for (const key of aKeys) {
      if (!deepEqual(a[key], b[key])) {
        return false;
      }
    }

    return true;
  }

  return false;
}

export function getChangedFields<T extends Record<string, any>>(
  oldObject: T,
  newObject: T,
  options?: CompareOptions<T>
): Difference<T>[] {
  const ignoreFields = new Set(
    options?.ignoreFields ?? []
  );

  const differences: Difference<T>[] = [];

  const keys = new Set<keyof T>([
    ...(Object.keys(oldObject) as (keyof T)[]),
    ...(Object.keys(newObject) as (keyof T)[]),
  ]);

  for (const key of keys) {
    // Ignore fields like updatedAt
    if (ignoreFields.has(key)) {
      continue;
    }

    const oldValue = oldObject[key];
    const newValue = newObject[key];

    if (!deepEqual(oldValue, newValue)) {
      differences.push({
        field: key,
        oldValue,
        newValue,
      });
    }
  }

  return differences;
}

type InsightFieldValue =
  | string
  | number
  | boolean
  | null
  | undefined;

type InsightDiff = {
  field: keyof InsightType;

  oldValue: any;
  newValue: any;
};

function normalizeFieldValue(
  value: any
): InsightFieldValue {
  if (
    value &&
    typeof value === 'object' &&
    'name' in value
  ) {
    return value.name;
  }

  return value;
}

export const getInsightDiff = (diff: InsightDiff[] = []) => {
  const fieldNames = diff.map(field => field.field);
  const newValue: Partial<
    Record<keyof InsightType, InsightFieldValue>
  > = {};

  const oldValue = diff.reduce<
    Partial<Record<keyof InsightType, InsightFieldValue>>
  >((acc, curr) => {
   acc[curr.field] = normalizeFieldValue(
    curr.oldValue
  );

  newValue[curr.field] = normalizeFieldValue(
    curr.newValue
  );

    return acc;
  }, {});

  return {
    fieldNames,
    oldValue,
    newValue,
  }
}