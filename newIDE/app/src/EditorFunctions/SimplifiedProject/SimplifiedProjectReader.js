// @flow
// Keep the semantics and marker strings in sync with the backend reader
// (update both in the same change).

/**
 * Truncate a value to a given depth. Objects beyond the depth are replaced
 * with `"{...}"` and arrays with `"[N items]"` summaries.
 */
export const truncateToDepth = (
  value: any,
  maxDepth: number,
  currentDepth: number = 0
): any => {
  if (value === null || value === undefined || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    if (currentDepth >= maxDepth) {
      return `[${value.length} items]`;
    }
    return value.map(item => truncateToDepth(item, maxDepth, currentDepth + 1));
  }

  if (currentDepth >= maxDepth) {
    return '{...}';
  }

  const result: { [string]: any } = {};
  for (const key of Object.keys(value)) {
    result[key] = truncateToDepth(value[key], maxDepth, currentDepth + 1);
  }
  return result;
};

/**
 * Estimate the number of tokens a JSON-serialised value will use.
 * Uses ~4 characters per token (conservative for structured data).
 */
export const estimateTokens = (value: any): number => {
  if (value === null || value === undefined) return 1;
  if (typeof value === 'string') return Math.ceil((value.length + 2) / 4);
  if (typeof value !== 'object') return Math.ceil(String(value).length / 4);
  try {
    return Math.ceil(JSON.stringify(value).length / 4);
  } catch (error) {
    return Infinity;
  }
};

/**
 * Cap every array in a value to at most `maxItems` entries, appending a
 * summary hint for omitted items.
 */
export const capArrays = (
  value: any,
  maxItems: number
): {| value: any, capped: number |} => {
  if (value === null || value === undefined || typeof value !== 'object') {
    return { value, capped: 0 };
  }

  let totalCapped = 0;

  if (Array.isArray(value)) {
    let items = value;
    if (items.length > maxItems) {
      totalCapped++;
      items = [
        ...items.slice(0, maxItems),
        `... and ${value.length -
          maxItems} more items (use filter or a more specific path to see them)`,
      ];
    }
    const mapped = items.map(item => {
      if (typeof item === 'string') return item;
      const sub = capArrays(item, maxItems);
      totalCapped += sub.capped;
      return sub.value;
    });
    return { value: mapped, capped: totalCapped };
  }

  const result: { [string]: any } = {};
  for (const key of Object.keys(value)) {
    const sub = capArrays(value[key], maxItems);
    totalCapped += sub.capped;
    result[key] = sub.value;
  }
  return { value: result, capped: totalCapped };
};

/**
 * Truncate all strings longer than `maxLength`, appending a hint.
 */
export const truncateStrings = (
  value: any,
  maxLength: number
): {| value: any, truncatedCount: number |} => {
  if (value === null || value === undefined)
    return { value, truncatedCount: 0 };

  if (typeof value === 'string') {
    if (value.length > maxLength) {
      return {
        value: `${value.slice(0, maxLength)}... [truncated — ${
          value.length
        } chars total]`,
        truncatedCount: 1,
      };
    }
    return { value, truncatedCount: 0 };
  }

  if (typeof value !== 'object') return { value, truncatedCount: 0 };

  let count = 0;
  if (Array.isArray(value)) {
    const mapped = value.map(item => {
      const sub = truncateStrings(item, maxLength);
      count += sub.truncatedCount;
      return sub.value;
    });
    return { value: mapped, truncatedCount: count };
  }

  const result: { [string]: any } = {};
  for (const key of Object.keys(value)) {
    const sub = truncateStrings(value[key], maxLength);
    count += sub.truncatedCount;
    result[key] = sub.value;
  }
  return { value: result, truncatedCount: count };
};

/**
 * Progressively truncate a result to fit within a token budget.
 * Strategy: 1) truncate long strings, 2) cap arrays (20→10→5→3),
 * 3) reduce depth.
 */
