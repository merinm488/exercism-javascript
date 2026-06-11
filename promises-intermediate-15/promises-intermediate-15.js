// PROMISES INTERMEDIATE 15 - Practice Exercise
//
// =============================================================================
// TASK 1: pollUntil — keep polling until a condition is met
// =============================================================================
//
// You are given:
//   - fn(): a function that returns a Promise
//   - conditionFn(result): returns true if the result is what we want
//   - intervalMs: milliseconds to wait between polls
//   - maxAttempts: maximum number of attempts before giving up
//
// Call fn(). If conditionFn(result) is true, return the result.
// If not, wait intervalMs, then try again. Repeat up to maxAttempts times.
//
// If all attempts are exhausted, reject with the last Error from fn, or
// if fn kept resolving but condition was never met, reject with
// new Error("condition not met").
//
// Example:
//   let attempts = 0;
//   const checkServer = () => {
//     attempts++;
//     if (attempts < 3) return Promise.resolve("loading");
//     return Promise.resolve("ready");
//   };
//   const isReady = (result) => result === "ready";
//
//   pollUntil(checkServer, isReady, 50, 10) => "ready"
//   // attempt 1: "loading" (not ready)
//   // wait 50ms
//   // attempt 2: "loading" (not ready)
//   // wait 50ms
//   // attempt 3: "ready" => returns "ready"
//
//   pollUntil(() => Promise.resolve("nope"), (r) => r === "yes", 10, 3)
//     => rejects with Error("condition not met")
//
// HINT:
//   Use a recursive helper with an attempt counter:
//   1. const wait = (ms) => new Promise(r => setTimeout(r, ms))
//   2. Define helper(attempt):
//      a. If attempt > maxAttempts: throw Error("condition not met")
//      b. return fn().then(result => {
//           if (conditionFn(result)) return result;
//           return wait(intervalMs).then(() => helper(attempt + 1));
//         })
//   3. Call helper(1)

export function pollUntil(fn, conditionFn, intervalMs, maxAttempts,attempts=1) {
  if (attempts>maxAttempts) 
    throw new Error('condition not met')
  return fn().then(result => {
    if (conditionFn(result))
      return result
    else{
      const delay = (ms) => new Promise(resolve => setTimeout(resolve,ms));
      return delay(intervalMs).then(() => {
        attempts++
        return pollUntil(fn,conditionFn,intervalMs,maxAttempts,attempts)
      })
    }
    })
}

// =============================================================================
// TASK 2: pipeline — compose N async functions into one
// =============================================================================
//
// You are given an array of functions. Each function takes a value and returns
// a Promise. Return a NEW function that takes an initial value and pipes it
// through ALL the functions in order.
//
// This is like composeAsync from exercise 13, but for N functions instead of 2.
//
// If the array is empty, return a function that resolves with the input as-is.
//
// Example:
//   const double = (n) => Promise.resolve(n * 2);
//   const addTen = (n) => Promise.resolve(n + 10);
//   const square = (n) => Promise.resolve(n * n);
//
//   const pipe = pipeline([double, addTen, square]);
//   pipe(3) => 64
//   // 3 * 2 = 6, 6 + 10 = 16, 16 * 16 = 256... wait let me recalculate
//   // 3 * 2 = 6, 6 + 10 = 16, 16^2 = 256
//
//   const pipe2 = pipeline([double, addTen]);
//   pipe2(5) => 20  // 5*2=10, 10+10=20
//
//   pipeline([])(42) => 42
//
// HINT:
//   Use the reduce pattern:
//   return (initialValue) =>
//     fns.reduce(
//       (promise, fn) => promise.then(val => fn(val)),
//       Promise.resolve(initialValue)
//     )

export function pipeline(fns) {
  return function pipe(x) {
    return fns.reduce((promise,curr) => {
      return promise.then(value => {
        return curr(value)
      })
    }, Promise.resolve(x))
  }
}

