// PROMISES INTERMEDIATE 13 - Practice Exercise
//
// =============================================================================
// TASK 1: Cache wrapper — wrap a function so results are cached
// =============================================================================
//
// You are given a function fetchFn(key) that returns a Promise. Create and
// return a new function that behaves like fetchFn, but caches results.
//
// The first call with a given key should call fetchFn(key) and store the
// result. Any subsequent call with the SAME key should return the cached
// result WITHOUT calling fetchFn again.
//
// Return a function (not a promise). The returned function takes a key and
// returns a Promise.
//
// This is a very common real-world pattern: memoization for async functions.
//
// Example:
//   let callCount = 0;
//   const fetchName = (key) => {
//     callCount++;
//     return Promise.resolve(key.toUpperCase());
//   };
//   const cachedFetch = withCache(fetchName);
//
//   cachedFetch("alice") => "ALICE"  (callCount becomes 1)
//   cachedFetch("alice") => "ALICE"  (callCount stays 1 — cached!)
//   cachedFetch("bob")   => "BOB"    (callCount becomes 2)
//   cachedFetch("bob")   => "BOB"    (callCount stays 2 — cached!)
//
// HINT:
//   1. Create an empty object `const cache = {}`
//   2. Return a function(key) that:
//      a. If cache[key] exists, return Promise.resolve(cache[key])
//      b. Otherwise: return fetchFn(key).then(result => {
//           cache[key] = result;
//           return result;
//         })

export function withCache(fetchFn) {
  let cache = {};
  return function newFn(key) {
    if (key in cache)
      return Promise.resolve(cache[key])
    
    else
    {
      return fetchFn(key).then(value => {
        return cache[key] = value
      })
    }
  }
}

// =============================================================================
// TASK 2: Compose two async functions
// =============================================================================
//
// You are given two functions, both of which return Promises:
//   - fn1(x): takes a value, returns a Promise
//   - fn2(x): takes a value, returns a Promise
//
// Return a NEW function that takes a value, passes it through fn1, then
// passes the result through fn2. Basically: pipe(fn1, fn2)(x).
//
// The returned function should itself return a Promise.
//
// Example:
//   const double = (n) => Promise.resolve(n * 2);
//   const addTen = (n) => Promise.resolve(n + 10);
//   const doubleThenAddTen = composeAsync(double, addTen);
//
//   doubleThenAddTen(5)  => 20  (5 * 2 = 10, 10 + 10 = 20)
//   doubleThenAddTen(3)  => 16  (3 * 2 = 6, 6 + 10 = 16)
//
// HINT:
//   Return a function(x) that:
//   1. Calls fn1(x)
//   2. .then(result => fn2(result))
//   That's it — just two promise-returning functions chained together.

export function composeAsync(fn1, fn2) {
  return function resultFunction(x) {
    return fn1(x).then(value => {
      return fn2(value)
    })
  }
}

// =============================================================================
// TASK 3: Timeout wrapper — reject if a promise takes too long
// =============================================================================
//
// You are given a function fn() that returns a Promise, and a number of
// milliseconds. Return a new Promise that:
//   - Resolves with fn()'s result if it completes within the timeout
//   - Rejects with an Error("timeout") if fn() takes too long
//
// Use Promise.race() to race fn() against a delay promise.
//
// Example:
//   const slowFn = () => new Promise(r => setTimeout(() => r("done"), 500));
//   timeoutWrapper(slowFn, 100)  => rejects with Error("timeout")
//   timeoutWrapper(slowFn, 1000) => resolves "done"
//
//   const fastFn = () => Promise.resolve("quick");
//   timeoutWrapper(fastFn, 100)  => resolves "quick"
//
// HINT:
//   1. Create a delay promise:
//      const delay = new Promise((_, reject) => {
//        setTimeout(() => reject(new Error("timeout")), ms);
//      });
//   2. Race them: return Promise.race([fn(), delay])

export function timeoutWrapper(fn, ms) {
  const delayTimer = new Promise((_,reject) => {
      setTimeout(() => {
        reject(new Error('timeout'))
      }, ms);
    })
  
  return Promise.race([fn(),delayTimer])
}

