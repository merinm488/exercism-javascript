// PROMISES INTERMEDIATE 14 - Practice Exercise
//
// =============================================================================
// TASK 1: allSettledReport — run all, report successes and failures
// =============================================================================
//
// You are given an array of functions. Each function returns a Promise.
// Call ALL of them (in parallel), and return an object with two arrays:
//
//   {
//     fulfilled: [values from successful promises],
//     rejected:  [error messages from failed promises]
//   }
//
// Unlike Promise.all (which stops at the first rejection), Promise.allSettled
// waits for ALL promises to finish — whether they resolve or reject.
//
// Promise.allSettled returns an array of objects, one per promise:
//   - { status: 'fulfilled', value: <result> }
//   - { status: 'rejected',  reason: <error> }
//
// Example:
//   const tasks = [
//     () => Promise.resolve('ok'),
//     () => Promise.reject(new Error('fail')),
//     () => Promise.resolve(42),
//   ];
//   allSettledReport(tasks) =>
//     { fulfilled: ['ok', 42], rejected: ['fail'] }
//
// HINT:
//   1. Call all functions to get an array of promises: tasks.map(fn => fn())
//   2. Pass that array to Promise.allSettled(...)
//   3. The result is an array of { status, value/reason } objects
//   4. Use .filter() to separate fulfilled from rejected
//   5. Use .map() to extract the values and error messages
//   6. Return { fulfilled: [...], rejected: [...] }

export function allSettledReport(tasks) {
  return Promise.allSettled(tasks.map(task => task())).then(result => {
    return result.reduce((acc,curr) => {
      if (curr.status === 'fulfilled')
      {
        acc['fulfilled'].push(curr.value)
        return acc
      }
      else{
        acc['rejected'].push(curr.reason.message)
        return acc
      }
  }, {'fulfilled': [],'rejected': []})
  })
  
}

// =============================================================================
// TASK 2: firstSuccessful — return the first promise that resolves
// =============================================================================
//
// You are given an array of functions. Each returns a Promise.
// Call ALL of them (in parallel), and return the result of the FIRST one
// that resolves successfully.
//
// If ALL of them reject, reject with an AggregateError (which has an
// `errors` property containing all the rejection reasons).
//
// Use Promise.any() — it's the opposite of Promise.all():
//   - Promise.all: stops at first rejection
//   - Promise.any: stops at first success
//
// Example:
//   const tasks = [
//     () => Promise.reject(new Error('no')),
//     () => Promise.resolve('yes'),
//     () => Promise.resolve('also yes')),
//   ];
//   firstSuccessful(tasks) => 'yes'
//
//   const allFail = [
//     () => Promise.reject(new Error('a')),
//     () => Promise.reject(new Error('b')),
//   ];
//   firstSuccessful(allFail) => rejects with AggregateError
//   // AggregateError.errors = [Error('a'), Error('b')]
//
// HINT:
//   1. Call all functions to get promises: tasks.map(fn => fn())
//   2. Pass to Promise.any(...)
//   3. That's it! Promise.any resolves with the first success.
//   4. If all reject, it throws an AggregateError — let it propagate.

export function firstSuccessful(tasks) {
  return Promise.any(tasks.map(task => task()))
}

// =============================================================================
// TASK 3: withFallback — try primary, fall back to backup on failure
// =============================================================================
//
// You are given two functions, both return Promises:
//   - primaryFn()
//   - fallbackFn()
//
// Try primaryFn(). If it resolves, return its result.
// If it rejects, call fallbackFn() and return its result instead.
//
// This is a very common pattern: "try the fast server, if it's down,
// try the backup server."
//
// Example:
//   const primary = () => Promise.reject(new Error('down'));
//   const backup  = () => Promise.resolve('from backup');
//   withFallback(primary, backup) => 'from backup'
//
//   const ok = () => Promise.resolve('primary works');
//   const backup = () => Promise.resolve('backup');
//   withFallback(ok, backup) => 'primary works'
//
// HINT:
//   1. Call primaryFn()
//   2. In .catch(), call fallbackFn() and return its result
//      return primaryFn().catch(() => fallbackFn())

export function withFallback(primaryFn, fallbackFn) {
  return primaryFn().catch(() => {
    return fallbackFn()
  })
}

// =============================================================================
// TASK 4: retryWithBackoff — retry with increasing delays
// =============================================================================
//
// Like retryWithDelay from exercise 13, but the delay DOUBLES each time.
//
// - First failure:  wait delayMs,           then retry
// - Second failure: wait delayMs * 2,       then retry
// - Third failure:  wait delayMs * 4,       then retry
// - Fourth failure: wait delayMs * 8,       then retry
// - ...and so on
//
// The "attempt" parameter tracks which attempt we're on (starting from 1).
// Use it to calculate the current delay: delayMs * 2^(attempt - 1)
//
// Wait FIRST, then retry. The wait happens BEFORE each retry (not before
// the first attempt).
//
// Example:
//   let tries = 0;
//   const flaky = () => {
//     tries++;
//     if (tries < 3) return Promise.reject(new Error('not yet'));
//     return Promise.resolve('got it');
//   };
//
//   retryWithBackoff(flaky, 5, 100) => 'got it'
//   // Attempt 1: fails
//   // Wait 100ms (100 * 2^0)
//   // Attempt 2: fails
//   // Wait 200ms (100 * 2^1)
//   // Attempt 3: succeeds!
//
// HINT:
//   This is similar to retryWithDelay but you track the current attempt number.
//   1. Define a wait helper: const wait = (ms) => new Promise(r => setTimeout(r, ms))
//   2. Use a recursive helper function that takes an `attempt` parameter
//   3. Call fn()
//   4. On .catch(error):
//      a. If attempt >= maxAttempts: throw error (no more retries)
//      b. Otherwise: calculate currentDelay = delayMs * Math.pow(2, attempt - 1)
//         Then: return wait(currentDelay).then(() => helper(attempt + 1))


