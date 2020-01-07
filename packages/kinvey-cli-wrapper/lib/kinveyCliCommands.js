'use strict'

const execa = require('execa');

const commandWrapper = require('./commandWrapper');
const options= require('./options');
const flexInit = require('./flexInit');

const hooks = {
  optionsHook: (opts) => opts,
}

module.exports.setOptionsHook = (hook) => {
  hooks.optionsHook = hook;
}

const optionsHandler = (opts) => {
  opts = hooks.optionsHook(opts);
  return options({ ...opts });
}

const kinveyCliCommand = (args, opts) => commandWrapper(execa)('kinvey', args, optionsHandler(opts));

module.exports.kinveyCliVersion = (options={}) => kinveyCliCommand(['--version'], options);

const loginProfileOptions = ({ password, ...opts }) => ({ input: `\n${password}\n`, ...opts });
const kinveyProfile = (args, options) => kinveyCliCommand(['profile', ...args], options);
module.exports.kinveyProfileCreate = (options, profileName) => kinveyProfile(['create', profileName], options);
module.exports.kinveyProfileList = (options) => kinveyProfile(['list'], options);
module.exports.kinveyProfileUse = (options, profileName) => kinveyProfile(['use', profileName], options);
module.exports.kinveyProfileShow = (options, profileName) => kinveyProfile(['show', profileName], options);
module.exports.kinveyProfileLogin = (options, profileName) => kinveyProfile(['login', profileName], loginProfileOptions(options));

const kinveyOrg = (args, options) => kinveyCliCommand(['org', ...args], options);
module.exports.kinveyOrgList = (options) => kinveyOrg(['list'], options);
module.exports.kinveyOrgShow = (options) => kinveyOrg(['show'], options);
module.exports.kinveyOrgUse = (options, org) => kinveyOrg(['use', org], options);

const kinveyApp = (args, options) => kinveyCliCommand(['app', ...args], options);
module.exports.kinveyAppList = (options) => kinveyApp(['list'], options);
module.exports.kinveyAppShow = (options) => kinveyApp(['show'], options);
module.exports.kinveyAppUse = (options, app) => kinveyApp(['use', app], options);
module.exports.kinveyAppCreate = (options, app) => kinveyApp(['create', app], options);
module.exports.kinveyAppDelete = (options) => kinveyApp(['delete'], options);
module.exports.kinveyAppExport = options => kinveyApp(['export'], options);
module.exports.kinveyAppApply = options => kinveyApp(['apply'], options);

const kinveyAppEnv = (args, options) => kinveyCliCommand(['appenv', ...args], options);
module.exports.kinveyAppEnvList = (options) => kinveyAppEnv(['list'], options);
module.exports.kinveyAppEnvShow = (options) => kinveyAppEnv(['show'], options);
module.exports.kinveyAppEnvUse = (options, env) => kinveyAppEnv(['use', env], options);
module.exports.kinveyAppEnvCreate = (options, appenv) => kinveyAppEnv(['create', appenv], options);
module.exports.kinveyAppEnvDelete = (options) => kinveyAppEnv(['delete'], options);
module.exports.kinveyAppEnvExport = (options) => kinveyAppEnv(['export'], options);
module.exports.kinveyAppEnvApply = (options) => kinveyAppEnv(['apply'], options);

const kinveyColl = (args, options) => kinveyCliCommand(['coll', ...args], options);
module.exports.kinveyCollList = (options) => kinveyColl(['list'], options);
module.exports.kinveyCollCreate = (options, name) => kinveyColl(['create', name], options); // untested
module.exports.kinveyCollDelete = (options, name) => kinveyColl(['delete', name], options); // untested

const kinveyFlex = (args, options) => kinveyCliCommand(['flex', ...args], options);
module.exports.kinveyFlexCreate = (options, name) => kinveyFlex(['create', name], options);
module.exports.kinveyFlexDeploy = (options) => kinveyFlex(['deploy'], options);
module.exports.kinveyFlexJob = (options, id) => kinveyFlex(['job', id], options);
module.exports.kinveyFlexStatus = (options) => kinveyFlex(['status'], options);
module.exports.kinveyFlexShow = (options) => kinveyFlex(['show'], options);
module.exports.kinveyFlexList = (options) => kinveyFlex(['list'], options);
module.exports.kinveyFlexLogs = (options) => kinveyFlex(['logs'], options);
module.exports.kinveyFlexUpdate = (options) => kinveyFlex(['update'], options);
module.exports.kinveyFlexRecycle = (options) => kinveyFlex(['recycle'], options);
module.exports.kinveyFlexDelete = (options) => kinveyFlex(['delete'], options);
module.exports.kinveyFlexClear = (options) => kinveyFlex(['clear'], options);

module.exports.kinveyFlexInit = (projectPath, profileName, domain, domainEntityId, serviceId, serviceName, svcEnvId, schemaVersion) => new Promise((resolve) => {
  flexInit(projectPath, profileName, domain, domainEntityId, serviceId, serviceName, svcEnvId, schemaVersion, () => resolve('SUCCESS'));
});
