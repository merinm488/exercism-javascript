/// <reference path="./global.d.ts" />
// @ts-check

/**
 * Implement the functions needed to solve the exercise here.
 * Do not forget to export them so they are available for the
 * tests. Here an example of the syntax as reminder:
 *
 * export function yourFunction(...) {
 *   ...
 * }
 */

/**
 * @param {number} minutesLeft
 * @returns {string}  the cooking status
 */

export function cookingStatus(minutesLeft){
    if (minutesLeft == 0) return 'Lasagna is done.';
    else if (minutesLeft > 0) return 'Not done, please wait.'
    else return 'You forgot to set the timer.'
}

/**
 * 
 * @param {string[]} layers 
 * @param {Number} timePerLayer 
 * @returns {Number} total preparation time
 */
export function preparationTime(layers,timePerLayer){
    let timeTaken = 0;
    if (timePerLayer == null){
        timePerLayer = 2
    }
    timeTaken = layers.length * timePerLayer;
    return timeTaken;
}

/**
 * 
 * @param {String[]} layers 
 * @returns {object} 
 */

export function quantities(layers){
    let layerQuantity = {noodles: 0, sauce: 0};
    let sauceCount = 0;
    let noodleCount = 0;
    for (let item of layers){
        if (item == 'sauce'){sauceCount++}
        else if (item == 'noodles'){noodleCount++} 
    }
    layerQuantity.noodles = noodleCount * 50;
    layerQuantity.sauce = sauceCount * 0.2;
    return layerQuantity;
}

/**
 * 
 * @param {String[]} friendsList 
 * @param {String[]} myList 
 */
export function addSecretIngredient(friendsList, myList){
    myList.push(friendsList[friendsList.length-1]);
}

/**
 * 
 * @param {Object} recipe 
 * @param {Number} portions 
 * @returns 
 */

export function scaleRecipe(recipe, portions){
    let scaled = {}
    for (let item in recipe){
        scaled[item] = recipe[item]*0.5*portions
    }
    return scaled;
}
