// PROMISES INTERMEDIATE 19 - Practice Exercise
//

//import { resolve } from "core-js/fn/promise"

// =============================================================================
// TASK 1: tapAsync — run a side-effect function, pass original value through
// =============================================================================
//
// You are given:
//   - value: any value
//   - fn(value): an async function (returns a Promise)
//
// Call fn(value) and wait for it to complete, but return the ORIGINAL value,
// not fn's result. This is useful for side effects like logging, notifying,
// or triggering actions without changing the data flowing through a chain.
//
// If fn rejects, reject with that error.
//
// Example:
//   tapAsync(5, (n) => Promise.resolve(undefined)) => 5
//   tapAsync("hello", (s) => Promise.resolve(s.toUpperCase())) => "hello"
//   tapAsync(10, (n) => Promise.reject(new Error("oops")))
//     => rejects with Error("oops")
//
// HINT:
//   You need to call fn(value) and wait for it, but then return value — not
//   fn's result. Think about what you return inside a .then() callback. If
//   fn(value) resolves to something, but you return a DIFFERENT value from
//   the .then() callback, which one becomes the resolved value of the chain?

export function tapAsync(value, fn) {
  return fn(value).then(() => value)
}

// =============================================================================
// TASK 2: partitionAsync — split items into two groups based on async predicate
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - predicateFn(item): an async function returning true or false
//
// Run predicateFn on ALL items IN PARALLEL. Return an array with two elements:
//   [matches, nonMatches]
//   - matches: items where predicateFn resolved to true (in original order)
//   - nonMatches: items where predicateFn resolved to false (in original order)
//
// Example:
//   partitionAsync([1, 2, 3, 4, 5], n => Promise.resolve(n > 3))
//     => [[4, 5], [1, 2, 3]]
//
//   partitionAsync([], n => Promise.resolve(true)) => [[], []]
//
// HINT:
//   You need to know the boolean result for each item. You already know how
//   to run all predicates in parallel and get back an array of booleans.
//   Once you have both the original items and their boolean results, you
//   need to separate them into two arrays. Think about how reduce can build
//   two arrays at once, or how you could use filter with the boolean array
//   to pick items at matching positions.

export function partitionAsync(items, predicateFn) {
  return Promise.all(items.map(predicateFn)).then(value => {
    let trueValues = items.filter((_,i) => value[i])
    let falseValues = items.filter((_,i) => !value[i])
    return [trueValues,falseValues]
  })
}

// =============================================================================
// TASK 3: mapWithRetry — map sequentially, retrying failures per item
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - fn(item): an async function
//   - maxRetries: maximum retry attempts per item (after the first attempt)
//
// For each item, try fn(item). If it rejects, retry up to maxRetries more
// times. If it still fails after all retries, reject with that error.
// Process items SEQUENTIALLY. Collect all results into an array.
//
// This combines two patterns: sequential mapping and retry logic.
//
// Example:
//   let callCount = 0;
//   const flakyDouble = (n) => {
//     callCount++;
//     if (callCount % 2 === 1) return Promise.reject(new Error("flaky"));
//     return Promise.resolve(n * 2);
//   };
//   mapWithRetry([1, 2, 3], flakyDouble, 1)
//     // item 1: attempt 1 fails, attempt 2 succeeds => 2
//     // item 2: attempt 1 fails, attempt 2 succeeds => 4
//     // item 3: attempt 1 fails, attempt 2 succeeds => 6
//     => [2, 4, 6]
//
//   mapWithRetry([], fn, 3) => []
//
// HINT:
//   This combines two patterns you already know. First, write a helper that
//   retries a single item — it calls fn(item), and on rejection, calls itself
//   again with a lower retry count. Then, use the sequential reduce pattern
//   to process all items one at a time, calling that helper for each.

export function mapWithRetry(items, fn, maxRetries) {
  function retry(item, attempts){
    return fn(item).catch((error) => {
      if(attempts>=maxRetries)
        return Promise.reject(error)
      return retry(item,attempts+1)
    })
  }
  return items.reduce((promise,curr) => {
    return promise.then(value => {
      return retry(curr,0).then(r => [...value,r])
    })
  }, Promise.resolve([]))
}

