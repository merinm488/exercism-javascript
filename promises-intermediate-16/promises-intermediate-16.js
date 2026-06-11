// PROMISES INTERMEDIATE 16 - Practice Exercise
//
// =============================================================================
// TASK 1: retryWithBackoff — retry an async function with increasing delays
// =============================================================================
//
// You are given:
//   - fn(): a function that returns a Promise
//   - maxRetries: maximum number of retry attempts (after the initial call)
//   - baseDelay: starting delay in milliseconds
//
// Call fn(). If it rejects, wait and try again. The delay doubles each retry:
//   - After 1st failure: wait baseDelay           (baseDelay * 2^0)
//   - After 2nd failure: wait baseDelay * 2       (baseDelay * 2^1)
//   - After 3rd failure: wait baseDelay * 4       (baseDelay * 2^2)
//
// If fn() succeeds at any point, return the result immediately.
// If all retries are exhausted, reject with the last error from fn.
//
// Example:
//   let attempts = 0;
//   const unstableService = () => {
//     attempts++;
//     if (attempts < 4) return Promise.reject(new Error("service unavailable"));
//     return Promise.resolve("connected");
//   };
//
//   retryWithBackoff(unstableService, 5, 100)
//   // attempt 1: fails
//   // wait 100ms
//   // attempt 2: fails
//   // wait 200ms
//   // attempt 3: fails
//   // wait 400ms
//   // attempt 4: succeeds → returns "connected"
//
//   retryWithBackoff(() => Promise.reject(new Error("always fails")), 2, 50)
//   // attempt 1: fails → wait 50ms → attempt 2: fails → wait 100ms → attempt 3: fails
//   // rejects with Error("always fails") (last error)
//
// HINT:
//   Use a recursive helper with a retry counter:
//   1. const wait = (ms) => new Promise(r => setTimeout(r, ms))
//   2. Define helper(retryCount):
//      return fn().catch(err => {
//        if (retryCount >= maxRetries) throw err
//        const delay = baseDelay * Math.pow(2, retryCount)
//        return wait(delay).then(() => helper(retryCount + 1))
//      })
//   3. Call helper(0)

//import { json } from "node:stream/consumers"

export function retryWithBackoff(fn, maxRetries, baseDelay) {
  const delay = (ms) => new Promise(resolve => setTimeout(resolve,ms))
  const helper = (attempts) => {
    return fn().catch((error) => {
      if(attempts>=maxRetries)
        return Promise.reject(error)
      return delay(baseDelay * Math.pow(2,attempts)).then(() => {
        return helper(attempts+1)
      })
    })
  }
  return helper(0)

}

// =============================================================================
// TASK 2: promiseMemoize — cache async function results
// =============================================================================
//
// You are given a function fn that takes arguments and returns a Promise.
// Return a NEW function that works the same as fn, but caches results.
//
// When the returned function is called with the same arguments again,
// it should return the cached Promise instead of calling fn again.
//
// Use JSON.stringify(args) as the cache key.
//
// Example:
//   let callCount = 0;
//   const fetchUser = (id) => {
//     callCount++;
//     return Promise.resolve({ id, name: "User " + id });
//   };
//
//   const cachedFetch = promiseMemoize(fetchUser);
//   cachedFetch(1) => { id: 1, name: "User 1" }  (callCount: 1)
//   cachedFetch(1) => { id: 1, name: "User 1" }  (callCount: 1, cached!)
//   cachedFetch(2) => { id: 2, name: "User 2" }  (callCount: 2)
//   cachedFetch(2) => { id: 2, name: "User 2" }  (callCount: 2, cached!)
//
// HINT:
//   Use a closure with a Map or object:
//   1. const cache = new Map()
//   2. Return a function(...args) {
//        const key = JSON.stringify(args)
//        if (cache.has(key)) return cache.get(key)
//        const promise = fn(...args)
//        cache.set(key, promise)
//        return promise
//      }

export function promiseMemoize(fn) {
  let result = {}
  return function newFn(...args) {
    const key = JSON.stringify(args)
    if(key in result)
    {
      return Promise.resolve(result[key])
    }
    else{
      return fn(...args).then((value) => {
        return result[key] = value
      })
    }
  }
}

// =============================================================================
// TASK 3: withTimeout — add a timeout to a promise
// =============================================================================
//
// You are given:
//   - promise: a Promise to wrap
//   - timeoutMs: maximum time to wait in milliseconds
//
// Return a new Promise that:
//   - Resolves with the original promise's value if it settles within timeoutMs
//   - Rejects with Error("timeout") if timeoutMs passes before it settles
//
// Example:
//   const fast = new Promise(r => setTimeout(() => r("done"), 50))
//   withTimeout(fast, 100) => "done"  (settles within 100ms)
//
//   const slow = new Promise(r => setTimeout(() => r("done"), 200))
//   withTimeout(slow, 100) => rejects with Error("timeout")
//
// HINT:
//   Use Promise.race with a timeout promise:
//   1. const timeoutPromise = new Promise((_, reject) =>
//        setTimeout(() => reject(new Error("timeout")), timeoutMs)
//      )
//   2. return Promise.race([promise, timeoutPromise])

