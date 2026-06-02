// PROMISE BASICS 6 - Practice Exercise
//
// This exercise reinforces the same Promise patterns from exercise 5
// with different scenarios. The concepts are the same — the goal is practice.
//
// CONCEPTS (same as exercise 5):
//   - Promise.race() - first to settle (resolve OR reject)
//   - Promise.allSettled() - wait for all, get every outcome
//   - Timeout pattern - racing a promise against a timer
//   - Retry pattern - retrying a failed operation
//   - Parallel execution - Promise.all()
//   - Sequential execution - reduce() chain
//   - Error recovery - .catch() and .finally()

// =============================================================================
// TASK 1: Get the first promise to SETTLE - Promise.race()
// =============================================================================
//
// You are given an array of Promises. Return a Promise that settles with
// whichever promise settles FIRST — whether it resolves OR rejects.
//
// Unlike Promise.any() (from exercise 5), this does NOT skip rejections.
// Whatever happens first, wins.
//
// Example:
//   const promises = [
//     new Promise(resolve => setTimeout(() => resolve("slow"), 100)),
//     new Promise(resolve => setTimeout(() => resolve("fast"), 10)),
//   ];
//   firstSettled(promises) => resolves with "fast"
//
//   const rejects = [
//     Promise.reject(new Error("boom")),
//     Promise.resolve("too late"),
//   ];
//   firstSettled(rejects) => rejects with Error("boom")
//
export function firstSettled(promises) {
  throw new Error('Implement firstSettled');
}

// =============================================================================
// TASK 2: Get ALL results, whether success or failure - Promise.allSettled()
// =============================================================================
//
// You are given an array of functions that each return a Promise. Call every
// function and return ALL results as an array of objects with this shape:
//
//   On success:  { status: "fulfilled", value: <the resolved value> }
//   On failure:  { status: "rejected", reason: <the error> }
//
// HINT: Use Promise.allSettled(). It never rejects — it always resolves with
//       an array of settlement objects.
//
// Example:
//   const fns = [
//     () => Promise.resolve(10),
//     () => Promise.reject(new Error("bad")),
//     () => Promise.resolve(30),
//   ];
//   allResults(fns) => [
//     { status: "fulfilled", value: 10 },
//     { status: "rejected", reason: Error("bad") },
//     { status: "fulfilled", value: 30 },
//   ]
//
export function allResults(fns) {
  throw new Error('Implement allResults');
}

// =============================================================================
// TASK 3: Retry with a delay between attempts
// =============================================================================
//
// You are given a function `fn` that returns a Promise, a number `attempts`,
// and a number `delayMs`. Call `fn()` up to `attempts` times:
//   - If fn() resolves, return its value immediately
//   - If fn() rejects and you still have attempts left, WAIT `delayMs`
//     milliseconds, then try again
//   - If all attempts fail, reject with the LAST error
//
// HINT: This is like the retry from exercise 5, but after a failure you need
//       to wait before retrying. You can create a helper that returns a promise
//       that resolves after `delayMs` using setTimeout, then chain the retry
//       after it:
//
//       fn().catch(() => {
//         return delay(delayMs).then(() => retryWithDelay(fn, attempts - 1, delayMs));
//       });
//
// Example:
//   let count = 0;
//   const flaky = () => {
//     count++;
//     if (count < 3) return Promise.reject(new Error("not yet"));
//     return Promise.resolve("got it");
//   };
//   retryWithDelay(flaky, 5, 100) => resolves with "got it" (after ~200ms of delays)
//
//   const alwaysFails = () => Promise.reject(new Error("nope"));
//   retryWithDelay(alwaysFails, 3, 50) => rejects with Error("nope")
//
export function retryWithDelay(fn, attempts, delayMs) {
  throw new Error('Implement retryWithDelay');
}

// =============================================================================
// TASK 4: Fetch in parallel and collect only successes
// =============================================================================
//
// You are given an array of items and a function `fetchFn(item)` that returns
// a Promise. Call fetchFn for ALL items in parallel, but return ONLY the
// successful results as an array (ignore failures).
//
// HINT: Use Promise.allSettled() with .map() (like Task 2), then filter out
//       the rejected results and extract just the values.
//
// Example:
//   const items = ["ok1", "bad", "ok2"];
//   const fetchFn = (item) => {
//     if (item === "bad") return Promise.reject(new Error("fail"));
//     return Promise.resolve(item.toUpperCase());
//   };
//   fetchSuccessful(items, fetchFn) => ["OK1", "OK2"]
//
//   fetchSuccessful([], fetchFn) => []
//
export function fetchSuccessful(items, fetchFn) {
  throw new Error('Implement fetchSuccessful');
}

// =============================================================================
// TASK 5: Process items SEQUENTIALLY into an object
// =============================================================================
//
// You are given an array of objects with `key` and `value` properties, and
// a function `processFn(obj)` that returns a Promise resolving to a
// transformed value. Process objects ONE AT A TIME, building an object
// where each key maps to the processed result.
//
// HINT: Same reduce() pattern as exercise 5 Task 5, but instead of pushing
//       to an array, you're adding a key to an object.
//
// Example:
//   const items = [
//     { key: "name", value: "alice" },
//     { key: "city", value: "london" },
//   ];
//   const processFn = (obj) => Promise.resolve(obj.value.toUpperCase());
//   buildObject(items, processFn) => { name: "ALICE", city: "LONDON" }
//
//   buildObject([], processFn) => {}
//
export function buildObject(items, processFn) {
  throw new Error('Implement buildObject');
}

// =============================================================================
// TASK 6: Try promises one at a time until one succeeds
// =============================================================================
//
// You are given an array of functions that each return a Promise. Try them
// SEQUENTIALLY (one at a time) until one succeeds:
//   - Call the first function. If it resolves, return its value.
//   - If it rejects, try the next function.
//   - If ALL functions reject, reject with the LAST error.
//
// HINT: This is similar to the retry pattern but instead of calling the same
//       function again, you're calling the NEXT function in the array.
//       Use a recursive approach with an index to track position.
//
// Example:
//   const fns = [
//     () => Promise.reject(new Error("fail 1")),
//     () => Promise.reject(new Error("fail 2")),
//     () => Promise.resolve("success"),
//     () => Promise.resolve("never reached"),
//   ];
//   trySequential(fns) => resolves with "success"
//
//   const allBad = [
//     () => Promise.reject(new Error("a")),
//     () => Promise.reject(new Error("b")),
//   ];
//   trySequential(allBad) => rejects with Error("b")
//
//   trySequential([]) => rejects with Error("No functions to try")
//
export function trySequential(fns) {
  throw new Error('Implement trySequential');
}
