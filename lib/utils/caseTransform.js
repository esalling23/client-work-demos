/**
 * Transform string in kebab-case to camelCase
 * @param {String} kebabCase string in kebab-case
 * @returns {String} new transformed string
 */
const kebabToCamel = (kebabCase) =>
  kebabCase
    .split('-')
    .map(
      (word, i) =>
        i === 0
          ? word.toLowerCase() // first word is all in lower case
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(), // the rest words start with capital letter
    )
    .join('');

/**
 * Transform title string (space separated words) to kebab case.
 * If optional suffix is provided, append it to the end.
 * @param {String} titleCase string to transform, may include spaces between words
 * @param {String} [suffix] optional suffix of arbitrary format
 * @returns {String} new string in kebab case
 */
const titleToKebab = (titleCase, suffix = '') =>
  titleCase
    ?.concat(` ${suffix}`)
    ?.trim()
    .replace(/[^a-zA-Z0-9\- ]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();

// commonjs export, so this util can be used in webpack operations, which are "server side"
module.exports = { kebabToCamel, titleToKebab };
