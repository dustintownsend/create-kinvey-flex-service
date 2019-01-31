'use strict'

const commandWrapper =
  (command) => (...args) =>
    command(...args)
      .then(result => resultWrapper(result))
      .catch(error => errorWrapper(error));


const resultToJSON = (result) => {
  const { stdout } = result;
  try {
    const json = JSON.parse(stdout);
    return json;
  } catch (_) {
    return { result: stdout };
  }
}

const resultWrapper = (result) => {
  if (result.stderr) throw result;
  const json = resultToJSON(result);
  return {
    error: null,
    ...json,
  }
}

const errorWrapper = (error) => {
  let errMsg = error.stderr.trim();
  errMsg = errMsg.split('/n');
  errMsg = errMsg[errMsg.length - 1];
  return { error: errMsg, json: null };
}

module.exports = commandWrapper;