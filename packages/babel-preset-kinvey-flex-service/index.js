'use strict';

const semver = require('semver');

const validateBoolOption = (name, value, defaultValue) => {
  if (typeof value === 'undefined') {
    value = defaultValue;
  }

  if (typeof value !== 'boolean') {
    throw new Error(`Preset kinvey-flex-service: '${name}' option must be a boolean.`);
  }

  return value;
};

const create = function(api, opts, env) {
  if (!opts) {
    opts = {};
  }

  const isEnvDevelopment = env === 'development';
  const isEnvProduction = env === 'production';
  const isEnvTest = env === 'test';

  if (!isEnvDevelopment && !isEnvProduction && !isEnvTest) {
    throw new Error(
      'Using `babel-preset-kinvey-flex-service` requires that you specify `NODE_ENV` or ' +
        '`BABEL_ENV` environment variables. Valid values are "development", ' +
        '"test", and "production". Instead, received: ' +
        JSON.stringify(env) +
        '.'
    );
  }

  const targetNodeVersion = semver.coerce(opts.targetNodeVersion || '6.12.3').raw;
  const skipVersionValidation = validateBoolOption('helpers', opts.helpers, false);

  if (!semver.satisfies(targetNodeVersion, '=6||=8||=10') && !skipVersionValidation) {
    throw new Error(
      'Currently `babel-preset-kinvey-flex-service` supports Node target versions `6.x.x`, `8.x.x`, or `10.x.x`.' +
      'The invalid Node version received: ' +
      JSON.stringify(targetNodeVersion || opts.targetNodeVersion) +
      '.'
    );
  }

  return {
    presets: [
      // TODO: not sure how this should be setup for test env.
      // isEnvTest && [
      //   // ES features necessary for user's Node version
      //   require('@babel/preset-env').default,
      //   {
      //     targets: {
      //       node: 'current',
      //     },
      //   },
      // ],
      (isEnvProduction || isEnvDevelopment) && [
        require('@babel/preset-env').default,
        {
          targets: {
            node: targetNodeVersion,
          },
        },
      ],
    ].filter(Boolean),
    // plugins: [
    // ]
  }
}

module.exports = function(api, opts) {
  // This is similar to how `env` works in Babel:
  // https://babeljs.io/docs/usage/babelrc/#env-option
  // We are not using `env` because it’s ignored in versions > babel-core@6.10.4:
  // https://github.com/babel/babel/issues/4539
  // https://github.com/facebook/create-react-app/issues/720
  // It’s also nice that we can enforce `NODE_ENV` being specified.
  const env = process.env.BABEL_ENV || process.env.NODE_ENV;
  return create(api, opts, env);
};