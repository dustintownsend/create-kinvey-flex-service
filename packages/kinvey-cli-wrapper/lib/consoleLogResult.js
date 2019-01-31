'use strict'
/**
 * For debugging and testing purposes only.
 */
module.exports = ({ error=null, result=null }) => (error ? console.error(error) : console.log(result));