// PROMISES INTERMEDIATE 17 - Practice Exercise
//
// =============================================================================
// TASK 1: mapSeries — apply an async function to each item, one at a time
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - fn(item): a function that takes one item and returns a Promise
//
// Apply fn to each item SEQUENTIALLY (one after another, not in parallel).
// Collect all results into an array, in the same order as the original items.
// Return the results array.
//
// If fn rejects for any item, stop processing and reject with that error.
// If items is empty, resolve with an empty array.
//
// Example:
//   const items = [1, 2, 3];
//   const slowDouble = (n) => new Promise(r => setTimeout(() => r(n * 2), 50));
//
//   mapSeries(items, slowDouble) => [2, 4, 6]
//   // Each item waits for the previous one to finish
//
//   mapSeries([], slowDouble) => []
//
// HINT:
//   Think about how you processed batches sequentially in exercise 15.
//   What array method lets you build up a result step by step, where each step
//   depends on the previous one? How would you start with an empty array and
//   add one result at a time?

export function mapSeries(items, fn) {
  return items.reduce((promise,curr) => {
    return promise.then(value => {
      return fn(curr).then(r => [...value,r])
    })
  },Promise.resolve([]))
}

// =============================================================================
// TASK 2: oncePromise — ensure a function only executes once
// =============================================================================
//
// You are given a function fn that returns a Promise.
// Return a NEW function that:
//   - On the first call: calls fn(), stores the promise, and returns it
//   - On every subsequent call: returns the SAME promise without calling fn again
//
// Example:
//   let callCount = 0;
//   const fetchData = () => {
//     callCount++;
//     return Promise.resolve("data loaded");
//   };
//
//   const fetchOnce = oncePromise(fetchData);
//   fetchOnce() => "data loaded"  (callCount: 1)
//   fetchOnce() => "data loaded"  (callCount: 1 — fn not called again!)
//   fetchOnce() => "data loaded"  (callCount: 1 — still cached)
//
// HINT:
//   You need to remember two things between calls: whether fn has been called
//   already, and what promise it returned. What kind of variable stays alive
//   between function calls? (Think about closures — you've used them in
//   promiseMemoize and circuitBreaker.)

export function oncePromise(fn) {
  let cachePromise = null;
  return function newFn() {
    if(!cachePromise)
    {
      cachePromise = fn()
    }
    return cachePromise;
  }
}

// =============================================================================
// TASK 3: retryWithFixedDelay — retry with a constant delay
// =============================================================================
//
// You are given:
//   - fn(): a function that returns a Promise
//   - maxRetries: maximum number of retry attempts (after the initial call)
//   - delayMs: fixed delay in milliseconds between each retry
//
// Call fn(). If it rejects, wait delayMs and try again. Repeat up to maxRetries.
// Unlike retryWithBackoff from exercise 16, the delay stays constant — it does
// NOT increase.
//
// If fn() succeeds at any point, return the result immediately.
// If all retries are exhausted, reject with the last error from fn.
//
// Example:
//   let attempts = 0;
//   const unstableService = () => {
//     attempts++;
//     if (attempts < 3) return Promise.reject(new Error("not ready"));
//     return Promise.resolve("connected");
//   };
//
//   retryWithFixedDelay(unstableService, 5, 100)
//   // attempt 1: fails → wait 100ms → attempt 2: fails → wait 100ms → attempt 3: success
//   // returns "connected"
//
//   retryWithFixedDelay(() => Promise.reject(new Error("always fails")), 2, 50)
//   // attempt 1: fails → wait 50ms → attempt 2: fails → wait 50ms → attempt 3: fails
//   // rejects with Error("always fails")
//
// HINT:
//   This is similar to retryWithBackoff from exercise 16, but simpler — the
//   delay doesn't change. Think about: how did you track retry count last time?
//   How did you wait before retrying? The structure is the same, just remove
//   the exponential part.

export function retryWithFixedDelay(fn, maxRetries, delayMs) {
  const delay = (ms) => new Promise(resolve => setTimeout(resolve,ms));
  function Helper(attempts) {
    return fn().catch((error) => {
      if(attempts>=maxRetries)
        return Promise.reject(error)
      return delay(delayMs).then(() => {
        return Helper(attempts+1)
      })
    })
  }
  return Helper(0)
}