// =============================================================================
// TASK 4: delayChain — run async functions sequentially with pauses between
// =============================================================================
//
// You are given:
//   - fns: an array of functions, each returns a Promise
//   - delayMs: milliseconds to wait BETWEEN function calls
//
// Run fns sequentially. Call the first function immediately. After it resolves,
// wait delayMs, then call the next function. After that resolves, wait delayMs,
// then call the next, and so on.
//
// Collect all results in an array. No delay before the first call.
// If any function rejects, stop and reject with that error.
//
// Example:
//   const fns = [
//     () => Promise.resolve("a"),
//     () => Promise.resolve("b"),
//     () => Promise.resolve("c"),
//   ];
//   delayChain(fns, 100) => ["a", "b", "c"]
//   // call fn[0] → get "a" → wait 100ms → call fn[1] → get "b" → wait 100ms → call fn[2]
//
//   delayChain([], 50) => []
//
// HINT:
//   You need a helper to create a delay: const wait = (ms) =>
//   new Promise(r => setTimeout(r, ms)). The reduce pattern collects results
//   sequentially. But where does the wait fit? After each function resolves
//   and you've collected its result, you need to pause before the next
//   iteration starts. Think about what you return from inside the .then()
//   — can you chain the wait AFTER collecting the result?

export function delayChain(fns, delayMs) {
  const delay = (ms) => new Promise(resolve => setTimeout(resolve,ms))
  if(fns.length === 0)
    return Promise.resolve([])
  return fns.slice(1).reduce((promise,curr) => {
    return promise.then(value => {
      return delay(delayMs).then(() => {
        return curr().then(r => [...value,r])
      })
    })
  }, fns[0]().then(r => [r]))
}

// =============================================================================
// TASK 5: findAsync — sequential async find, return the first matching item
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - predicateFn(item): an async function returning true or false
//
// Run predicateFn on items SEQUENTIALLY. Return the FIRST item where
// predicateFn resolves to true. If no item matches, return undefined.
// Stop checking as soon as you find a match (short-circuit).
//
// This is like someAsync from exercise 18, but instead of returning true/false,
// it returns the actual item that matched.
//
// Example:
//   findAsync([1, 2, 3, 4], n => Promise.resolve(n > 2)) => 3
//   findAsync([1, 2, 3], n => Promise.resolve(n > 10)) => undefined
//   findAsync([], n => Promise.resolve(true)) => undefined
//
// HINT:
//   Think about what each step in your promise chain should carry forward.
//   You could carry a "found" value — starting as undefined. At each step,
//   if you already found something, skip the check and pass it along. If not,
//   check the current item: if it passes, what do you carry forward? If it
//   fails, what stays as the carried value?

export function findAsync(items, predicateFn) {
  let promise = Promise.resolve(undefined)
  for(const item of items){
    promise = promise.then(result => {
     if(result !== undefined)
      return result
    return predicateFn(item).then(value => {
      if(value) return item
      return undefined
    })
    })
  }
  return promise
}

// =============================================================================
// TASK 6: safeMap — map in parallel, replace failures with a fallback value
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - fn(item): an async function
//   - fallback: a value to use when fn rejects for an item
//
// Run fn on ALL items IN PARALLEL. If fn resolves, use its result. If fn
// rejects for an item, use fallback instead. Return all results in the same
// order as items. This function ALWAYS resolves (never rejects).
//
// Example:
//   safeMap([1, 2, 3], n => Promise.resolve(n * 2), 0) => [2, 4, 6]
//
//   const failOnTwo = (n) => {
//     if (n === 2) return Promise.reject(new Error("fail"));
//     return Promise.resolve(n * 10);
//   };
//   safeMap([1, 2, 3], failOnTwo, -1) => [10, -1, 30]
//
//   safeMap([], fn, 0) => []
//
// HINT:
//   You need each item to always produce a result, even when fn fails.
//   Remember that .then() can take TWO arguments: .then(onSuccess, onError).
//   If both handlers return a value, the promise always resolves. How would
//   you map each item to a promise that resolves with either fn's result or
//   the fallback? Once every promise is guaranteed to resolve, what method
//   collects all results in order?

export function safeMap(items, fn, fallback) {
  return Promise.all(items.map(item => fn(item).catch(()=>fallback)))
}
