'use strict'

const path = require('path');

const nodeConfig = (projectDir=null, sessionDir=null) => {
  if (!projectDir && !sessionDir) { return null; }
  const result = { paths: {} };
  if (projectDir) {
    result.paths.project = path.join(projectDir, '.kinvey');
    result.paths.package = path.join(projectDir, 'build');
  }
  if (sessionDir) { result.paths.session = path.join(sessionDir, '.kinvey-cli'); }
  return JSON.stringify(result);
}

const defaultEnv = {
  KINVEY_CLI_NO_COLOR: true,
  KINVEY_CLI_NO_PROMPT: false,
  KINVEY_CLI_OUTPUT: 'json',
  KINVEY_CLI_EMAIL: null,
  KINVEY_CLI_PASSWORD: null,
  KINVEY_CLI_INSTANCE_ID: null,
  KINVEY_CLI_2FA: null,
  KINVEY_CLI_PROFILE: null,
  KINVEY_CLI_ORG: null,
  KINVEY_CLI_APP: null,
  KINVEY_CLI_ENV: null,
  KINVEY_CLI_DOMAIN: null,
  KINVEY_CLI_ID: null,
  HTTPS_PROXY: null,
  KINVEY_CLI_SERVICE: null,
}

const options = ({
  email=null,
  password=null,
  instanceId=null,
  twoFa=null,
  profileName=null,
  noPrompt=null,
  projectDir=null,
  sessionDir=null,
  input=null,
  org=null,
  app=null,
  env:environment=null,
  domain=null,
  id=null,
  httpsProxy=null,
  service=null,
}={}) => {
  const env = {
    ...defaultEnv,
    NODE_CONFIG: nodeConfig(projectDir, sessionDir),
  }
  if (env.NODE_CONFIG == null) { delete env.NODE_CONFIG; }

  if (email) { env.KINVEY_CLI_EMAIL = email; }
  else { delete env.KINVEY_CLI_EMAIL; }
  if (password) { env.KINVEY_CLI_PASSWORD = password; }
  else { delete env.KINVEY_CLI_PASSWORD; }
  if (instanceId) { env.KINVEY_CLI_INSTANCE_ID = instanceId; }
  else { delete env.KINVEY_CLI_INSTANCE_ID; }
  if (twoFa) { env.KINVEY_CLI_2FA = twoFa; }
  else { delete env.KINVEY_CLI_2FA; }
  if (profileName) { env.KINVEY_CLI_PROFILE = profileName; }
  else { delete env.KINVEY_CLI_PROFILE; }
  if (noPrompt) { env.KINVEY_CLI_NO_PROMPT = noPrompt; }
  else { delete env.KINVEY_CLI_NO_PROMPT; }

  if (org) { env.KINVEY_CLI_ORG = org; }
  else { delete env.KINVEY_CLI_ORG; }
  if (app) { env.KINVEY_CLI_APP = app; }
  else { delete env.KINVEY_CLI_APP; }
  if (environment) { env.KINVEY_CLI_ENV = environment; }
  else { delete env.KINVEY_CLI_ENV; }
  if (domain) { env.KINVEY_CLI_DOMAIN = domain; }
  else { delete env.KINVEY_CLI_DOMAIN; }
  if (id) { env.KINVEY_CLI_ID = id; }
  else { delete env.KINVEY_CLI_ID; }
  if (httpsProxy) { env.HTTPS_PROXY = httpsProxy; }
  else { delete env.HTTPS_PROXY; }

  if (service) { env.KINVEY_CLI_SERVICE = service; }
  else { delete env.KINVEY_CLI_SERVICE; }

  const opts = {
    shell: true,
    input: '',
    env,
  }

  if (input) { opts.input = input; }
  else { delete opts.input; }

  return opts;
};

module.exports = options;