export const applyTokenBudget = ({
  result,
  maxTokens,
  maxDepth,
  maxStringLength,
}: {|
  result: any,
  maxTokens: number,
  maxDepth: number,
  maxStringLength: number,
|}): {| result: any, truncationWarning?: string |} => {
  const originalTokens = estimateTokens(result);

  // Always apply string truncation.
  const { value: stringTruncated, truncatedCount } = truncateStrings(
    result,
    maxStringLength
  );
  let current = stringTruncated;
  let currentTokens = estimateTokens(current);

  if (currentTokens <= maxTokens) {
    if (truncatedCount > 0) {
      return {
        result: current,
        truncationWarning: `${truncatedCount} string(s) were truncated to ${maxStringLength} chars. Specify a path and maxStringLength to read full values.`,
      };
    }
    return { result };
  }

  // Phase 2: cap arrays progressively.
  const arrayLimits = [20, 10, 5, 3];
  let arraysCapped = 0;
  for (const limit of arrayLimits) {
    const { value: capped, capped: capCount } = capArrays(current, limit);
    current = capped;
    arraysCapped += capCount;
    currentTokens = estimateTokens(current);
    if (currentTokens <= maxTokens) break;
  }

  // Phase 3: reduce depth.
  let depthReduced = false;
  let effectiveDepth = maxDepth;
  while (currentTokens > maxTokens && effectiveDepth > 0) {
    effectiveDepth--;
    depthReduced = true;
    current = truncateToDepth(current, effectiveDepth);
    currentTokens = estimateTokens(current);
  }

  // Build warning.
  const parts = [];
  if (truncatedCount > 0) {
    parts.push(
      `${truncatedCount} string(s) truncated to ${maxStringLength} chars`
    );
  }
  if (arraysCapped > 0) {
    parts.push(`${arraysCapped} array(s) capped`);
  }
  if (depthReduced) {
    parts.push(`depth reduced from ${maxDepth} to ${effectiveDepth}`);
  }
  parts.push(
    'Use a more specific path, filter, or lower maxDepth to get the data you need.'
  );

  return {
    result: current,
    truncationWarning: `Result was too large (~${originalTokens} tokens) and was automatically truncated. ${parts.join(
      '. '
    )}.`,
  };
};

/**
 * A filter over the items of an array: `property` names the item property to
 * compare (omitted when the items are plain values, like the names given by a
 * path ending in `[*].objectName`), and exactly one of `value` (strict
 * equality on the stringified value), `contains` or `startsWith` (both
 * case-insensitive on the stringified value) gives the comparison. When
 * several are given, the most specific wins (value, then startsWith, then
 * contains).
 */
export type ArrayItemsFilter = {
  property?: string,
  value?: string,
  contains?: string,
  startsWith?: string,
};

type FilterComparison = {|
  kind: 'value' | 'startsWith' | 'contains',
  text: string,
|};

/** The comparison a filter makes, or null when it has none. */
const getFilterComparison = (
  filter: ArrayItemsFilter
): FilterComparison | null => {
  if (filter.value !== undefined) {
    return { kind: 'value', text: String(filter.value) };
  }
  if (filter.startsWith !== undefined) {
    return {
      kind: 'startsWith',
      text: String(filter.startsWith).toLowerCase(),
    };
  }
  if (filter.contains !== undefined) {
    return { kind: 'contains', text: String(filter.contains).toLowerCase() };
  }
  return null;
};

const matchesFilterComparison = (
  value: any,
  comparison: FilterComparison
): boolean => {
  const text = String(value);
  if (comparison.kind === 'value') return text === comparison.text;
  if (comparison.kind === 'startsWith') {
    return text.toLowerCase().startsWith(comparison.text);
  }
  return text.toLowerCase().includes(comparison.text);
};

const hasFilterProperty = (filter: ArrayItemsFilter): boolean =>
  typeof filter.property === 'string' && filter.property !== '';

export const matchesFilter = (item: any, filter: ArrayItemsFilter): boolean => {
  const comparison = getFilterComparison(filter);
  if (!comparison) return false;
  if (!hasFilterProperty(filter)) {
    // No property: the items are plain values, compared themselves.
    return (
      item !== null &&
      item !== undefined &&
      typeof item !== 'object' &&
      matchesFilterComparison(item, comparison)
    );
  }
  if (!item || typeof item !== 'object') return false;
  return matchesFilterComparison(item[String(filter.property)], comparison);
};

/**
 * Keep the items of an array matching the filter. A filter that cannot be
 * applied is refused instead of being ignored: an unfiltered result taken for
 * a filtered one is acted upon (an agent asked for the objects "containing
 * zombie", got them all, and deleted them all).
 */
export const applyArrayItemsFilter = (
  items: Array<any>,
  filter: ArrayItemsFilter
):
  | {| success: true, result: Array<any> |}
  | {| success: false, message: string |} => {
  if (!getFilterComparison(filter)) {
    return {
      success: false,
      message:
        'The filter needs one of `value`, `contains` or `startsWith` to compare with. Nothing was returned.',
    };
  }
  if (!hasFilterProperty(filter)) {
    const objectItem = items.find(
      item => item && typeof item === 'object' && !Array.isArray(item)
    );
    if (objectItem) {
      return {
        success: false,
        message: `The filter needs \`property\` to say which property of the items to compare (the items have: ${Object.keys(
          objectItem
        ).join(', ') ||
          '(none)'}). Nothing was returned: without \`property\`, only arrays of plain values (like a path ending in \`[*].objectName\`) are filtered.`,
      };
    }
  }
  return {
    success: true,
    result: items.filter(item => matchesFilter(item, filter)),
  };
};