// =============================================================================
// TASK 3: mapConcurrent — async map with concurrency limit
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - fn(item): an async function to apply to each item
//   - maxConcurrent: maximum number of promises running at a time
//
// Apply fn to every item, but run at most maxConcurrent promises at once.
// Return all results in the SAME ORDER as the original items array.
//
// This is like concurrentLimit from exercise 14, but instead of an array of
// task functions, you have an array of data items and a transform function.
//
// Example:
//   const items = [1, 2, 3, 4, 5];
//   const slowDouble = (n) => new Promise(r => setTimeout(() => r(n * 2), 50));
//
//   mapConcurrent(items, slowDouble, 2) => [2, 4, 6, 8, 10]
//   // At most 2 run at a time, results in original order
//
//   mapConcurrent([], slowDouble, 3) => []
//   mapConcurrent([1], slowDouble, 5) => [2]
//
// HINT:
//   This is the same "lanes" pattern from concurrentLimit:
//   1. Create results array: const results = new Array(items.length)
//   2. Define runNext(index):
//      if (index >= items.length) return Promise.resolve()
//      return fn(items[index]).then(val => {
//        results[index] = val
//        return runNext(index + maxConcurrent)
//      })
//   3. Start Math.min(maxConcurrent, items.length) lanes
//   4. return Promise.all(lanes).then(() => results)

export function mapConcurrent(items, fn, maxConcurrent) {
  let result = new Array(items.length)
  function nextRun(index) {
    if (index >= items.length)
      return Promise.resolve()
    return fn(items[index]).then(value => {
      result[index] = value;
      return nextRun(index+maxConcurrent)
    })
  }

  let lanes = []
  for (let i=0; i< Math.min(maxConcurrent, items.length); i++)
    lanes.push(nextRun(i))
  return Promise.all(lanes).then(() => result)
}

// =============================================================================
// TASK 4: batchProcess — split into batches, process each batch sequentially
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - batchFn(batch): an async function that processes an array (batch) of items
//   - batchSize: how many items per batch
//
// Split items into chunks of batchSize. Call batchFn on each chunk
// SEQUENTIALLY (one batch at a time). Collect all batch results and
// return them flattened into a single array.
//
// This is a very common pattern for APIs that accept bulk operations but
// have payload size limits.
//
// Example:
//   const items = [1, 2, 3, 4, 5, 6, 7];
//   const doubleBatch = (batch) => Promise.resolve(batch.map(n => n * 2));
//
//   batchProcess(items, doubleBatch, 3) => [2, 4, 6, 8, 10, 12, 14]
//   // Batch 1: [1,2,3] => [2,4,6]
//   // Batch 2: [4,5,6] => [8,10,12]
//   // Batch 3: [7]     => [14]
//   // Flattened: [2,4,6,8,10,12,14]
//
//   batchProcess([], doubleBatch, 3) => []
//   batchProcess([1, 2], doubleBatch, 5) => [2, 4]
//
// HINT:
//   1. Split items into chunks:
//      const chunks = [];
//      for (let i = 0; i < items.length; i += batchSize) {
//        chunks.push(items.slice(i, i + batchSize));
//      }
//   2. Use the reduce pattern to process chunks sequentially:
//      chunks.reduce((promise, chunk) =>
//        promise.then(results =>
//          batchFn(chunk).then(batchResult => [...results, ...batchResult])
//        ),
//        Promise.resolve([])
//      )

export function batchProcess(items, batchFn, batchSize) {
  let chunks = [];
  for(let i=0; i<items.length; i+=batchSize)
  {
    chunks.push(items.slice(i,i+batchSize))
  }
  return chunks.reduce((promise,curr) => {
    return promise.then(value => {
      return batchFn(curr).then(r => {
        return [...value, ...r]
      })
    })
  }, Promise.resolve([]))

}

// =============================================================================
// TASK 5: circuitBreaker — stop calling after repeated failures
// =============================================================================
//
// You are given:
//   - fn(): a function that returns a Promise
//   - failureThreshold: number of consecutive failures before "opening" the circuit
//   - resetTimeoutMs: time in ms before trying again after the circuit opens
//
// Return a NEW function that wraps fn with circuit breaker logic:
//
// States:
//   CLOSED (normal): calls fn normally. On failure, increment failure counter.
//     If failures reach failureThreshold, switch to OPEN.
//
//   OPEN (blocked): reject immediately with Error("circuit open").
//     After resetTimeoutMs, switch to HALF_OPEN.
//
//   HALF_OPEN (testing): try fn() once.
//     If it succeeds: reset failure counter, switch to CLOSED, return result.
//     If it fails: switch back to OPEN, reset the timeout timer.
//
// This is a critical pattern in distributed systems to prevent cascading
// failures when a downstream service is down.
//
// Example:
//   let failCount = 0;
//   const flakyService = () => {
//     failCount++;
//     if (failCount < 5) return Promise.reject(new Error("service down"));
//     return Promise.resolve("ok");
//   };
//
//   const protectedCall = circuitBreaker(flakyService, 3, 100);
//
//   protectedCall() => rejects Error("service down")  (failures: 1)
//   protectedCall() => rejects Error("service down")  (failures: 2)
//   protectedCall() => rejects Error("service down")  (failures: 3, circuit OPENS)
//   protectedCall() => rejects Error("circuit open")   (circuit is OPEN)
//   // ... after 100ms, circuit goes to HALF_OPEN
//   protectedCall() => rejects Error("service down")   (failCount=4, back to OPEN)
//   // ... after 100ms, circuit goes to HALF_OPEN
//   protectedCall() => resolves "ok"                   (failCount=5, circuit CLOSES)
//
// HINT:
//   Use a closure to track state:
//   1. let failures = 0;
//      let state = 'CLOSED';
//      let openTimer = null;
//
//   2. Return a function() that checks state:
//      - If OPEN: return Promise.reject(new Error("circuit open"))
//      - If CLOSED or HALF_OPEN: call fn()
//        - On success: failures = 0, state = 'CLOSED', return result
//        - On failure:
//          failures++
//          if failures >= failureThreshold:
//            state = 'OPEN'
//            openTimer = setTimeout(() => { state = 'HALF_OPEN' }, resetTimeoutMs)
//          throw the error