// =============================================================================
// TASK 4: Retry with delay between attempts
// =============================================================================
//
// You are given a function fn() that returns a Promise, maxAttempts, and a
// delayMs. Try fn(). If it rejects, wait delayMs milliseconds, then try
// again. Repeat up to maxAttempts times.
//
// This is like the retry you've done before, but now with a PAUSE between
// attempts — a very common pattern when calling rate-limited APIs.
//
// To create a delay, use a helper:
//   const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
//
// Example:
//   let tries = 0;
//   const flaky = () => {
//     tries++;
//     if (tries < 3) return Promise.reject(new Error("not yet"));
//     return Promise.resolve("got it");
//   };
//   retryWithDelay(flaky, 5, 100) => "got it"
//   // Tries, waits 100ms, tries again, waits 100ms, tries again — success!
//
//   retryWithDelay(() => Promise.reject(new Error("never")), 2, 50)
//     => rejects after ~100ms (2 attempts with 50ms gap)
//
// HINT:
//   Recursive pattern with a wait step:
//   1. Base case: attempts <= 0 -> reject
//   2. Try fn()
//   3. .catch(() => wait(delayMs).then(() => retryWithDelay(fn, attempts-1, delayMs)))

export function retryWithDelay(fn, attempts, delayMs) {
  const wait = (ms) => new Promise(resolve => setTimeout(resolve,ms))
  return fn().catch((error) => {
    if(attempts<=1)
      throw error
    return wait(delayMs).then(() => {
      return retryWithDelay(fn,attempts-1,delayMs)
    })
    
  })
}

// =============================================================================
// TASK 5: Queue — run async tasks one at a time
// =============================================================================
//
// You are given an array of functions. Each function returns a Promise.
// Execute them ONE AT A TIME, sequentially, and collect all results in order.
//
// Return a Promise that resolves with an array of all results.
//
// This is the reduce pattern you've used before, but applied to an array
// of functions instead of data items. Very common pattern for rate-limited
// APIs where you can't fire all requests in parallel.
//
// Example:
//   const tasks = [
//     () => Promise.resolve("first"),
//     () => Promise.resolve("second"),
//     () => Promise.resolve("third"),
//   ];
//   runQueue(tasks) => ["first", "second", "third"]
//
//   runQueue([]) => []
//
//   const mixed = [
//     () => Promise.resolve(1),
//     () => Promise.reject(new Error("boom")),
//     () => Promise.resolve(3),
//   ];
//   runQueue(mixed) => rejects with Error("boom")
//   // If any task rejects, the whole queue stops
//
// HINT:
//   Same reduce pattern:
//   tasks.reduce((promise, task) => {
//     return promise.then(results =>
//       task().then(result => [...results, result])
//     );
//   }, Promise.resolve([]))

export function runQueue(tasks) {
  return tasks.reduce((promise,curr) => {
    return promise.then(value => {
      return curr().then(result => [...value,result])
    })
  }, Promise.resolve([]))
}

// =============================================================================
// TASK 6: Transform then batch — sequential transform + parallel batch
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - transformFn(item): returns a Promise (transforms each item)
//   - batchFn(transformedItems): returns a Promise (processes all items together)
//
// Step 1: Transform ALL items SEQUENTIALLY (one at a time) using transformFn.
// Step 2: Pass the array of transformed items to batchFn.
// Step 3: Return the result of batchFn.
//
// This combines sequential processing with a final batch operation — a
// pattern common in data pipelines (ETL: Extract, Transform, Load).
//
// Example:
//   const items = ["hello", "world"];
//   const transformFn = (item) => Promise.resolve(item.toUpperCase());
//   const batchFn = (arr) => Promise.resolve(arr.join("-"));
//   transformThenBatch(items, transformFn, batchFn) => "HELLO-WORLD"
//
//   transformThenBatch([], transformFn, batchFn) => ""
//
// HINT:
//   Two steps:
//   1. Use the reduce pattern to transform items sequentially:
//      items.reduce((p, item) =>
//        p.then(results => transformFn(item).then(r => [...results, r])),
//        Promise.resolve([])
//      )
//   2. Chain .then(transformed => batchFn(transformed))

export function transformThenBatch(items, transformFn, batchFn) {
  return items.reduce((promise,curr) => {
    return promise.then(value => {
      return transformFn(curr).then(r => [...value,r])
    })
  }, Promise.resolve([])).then(result => { 
    return batchFn(result)
  })
}
