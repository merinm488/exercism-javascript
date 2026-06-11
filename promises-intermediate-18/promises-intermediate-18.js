// PROMISES INTERMEDIATE 18 - Practice Exercise
//

// =============================================================================
// TASK 1: reduceAsync — async version of Array.reduce
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - fn(acc, item): an async function (returns a Promise) that takes the
//     current accumulator and current item, and returns a new accumulator value
//   - initialValue: the starting value for the accumulator
//
// Apply fn to each item SEQUENTIALLY, building up a single result.
// Start with initialValue as the accumulator. For each item, call
// fn(currentAcc, item), wait for it to resolve, and use that as the new
// accumulator. Return the final accumulator value.
//
// If fn rejects for any item, stop and reject with that error.
// If items is empty, resolve with initialValue.
//
// Example:
//   const items = [1, 2, 3, 4];
//   const asyncSum = (acc, item) => Promise.resolve(acc + item);
//
//   reduceAsync(items, asyncSum, 0) => 10
//   // 0 + 1 = 1, then 1 + 2 = 3, then 3 + 3 = 6, then 6 + 4 = 10
//
//   const words = ["hello", "world"];
//   const asyncJoin = (acc, word) => Promise.resolve(acc + " " + word);
//   reduceAsync(words, asyncJoin, "") => " hello world"
//
//   reduceAsync([], asyncSum, 0) => 0
//
// HINT:
//   Think about how you used reduce with promises in mapSeries. The pattern is
//   similar — you're chaining promises one after another. But instead of
//   building an array, you're building up a single accumulated value. What
//   should your initial promise resolve to?

export function reduceAsync(items, fn, initialValue) {
  // Your code here
}

// =============================================================================
// TASK 2: timeoutPromise — reject if a promise takes too long
// =============================================================================
//
// You are given:
//   - promise: a Promise that may take some time to settle
//   - ms: a time limit in milliseconds
//
// Return a new Promise that:
//   - Resolves with the same value if `promise` settles within `ms` milliseconds
//   - Rejects with Error("timed out") if `promise` hasn't settled in time
//
// Example:
//   const slow = new Promise(r => setTimeout(() => r("done"), 200));
//   timeoutPromise(slow, 50) => rejects with Error("timed out")
//
//   const fast = Promise.resolve("quick");
//   timeoutPromise(fast, 1000) => resolves with "quick"
//
// HINT:
//   You need TWO promises racing against each other: the original one, and a
//   timer promise that rejects after ms milliseconds. Which Promise method
//   lets you wait for the FIRST one to settle? You'll need to create a new
//   promise that rejects after a setTimeout.

export function timeoutPromise(promise, ms) {
  // Your code here
}

// =============================================================================
// TASK 3: someAsync — async version of Array.some (sequential)
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - predicateFn(item): an async function that returns true or false
//
// Run predicateFn on items SEQUENTIALLY (one at a time). Return true as soon
// as ONE item passes (predicateFn resolves to true). If all items fail,
// return false. This is the async version of Array.some.
//
// Stop checking as soon as you find a passing item (short-circuit).
//
// Example:
//   someAsync([1, 2, 3, 4], n => Promise.resolve(n > 3)) => true
//   someAsync([1, 2, 3], n => Promise.resolve(n > 10)) => false
//   someAsync([], n => Promise.resolve(true)) => false
//
// HINT:
//   This is similar to mapSeries in structure — you process items one at a
//   time. But instead of collecting results, you check each one and return
//   early when you find a true. Think about how you'd use reduce or a loop
//   that chains promises, but stops early when the condition is met.

export function someAsync(items, predicateFn) {
  // Your code here
}

// =============================================================================
// TASK 4: everyAsync — async version of Array.every (parallel)
// =============================================================================
//
// You are given:
//   - items: an array of values
//   - predicateFn(item): an async function that returns true or false
//
// Run predicateFn on ALL items IN PARALLEL. Return true only if EVERY item
// passes (predicateFn resolves to true for all). If any item fails
// (resolves to false), return false.
//
// Example:
//   everyAsync([2, 4, 6], n => Promise.resolve(n % 2 === 0)) => true
//   everyAsync([2, 3, 6], n => Promise.resolve(n % 2 === 0)) => false
//   everyAsync([], n => Promise.resolve(true)) => true
//
// HINT:
//   This is very similar to filterAsync from exercise 17. You already know
//   how to run all predicates in parallel and get back an array of booleans.
//   Once you have that array, what built-in array method tells you if ALL
//   values are true?

export function everyAsync(items, predicateFn) {
  // Your code here
}

// =============================================================================
// TASK 5: waterfall — run async functions in sequence, passing results forward
// =============================================================================
//
// You are given an array of functions, where each function takes one argument
// and returns a Promise. Run them in sequence, where the result of each
// function becomes the input to the next.
//
// If the array is empty, return initialValue unchanged.
// If any function rejects, stop and reject with that error.
//
// Example:
//   const addOne = x => Promise.resolve(x + 1);
//   const double = x => Promise.resolve(x * 2);
//   const subtract = x => Promise.resolve(x - 3);
//
//   waterfall([addOne, double, subtract], 5)
//   // 5 → addOne → 6 → double → 12 → subtract → 9
//   // returns 9
//
//   waterfall([], 42) => 42
//
// HINT:
//   This is similar to mapSeries and reduceAsync — you're processing things
//   one at a time. Think about reduce: you start with initialValue, and for
//   each function, you call it with the current accumulated value. The result
//   becomes the new accumulated value for the next function.

export function waterfall(fns, initialValue) {
  // Your code here
}

// =============================================================================
// TASK 6: attempt — wrap a promise so it never rejects
// =============================================================================
//
// You are given a function fn that returns a Promise.
// Return a NEW function that:
//   - Calls fn with the same arguments
//   - Always resolves (never rejects)
//   - Resolves with an object:
//       { ok: true, value: result }  if fn succeeds
//       { ok: false, error: err }    if fn rejects
//
// Example:
//   const safeParse = attempt((json) => {
//     const parsed = JSON.parse(json);
//     return Promise.resolve(parsed);
//   });
//
//   safeParse('{"a":1}') => { ok: true, value: { a: 1 } }
//   safeParse('invalid') => { ok: false, error: SyntaxError }
//
//   const safeFetch = attempt((url) => Promise.resolve("data: " + url));
//   safeFetch("/test") => { ok: true, value: "data: /test" }
//
// HINT:
//   You need to return a function (like toPromise). Inside, call fn and handle
//   both outcomes. How do you handle both resolve and reject on a promise and
//   turn either case into a resolve? Think about .then() — it takes two
//   arguments: the success handler and the error handler. What if both
//   handlers return a similar object structure?

export function attempt(fn) {
  // Your code here
}
