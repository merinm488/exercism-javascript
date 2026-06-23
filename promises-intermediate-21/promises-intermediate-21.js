// PROMISES INTERMEDIATE 21 - Practice Exercise
//

// =============================================================================
// TASK 1: groupByAsync — group items into categories (parallel)
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - classifyFn(item): an async function returning a category string
//
// Run classifyFn on ALL items IN PARALLEL. Return an object where each
// category maps to an ARRAY of items in that category.
//
// This is like countByAsync from exercise 20, but instead of counting,
// you collect the actual items.
//
// Example:
//   groupByAsync([1, 2, 3, 4, 5, 6], n => Promise.resolve(n % 2 === 0 ? "even" : "odd"))
//     => { odd: [1, 3, 5], even: [2, 4, 6] }
//
//   groupByAsync(["apple", "apricot", "banana", "blueberry", "cherry"],
//     s => Promise.resolve(s[0]))
//     => { a: ["apple", "apricot"], b: ["banana", "blueberry"], c: ["cherry"] }
//
//   groupByAsync([], classifyFn) => {}
//
// HINT:
//   Two steps, just like countByAsync:
//   Step 1: Get all categories in parallel. What method runs async operations
//           on every item and collects results?
//   Step 2: Use reduce to build an object. But this time, each category maps to
//           an ARRAY, not a number. Think about what you did in countByAsync:
//             acc[category] = (acc[category] || ??) + newItem
//           What should ?? be instead of 0? And what should you do instead of + 1?

export function groupByAsync(items, classifyFn) {
  return Promise.all(items.map(item => classifyFn(item))).then(value => {
    return value.reduce((acc,curr,index) => {
      acc[curr] = acc[curr] || []
      acc[curr].push(items[index])
      return acc
    }, {})
  })
}

// =============================================================================
// TASK 2: compactAsync — map and remove null/undefined results (parallel)
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - fn(item): an async function that returns a value or null/undefined
//
// Run fn on ALL items IN PARALLEL. Collect only the non-null, non-undefined
// results into an array. Filter out the nulls and undefineds.
//
// This is useful when some items don't produce valid results. For example,
// looking up users by ID — some IDs might not exist, returning null.
//
// Example:
//   compactAsync([1, 2, 3, 4], n => Promise.resolve(n % 2 === 0 ? n * 10 : null))
//     => [20, 40]
//
//   compactAsync(["hello", "", "world", ""], s => Promise.resolve(s || null))
//     => ["hello", "world"]
//
//   compactAsync([], fn) => []
//
// HINT:
//   Two steps:
//   Step 1: Run the async function on every item in parallel. You know how.
//   Step 2: Filter out the null and undefined values. Which array method
//           keeps only elements that pass a test? Your test: is the value
//           not null AND not undefined?

export function compactAsync(items, fn) {
  return Promise.all(items.map(fn)).then(value => {
    return value.filter(r => r != null)
  })
}

// =============================================================================
// TASK 3: sortByAsync — sort items by async-computed keys (parallel)
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - keyFn(item): an async function returning a "sort key" for each item
//
// Run keyFn on ALL items IN PARALLEL to get sort keys. Then sort the items
// by their keys (ascending). Return the sorted items.
//
// Example:
//   sortByAsync(["banana", "apple", "cherry"], s => Promise.resolve(s.length))
//     => ["apple", "banana", "cherry"]
//     // lengths: 5, 6, 6 — "apple" is shortest so it comes first
//     // "banana" and "cherry" have the same length, stable sort keeps original order
//
//   sortByAsync([3, 1, 2], n => Promise.resolve(-n))
//     => [3, 2, 1]
//     // keys: -3, -1, -2 → sorted ascending: -3, -2, -1 → items: 3, 2, 1
//
//   sortByAsync([], keyFn) => []
//
// HINT:
//   You need to pair each item with its key, then sort.
//   Step 1: Get all keys in parallel. That gives you two arrays: the original
//           items and their keys (in the same order).
//   Step 2: How do you sort items based on keys? One approach:
//           - Create pairs: [{ item, key }, { item, key }, ...]
//           - Sort the pairs using .sort() — compare pair.key values
//           - Extract just the items from the sorted pairs
//   You could use items.map() to create pairs, .sort() to order them,
//   and another .map() to extract items.

export function sortByAsync(items, keyFn) {
  return Promise.all(items.map(keyFn)).then(value => {
    return items.map((item,i) => ({item, key : value[i]})).sort((a,b) => a.key-b.key).map(r => r.item)
  })
}

