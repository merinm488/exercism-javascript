/// <reference path="./global.d.ts" />
//
// @ts-check

/**
 * Determine the price of the pizza given the pizza and optional extras
 *
 * @param {Pizza} pizza name of the pizza to be made
 * @param {Extra[]} extras list of extras
 *
 * @returns {number} the price of the pizza
 */
export function pizzaPrice(pizza, ...extras) {
  let itemCost = {Margherita: 7, Caprese: 9, Formaggio: 10, ExtraSauce: 1, ExtraToppings: 2};
  let total = itemCost[pizza];
  let extraItem = [...extras];
  for (let item of extraItem)
  {
    total+=itemCost[item];
  }
  return total;
}

/**
 * Calculate the price of the total order, given individual orders
 *
 * (HINT: For this exercise, you can take a look at the supplied "global.d.ts" file
 * for a more info about the type definitions used)
 *
 * @param {PizzaOrder[]} pizzaOrders a list of pizza orders
 * @returns {number} the price of the total order
 */
export function orderPrice(pizzaOrders) {
  let orderTotal = 0;
  for (let order of pizzaOrders)
  {
    orderTotal+=pizzaPrice(order.pizza, ...order.extras)
  }
  return orderTotal;
}
