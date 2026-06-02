// PROMISE BASICS 4 - Practice Exercise
//
// This exercise introduces new Promise methods and patterns.
// No hints are provided. Read the test file if you're stuck.
//
// NEW CONCEPTS:
//   - Promise.allSettled() - waits for ALL promises, even if some reject
//   - .finally() - runs code after a promise settles, regardless of outcome
//   - Promise.race() - settles with the first promise that completes
//   - Returning a promise from inside .then()
//
// REVIEWED CONCEPTS:
//   - Everything from exercises 1, 2, and 3

// =============================================================================
// TASK 1: Get results from ALL promises (even rejected ones)
// =============================================================================
//
// You are given an array of Promises. Unlike Promise.all(), which rejects
// if ANY promise rejects, Promise.allSettled() waits for ALL of them and
// gives you an array of result objects.
//
// Each result object looks like:
//   { status: "fulfilled", value: <the resolved value> }   - for resolved promises
//   { status: "rejected", reason: <the error> }            - for rejected promises
//
// Return a Promise that resolves with an array of these result objects.
//
// Example:
//   const promises = [
//     Promise.resolve(10),
//     Promise.reject(new Error("bad")),
//     Promise.resolve(30),
//   ];
//   allResults(promises)
//     => resolves with [
//          { status: "fulfilled", value: 10 },
//          { status: "rejected", reason: Error("bad") },
//          { status: "fulfilled", value: 30 },
//        ]
//
export function allResults(promises) {
  throw new Error('Implement allResults');
}

// =============================================================================
// TASK 2: Count how many promises succeeded
// =============================================================================
//
// You are given an array of Promises (some may resolve, some may reject).
// Return a Promise that resolves with the NUMBER of promises that resolved
// successfully (i.e., status === "fulfilled").
//
// Example:
//   const promises = [
//     Promise.resolve("ok"),
//     Promise.reject(new Error("fail")),
//     Promise.resolve("also ok"),
//   ];
//   countSuccesses(promises) => resolves with 2
//
//   countSuccesses([Promise.resolve(1), Promise.resolve(2)])
//     => resolves with 2
//
//   countSuccesses([Promise.reject(new Error("a")), Promise.reject(new Error("b"))])
//     => resolves with 0
//
export function countSuccesses(promises) {
  throw new Error('Implement countSuccesses');
}

// =============================================================================
// TASK 3: Add a cleanup step with .finally()
// =============================================================================
//
// You are given a Promise. Add a .then() that returns the value unchanged,
// and a .finally() that calls the provided `cleanupFn` function.
//
// The .finally() should run regardless of whether the promise resolved
// or rejected. The original value (or error) should pass through unchanged.
//
// Example:
//   let cleaned = false;
//   withCleanup(Promise.resolve(42), () => { cleaned = true; })
//     => resolves with 42, and cleaned becomes true
//
//   withCleanup(Promise.reject(new Error("fail")), () => { cleaned = true; })
//     => rejects with Error("fail"), and cleaned becomes true
//
export function withCleanup(promise, cleanupFn) {
  throw new Error('Implement withCleanup');
}

// =============================================================================
// TASK 4: Race - first promise to settle wins
// =============================================================================
//
// You are given an array of Promises. Return a Promise that settles (resolves
// or rejects) with the SAME outcome as the FIRST promise to settle.
//
// Example:
//   const promises = [
//     new Promise(resolve => setTimeout(() => resolve("slow"), 200)),
//     new Promise(resolve => setTimeout(() => resolve("fast"), 50)),
//   ];
//   firstResult(promises) => resolves with "fast"
//
//   const mixed = [
//     new Promise((_, reject) => setTimeout(() => reject(new Error("err")), 10)),
//     new Promise(resolve => setTimeout(() => resolve("late"), 100)),
//   ];
//   firstResult(mixed) => rejects with Error("err")
//
export function firstResult(promises) {
  throw new Error('Implement firstResult');
}

// =============================================================================
// TASK 5: Fetch user, then fetch their orders
// =============================================================================
//
// You are given:
//   - userPromise: a Promise that resolves with a user object { id: 5, name: "Merin" }
//   - fetchOrders: a function that takes a userId and returns a Promise
//     that resolves with an array of order IDs
//
// Chain them: first get the user, then use the user's id to call fetchOrders,
// and return the resulting array of order IDs.
//
// Example:
//   const userPromise = Promise.resolve({ id: 5, name: "Merin" });
//   const fetchOrders = (userId) => Promise.resolve([101, 102, 103]);
//   fetchUserOrders(userPromise, fetchOrders) => resolves with [101, 102, 103]
//
//   const userPromise2 = Promise.resolve({ id: 2, name: "Alex" });
//   const fetchOrders2 = (userId) => Promise.resolve([201]);
//   fetchUserOrders(userPromise2, fetchOrders2) => resolves with [201]
//
export function fetchUserOrders(userPromise, fetchOrders) {
  throw new Error('Implement fetchUserOrders');
}

// =============================================================================
// TASK 6: Validate, transform, and delay - combining everything
// =============================================================================
//
// You are given a Promise that resolves with a string.
//
// Chain the following steps:
//   1. Check if the string length is >= 3
//      - If yes, pass the string along
//      - If no, throw new Error("too short")
//   2. Convert the string to uppercase
//   3. Wait 50ms, then resolve with the uppercase string
//      (use the delayResolve pattern from exercise 3)
//   4. If anything goes wrong, catch and return the string "error"
//
// Example:
//   validateTransformDelay(Promise.resolve("hello"))
//     => after 50ms, resolves with "HELLO"
//   validateTransformDelay(Promise.resolve("hi"))
//     => resolves with "error"  (string too short)
//   validateTransformDelay(Promise.reject(new Error("fail")))
//     => resolves with "error"
//
export function validateTransformDelay(stringPromise) {
  throw new Error('Implement validateTransformDelay');
}
