'use strict'

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const semver = require('semver');
const os = require('os');
const kinveyCli = require('kinvey-cli-wrapper');

const clearConsole = require('./utils/clearConsole');
const paths = require('../config/paths');

const STATUS_ONLINE = 'ONLINE';
const STATUS_COMPLETED = 'COMPLETED';
const STATUS_RUNNING = 'RUNNING';

// Process CLI arguments
const argv = process.argv.slice(2);

const releaseType = (() => {
  if (argv.indexOf('--major') !== -1) {
    return 'major';
  }
  if (argv.indexOf('--minor') !== -1) {
    return 'minor';
  }
  return 'patch';
})();

let newVersion = (() => {
  try {
    const vArgIndex = argv.indexOf('-v');
    const versionArgIndex = argv.indexOf('--version');
    if (vArgIndex !== -1) {
      return semver.coerce(argv[vArgIndex + 1]).raw;
    }
    if (versionArgIndex !== -1) {
      return semver.coerce(argv[versionArgIndex + 1]).raw;
    }
    return null;
  } catch(_) {
    console.log(chalk.red('Unable to set version with -v or --version argument. Falling back to default behavior.'));
    return null;
  }
})();

const skipRemoteVersionChecks = argv.indexOf('--skip-version-checks') !== -1;

const kinveyProjectConfig = path.join(paths.appPath, '.kinvey');
kinveyCli.setProjectDir(paths.appPath);
clearConsole();

if (!fs.existsSync(kinveyProjectConfig)) {
  console.log();
  console.log(chalk.red('Kinvey Flex Service is not initialized in this directory'));
  console.log();
  console.log('Initialize using Kinvey-CLI, run:');
  console.log(`  ${chalk.cyan('kinvey')} flex init `);
  console.log(); // TODO: add link to resource to explain this in more detail.
  console.log(chalk.red('deploy script failed'));
  console.log();
} else {
  (async() => {

    const { error: deployStatusError, result: deployStatus } = await kinveyCli.showFlexServiceStatus();
    if (deployStatusError) {
      if (checkError(deployStatusError)) {
        console.log(chalk.red('UNHANDLED ERROR'), deployStatusError);
      }
      return;
    }

    if (deployStatus) {
      let {
        status,
        version,
        deployment: {
          status: deploymentStatus,
          version: deploymentVersion,
        }
      } = deployStatus;

      status = status.toUpperCase();
      deploymentStatus = deploymentStatus.toUpperCase();

      console.log('Flex Service Status');
      console.log(`status: ${status === STATUS_ONLINE?chalk.green(status):chalk.yellow(status)}`);
      console.log(`version: ${chalk.cyan(version)}`);
      console.log(`deployment status: ${deploymentStatus === STATUS_COMPLETED ?
        chalk.green(deploymentStatus) : chalk.yellow(deploymentStatus)}`);

      console.log(`deployment version: ${chalk.cyan(deploymentVersion)}`);

      if (deploymentStatus === STATUS_RUNNING) {
        console.log(chalk.red('Unable to deploy while another deployment is in progress.'));
        console.log();
        console.log('to check deployment status, run:');
        console.log(` ${chalk.cyan('kinvey flex status')} `);
        console.log();
        return;
      }

      if (!skipRemoteVersionChecks && version !== deploymentVersion) {
        console.log(chalk.red('Unable to deploy while another deployment is in progress.'));
        console.log();
        console.log('to check deployment status, run:');
        console.log(` ${chalk.cyan('kinvey flex status')} `);
        console.log();
        console.log(`OR use ${chalk.cyan('--skip-version-checks')} argument to skip this check.`);
        console.log();
        return;
      }

      if (!skipRemoteVersionChecks && !newVersion) {
        newVersion = semver.inc(semver.coerce(deploymentVersion), releaseType);
      }

      const pkg = require(path.join(paths.appBuild, 'package.json'));

      if (!newVersion) {
        newVersion = semver.inc(semver.coerce(pkg.version || '0.0.0'), releaseType);
      }

      if (!skipRemoteVersionChecks) {
        if (!semver.gte(semver.coerce(newVersion), semver.coerce(deploymentVersion))) {
          console.log();
          console.log(chalk.red(`The new version (${newVersion}) must be greater than the deployed version ${deploymentVersion}.`));
          console.log();
          console.log(`use ${chalk.cyan('--skip-version-checks')} argument to skip this check. But the deployment may fail.`);
          console.log();
          return;
        }
      }

      pkg.version = newVersion;
      fs.writeFileSync(
        path.join(paths.appBuild, 'package.json'),
        JSON.stringify(pkg, null, 2) + os.EOL
      );
    }

    let failedToGetProfile = false;
    let profileName = null;
    const showProfileResult = await kinveyCli.showProfile();

    if (showProfileResult.result) {
      profileName = showProfileResult.result.name;
    }

    if (showProfileResult.error) {
      const { error: listProfilesError, result: profiles} = await kinveyCli.listProfiles();
      console.log(listProfilesError, profiles);
      if (listProfilesError || (profiles && profiles.length < 1) || !profiles) {
        failedToGetProfile = true;
      } else {
        profileName = profiles[0].profile;
        console.log(`Settings active profile to: ${chalk.cyan(profileName)}.`)
        await kinveyCli.useProfile(profileName);
        failedToGetProfile = false;
      }
    }

    if (failedToGetProfile) {
      console.log();
      console.log(chalk.red('failed to get active profile.'));
      console.log();
      console.log('kinvey-cli may not be initalized on your machine.');
      console.log('run:');
      console.log(` ${chalk.cyan('kinvey init')} `);
      console.log();
    } else {
      const showFlexServiceResult = await kinveyCli.showFlexService();
      if (showFlexServiceResult.error) {
        if (checkError(showFlexServiceResult.error)) {
          console.log(chalk.red('UNHANDLED ERROR'), showFlexServiceResult.error);
        } else {
          return;
        }
      }
      if (showFlexServiceResult.result) {
        const {
          serviceName,
        } = showFlexServiceResult.result;

        console.log();
        console.log(`Deploying to: ${chalk.cyan(serviceName)}`);

        const deployResult = await kinveyCli.deployFlexService();
        if (deployResult.error) {
          console.log(chalk.red('UNHANDLED ERROR', deployResult.error));
        }
        if (deployResult.result && deployResult.result.id) {
          console.log();
          console.log(chalk.green('Deployment complete.'))
          console.log();
          console.log(`Job Id: ${deployResult.result.id}`);
          console.log();
          console.log('to check deployment status, run:');
          console.log(` ${chalk.cyan('kinvey flex status')} `);
          console.log();
        }
      }
    }
  })();
}

const checkError = (error) => {
  if (error === '[error] InvalidCredentials: Credentials are invalid. Please authenticate.') {
    console.log();
    console.log(chalk.red('InvalidCredentials: Credentials are invalid. Please authenticate.'));
    console.log();
    console.log('To authenticate, run:');
    console.log(` ${chalk.cyan('kinvey profile login')} `);
    console.log();
    return false;
  }
  return error;
}