export function circuitBreaker(fn, failureThreshold, resetTimeoutMs) {
  let state = 'CLOSED'
  let failed = 0;
  let openTimer = 0;
  return function newFn(){
    if(state == 'OPEN')
    {
      return Promise.reject(new Error('circuit open'))
    }
    if (state == 'CLOSED' || state == 'HALF_OPEN')
    {
      return fn().then(result => {
        failed = 0
        state = 'CLOSED'
        return result
      }).catch((error) => {
        failed++
        if(failed>=failureThreshold)
        {
          state = 'OPEN'
          openTimer = setTimeout(() => {state = 'HALF_OPEN'}, resetTimeoutMs); 
          return Promise.reject(error)
        }
        else throw error
      })
    }
    
  }
}

// =============================================================================
// TASK 6: firstNFulfilled — collect the first N successful results
// =============================================================================
//
// You are given:
//   - tasks: an array of functions, each returns a Promise
//   - n: the number of successful results to collect
//
// Run ALL tasks in parallel. As soon as exactly n of them resolve,
// return their results in an array (in the order they resolve, not the
// original order).
//
// If fewer than n tasks succeed, reject with Error("not enough results").
//
// This is harder than it sounds. You cannot use Promise.any (which gives just
// the first) or Promise.all (which needs ALL to succeed). You need to manually
// track how many have fulfilled so far.
//
// Example:
//   const tasks = [
//     () => new Promise(r => setTimeout(() => r("a"), 30)),
//     () => new Promise(r => setTimeout(() => r("b"), 10)),
//     () => Promise.reject(new Error("fail")),
//     () => new Promise(r => setTimeout(() => r("d"), 20)),
//   ];
//
//   firstNFulfilled(tasks, 2) => ["b", "d"]
//   // "b" resolves first (10ms), "d" second (20ms)
//   // "a" (30ms) is ignored — we already have 2
//
//   firstNFulfilled(tasks, 4)
//     => rejects with Error("not enough results")
//     // Only 3 succeed, but we asked for 4
//
//   firstNFulfilled([
//     () => Promise.resolve("only"),
//   ], 2) => rejects with Error("not enough results")
//
// HINT:
//   This requires manual tracking with Promise constructors:
//
//   return new Promise((resolve, reject) => {
//     const results = [];
//     let settled = 0;
//     let failed = 0;
//     const total = tasks.length;
//
//     tasks.forEach(task => {
//       task().then(
//         (value) => {
//           settled++;
//           if (results.length < n) {
//             results.push(value);
//             if (results.length === n) resolve(results);
//           }
//         },
//         () => {
//           settled++;
//           failed++;
//           // Check if it's now impossible to get n results
//           if (total - failed < n) {
//             reject(new Error("not enough results"));
//           }
//         }
//       );
//     });
//   });
//
//   The key insight: we resolve early as soon as we have n results,
//   and reject early if too many fail to ever reach n.

export function firstNFulfilled(tasks, n) {
  let failed = 0;
  let result = []
  return new Promise((resolve, reject) => {
    tasks.forEach(task => {
      task().then(value => {
        if(result.length < n)
        {
          result.push(value)
        }
        if (result.length == n)
          resolve(result)
      }).catch(() => {
        failed++
        if(tasks.length - failed < n)
          reject(new Error("not enough results"))
      })
      
    })
  })
}
