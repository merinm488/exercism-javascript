// PROMISE BASICS 9 - Practice Exercise
//
// CONCEPTS:
//   - Promise.allSettled() + building an object from results
//   - Sequential reduce that builds a string
//   - Parallel fetch with aggregated error messages
//   - Chaining .then() to transform Promise.allSettled() output into a map
//   - Combining patterns you already know in new ways

// =============================================================================
// TASK 1: Build a result map from parallel fetches
// =============================================================================
//
// You are given an array of objects, each with `key` and `url` properties,
// and a function `fetchFn(url)` that returns a Promise.
//
// Call fetchFn for ALL urls in parallel. Return an object where:
//   - For each SUCCESSFUL fetch: { [key]: value }
//   - For each FAILED fetch: { [key]: null }
//
// Example:
//   const items = [
//     { key: "user", url: "/user" },
//     { key: "posts", url: "/posts" },
//     { key: "bad", url: "/error" },
//   ];
//   const fetchFn = (url) => {
//     if (url === "/error") return Promise.reject(new Error("fail"));
//     return Promise.resolve(url + " data");
//   };
//   fetchAsMap(items, fetchFn) =>
//     { user: "/user data", posts: "/posts data", bad: null }
//
//   fetchAsMap([], fetchFn) => {}
//
// HINT:
//   1. Use Promise.allSettled() on the mapped promises
//   2. Then use .reduce() on the results array to build an object
//   3. For each result, use items[i].key as the object key
//   4. If status is "fulfilled", use result.value; if "rejected", use null
//
//   Remember: you need access to both the settlement results AND the original
//   items array (for the keys). You can use the index parameter in reduce:
//     results.reduce((acc, result, index) => { ... }, {})
//   Inside, items[index].key gives you the key for that result.

export function fetchAsMap(items, fetchFn) {
  let promises = items.map(item => fetchFn(item.url));
  return Promise.allSettled(promises).then (result => {
      return result.reduce((acc,curr,index) => {
      if (curr.status == 'fulfilled')
      {
        acc[items[index].key] = curr.value
        return acc
      }
      else
      {
        acc[items[index].key] = null
        return acc
      }
    }, {})
  })
  
}

// =============================================================================
// TASK 2: Sequential string builder
// =============================================================================
//
// You are given an array of words and a function `transformFn(word)` that
// returns a Promise resolving to a string. Process words ONE AT A TIME and
// build a single string by joining all results with a space.
//
// This is the same sequential reduce pattern you know, but instead of
// building an array, you're building a string.
//
// Example:
//   const words = ["hello", "world", "today"];
//   const upper = (w) => Promise.resolve(w.toUpperCase());
//   buildString(words, upper) => "HELLO WORLD TODAY"
//
//   buildString([], upper) => ""
//
//   buildString(["one"], upper) => "ONE"
//
// HINT:
//   Same reduce() pattern starting with Promise.resolve("").
//   For each word, call transformFn(word).then(r => ...)
//   If the accumulated string is empty, just use r.
//   Otherwise, join with a space: acc + " " + r
//   You could also use a ternary: acc ? acc + " " + r : r

export function buildString(words, transformFn) {
  return words.reduce((acc,curr) => {
    return acc.then(value => {
      return transformFn(curr).then(r => {
         return value.length ? value + ' ' + r : r
      })
    })
  },Promise.resolve(''))
}

// =============================================================================
// TASK 3: Parallel fetch with aggregated errors
// =============================================================================
//
// You are given an array of items and a function `fetchFn(item)` that returns
// a Promise. Call fetchFn for ALL items in parallel.
//
// - If ALL succeed, return the array of values
// - If ANY fail, reject with Error("Failed: msg1, msg2") where the messages
//   are from ALL the rejected promises, joined with ", "
//
// This is different from what you've done before:
//   - Promise.all() rejects with the FIRST error only
//   - Here you need to collect ALL error messages and combine them
//
// Example:
//   const items = ["a", "b", "c"];
//   const fetchFn = (item) => {
//     if (item === "b") return Promise.reject(new Error("bad b"));
//     if (item === "c") return Promise.reject(new Error("bad c"));
//     return Promise.resolve(item.toUpperCase());
//   };
//   fetchWithErrors(items, fetchFn) => rejects with Error("Failed: bad b, bad c")
//
//   const items2 = ["x", "y"];
//   const fetchFn2 = (item) => Promise.resolve(item + "!");
//   fetchWithErrors(items2, fetchFn2) => resolves with ["x!", "y!"]
//
//   fetchWithErrors([], fetchFn) => resolves with []
//
// HINT:
//   1. Use Promise.allSettled() to get all results
//   2. Check if any have status "rejected"
//   3. If there are rejections, extract their .reason.message values,
//      join them with ", ", prepend "Failed: ", and reject with that Error
//   4. If no rejections, extract all the .value properties and return them
//
//   You can use .filter() to separate fulfilled from rejected, or use a
//   single .reduce() to do it in one pass.

export function fetchWithErrors(items, fetchFn) {
  let promises = items.map(item => fetchFn(item));
  return Promise.allSettled(promises).then(value => {
    if (value.every(item => item.status === 'fulfilled'))
    {
      return value.map(item => item.value)
    }
    else
    {
      return Promise.reject(new Error('Failed: ' + value.filter(item => item.status === 'rejected')
                    .map(item => item.reason.message)
                    .join(', ')))
    }
  })
}

// =============================================================================
// TASK 4: Sequential filter into groups
// =============================================================================
//
// You are given an array of items and a function `classifyFn(item)` that
// returns a Promise resolving to a category string (e.g., "even", "odd").
//
// Process items ONE AT A TIME and return an object where each category maps
// to an array of items belonging to that category.
//
// This combines:
//   - Sequential reduce pattern (one at a time)
//   - Building an object (like buildObject from exercise 6)
//   - But instead of single values, each key maps to an ARRAY of items
//
// Example:
//   const nums = [1, 2, 3, 4, 5, 6];
//   const parity = (n) => Promise.resolve(n % 2 === 0 ? "even" : "odd");
//   groupBySequential(nums, parity) =>
//     { odd: [1, 3, 5], even: [2, 4, 6] }
//
//   groupBySequential([], parity) => {}
//
// HINT:
//   Same reduce() pattern starting with Promise.resolve({}).
//   For each item:
//     1. Call classifyFn(item) to get the category
//     2. Then update the accumulator object:
//        - If the category key already exists, append the item:
//          { ...acc, [category]: [...acc[category], item] }
//        - If it doesn't exist yet, create it:
//          { ...acc, [category]: [item] }
//        You can handle both with:
//          { ...acc, [category]: [...(acc[category] || []), item] }

export function groupBySequential(items, classifyFn) {
  return items.reduce((promise, curr,index) => {
    return promise.then(value => {
      return classifyFn(curr).then(r => {
        value[r] ? (value[r] = [...value[r], curr]) : value[r] = [curr]
        return value
      })
    })
  }, Promise.resolve({}))
}
