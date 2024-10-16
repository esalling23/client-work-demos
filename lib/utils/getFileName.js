/**
 * takes in a file's url and returns the filename
 * @param {string} url - url of the file location
 * @returns - the filename from the url
 */
const getFilename = (url) => url.split('/').pop();

export default getFilename;