// =============================================================================
// TASK 4: scanAsync — like reduce, but returns ALL intermediate results
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - fn(acc, item): an async function that takes the accumulator and current item
//   - initialValue: the starting value for the accumulator
//
// Process items SEQUENTIALLY. After each step, record the accumulator value.
// Return an array of ALL intermediate accumulator values (including the start).
//
// This is like reduceAsync (exercise 18), but instead of returning only the
// final value, you return every value the accumulator took along the way.
//
// Example:
//   scanAsync([1, 2, 3], (acc, n) => Promise.resolve(acc + n), 0)
//     => [0, 1, 3, 6]
//     // Step 0: start at 0
//     // Step 1: 0 + 1 = 1
//     // Step 2: 1 + 2 = 3
//     // Step 3: 3 + 3 = 6
//
//   scanAsync(["a", "b", "c"], (acc, s) => Promise.resolve(acc + s), "")
//     => ["", "a", "ab", "abc"]
//
//   scanAsync([], fn, 42) => [42]
//     // No items, just the initial value
//
// HINT:
//   This uses the sequential reduce pattern. The key difference from reduceAsync:
//   instead of just passing the accumulator forward, you also RECORD it.
//
//   Think about what your accumulator should carry. It needs two things:
//     - The current accumulated value (like reduceAsync)
//     - The list of all values seen so far
//
//   Start with { current: initialValue, history: [initialValue] }.
//   At each step:
//     - Call fn(currentValue, item) to get the new value
//     - Add that new value to the history
//     - Return the updated object for the next step
//
//   At the end, return the history.

export function scanAsync(items, fn, initialValue) {
  return items.reduce((promise,curr) => {
    return promise.then(value => {
      return fn(value.at(-1),curr).then(r => [...value,r])
    })
  }, Promise.resolve([initialValue]))
}

// =============================================================================
// TASK 5: flatMapSequential — flatMap, but one item at a time
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - fn(item): an async function that returns an ARRAY
//
// Run fn on each item SEQUENTIALLY (one at a time). Each call returns an array.
// Flatten all results into a single array.
//
// This is the sequential version of flatMapAsync from exercise 20.
// Use this when order matters or when fn has side effects that must not overlap.
//
// Example:
//   flatMapSequential([1, 2, 3], n => Promise.resolve([n, n * 10]))
//     => [1, 10, 2, 20, 3, 30]
//
//   flatMapSequential([], fn) => []
//
// HINT:
//   You've done sequential reduce before. The accumulator is an array that
//   grows with each step. Each step calls fn(item) which returns an array.
//   How do you combine two arrays into one? (hint: spread or concat)
//
//   The pattern:
//   - Start with Promise.resolve([]) as the initial accumulator
//   - For each item, .then() on the previous promise:
//     - Call fn(item) to get an array
//     - Then combine the accumulator array with the new array
//   - Remember: fn(item) returns a promise, so you need to chain another
//     .then() to get its resolved value before combining

export function flatMapSequential(items, fn) {
  return items.reduce((promise,curr) => {
    return promise.then(value => {
      return fn(curr).then(r => [...value,...r])
    })
  }, Promise.resolve([]))
}

// =============================================================================
// TASK 6: uniqByAsync — remove duplicates based on an async key (parallel)
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - keyFn(item): an async function returning a key for each item
//
// Run keyFn on ALL items IN PARALLEL. Keep only the FIRST item with each
// unique key. Remove later duplicates.
//
// Example:
//   uniqByAsync([1, 2, 3, 2, 1, 4], n => Promise.resolve(n))
//     => [1, 2, 3, 4]
//     // keys: [1, 2, 3, 2, 1, 4] — duplicates at indices 3 and 4 removed
//
//   uniqByAsync(["Apple", "apricot", "Avocado", "banana"],
//     s => Promise.resolve(s[0].toLowerCase()))
//     => ["Apple", "apricot", "banana"]
//     // keys: ["a", "a", "a", "b"] — keep first "a" (Apple), skip rest, keep "b"
//
//   uniqByAsync([], keyFn) => []
//
// HINT:
//   Two steps:
//   Step 1: Get all keys in parallel (you know how by now).
//           You now have items and their keys at matching indices.
//   Step 2: Walk through the pairs and keep only the first item for each key.
//           You need to track which keys you've already seen. What data structure
//           is good for tracking seen values? (You learned about it for O(1) lookups.)
//
//           For each item:
//             - If its key has been seen before → skip it
//             - If its key is new → add to results, mark key as seen

export function uniqByAsync(items, keyFn) {
  return Promise.all(items.map(keyFn)).then(value => {
    let seen = new Set();
    let result = [];
    items.forEach((item,i) => {
      if(!seen.has(value[i]))
      {
        result.push(item)
        seen.add(value[i])
      }
    });
    return result
  })
}
