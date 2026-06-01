// PROMISE BASICS - Practice Exercise
//
// This exercise has 6 tasks, going from simple to more advanced.
// Read each comment, then implement the function below it.
//
// HINT: The test file (promise-basics.spec.js) shows exactly what each
// function should do. Read it whenever you're unsure what's expected.

// =============================================================================
// TASK 1: Create a resolved promise
// =============================================================================
//
// Return a Promise that resolves with the given value.
//
// Example:
//   resolveWithValue(42)     => a promise that resolves with 42
//   resolveWithValue("hello") => a promise that resolves with "hello"
//
// HINT: Use Promise.resolve(value)
//
export function resolveWithValue(value) {
  return Promise.resolve(value)
  
}

// =============================================================================
// TASK 2: Create a rejected promise
// =============================================================================
//
// Return a Promise that rejects with an Error containing the given message.
//
// Example:
//   rejectWithError("something broke") => a promise that rejects with Error("something broke")
//
// HINT: Use Promise.reject(new Error(message))
//
export function rejectWithError(message) {
  return Promise.reject(new Error(message))
}

// =============================================================================
// TASK 3: Extract data from a promise using .then()
// =============================================================================
//
// You are given a Promise that resolves with a student object: { name: "Merin", score: 90 }
// Return a new Promise that resolves with just the score (a number).
//
// Example:
//   const studentPromise = Promise.resolve({ name: "Merin", score: 90 });
//   getScore(studentPromise) => a promise that resolves with 90
//
// HINT: Use .then() to transform the value
//   promise.then((result) => result.score)
//
export function getScore(studentPromise) {
  return studentPromise.then(value => {
    return value.score
  })
}

// =============================================================================
// TASK 4: Handle errors using .catch()
// =============================================================================
//
// You are given a Promise that may resolve or may reject.
// If it resolves, return the value as-is.
// If it rejects, return the string "recovered" (don't let the error propagate).
//
// Example:
//   const goodPromise = Promise.resolve("ok");
//   safelyGet(goodPromise) => a promise that resolves with "ok"
//
//   const badPromise = Promise.reject(new Error("fail"));
//   safelyGet(badPromise) => a promise that resolves with "recovered"
//
// HINT: Use .catch() to handle the rejection
//   promise.catch(() => "recovered")
//   But you need to handle BOTH cases (resolve AND reject).
//   Think about chaining .then() and .catch()
//
export function safelyGet(promise) {
  return promise.then(value =>{
    return value
  })
  .catch(() => {
    return 'recovered'
  })
}

// =============================================================================
// TASK 5: Wait for multiple promises using Promise.all()
// =============================================================================
//
// You are given an array of Promises. Return a single Promise that:
// - resolves with an array of ALL the values (in the same order), if all succeed
// - rejects with the first error, if any one fails
//
// Example:
//   getAll([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)])
//   => a promise that resolves with [1, 2, 3]
//
// HINT: Use Promise.all(promiseArray)
//
export function getAll(promiseArray) {
  return Promise.all(promiseArray)
}

// =============================================================================
// TASK 6: Wrap a callback-based function in a Promise
// =============================================================================
//
// You are given a function `callbackFn` that takes a callback.
// The callback receives either:
//   - null on success (meaning no error)
//   - an Error object on failure
//
// Wrap this in a Promise so that:
// - If the callback receives null, the promise resolves with "success"
// - If the callback receives an Error, the promise rejects with that Error
//
// Example:
//   function sayHi(callback) {
//     callback(null);  // success
//   }
//   wrapCallback(sayHi) => a promise that resolves with "success"
//
//   function sayFail(callback) {
//     callback(new Error("oops"));  // failure
//   }
//   wrapCallback(sayFail) => a promise that rejects with Error("oops")
//
// HINT: Use new Promise((resolve, reject) => { ... })
//   Inside, call callbackFn with YOUR OWN callback function.
//   In YOUR callback, check if the argument is null or an Error.
//
export function wrapCallback(callbackFn) {
  return new Promise((resolve,reject) => {
    callbackFn((parameter) => {
      if (parameter === null)
      {
        resolve('success')
      }
      else
      {
        reject(parameter)
      }
    })
  })


}
