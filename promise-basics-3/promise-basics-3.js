// PROMISE BASICS 3 - Practice Exercise
//
// This exercise reinforces what you learned in promise-basics 1 & 2,
// and introduces MULTI-STEP .then() CHAINING and DELAYED PROMISES.
//
// NEW CONCEPTS:
//   - Chaining multiple .then() calls (each transforms the data further)
//   - Using setTimeout inside new Promise()
//
// REVIEWED CONCEPTS:
//   - Promise.resolve / Promise.reject
//   - .then() and .catch()
//   - Promise.all()
//   - new Promise() constructor
//
// HINT: Read the test file (promise-basics-3.spec.js) if you're unsure
// what's expected. Tests show exactly what each function should do.

// =============================================================================
// TASK 1: Double a number and then format it
// =============================================================================
//
// You are given a Promise that resolves with a number.
// Chain TWO .then() calls:
//   - First .then(): double the number
//   - Second .then(): turn it into the string "Result: <doubled>"
//
// Example:
//   doubleAndFormat(Promise.resolve(5))
//     => resolves with "Result: 10"
//   doubleAndFormat(Promise.resolve(0))
//     => resolves with "Result: 0"
//
// HINT:
//   promise
//     .then(num => num * 2)
//     .then(doubled => "Result: " + doubled)
//
export function doubleAndFormat(promise) {
  throw new Error('Implement doubleAndFormat');
}

// =============================================================================
// TASK 2: Get names of top students
// =============================================================================
//
// You are given an array of Promises. Each promise resolves with a student
// object: { name: "Merin", grade: 85 }
//
// Return a Promise that resolves with an array of names where grade >= 70.
//
// Example:
//   const students = [
//     Promise.resolve({ name: "Merin", grade: 85 }),
//     Promise.resolve({ name: "Alex", grade: 60 }),
//     Promise.resolve({ name: "Sam", grade: 72 }),
//   ];
//   getTopStudents(students)  => resolves with ["Merin", "Sam"]
//
// HINT: Use Promise.all() to get all student objects.
//   Then use .then() with filter() and map().
//   You know all these array methods already!
//
export function getTopStudents(studentPromises) {
  throw new Error('Implement getTopStudents');
}

// =============================================================================
// TASK 3: Extract a nested property with a fallback
// =============================================================================
//
// You are given a Promise that resolves with a user object:
//   { profile: { email: "merin@example.com" } }
//
// Use .then() to extract the email string.
// If the promise rejects (or anything goes wrong), return "no email"
// using .catch().
//
// Example:
//   extractEmail(Promise.resolve({ profile: { email: "merin@example.com" } }))
//     => resolves with "merin@example.com"
//   extractEmail(Promise.reject(new Error("fail")))
//     => resolves with "no email"
//
export function extractEmail(userPromise) {
  throw new Error('Implement extractEmail');
}

// =============================================================================
// TASK 4: Validate age, then build a greeting
// =============================================================================
//
// You are given a Promise that resolves with a person object:
//   { name: "Merin", age: 25 }
//
// Chain TWO .then() calls:
//   - First .then(): check if age >= 18
//     - If yes, pass the name along (return name)
//     - If no, throw new Error("underage")
//   - Second .then(): turn the name into "Hello, <name>!"
//
// Add a .catch() that returns "access denied"
//
// Example:
//   greetIfAdult(Promise.resolve({ name: "Merin", age: 25 }))
//     => resolves with "Hello, Merin!"
//   greetIfAdult(Promise.resolve({ name: "Kid", age: 12 }))
//     => resolves with "access denied"
//   greetIfAdult(Promise.reject(new Error("fail")))
//     => resolves with "access denied"
//
// HINT: You can throw inside .then() to trigger .catch()!
//   .then(person => {
//     if (person.age < 18) throw new Error("underage");
//     return person.name;
//   })
//
export function greetIfAdult(personPromise) {
  throw new Error('Implement greetIfAdult');
}

// =============================================================================
// TASK 5: Count total quantity from item promises
// =============================================================================
//
// You are given an array of Promises. Each promise resolves with an item
// object: { product: "Book", quantity: 3 }
//
// Return a Promise that resolves with the TOTAL quantity (sum of all).
//
// Example:
//   const items = [
//     Promise.resolve({ product: "Book", quantity: 3 }),
//     Promise.resolve({ product: "Pen", quantity: 1 }),
//     Promise.resolve({ product: "Bag", quantity: 2 }),
//   ];
//   countItems(items)  => resolves with 6
//   countItems([])     => resolves with 0
//
// HINT: Same pattern as getTotalPrice from exercise 2, but summing quantity.
//
export function countItems(itemPromises) {
  throw new Error('Implement countItems');
}

// =============================================================================
// TASK 6: Create a delayed promise (NEW CONCEPT!)
// =============================================================================
//
// Given a value and a delay in milliseconds, return a Promise that resolves
// with the value AFTER the given delay.
//
// Example:
//   delayResolve("hello", 100)
//     => after 100ms, resolves with "hello"
//   delayResolve(42, 200)
//     => after 200ms, resolves with 42
//
// HINT: Use new Promise((resolve) => { ... }) with setTimeout.
//   setTimeout is a built-in function that runs a callback after a delay:
//     setTimeout(() => resolve(value), delay)
//
//   This is the same new Promise() pattern you already know, but instead
//   of calling resolve() immediately, you wait for the timer.
//
export function delayResolve(value, delay) {
  throw new Error('Implement delayResolve');
}
