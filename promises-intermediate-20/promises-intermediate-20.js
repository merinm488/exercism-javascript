// PROMISES INTERMEDIATE 20 - Practice Exercise
//

//import { settings } from "cluster";

// =============================================================================
// TASK 1: debounceAsync — delay execution until calls stop coming
// =============================================================================
//
// You are given:
//   - fn(...args): a function that returns a Promise
//   - delayMs: milliseconds to wait after the LAST call before executing
//
// Return a NEW function. Every time it's called, reset a timer. Only after
// delayMs passes with NO new calls should fn actually execute with the LAST
// set of arguments. The returned function itself returns a Promise.
//
// This is the classic "debounce" pattern. It's used for search inputs — you
// don't want to call the API on every keystroke, only after the user stops
// typing for a moment.
//
// Example:
//   let callCount = 0;
//   const expensive = (val) => {
//     callCount++;
//     return Promise.resolve(val * 2);
//   };
//   const debounced = debounceAsync(expensive, 100);
//
//   debounced(1);  // timer starts
//   debounced(2);  // timer resets
//   debounced(3);  // timer resets
//   // ... after 100ms with no new calls, fn(3) executes
//   // callCount is 1, not 3
//
// HINT:
//   You need a closure that tracks a timer ID (like circuitBreaker tracked state).
//   1. let timer = null
//   2. Return a function(...args) that:
//      a. If timer is set, clear it: clearTimeout(timer)
//      b. Return a new Promise(resolve, reject) {
//           timer = setTimeout(() => {
//             fn(...args).then(resolve).catch(reject);
//           }, delayMs);
//         }
//   Each call cancels the previous timer and starts a new one.

export function debounceAsync(fn, delayMs) {
  let timer = null;
  return function(...args) {
    return new Promise((resolve,reject) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        fn(...args).then(resolve).catch(reject)
      }, delayMs);
    })
  }
}

// =============================================================================
// TASK 2: throttleAsync — limit how often a function can run
// =============================================================================
//
// You are given:
//   - fn(...args): a function that returns a Promise
//   - intervalMs: minimum time between calls in milliseconds
//
// Return a NEW function. The FIRST call executes immediately. Any calls made
// within intervalMs afterwards return the SAME promise (the first call's
// result). After intervalMs passes, the next call executes normally.
//
// Unlike debounce (which waits for silence), throttle ensures fn runs at most
// once per interval. This is used for rate-limiting scroll handlers or API calls.
//
// Example:
//   let callCount = 0;
//   const expensive = (val) => {
//     callCount++;
//     return Promise.resolve(val * 10);
//   };
//   const throttled = throttleAsync(expensive, 100);
//
//   const p1 = throttled(1);  // executes immediately, callCount = 1
//   const p2 = throttled(2);  // within 100ms, returns SAME promise as p1
//   const p3 = throttled(3);  // within 100ms, returns SAME promise as p1
//   // p1, p2, p3 all resolve to 10 (the result of fn(1))
//   // callCount stays at 1
//   // ... after 100ms, throttled(4) would execute again
//
// HINT:
//   You need a closure tracking two things:
//   1. let lastPromise = null
//   2. let lastCallTime = 0
//   3. Return a function(...args) that:
//      a. If Date.now() - lastCallTime < intervalMs AND lastPromise exists:
//         return lastPromise (reuse the previous result)
//      b. Otherwise:
//         lastCallTime = Date.now()
//         lastPromise = fn(...args)
//         return lastPromise

export function throttleAsync(fn, intervalMs) {
  let lastCallTime = 0;
  let lastPromise = null;
  return function(...args) {
    
    if(lastPromise === null)
    {
      lastPromise = fn(...args)
      lastCallTime = Date.now()
    }
    else{
      if(Date.now() - lastCallTime < intervalMs)
        return lastPromise
      else{
        lastCallTime = Date.now()
        lastPromise = fn(...args)
      }
    }
    return lastPromise
  }
}

// =============================================================================
// TASK 3: flatMapAsync — map in parallel, flatten results
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - fn(item): an async function that returns an ARRAY
//
// Run fn on ALL items IN PARALLEL. Each call returns an array.
// Flatten all results into a single array.
//
// This is the async version of flatMap — like map + flat in one step.
//
// Example:
//   const words = ["hello world", "good morning"];
//   const splitWords = (s) => Promise.resolve(s.split(" "));
//   flatMapAsync(words, splitWords) => ["hello", "world", "good", "morning"]
//
//   flatMapAsync([], splitWords) => []
//
//   const nums = [1, 2, 3];
//   const duplicates = (n) => Promise.resolve([n, n * 10]);
//   flatMapAsync(nums, duplicates) => [1, 10, 2, 20, 3, 30]
//
// HINT:
//   You already know Promise.all + map. That gives you an array of arrays.
//   Then you need to flatten: [[1,10], [2,20], [3,30]] => [1,10,2,20,3,30]
//   What array method flattens one level? Or you could use reduce to concatenate.

