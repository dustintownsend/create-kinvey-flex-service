'use strict'

const {
  kinveyCliVersion,
  kinveyProfileCreate,
  kinveyProfileList,
  kinveyProfileUse,
  kinveyProfileShow,
  kinveyProfileLogin,
  kinveyOrgList,
  kinveyOrgShow,
  kinveyOrgUse,
  kinveyAppList,
  kinveyAppShow,
  kinveyAppUse,
  kinveyAppCreate,
  kinveyAppDelete,
  kinveyAppApply,
  kinveyAppExport,
  kinveyAppEnvList,
  kinveyAppEnvShow,
  kinveyAppEnvUse,
  kinveyAppEnvCreate,
  kinveyAppEnvDelete,
  kinveyAppEnvApply,
  kinveyAppEnvExport,
  kinveyCollList,
  kinveyCollCreate,
  kinveyCollDelete,
  kinveyFlexCreate,
  kinveyFlexDeploy,
  kinveyFlexJob,
  kinveyFlexStatus,
  kinveyFlexShow,
  kinveyFlexList,
  kinveyFlexLogs,
  kinveyFlexUpdate,
  kinveyFlexRecycle,
  kinveyFlexDelete,
  kinveyFlexClear,
  setOptionsHook,
  kinveyFlexInit,
 } = require('./lib/kinveyCliCommands');