export function retryWithBackoff(fn, maxAttempts, delayMs,attempts = 1) {
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
  return fn().catch((error) => {
    let currentDelay = delayMs * Math.pow(2,attempts-1)
    return wait(currentDelay).then(() => {
      attempts++
      if (attempts <= maxAttempts)
        return retryWithBackoff(fn,maxAttempts,delayMs,attempts)
      else throw error
    })
  })
}

// =============================================================================
// TASK 5: runAllWithRecovery — run sequentially, collect ALL results
// =============================================================================
//
// Like runQueue from exercise 13, but with a key difference:
// if a task FAILS, don't stop — keep going. Collect everything.
//
// Return an object:
//   {
//     results: [result1, result2, ...],  // successful values in order
//     errors:  [err1, err2, ...]         // error objects from failures
//   }
//
// Tasks still run SEQUENTIALLY (one at a time). If task 2 fails, task 3
// still runs.
//
// Example:
//   const tasks = [
//     () => Promise.resolve('a'),
//     () => Promise.reject(new Error('boom')),
//     () => Promise.resolve('c'),
//   ];
//   runAllWithRecovery(tasks) =>
//     { results: ['a', 'c'], errors: [Error('boom')] }
//
//   runAllWithRecovery([]) => { results: [], errors: [] }
//
// HINT:
//   Same reduce pattern, but use .catch() to handle failures gracefully:
//   tasks.reduce((promise, task) => {
//     return promise.then(({ results, errors }) => {
//       return task().then(
//         (result) => ({ results: [...results, result], errors }),
//         (error)  => ({ results, errors: [...errors, error] })
//       );
//     });
//   }, Promise.resolve({ results: [], errors: [] }))
//
//   Notice: .then(onFulfilled, onRejected) takes TWO callbacks.
//   This lets you handle both cases in one .then() call.

export function runAllWithRecovery(tasks) {
  return tasks.reduce((promise,curr) => {
    return promise.then(({results,errors}) => {
      return curr().then(r => {
        return {results: [...results, r],errors}
      }).catch(error => {
        return {results, errors: [...errors,error]}
      })
    })
  },Promise.resolve({'results':[], 'errors':[]}))
}

// =============================================================================
// TASK 6: concurrentLimit — run with max N at a time
// =============================================================================
//
// You are given an array of functions (each returns a Promise) and a number
// `maxConcurrent`. Run the functions so that at most `maxConcurrent` promises
// are running at any given time. Collect all results in order.
//
// This is NOT sequential (one at a time) and NOT fully parallel (all at once).
// It's somewhere in between — a "pool" of running promises.
//
// This is the hardest task. It's a real-world pattern used when APIs have
// rate limits (e.g., "max 3 requests at a time").
//
// Example:
//   const tasks = [
//     () => Promise.resolve('a'),
//     () => Promise.resolve('b'),
//     () => Promise.resolve('c'),
//     () => Promise.resolve('d'),
//     () => Promise.resolve('e'),
//   ];
//   concurrentLimit(tasks, 2) => ['a', 'b', 'c', 'd', 'e']
//   // At most 2 run at a time
//
//   concurrentLimit(tasks, 10) => ['a', 'b', 'c', 'd', 'e']
//   // All run in parallel (10 > 5 tasks)
//
//   concurrentLimit([], 3) => []
//
// HINT:
//   This requires a different approach. One way:
//
//   1. Create a results array with the same length as tasks
//      const results = new Array(tasks.length)
//
//   2. Write a recursive helper that processes tasks by index:
//      async function runNext(index) {
//        if (index >= tasks.length) return;
//        results[index] = await tasks[index]();
//        await runNext(index + maxConcurrent);
//      }
//
//   3. Start maxConcurrent "lanes" running in parallel:
//      const lanes = [];
//      for (let i = 0; i < Math.min(maxConcurrent, tasks.length); i++) {
//        lanes.push(runNext(i));
//      }
//      await Promise.all(lanes);
//      return results;
//
//   The idea: each "lane" starts at index 0, 1, 2... and processes every
//   maxConcurrent-th task. Lane 0 does tasks[0], tasks[3], tasks[6]...
//   Lane 1 does tasks[1], tasks[4], tasks[7]... etc.
//   Each lane runs sequentially within itself, but lanes run in parallel.

export function concurrentLimit(tasks, maxConcurrent) {
  if (tasks.length === 0)
    return Promise.resolve([])

  let result = new Array(tasks.length);
  function runNext(index) {
    if (index>=tasks.length)
      return Promise.resolve();
    else{
      return tasks[index]().then(value => {
        result[index] = value
        return runNext(index + maxConcurrent);
      })
    }
  }
  const lanes = [];
  for (let i=0; i< Math.min(maxConcurrent,tasks.length); i++)
  {
    lanes.push(runNext(i))
  }
  return Promise.all(lanes).then(() => result);
}
