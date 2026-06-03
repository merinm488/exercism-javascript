// PROMISE BASICS 7 - Practice Exercise
//
// CONCEPTS:
//   - Retry with backoff (delay doubles each time)
//   - Promise.allSettled() + result categorisation
//   - Sequential execution with reduce() to build an array
//   - Sequential try-until-condition pattern
//   - Timeout pattern with Promise.race()

//import { find } from "core-js/core/array";

// =============================================================================
// TASK 1: Retry with exponential backoff
// =============================================================================
//
// You are given a function `fn` that returns a Promise, a number `attempts`,
// and a starting delay `delayMs`. Call `fn()` up to `attempts` times:
//   - If fn() resolves, return its value immediately
//   - If fn() rejects and you still have attempts left, WAIT `delayMs`
//     milliseconds, then try again. But each time you retry, DOUBLE the delay.
//   - If all attempts fail, reject with the LAST error
//
// Example with retryBackoff(fn, 4, 100):
//   1st try fails -> wait 100ms -> 2nd try fails -> wait 200ms -> 3rd try fails
//   -> wait 400ms -> 4th try succeeds -> return value
//
// HINT: Same recursive pattern as retryWithDelay, but pass delayMs * 2 when
//       making the recursive call.
//
// Example:
//   let count = 0;
//   const flaky = () => {
//     count++;
//     if (count < 3) return Promise.reject(new Error("not yet"));
//     return Promise.resolve("done");
//   };
//   retryBackoff(flaky, 5, 50) => resolves with "done"
//
//   const alwaysFails = () => Promise.reject(new Error("nope"));
//   retryBackoff(alwaysFails, 3, 50) => rejects with Error("nope")
//
export function retryBackoff(fn, attempts, delayMs) {
  if (attempts == 1)
    return fn()
  if (attempts >1)
  {
    const delay = (ms) =>{
      return new Promise(resolve => {setTimeout(resolve,ms)});
    }
    return fn().then(value => {
      return value
    }).catch(() => {
      return delay(delayMs).then(() => {
        return retryBackoff(fn, attempts-1, delayMs*2)
      })
    })
  }
}

// =============================================================================
// TASK 2: Fetch in parallel and categorise results
// =============================================================================
//
// You are given an array of items and a function `fetchFn(item)` that returns
// a Promise. Call fetchFn for ALL items in parallel. Return an object with
// two arrays:
//   { succeeded: [values from resolved promises], failed: [error messages] }
//
// HINT: Use Promise.allSettled(), then reduce the results into an object with
//       two arrays. For rejected results, extract error.message.
//
// Example:
//   const items = ["good", "bad", "ok"];
//   const fetchFn = (item) => {
//     if (item === "bad") return Promise.reject(new Error("failed"));
//     return Promise.resolve(item.toUpperCase());
//   };
//   parallelSummary(items, fetchFn) =>
//     { succeeded: ["GOOD", "OK"], failed: ["failed"] }
//
//   parallelSummary([], fetchFn) => { succeeded: [], failed: [] }
//
export function parallelSummary(items, fetchFn) {
  let promises = items.map(item => fetchFn(item))
  return Promise.allSettled(promises).then(result => {
      return result.reduce((acc,curr) =>{
      if (curr.status == 'fulfilled')
      {
        acc.succeeded.push(curr.value)
      }
      else acc.failed.push(curr.reason.message)
      return acc
    }, {succeeded: [], failed: []})
  })
}

// =============================================================================
// TASK 3: Process items SEQUENTIALLY and collect results into an array
// =============================================================================
//
// You are given an array of items and a function `processFn(item)` that returns
// a Promise. Process items ONE AT A TIME and collect the results into an array
// (like an async version of .map()).
//
// HINT: Same reduce() pattern as buildObject from exercise 6, but instead of
//       building an object, you push each result to an array:
//       processFn(curr).then(result => [...acc, result])
//
// Example:
//   const items = [1, 2, 3];
//   const double = (n) => Promise.resolve(n * 2);
//   sequentialMap(items, double) => [2, 4, 6]
//
//   sequentialMap([], double) => []
//
export function sequentialMap(items, processFn) {
  return items.reduce((promise, curr) => {
    return promise.then(value =>{
      return processFn(curr).then(r => [...value,r])
    })
  }, Promise.resolve([]))
}

// =============================================================================
// TASK 4: Try functions sequentially until one MEETS A CONDITION
// =============================================================================
//
// You are given an array of functions that each return a Promise, and a
// `condition` function. Try the functions SEQUENTIALLY:
//   - Call a function. If it resolves, check if the result passes `condition`.
//     - If condition returns true, return that result.
//     - If condition returns false, try the next function.
//   - If a function rejects, try the next function.
//   - If ALL functions are exhausted without a match, reject with
//     Error("No match found")
//
// HINT: This is like trySequential from exercise 6, but you have an extra
//       check after a successful resolve. The recursive pattern is the same:
//       fn resolves + condition passes -> return value
//       fn resolves + condition fails  -> try next (fns.slice(1))
//       fn rejects                     -> try next (fns.slice(1))
//
// Example:
//   const fns = [
//     () => Promise.resolve(5),
//     () => Promise.resolve(12),
//     () => Promise.resolve(8),
//   ];
//   const isEven = (n) => n % 2 === 0;
//   findMatching(fns, isEven) => resolves with 12
//
//   const allOdd = [
//     () => Promise.resolve(1),
//     () => Promise.resolve(3),
//   ];
//   findMatching(allOdd, isEven) => rejects with Error("No match found")
//
//   findMatching([], isEven) => rejects with Error("No match found")
//
export function findMatching(fns, condition) {
  if (fns.length == 0)
    return Promise.reject(new Error('No match found'))

  return fns[0]().then(value => {
    if (condition(value)) return value
    else 
    {
      return findMatching(fns.slice(1),condition)
    }
  }).catch(() => {
    return findMatching(fns.slice(1),condition)
  })
}