function Wrapper() {
  const state = {};

  this.setProjectDir = (projectDir) => {
    state.projectDir = projectDir;
  }

  this.setSessionDir = (sessionDir) => {
    state.sessionDir = sessionDir;
  }

  setOptionsHook((options={}) => {
    const opts = { ...options };
    Object.keys(state).forEach((key) => {
      opts[key] = state[key];
    });
    return opts;
  });

  /**
   * Returns current version of Kinvey CLI
   * @param {Object?} options
   * @returns {Promise}
   */
  this.getCliVersion = (options={}) => kinveyCliVersion(options);

  /**
   * Create a new Kinvey Profile. Will be saved in .kinvey-cli file with auth token.
   * This is needed to use additional commands.
   * @param {String} email
   * @param {String} password
   * @param {String} profileName
   * @param {String?} instanceId
   * @param {Object?} options
   * @returns {Promise}
   */
  this.createProfile = (email, password, profileName, instanceId=null, options={}) =>
    kinveyProfileCreate({ email, password, instanceId, ...options }, profileName);

  /**
   * List all profiles stored in .kinvey-cli file
   * @param {Object?} options
   * @returns {Promise}
   */
  this.listProfiles = (options={}) =>
    kinveyProfileList({ ...options });

  /**
   * Show details of current profile or profile of profileName, if set.
   * @param {String?} profileName
   * @param {Object?} options
   * @returns {Promise}
   */
  this.showProfile = (profileName=null, options={}) =>
    kinveyProfileShow({ ...options }, profileName);

  /**
   * Use this to reauthenticate a profile when AuthToken expires.
   * @param {String} password
   * @param {String} profileName
   * @param {Object?} options
   * @returns {Promise}
   */
  this.loginProfile = (password, profileName=null, options={}) =>
    kinveyProfileLogin({ password, ...options }, profileName);

  /**
   * Set the active/current profile to use.
   * Other commands will use this profile when a profileName is not specified.
   * @param {String} profileName
   * @param {Object?} options
   * @returns {Promise}
   */
  this.useProfile = (profileName, options={}) =>
    kinveyProfileUse({ ...options }, profileName);

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.listOrgs = (options={}) => kinveyOrgList(options);

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.showOrg = (org=null, options={}) => kinveyOrgShow({ org, ...options });

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.useOrg = (org, options={}) => kinveyOrgUse(options, org);

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.listApps = (options={}) => kinveyAppList(options);

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.showApp = (app=null, options={}) => kinveyAppShow({ app, ...options });

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.useApp = (app, options={}) => kinveyAppUse(options, app);

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.createApp = (app, options={}) => kinveyAppCreate(options, app); // untested

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.deleteApp = (app, options={}) => kinveyAppDelete({ app, noPrompt: true, ...options }); // untested

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.applyApp = (app, file, options={}) => kinveyAppApply({ app, file });

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.exportApp = (app, file, options={}) => kinveyAppExport({ app, file });

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.listAppEnvs = (app=null, options={}) => kinveyAppEnvList({ app, ...options });

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.showAppEnv = (app=null, env=null, options={}) => kinveyAppEnvShow({ app, env, ...options });

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.useAppEnv = (env, app=null, options={}) => kinveyAppEnvUse({ app, ...options }, env);

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.createAppEnv = (env, app=null, options={}) => kinveyAppEnvCreate({ app, ...options }, env);

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.deleteAppEnv = (env, app=null, options={}) => kinveyAppEnvDelete({ app, env, noPrompt: true, ...options });

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.applyAppEnv = (env, app=null, file, options={}) => kinveyAppEnvApply({ app, env, file });

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.exportEnvApp = (env, app=null, file, options={}) => kinveyAppEnvExport({ app, env, file });

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.listCollections = (app=null, env=null, options={}) => kinveyCollList({ app, env, ...options });

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.createCollection = (collectionName, app=null, env=null, options={}) => kinveyCollCreate({ app, env, ...options }, collectionName);

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.deleteCollection = (collectionName, app=null, env=null,options={}) => kinveyCollDelete({ app, env, noPrompt: true, ...options }, collectionName);

  const initFlex = async (...args) => {
    const schemaVersion = 3;
    let serviceId = args[0];
    let profileName = args[1];
    let projectPath = args[2] || process.cwd();
    let domain = args[3];
    let domainEntityId = args[4];
    let options = args[5];
    let profile = null;
    let serviceName = null;
    let svcEnvId = null;
    let errors = [];

    if (profileName) {
      const { result } = await this.showProfile(profileName);
      profile = result;
    } else {
      const { result } = await this.showProfile();
      profile = result;
      profileName = profile.name;
    }

    const {
      active: {
        app: activeApp,
        org: activeOrg,
      }, } = profile;

    if (activeApp) {
      domain = 'app';
      domainEntityId = activeApp.id;
    } else if (activeOrg) {
      domain = 'org';
      domainEntityId = activeOrg.id;
    }

    if ((domain === 'app' || domain === 'org') && !domainEntityId) {
      // no active app or org is set in profile.
      throw new Error('no active app or org is set in profile.');
    }

    const { result: flexService } = await this.showFlexService({ service: serviceId });
    serviceName = flexService.serviceName;
    svcEnvId = flexService.svcEnvId;

    return kinveyFlexInit(projectPath, profileName, domain, domainEntityId, serviceId, serviceName, svcEnvId, schemaVersion);
  }

  /**
   * @param {Object?} options
   * @returns {Promise}
   */
  this.initFlexService = async (serviceId, profileName=null, projectPath=null, domain=null, domainEntityId=null, options={}) => initFlex(serviceId, profileName, projectPath, domain, domainEntityId, options);

  // either an app or org is required, along with serviceName
  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.createFlexService = (serviceName, app=null, org=null, secret=null, env=null, vars=null, runtime=null,
    options) => kinveyFlexCreate({app, org, secret, env, vars, runtime, ...options}, serviceName);

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.deleteFlexService = (serviceId, options={}) => kinveyFlexDelete({ noPrompt: true, service: serviceId, ...options });

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.listFlexServices = (options={}) => kinveyFlexList(options);

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.showFlexService = (options={}) => kinveyFlexShow(options);

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.deployFlexService = (options={}) => kinveyFlexDeploy(options);

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.showFlexServiceJob = (options={}) => kinveyFlexJob(options);

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.showFlexServiceStatus = (options={}) => kinveyFlexStatus(options);

  /**
   *
   * @param {Object?} options
   * @returns {Promise}
   */
  this.showFlexServiceLogs = (options={}) => kinveyFlexLogs(options);

  /**
   * Updates environment variables and/or runtime environment.
   * Causes a restart/rebuilt of the service.
   * @param {String?} service The service ID.
   * @param {String?} env The environment ID or name.
   * @param {Object?} options
   * @returns {Promise}
   */
  this.updateFlexService = (service=null, env=null, options={}) => kinveyFlexUpdate({ service, env, ...options });

  /**
   * Recycles flex environment.
   * @param {String?} service The service ID.
   * @param {String?} env The environment ID or name.
   * @param {Object?} options
   * @returns {Promise}
   */
  this.recycleFlexService = (service=null, env=null, options={}) => kinveyFlexRecycle({ service, env, ...options });

  /**
   *  Removes the current Flex Service configuration [.kinvey file] from the project.
   * TODO: test clearing from multiple directories.
   * @param {Object?} options
   * @returns {Promise}
   */
  this.clearFlexService = (options={}) => kinveyFlexClear(options);
}

module.exports = new Wrapper();
