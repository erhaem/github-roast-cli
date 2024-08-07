import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

/**
 * Takes user input
 *
 * @param {String} text
 * @returns {String?}
 */
async function userInput(text) {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(text);

  rl.close();

  return answer;
}

/**
 * Cherry-picks object keys
 *
 * @param {Object} obj
 * @param {Array} targetKeys - keys you want to pick
 * @returns {Object}
 */
function pickObjectKeys(obj, targetKeys) {
  const data = Object.keys(obj).reduce((acc, key) => {
    if (targetKeys.includes(key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});

  return data;
}

export { userInput, pickObjectKeys };
