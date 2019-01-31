'use strict'

const path = require('path');
const ProjectSetup = require('kinvey-cli/lib/ProjectSetup');

const KINVEY_PROJECT_FILE = '.kinvey';

/**
 * Creates the .kinvey file for a flex service project. Will be used by other flex commands.
 * @param {String} projectPath
 * @param {String} profileName
 * @param {String} domain
 * @param {String} domainEntityId
 * @param {String} serviceId
 * @param {String} serviceName
 * @param {String} svcEnvId
 * @param {Number} schemaVersion
 * @param {Function} done
 */
const init = (projectPath, profileName, domain, domainEntityId, serviceId, serviceName, svcEnvId, schemaVersion, done) => {
  const projectSetup = new ProjectSetup(path.join(projectPath, KINVEY_PROJECT_FILE));
  projectSetup.setFlexNamespace(profileName, { domain, domainEntityId, serviceId, serviceName, svcEnvId, schemaVersion });
  projectSetup.save(done);
}

module.exports = init;