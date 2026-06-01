// PROMISE BASICS 2 - Practice Exercise
//
// This exercise builds on what you learned in promise-basics.
// 6 tasks again, same concepts but different scenarios.
//
// CONCEPTS USED:
//   - Promise.resolve / Promise.reject
//   - .then() for transforming data
//   - Chaining multiple .then() calls
//   - .catch() for error handling
//   - Promise.all() for waiting on multiple promises
//   - new Promise() constructor
//
// HINT: Read the test file (promise-basics-2.spec.js) if you're unsure
// what's expected. Tests show exactly what each function should do.

// =============================================================================
// TASK 1: Create a welcome message promise
// =============================================================================
//
// Given a name (string), return a Promise that resolves with the welcome
// message: "Welcome, <name>!"
//
// Example:
//   welcome("Merin")  => resolves with "Welcome, Merin!"
//   welcome("Alex")   => resolves with "Welcome, Alex!"
//
export function welcome(name) {
  throw new Error('Implement welcome');
}

// =============================================================================
// TASK 2: Create an age validation promise
// =============================================================================
//
// Given an age (number), return a Promise that:
//   - resolves with the string "allowed" if age is 18 or above
//   - rejects with an Error("too young") if age is below 18
//
// Example:
//   validateAge(25)  => resolves with "allowed"
//   validateAge(15)  => rejects with Error("too young")
//
// HINT: You need to use an if/else AND return a Promise.
//   Think: "which Promise method creates a resolved promise?"
//   and   "which Promise method creates a rejected promise?"
//
export function validateAge(age) {
  throw new Error('Implement validateAge');
}

// =============================================================================
// TASK 3: Extract the capital city from a country promise
// =============================================================================
//
// You are given a Promise that resolves with a country object:
//   { name: "India", capital: "New Delhi", population: 1400000000 }
//
// Return a new Promise that resolves with just the capital (a string).
//
// Example:
//   const india = Promise.resolve({ name: "India", capital: "New Delhi", population: 1400000000 });
//   getCapital(india)  => resolves with "New Delhi"
//
// HINT: This is just like Task 3 from the previous exercise.
//   Use .then() to extract the capital property.
//
export function getCapital(countryPromise) {
  throw new Error('Implement getCapital');
}

// =============================================================================
// TASK 4: Double a number from a promise, with error recovery
// =============================================================================
//
// You are given a Promise that may resolve with a number or may reject.
// - If it resolves with a number, return a new Promise that resolves with
//   that number doubled (multiplied by 2)
// - If it rejects, return a Promise that resolves with 0 (zero)
//
// Example:
//   doubleOrZero(Promise.resolve(5))   => resolves with 10
//   doubleOrZero(Promise.resolve(3))   => resolves with 6
//   doubleOrZero(Promise.reject(...))  => resolves with 0
//
// HINT: Chain .then() and .catch() like you did in the previous exercise.
//   The .then() should transform the number.
//   The .catch() should return 0.
//
export function doubleOrZero(promise) {
  throw new Error('Implement doubleOrZero');
}

// =============================================================================
// TASK 5: Get the total price from multiple item promises
// =============================================================================
//
// You are given an array of Promises. Each promise resolves with an object
// representing a purchased item: { name: "Book", price: 12 }
//
// Return a single Promise that resolves with the TOTAL price (sum of all
// prices).
//
// Example:
//   const items = [
//     Promise.resolve({ name: "Book", price: 12 }),
//     Promise.resolve({ name: "Pen", price: 3 }),
//     Promise.resolve({ name: "Bag", price: 25 }),
//   ];
//   getTotalPrice(items)  => resolves with 40
//
// HINT: First use Promise.all() to get all the item objects.
//   Then use .then() to sum up the prices with reduce().
//   You've used reduce() before in earlier exercises!
//
export function getTotalPrice(itemPromises) {
  throw new Error('Implement getTotalPrice');
}

// =============================================================================
// TASK 6: Wrap a callback-based function that returns data
// =============================================================================
//
// You are given a function `fetchData` that takes a callback.
// The callback receives TWO arguments:
//   - error: null on success, or an Error object on failure
//   - data: the result on success, or undefined on failure
//
// Wrap this in a Promise so that:
//   - If error is null, the promise resolves with data
//   - If error is an Error, the promise rejects with that Error
//
// Example:
//   function getUser(cb) {
//     cb(null, { name: "Merin" });   // success, data = { name: "Merin" }
//   }
//   promisify(getUser) => resolves with { name: "Merin" }
//
//   function failingFetch(cb) {
//     cb(new Error("network down"));  // failure
//   }
//   promisify(failingFetch) => rejects with Error("network down")
//
// HINT: This is like Task 6 from the previous exercise, but now the callback
//   receives TWO arguments instead of one. Your callback needs to accept both:
//
//   callbackFn((error, data) => {
//     // check error, then use data
//   });
//
export function promisify(fetchData) {
  throw new Error('Implement promisify');
}
