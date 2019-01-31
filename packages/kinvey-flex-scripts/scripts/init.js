'use strict';

const fs = require('fs-extra'); // maybe use fs-extra
const path = require('path');
const os = require('os');
const chalk = require('chalk');
const spawn = require('cross-spawn');
const { defaultBrowsers } = require('./utils/browsersHelper');

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// svc is short for service

module.exports = function(
  svcPath,
  svcName,
  verbose,
  originalDirectory,
  template
) {
  const ownPath = path.dirname(
    require.resolve(path.join(__dirname, '..', 'package.json'))
  );

  const svcPackage = require(path.join(svcPath, 'package.json'));
  const useYarn = fs.existsSync(path.join(svcPath, 'yarn.lock'));

  svcPackage.dependencies = svcPackage.dependencies || {};

  const useTypeScript = svcPackage.dependencies['typescript'] != null;

  // Setup the script rules
  svcPackage.scripts = {
    start: 'kinvey-flex-scripts start',
    build: 'kinvey-flex-scripts build',
    // test: 'kinvey-flex-scripts test',
    // eject: 'kinvey-flex-scripts eject',
    deploy: 'kinvey-flex-scripts deploy'
  };

  // Setup the eslint config
  svcPackage.eslintConfig = {
    extends: 'kinvey-flex-service',
  };

  // Setup the browsers list
  svcPackage.browserslist = defaultBrowsers;

  fs.writeFileSync(
    path.join(svcPath, 'package.json'),
    JSON.stringify(svcPackage, null, 2) + os.EOL
  );

  const readmeExists = fs.existsSync(path.join(svcPath, 'README.md'));
  if (readmeExists) {
    fs.renameSync(
      path.join(svcPath, 'README.md'),
      path.join(svcPath, 'README.old.md')
    );
  }

  // Copy the files for the user
  const templatePath = template
    ? path.resolve(originalDirectory, template)
    : path.join(ownPath, useTypeScript ? 'template-typescript' : 'template');
  if (fs.existsSync(templatePath)) {
    fs.copySync(templatePath, svcPath);
  } else {
    console.error(
      `Could not locate supplied template: ${chalk.green(templatePath)}`
    );
    return;
  }

  // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
  // See: https://github.com/npm/npm/issues/1862
  try {
    fs.moveSync(
      path.join(svcPath, 'gitignore'),
      path.join(svcPath, '.gitignore'),
      []
    );
  } catch (err) {
    // Append if there's already a `.gitignore` file there
    if (err.code === 'EEXIST') {
      const data = fs.readFileSync(path.join(svcPath, 'gitignore'));
      fs.appendFileSync(path.join(svcPath, '.gitignore'), data);
      fs.unlinkSync(path.join(svcPath, 'gitignore'));
    } else {
      throw err;
    }
  }

  let command;
  let args;
  args = [];

  if (useYarn) {
    command = 'yarnpkg';
    args = ['add'];
    // args.push('--ignore-engines');
  } else {
    command = 'npm';
    args = ['install', '--save', verbose && '--verbose'].filter(e => e);
  }
  args.push('kinvey-flex-sdk');

  // Install additional template dependencies, if present
  const templateDependenciesPath = path.join(
    svcPath,
    '.template.dependencies.json'
  );
  if (fs.existsSync(templateDependenciesPath)) {
    const templateDependencies = require(templateDependenciesPath).dependencies;
    args = args.concat(
      Object.keys(templateDependencies).map(key => {
        return `${key}@${templateDependencies[key]}`;
      })
    );
    fs.unlinkSync(templateDependenciesPath);
  }

  // Install react and react-dom for backward compatibility with old CRA cli
  // which doesn't install react and react-dom along with react-scripts
  // or template is presetend (via --internal-testing-template)
  // if (!isReactInstalled(svcPackage) || template) {
  console.log(`Installing kinvey-flex-sdk using ${command}...`);
  console.log();

  const proc = spawn.sync(command, args, { stdio: 'inherit' });
  if (proc.status !== 0) {
    console.error(`\`${command} ${args.join(' ')}\` failed`);
    return;
  }
  // }

  // if (useTypeScript) {
    // verifyTypeScriptSetup();
  // }

  // if (tryGitInit(svcPath)) {
  //   console.log();
  //   console.log('Initialized a git repository.');
  // }

  // Display the most elegant way to cd.
  // This needs to handle an undefined originalDirectory for
  // backward compatibility with old global-cli's.
  let cdpath;
  if (originalDirectory && path.join(originalDirectory, svcName) === svcPath) {
    cdpath = svcName;
  } else {
    cdpath = svcPath;
  }

  // Change displayed command to yarn instead of yarnpkg
  const displayedCommand = useYarn ? 'yarn' : 'npm';

  console.log();
  console.log(`Success! Created ${svcName} at ${svcPath}`);
  console.log('Inside that directory, you can run several commands:');
  console.log();
  console.log(chalk.cyan(`  ${displayedCommand} start`));
  console.log('    Starts the development server.');
  console.log();
  console.log(
    chalk.cyan(`  ${displayedCommand} ${useYarn ? '' : 'run '}build`)
  );
  console.log('    Bundles the app into static files for production.');
  console.log();
  console.log(
    chalk.cyan(`  ${displayedCommand} ${useYarn ? '' : 'run '}deploy`)
  );
  console.log('    Deploys the bundled service to Kinvey.');
  console.log();
  // console.log(chalk.cyan(`  ${displayedCommand} test`));
  // console.log('    Starts the test runner.');
  // console.log();
  // console.log(
  //   chalk.cyan(`  ${displayedCommand} ${useYarn ? '' : 'run '}eject`)
  // );
  // console.log(
  //   '    Removes this tool and copies build dependencies, configuration files'
  // );
  // console.log(
  //   '    and scripts into the app directory. If you do this, you can’t go back!'
  // );
  console.log();
  console.log('We suggest that you begin by typing:');
  console.log();
  console.log(chalk.cyan('  cd'), cdpath);
  console.log(`  ${chalk.cyan(`${displayedCommand} start`)}`);
  if (readmeExists) {
    console.log();
    console.log(
      chalk.yellow(
        'You had a `README.md` file, we renamed it to `README.old.md`'
      )
    );
  }
  console.log();
}