export type PathStep =
  | {| type: 'key', key: string |}
  | {| type: 'index', index: number |}
  | {| type: 'wildcard' |};

/**
 * Parse a path string into an array of steps.
 * Supports dot-separated keys, bracket indices (`[0]`, `[*]`), and
 * string literals for keys with special characters (`["my key"]`).
 * Backslash escapes inside string literals are honoured (`["a\"b"]`).
 */
export const parsePath = (path: string): Array<PathStep> => {
  const steps: Array<PathStep> = [];
  let i = 0;

  // `charAt` (and not `path[i]`) so Flow does not keep stale character
  // refinements across the `i++` mutations.
  while (i < path.length) {
    if (path.charAt(i) === '.') {
      i++;
    } else if (path.charAt(i) === '[') {
      i++; // skip [

      if (path.charAt(i) === '"') {
        // String literal: ["..."]
        i++; // skip opening "
        let key = '';
        while (i < path.length) {
          if (path.charAt(i) === '\\' && i + 1 < path.length) {
            i++; // skip backslash, take next char literally
            key += path.charAt(i);
            i++;
          } else if (path.charAt(i) === '"') {
            break;
          } else {
            key += path.charAt(i);
            i++;
          }
        }
        i++; // skip closing "
        i++; // skip ]
        steps.push({ type: 'key', key });
      } else if (path.charAt(i) === '*') {
        i++; // skip *
        i++; // skip ]
        steps.push({ type: 'wildcard' });
      } else {
        // Numeric index: [0], [12], etc.
        let numStr = '';
        while (i < path.length && path.charAt(i) !== ']') {
          numStr += path.charAt(i);
          i++;
        }
        i++; // skip ]
        steps.push({ type: 'index', index: parseInt(numStr, 10) });
      }
    } else {
      // Plain key — read until `.`, `[`, or end of string.
      let key = '';
      while (
        i < path.length &&
        path.charAt(i) !== '.' &&
        path.charAt(i) !== '['
      ) {
        key += path.charAt(i);
        i++;
      }
      if (key) {
        steps.push({ type: 'key', key });
      }
    }
  }

  return steps;
};

/**
 * The results of the remaining steps applied to the items of the last wildcard
 * of a path, filtered:
 * - the steps end on arrays (`scenes[*].objects`): each array is filtered;
 * - the filter names a `property`: the ITEMS are filtered before the steps
 *   project them (`objects[*].objectName` filtered on `objectName` gives the
 *   matching names);
 * - no `property`: the projected plain values are filtered
 *   (`objects[*].objectName` with `contains`).
 */
const filterWildcardResults = ({
  items,
  results,
  filter,
}: {|
  items: Array<any>,
  results: Array<any>,
  filter: ArrayItemsFilter,
|}):
  | {| success: true, result: Array<any> |}
  | {| success: false, message: string |} => {
  if (results.length > 0 && results.every(result => Array.isArray(result))) {
    const filteredResults = [];
    for (const result of results) {
      const filtered = applyArrayItemsFilter(result, filter);
      if (!filtered.success) return filtered;
      filteredResults.push(filtered.result);
    }
    return { success: true, result: filteredResults };
  }
  if (hasFilterProperty(filter)) {
    const filteredItems = applyArrayItemsFilter(items, filter);
    if (!filteredItems.success) return filteredItems;
    const keptItems = new Set(filteredItems.result);
    return {
      success: true,
      result: results.filter((result, index) => keptItems.has(items[index])),
    };
  }
  return applyArrayItemsFilter(results, filter);
};

/**
 * Walk a value along pre-parsed path steps, applying an optional array
 * filter and depth-truncation on the result.
 */