export function flatMapAsync(items, fn) {
  return Promise.all(items.map(item => fn(item))).then(value => {
    return value.flat()
  })
}

// =============================================================================
// TASK 4: zipAsync — combine two arrays element-wise with an async function
// =============================================================================
//
// You are given:
//   - items1: an array of values
//   - items2: an array of values (same length)
//   - combineFn(a, b): an async function that takes one element from each array
//
// Run combineFn on each pair IN PARALLEL: combineFn(items1[0], items2[0]),
// combineFn(items1[1], items2[1]), etc. Return all results in order.
//
// If the arrays have different lengths, only zip up to the shorter length.
//
// Example:
//   zipAsync([1, 2, 3], [10, 20, 30], (a, b) => Promise.resolve(a + b))
//     => [11, 22, 33]
//
//   zipAsync(["a", "b"], ["x", "y"], (a, b) => Promise.resolve(a + b))
//     => ["ax", "by"]
//
//   zipAsync([1, 2, 3], [10, 20], (a, b) => Promise.resolve(a + b))
//     => [11, 22]  (stops at shorter array)
//
//   zipAsync([], [], combineFn) => []
//
// HINT:
//   You need to pair up elements by index. You can use:
//   1. Figure out the length: Math.min(items1.length, items2.length)
//   2. Create an array of indices or use a range approach
//   3. Map each index to a promise: combineFn(items1[i], items2[i])
//   4. Promise.all to collect results
//   Or use Array.from({ length: minLen }, (_, i) => combineFn(...))

export function zipAsync(items1, items2, combineFn) {
  let arr = Array.from({length: Math.min(items1.length,items2.length)}, (_,i) => {
    return combineFn(items1[i], items2[i])
  })
  return Promise.all(arr)
    
}

// =============================================================================
// TASK 5: takeWhileAsync — take items sequentially while predicate is true
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - predicateFn(item): an async function returning true or false
//
// Run predicateFn on items SEQUENTIALLY. Collect items into a result array.
// As soon as predicateFn returns false, STOP — do not check any more items.
// Return the items collected so far (those before the first false).
//
// This is different from filterAsync (which checks ALL items).
// takeWhile stops at the FIRST false — items after it are never tested.
//
// Example:
//   takeWhileAsync([1, 2, 3, 4, 5], n => Promise.resolve(n < 4))
//     => [1, 2, 3]
//     // 1 passes, 2 passes, 3 passes, 4 fails -> stop, don't test 5
//
//   takeWhileAsync([5, 1, 2], n => Promise.resolve(n < 4))
//     => []  // 5 fails immediately, stop
//
//   takeWhileAsync([], predicateFn) => []
//
//   takeWhileAsync([1, 2, 3], n => Promise.resolve(true))
//     => [1, 2, 3]  // all pass
//
// HINT:
//   This is like findAsync from exercise 19, but instead of finding one item,
//   you're collecting items until one fails. Use the sequential reduce pattern.
//   Carry an object with two properties:
//     { done: false, results: [] }
//   At each step:
//     - If done is true, just pass the accumulator through unchanged
//     - If done is false, call predicateFn(item)
//       - If true: add item to results, pass { done: false, results: [...] }
//       - If false: set done to true, pass { done: true, results: [...] }
//   At the end, return the results array.

export function takeWhileAsync(items, predicateFn) {
  return items.reduce((promise,curr) => {
    return promise.then(value => {
      if(value.done)
        return value
      return predicateFn(curr).then(r => {
        if(r)
          return {done:false, results: [...value.results,curr]}
        return {done:true,results: value.results}
      })
    })
  },Promise.resolve({done:false, results:[]})).then(result => result.results)
}

// =============================================================================
// TASK 6: countByAsync — count items per category in parallel
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - classifyFn(item): an async function returning a category string
//
// Run classifyFn on ALL items IN PARALLEL. Return an object where each
// category maps to the COUNT of items in that category.
//
// This is like groupBySequential from exercise 9, but:
//   - Runs in parallel (not sequential)
//   - Returns counts (not arrays of items)
//
// Example:
//   countByAsync([1, 2, 3, 4, 5, 6], n => Promise.resolve(n % 2 === 0 ? "even" : "odd"))
//     => { odd: 3, even: 3 }
//
//   countByAsync(["a", "bb", "ccc", "dd"], s => Promise.resolve(s.length > 2 ? "long" : "short"))
//     => { short: 3, long: 1 }
//
//   countByAsync([], classifyFn) => {}
//
// HINT:
//   Two steps:
//   1. Promise.all(items.map(classifyFn)) gives you an array of categories:
//      ["odd", "even", "odd", "even", "odd", "even"]
//   2. Use reduce to count occurrences into an object:
//      Start with {}, for each category:
//        acc[category] = (acc[category] || 0) + 1
//      The || 0 handles the first occurrence when the key doesn't exist yet.

export function countByAsync(items, classifyFn) {
  return Promise.all(items.map(classifyFn)).then(value => {
    return value.reduce((acc,curr) => {
     acc[curr] = (acc[curr] || 0) + 1
     return acc
    },{})
  })
}
