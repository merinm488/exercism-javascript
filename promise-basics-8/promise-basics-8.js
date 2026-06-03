// PROMISE BASICS 8 - Practice Exercise
//
// This exercise gives you more practice with promise patterns, including
// a new concept: Promise.race() for timeouts.
//
// CONCEPTS:
//   - Timeout pattern with Promise.race()
//   - Sequential filter (async version of .filter())
//   - Retry with capped delay (backoff stops increasing at a max)
//   - First resolved: try sequentially until one succeeds
//   - Parallel fetch with object lookup

// =============================================================================
// TASK 1: Timeout with Promise.race()
// =============================================================================
//
// You are given a function `fn` that returns a Promise and a number `ms`.
// Call fn(). If it resolves within `ms` milliseconds, return its value.
// If it takes longer than `ms` milliseconds, reject with Error("Timed out").
//
// HINT: Use Promise.race() with two promises:
//   1. fn() — the actual operation
//   2. A delay promise that rejects after ms milliseconds
//
// Promise.race() returns the result of whichever promise settles first.
// If the delay rejects first, you get the timeout error.
// If fn() resolves first, you get its value.
//
// Example:
//   const slow = () => new Promise(resolve => setTimeout(() => resolve("late"), 200));
//   withTimeout(slow, 50) => rejects with Error("Timed out")
//
//   const fast = () => Promise.resolve("quick");
//   withTimeout(fast, 100) => resolves with "quick"
//
export function withTimeout(fn, ms) {
  throw new Error('Implement withTimeout');
}

// =============================================================================
// TASK 2: Sequential filter (async .filter())
// =============================================================================
//
// You are given an array of items and a function `testFn(item)` that returns
// a Promise (resolves to true or false). Test items ONE AT A TIME and return
// an array of only the items where testFn resolved to true.
//
// This is the async version of .filter().
//
// HINT: Same reduce() pattern as sequentialMap, but instead of always
//       appending the result, you only append the item if the result is true:
//         testFn(curr).then(passed => passed ? [...acc, curr] : acc)
//
// Example:
//   const items = [1, 2, 3, 4, 5];
//   const isBig = (n) => Promise.resolve(n > 3);
//   sequentialFilter(items, isBig) => [4, 5]
//
//   sequentialFilter([], isBig) => []
//
export function sequentialFilter(items, testFn) {
  throw new Error('Implement sequentialFilter');
}

// =============================================================================
// TASK 3: Retry with capped exponential backoff
// =============================================================================
//
// Same as retryBackoff from exercise 7, but with one difference: the delay
// doubles each time ONLY up to `maxDelay`. Once the delay would exceed
// maxDelay, use maxDelay instead.
//
//   retryCapped(fn, 4, 100, 300) means:
//     1st try fails -> wait 100ms (min(100, 300))
//     2nd try fails -> wait 200ms (min(200, 300))
//     3rd try fails -> wait 300ms (min(400, 300) -> capped at 300)
//     4th try succeeds -> return value
//
// HINT: Same recursive pattern, but when recursing, pass:
//         Math.min(delayMs * 2, maxDelay)  as the new delay
//       Don't forget to also pass maxDelay through to the recursive call.
//
// Example:
//   let count = 0;
//   const flaky = () => {
//     count++;
//     if (count < 3) return Promise.reject(new Error("not yet"));
//     return Promise.resolve("done");
//   };
//   retryCapped(flaky, 5, 50, 200) => resolves with "done"
//
//   const alwaysFails = () => Promise.reject(new Error("nope"));
//   retryCapped(alwaysFails, 3, 50, 200) => rejects with Error("nope")
//
export function retryCapped(fn, attempts, delayMs, maxDelay) {
  throw new Error('Implement retryCapped');
}

// =============================================================================
// TASK 4: First resolved — try sequentially until one succeeds
// =============================================================================
//
// You are given an array of functions that each return a Promise.
// Try them SEQUENTIALLY:
//   - If a function resolves, return its value immediately
//   - If a function rejects, try the next one
//   - If ALL functions reject, reject with Error("All failed")
//
// This is simpler than findMatching from exercise 7 — there is no condition
// check. You just return the first successful result.
//
// HINT: Same recursive pattern:
//   - Base case: fns is empty -> reject
//   - fns[0]() resolves -> return value
//   - fns[0]() rejects -> recurse with fns.slice(1)
//
// Example:
//   const fns = [
//     () => Promise.reject(new Error("a")),
//     () => Promise.reject(new Error("b")),
//     () => Promise.resolve("found"),
//   ];
//   firstResolved(fns) => resolves with "found"
//
//   const allFail = [
//     () => Promise.reject(new Error("x")),
//     () => Promise.reject(new Error("y")),
//   ];
//   firstResolved(allFail) => rejects with Error("All failed")
//
//   firstResolved([]) => rejects with Error("All failed")
//
export function firstResolved(fns) {
  throw new Error('Implement firstResolved');
}