export function withTimeout(promise, timeoutMs) {
  const delayPromise = new Promise((_,reject) => {
    setTimeout(() => {
      reject(new Error('timeout'))
    }, timeoutMs);
  })
  return Promise.race([promise,delayPromise])
}

// =============================================================================
// TASK 4: fallbackChain — try multiple functions until one succeeds
// =============================================================================
//
// You are given an array of functions. Each function returns a Promise.
// Try them one at a time, in order. As soon as one resolves, return its result.
// If one rejects, move on to the next.
//
// If ALL functions reject, reject with the last error.
// If the array is empty, reject with Error("no functions provided").
//
// Example:
//   const primary   = () => Promise.reject(new Error("primary down"));
//   const secondary = () => Promise.reject(new Error("secondary down"));
//   const tertiary  = () => Promise.resolve("tertiary ok");
//
//   fallbackChain([primary, secondary, tertiary]) => "tertiary ok"
//
//   fallbackChain([primary, secondary]) => rejects with Error("secondary down")
//
//   fallbackChain([]) => rejects with Error("no functions provided")
//
// HINT:
//   Use the reduce pattern starting with a rejected promise:
//   fns.reduce(
//     (promise, fn) => promise.catch(() => fn()),
//     Promise.reject(new Error("no functions provided"))
//   )
//   Each .catch() catches the previous rejection and tries the next function.

export function fallbackChain(fns) {
  return fns.reduce((promise,curr) => {
    return promise.catch(() => curr())
  },Promise.reject(new Error("no functions provided")))
}

// =============================================================================
// TASK 5: asyncQueue — process async tasks one at a time
// =============================================================================
//
// Return an object with an enqueue method. The enqueue method takes a function
// that returns a Promise. Tasks are processed one at a time, in order.
//
// enqueue(fn) returns a Promise that resolves/rejects with fn's result.
// Even if fn takes a long time, the next task won't start until the current
// one finishes.
//
// Example:
//   const queue = asyncQueue();
//   const order = [];
//
//   queue.enqueue(() => new Promise(r => setTimeout(() => {
//     order.push("a"); r(1);
//   }, 50)));
//
//   queue.enqueue(() => new Promise(r => setTimeout(() => {
//     order.push("b"); r(2);
//   }, 10)));
//
//   // Even though task B is faster, it waits for task A to finish first
//   // order ends up as ["a", "b"]
//
// HINT:
//   Use a closure to track a running promise chain:
//   1. let running = Promise.resolve()
//   2. return {
//        enqueue(fn) {
//          const result = running.then(() => fn())
//          running = result.catch(() => {})  // always resolves so chain continues
//          return result
//        }
//      }
//
//   The key insight: running always stays as a resolved promise (never rejects),
//   so the next enqueue always starts fresh. But we return the ORIGINAL result
//   promise so the caller gets the real value or error.

export function asyncQueue() {
  let running = Promise.resolve();
  return {
    enqueue: (fn)=> {
      let result = running.then(() => fn())
      running = result.catch(() => {})
      return result
    }
  }
}

// =============================================================================
// TASK 6: settleAll — collect all results regardless of success or failure
// =============================================================================
//
// You are given an array of task functions, each returns a Promise.
// Run ALL tasks in parallel. Return an array of result objects:
//   - For fulfilled: { status: "fulfilled", value: result }
//   - For rejected:  { status: "rejected", reason: error }
//
// Results should be in the SAME ORDER as the original tasks array.
// This function ALWAYS resolves (never rejects), even if all tasks fail.
//
// Example:
//   const tasks = [
//     () => Promise.resolve("ok"),
//     () => Promise.reject(new Error("fail")),
//     () => Promise.resolve(42),
//   ];
//
//   settleAll(tasks) => [
//     { status: "fulfilled", value: "ok" },
//     { status: "rejected", reason: Error("fail") },
//     { status: "fulfilled", value: 42 },
//   ]
//
//   settleAll([]) => []
//
// HINT:
//   Map each task to a promise that always resolves (with a result object):
//   return Promise.all(
//     tasks.map((task) =>
//       task().then(
//         (value) => ({ status: "fulfilled", value }),
//         (reason) => ({ status: "rejected", reason })
//       )
//     )
//   )
//
//   The key insight: by catching errors inside .then()'s second argument,
//   each mapped promise ALWAYS resolves (with either a fulfilled or rejected
//   result object). So Promise.all never rejects.

export function settleAll(tasks) {
  //return Promise.allSettled(tasks.map(task => task())).then(value => value)
  return Promise.all(tasks.map(task => task().then(value => ({status:'fulfilled', value}), reason => ({status:'rejected',reason}))))
}