const walkSteps = ({
  current,
  steps,
  startIndex,
  filter,
  maxDepth,
}: {|
  current: any,
  steps: Array<PathStep>,
  startIndex: number,
  filter?: ?ArrayItemsFilter,
  maxDepth: number,
|}):
  | {| success: true, result: any |}
  | {| success: false, message: string |} => {
  let value: any = current;

  for (let i = startIndex; i < steps.length; i++) {
    if (value === null || value === undefined) {
      return {
        success: false,
        message: `Cannot navigate further — value is ${String(value)}.`,
      };
    }

    const step = steps[i];

    if (step.type === 'key') {
      if (typeof value !== 'object' || Array.isArray(value)) {
        return {
          success: false,
          message: `Cannot access property "${
            step.key
          }" on a non-object value.`,
        };
      }
      // $FlowFixMe[method-unbinding] - deliberate `.call` on a foreign object.
      if (!Object.prototype.hasOwnProperty.call(value, step.key)) {
        const availableKeys = Object.keys(value);
        return {
          success: false,
          message: `Key "${step.key}" not found. Available keys: ${
            availableKeys.length ? availableKeys.join(', ') : '(none)'
          }.`,
        };
      }
      value = value[step.key];
    } else if (step.type === 'index') {
      if (!Array.isArray(value)) {
        return {
          success: false,
          message: `Expected an array for index access [${
            step.index
          }] but got ${typeof value}.`,
        };
      }
      if (step.index < 0 || step.index >= value.length) {
        return {
          success: false,
          message: `Index ${step.index} is out of bounds (array has ${
            value.length
          } items).`,
        };
      }
      value = value[step.index];
    } else {
      // Wildcard [*]
      if (!Array.isArray(value)) {
        return {
          success: false,
          message: `Expected an array for wildcard [*] access but got ${typeof value}.`,
        };
      }

      if (i + 1 < steps.length) {
        // Apply remaining steps to each item. The filter applies to the last
        // array of the path: a later wildcard, else what the remaining steps
        // end on (see `filterWildcardResults`).
        const hasLaterWildcard = steps
          .slice(i + 1)
          .some(laterStep => laterStep.type === 'wildcard');
        const results = [];
        for (const item of value) {
          const sub = walkSteps({
            current: item,
            steps,
            startIndex: i + 1,
            filter: hasLaterWildcard ? filter : null,
            maxDepth,
          });
          if (!sub.success) return sub;
          results.push(sub.result);
        }
        if (filter && !hasLaterWildcard) {
          return filterWildcardResults({ items: value, results, filter });
        }
        return { success: true, result: results };
      }

      // Terminal wildcard — apply filter if provided, then truncate.
      if (filter) {
        const filtered = applyArrayItemsFilter(value, filter);
        if (!filtered.success) return filtered;
        return {
          success: true,
          result: truncateToDepth(filtered.result, maxDepth),
        };
      }
      return { success: true, result: truncateToDepth(value, maxDepth) };
    }
  }

  // Apply filter to the final result if it's an array and filter is provided.
  if (Array.isArray(value) && filter) {
    const filtered = applyArrayItemsFilter(value, filter);
    if (!filtered.success) return filtered;
    value = filtered.result;
  }

  return { success: true, result: truncateToDepth(value, maxDepth) };
};

/**
 * Navigate a project JSON object using a path with dot access, bracket
 * indices (`[0]`, `[*]`), and string literals (`["key"]`) for keys with
 * special characters.  Supports optional filtering (equality, contains or
 * startsWith), pagination of array results (offset/limit), a count-only
 * mode, depth truncation, string length truncation, and a token budget.
 */
export const navigateSimplifiedProjectJson = ({
  project,
  path,
  filter,
  offset = 0,
  limit,
  countOnly = false,
  maxDepth = 2,
  maxTokens = 4000,
  maxStringLength = 500,
}: {|
  project: { [string]: any },
  path: string,
  filter?: ?ArrayItemsFilter,
  offset?: number,
  limit?: number,
  countOnly?: boolean,
  maxDepth?: number,
  maxTokens?: number,
  maxStringLength?: number,
|}):
  | {| success: true, result: any, truncationWarning?: string |}
  | {| success: false, message: string |} => {
  const steps = parsePath(path);
  const navResult = walkSteps({
    current: project,
    steps,
    startIndex: 0,
    filter,
    // Counting must see real arrays, not `[N items]` summaries: keep one
    // level so the terminal array survives depth truncation.
    maxDepth: countOnly ? Math.max(maxDepth, 1) : maxDepth,
  });

  if (!navResult.success) return navResult;

  let navigated = navResult.result;

  if (countOnly) {
    if (!Array.isArray(navigated)) {
      return {
        success: false,
        message: `countOnly requires the path to resolve to an array, but got ${typeof navigated}.`,
      };
    }
    return { success: true, result: { count: navigated.length } };
  }

  // Paginate array results.
  if (Array.isArray(navigated) && (offset > 0 || limit !== undefined)) {
    const totalCount = navigated.length;
    if (offset >= totalCount && totalCount > 0) {
      return {
        success: true,
        result: [
          `(no items: offset ${offset} is beyond the end - the array has ${totalCount} items)`,
        ],
      };
    }
    const end = limit !== undefined ? offset + limit : totalCount;
    const page = navigated.slice(offset, end);
    const remaining = totalCount - Math.min(end, totalCount);
    if (remaining > 0) {
      page.push(
        `... and ${remaining} more items (continue with offset=${Math.min(
          end,
          totalCount
        )})`
      );
    }
    navigated = page;
  }

  const { result, truncationWarning } = applyTokenBudget({
    result: navigated,
    maxTokens,
    maxDepth,
    maxStringLength,
  });

  if (truncationWarning) {
    return { success: true, result, truncationWarning };
  }

  return { success: true, result };
};
