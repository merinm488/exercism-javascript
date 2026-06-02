// PROMISE BASICS 5 - Practice Exercise
//
// This exercise covers more core Promise patterns using .then() chains.
//
// NEW CONCEPTS:
//   - Promise.any() - resolves with the first FULFILLED promise
//   - Timeout pattern - racing a promise against a timer
//   - Retry pattern - retrying a failed operation multiple times
//   - Parallel execution - running multiple promises at the same time
//   - Sequential execution - running promises one after another
//   - Error recovery - catching errors and continuing with a fallback
//
// REVIEWED CONCEPTS:
//   - Everything from exercises 1, 2, 3, and 4

// =============================================================================
// TASK 1: Get the first SUCCESSFUL result - Promise.any()
// =============================================================================
//
// You are given an array of Promises. Unlike Promise.race(), which settles
// with the first promise (even if it rejects), Promise.any() waits for the
// first promise that FULFILLS (resolves successfully).
//
// If ALL promises reject, Promise.any() rejects with an AggregateError.
// An AggregateError has an `errors` property containing all the rejection reasons.
//
// Return a Promise that resolves with the VALUE of the first fulfilled promise.
//
// Example:
//   const promises = [
//     Promise.reject(new Error("fail")),
//     Promise.resolve("success"),
//     Promise.resolve("also success"),
//   ];
//   firstSuccess(promises) => resolves with "success"
//
//   const allBad = [
//     Promise.reject(new Error("a")),
//     Promise.reject(new Error("b")),
//   ];
//   firstSuccess(allBad) => rejects with AggregateError (errors property has both errors)
//
export function firstSuccess(promises) {
  throw new Error('Implement firstSuccess');
}

// =============================================================================
// TASK 2: Add a timeout to a promise
// =============================================================================
//
// You are given a Promise and a time in milliseconds. Return a Promise that:
//   - Resolves/rejects with the original promise's result if it settles within `ms`
//   - Rejects with new Error("timeout") if the original promise takes longer than `ms`
//
// HINT: Think about which Promise method "races" two promises against each other.
//       You need to race the original promise against a delay promise that
//       rejects after `ms` milliseconds.
//
// Example:
//   const slow = new Promise(resolve => setTimeout(() => resolve("late"), 500));
//   withTimeout(slow, 100) => rejects with Error("timeout")
//
//   const fast = new Promise(resolve => setTimeout(() => resolve("quick"), 10));
//   withTimeout(fast, 1000) => resolves with "quick"
//
export function withTimeout(promise, ms) {
  throw new Error('Implement withTimeout');
}

// =============================================================================
// TASK 3: Retry a failing operation
// =============================================================================
//
// You are given a function `fn` that returns a Promise, and a number `attempts`.
// Call `fn()` up to `attempts` times:
//   - If fn() resolves, return its value immediately
//   - If fn() rejects and you still have attempts left, try again
//   - If all attempts fail, reject with the LAST error
//
// HINT: This is a recursive pattern. If fn() rejects and attempts > 1,
//       call retry(fn, attempts - 1). If attempts is 1, just return fn().
//
// Example:
//   let count = 0;
//   const flaky = () => {
//     count++;
//     if (count < 3) return Promise.reject(new Error("not yet"));
//     return Promise.resolve("got it");
//   };
//   retry(flaky, 5) => resolves with "got it" (succeeds on 3rd try)
//
//   const alwaysFails = () => Promise.reject(new Error("nope"));
//   retry(alwaysFails, 3) => rejects with Error("nope")
//
export function retry(fn, attempts) {
  throw new Error('Implement retry');
}

// =============================================================================
// TASK 4: Fetch multiple URLs in PARALLEL
// =============================================================================
//
// You are given an array of items and a function `fetchFn(item)` that returns
// a Promise. Call fetchFn for ALL items AT THE SAME TIME (in parallel) and
// return all results as an array.
//
// HINT: Use .map() to create an array of promises, then pass that array
//       to a Promise method that waits for all of them.
//
// Example:
//   const urls = ["url1", "url2", "url3"];
//   const fetchFn = (url) => Promise.resolve(url.toUpperCase());
//   fetchParallel(urls, fetchFn) => resolves with ["URL1", "URL2", "URL3"]
//
//   fetchParallel([], fetchFn) => resolves with []
//
export function fetchParallel(items, fetchFn) {
  throw new Error('Implement fetchParallel');
}

// =============================================================================
// TASK 5: Process items SEQUENTIALLY (one at a time)
// =============================================================================
//
// You are given an array of items and a function `processFn(item)` that returns
// a Promise. Process items ONE AT A TIME, in order, collecting results into
// an array.
//
// Unlike Task 4 (where all items run at the same time), here each item must
// WAIT for the previous one to finish before starting.
//
// HINT: Use reduce() to build up a chain. Start with a resolved promise
//       containing an empty array, then for each item, chain a .then() that:
//         1. Calls processFn(item)
//         2. Adds the result to the accumulated array
//
// Example:
//   const items = ["a", "b", "c"];
//   const processFn = (item) => Promise.resolve(item.toUpperCase());
//   fetchSequential(items, processFn) => resolves with ["A", "B", "C"]
//
//   fetchSequential([], processFn) => resolves with []
//
export function fetchSequential(items, processFn) {
  throw new Error('Implement fetchSequential');
}

// =============================================================================
// TASK 6: Fetch with fallback and cleanup
// =============================================================================
//
// You are given:
//   - promise: a Promise
//   - fallback: a value to use if the promise rejects
//   - logFn: a function to call when the promise settles (regardless of outcome)
//
// Return a Promise that:
//   1. If promise resolves, return its value
//   2. If promise rejects, return the fallback value (catch and recover)
//   3. Always call logFn("done") at the end (regardless of resolve/reject)
//
// HINT: Chain .then(), .catch(), and .finally(). Think about the ORDER.
//       .catch() should return the fallback to recover from errors.
//
// Example:
//   robustFetch(Promise.resolve(42), 0, () => {}) => resolves with 42
//   robustFetch(Promise.reject(new Error("fail")), "default", () => {}) => resolves with "default"
//
export function robustFetch(promise, fallback, logFn) {
  throw new Error('Implement robustFetch');
}