// =============================================================================
// TASK 4: raceSuccess — first successful result, ignoring failures
// =============================================================================
//
// You are given an array of functions, each returns a Promise.
// Run ALL functions in parallel. Return the result of the FIRST one that
// RESOLVES. Ignore any that reject — just keep waiting for a success.
//
// If ALL functions reject, reject with Error("all failed").
// If the array is empty, reject with Error("no functions provided").
//
// Do NOT use Promise.any() — implement the logic yourself.
//
// Example:
//   const tasks = [
//     () => Promise.reject(new Error("fail 1")),
//     () => new Promise(r => setTimeout(() => r("slow"), 50)),
//     () => Promise.reject(new Error("fail 2")),
//     () => new Promise(r => setTimeout(() => r("fast"), 20)),
//   ];
//
//   raceSuccess(tasks) => "fast"
//   // "fast" resolves first among the successes (20ms vs 50ms)
//
//   raceSuccess([
//     () => Promise.reject(new Error("a")),
//     () => Promise.reject(new Error("b")),
//   ]) => rejects with Error("all failed")
//
//   raceSuccess([]) => rejects with Error("no functions provided")
//
// HINT:
//   You need to track two things across all tasks: how many have settled, and
//   how many have failed. When a task succeeds, you can resolve immediately.
//   When a task fails, increment the failure count. At what point do you know
//   that all hope is lost and you should reject?
//
//   Think about what you learned in firstNFulfilled from exercise 15 — this is
//   a simpler version of that pattern. You'll need to create your own Promise
//   using new Promise((resolve, reject) => { ... }).

export function raceSuccess(fns) {
  if (fns.length === 0)
    return Promise.reject(new Error("no functions provided"))
  let failed = 0;
  return new Promise((resolve,reject) => {
    fns.map(fn=>fn().then((value) => {
      resolve(value)
    },() => {
      failed++
      if (failed == fns.length)
      {
        reject(new Error("all failed"))
      }
    }))
  })
}

// =============================================================================
// TASK 5: filterAsync — async filter on an array
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - predicateFn(item): an async function that returns true or false
//
// Run predicateFn on EVERY item in parallel. Keep only the items where
// predicateFn resolves to true. Return the filtered array in the SAME ORDER
// as the original items.
//
// If predicateFn rejects for any item, the whole operation should reject.
//
// Example:
//   const items = [1, 2, 3, 4, 5];
//   const isBig = (n) => Promise.resolve(n > 3);
//
//   filterAsync(items, isBig) => [4, 5]
//
//   const users = [
//     { name: "Alice", active: true },
//     { name: "Bob", active: false },
//     { name: "Carol", active: true },
//   ];
//   const isActive = (user) => Promise.resolve(user.active);
//
//   filterAsync(users, isActive) => [{ name: "Alice", active: true }, { name: "Carol", active: true }]
//
// HINT:
//   You can't use Array.filter directly because predicateFn is async. But what
//   if you could turn the async answers into regular boolean values first?
//   What method runs all promises in parallel and gives you back an array of
//   results? Once you have an array of booleans, how do you combine that with
//   the original items to keep only the matching ones?

export function filterAsync(items, predicateFn) {
  return Promise.all(items.map(item=>predicateFn(item))).then(value => {
    return items.filter((_,i) => value[i])
  })
}

// =============================================================================
// TASK 6: toPromise — convert a callback-style function to promise-style
// =============================================================================
//
// In older JavaScript, async operations used callbacks instead of promises.
// A "node-style callback" takes (error, result) as arguments:
//
//   function readFile(path, callback) {
//     // ... later ...
//     callback(null, "file contents");   // success: error is null
//     // or
//     callback(new Error("not found"));  // failure: result is undefined
//   }
//
// You are given a function that uses this callback pattern.
// Return a NEW function that:
//   - Takes the same arguments (except the callback)
//   - Returns a Promise instead
//   - Resolves with the result on success (when error is null)
//   - Rejects with the error on failure
//
// Example:
//   function oldFetch(url, callback) {
//     if (url === "/ok") callback(null, "data");
//     else callback(new Error("not found"));
//   }
//
//   const fetchPromise = toPromise(oldFetch);
//   fetchPromise("/ok") => resolves with "data"
//   fetchPromise("/bad") => rejects with Error("not found")
//
// HINT:
//   You need to create a new Promise manually. Inside the executor function,
//   call the original function with all the arguments PLUS a callback that
//   you create. Inside YOUR callback, decide whether to resolve or reject
//   based on whether the error argument is null.
//
//   Think about: how do you capture "all the arguments the caller passed"
//   and add one more (your callback) at the end? You've used rest parameters
//   and spread before.

export function toPromise(fn) {
  return function promise(...args) {
    return new Promise((resolve,reject) => {
      fn(...args,(error,result) => {
        if(!error)
          resolve(result)
        else reject(error)

      })
    })
  }
}
