'use strict'

// require('dotenv').config();
const request = require('request');
const express = require('express');
const merge = require('lodash.merge');
const webpackDevMiddleware = require('webpack-dev-middleware');
const path = require('path');
const requireFromString = require('require-from-string');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const clearConsole = require('../scripts/utils/clearConsole');

const paths = require('./paths');

const DevServer = (compiler, config, port, isInteractive) => {
  const app = express();
  const devMiddleware = webpackDevMiddleware(compiler, {
      publicPath: paths.appPath,
      writeToDisk: false,
  });

  app.use(devMiddleware);

  devMiddleware.waitUntilValid(() => {
      // devMiddleware.close(); // TODO: remove close() when hot module reloading works
      const filepath = path.join(paths.appPath,'dist', config.output.filename);
      const bundle = devMiddleware.fileSystem.readFileSync(filepath,'utf-8');
      requireFromString(bundle);
      serviceDiscovery();
  });

  app.use(bodyParser.json());

//   // @ts-ignore
  const pkgJson = require(paths.appPackageJson);

  const LOCAL_FLEX_URL = 'http://localhost:10001';

  let {
      KINVEY_APP_ID,
      KINVEY_APP_SECRET,
      KINVEY_MASTER_SECRET,
      KINVEY_BAAS_URL,
      KINVEY_API_VERSION,
      KINVEY_AUTH_HEADER,
      KINVEY_USER_NAME,
      KINVEY_USER_ID,
      FLEX_SHARED_SECRET,
  } = process.env;

  const KINVEY_CLIENT_APP_VERSION = pkgJson.version;

  const appMetadata = {
      _id: KINVEY_APP_ID,
      appsecret: KINVEY_APP_SECRET,
      baasUrl: KINVEY_BAAS_URL,
  };

  if (KINVEY_MASTER_SECRET) {
      appMetadata.mastersecret = KINVEY_MASTER_SECRET;
  }

  if ((!KINVEY_AUTH_HEADER || KINVEY_AUTH_HEADER === "") && KINVEY_APP_SECRET && KINVEY_MASTER_SECRET) {
      KINVEY_AUTH_HEADER = `Basic ${Buffer.from(`${KINVEY_APP_SECRET}:${KINVEY_MASTER_SECRET}`).toString('base64')}`;
  }

  let FLEX_LOCAL_HEADERS = {
      'X-Kinvey-App-Metadata' : JSON.stringify(appMetadata),
      'X-Kinvey-Original-Request-Headers': JSON.stringify({
          "x-kinvey-api-version": KINVEY_API_VERSION || "3",
          authorization: KINVEY_AUTH_HEADER,
          "x-kinvey-client-app-version": KINVEY_CLIENT_APP_VERSION || "1",
          "host": (KINVEY_BAAS_URL || 'baas').replace('https://', '')}),
      'X-Kinvey-Username': KINVEY_USER_NAME,
      'X-Kinvey-User-Id': KINVEY_USER_ID,
      'Content-Type': 'application/json',
  };

  if (FLEX_SHARED_SECRET) {
      FLEX_LOCAL_HEADERS['X-Auth-Key'] = FLEX_SHARED_SECRET;
  }

  app.get('/_flexFunctions/*', (req, res) => {
      const { path, query } = req;
      const url = `${LOCAL_FLEX_URL}${path}`;
      flexReq(url, 'POST', res, { query });
  });

  app.post('/_flexFunctions/*', (req, res) => {
      const { path, body } = req;
      const url = `${LOCAL_FLEX_URL}${path}`;
      flexReq(url, 'POST', res, body);
  });

  app.get('/_auth/*', (req, res) => {
      const { params, path, query } = req;
      const { body } = query;
      const url = `${LOCAL_FLEX_URL}${path}`;
      flexReq(url, 'POST', res, body);
  });

  app.get('/:serviceObject', (req, res) => {
      const { params } = req;
      const { serviceObject } = params;
      const url = `${LOCAL_FLEX_URL}/${serviceObject}`;
      flexReq(url, 'GET', res);
  });

  app.get('/:serviceObject/_count', (req, res) => {
      const { params } = req;
      const { serviceObject } = params;
      const url = `${LOCAL_FLEX_URL}/${serviceObject}/_count`;
      flexReq(url, 'GET', res);
  });

  app.get('/:serviceObject/:id', (req, res) => {
      const { params } = req;
      const { serviceObject, id } = params;
      const url = `${LOCAL_FLEX_URL}/${serviceObject}/${id}`;
      flexReq(url, 'GET', res);
  });

  const flexReq = (url, method, res, body = null) => {
      const headers = merge(
          res.headers,
          FLEX_LOCAL_HEADERS
      );
      const options = {
          url,
          method,
          headers,
      };
      if (body) options.body = JSON.stringify(body);
      return request(options).pipe(res);
  }

  const serviceDiscovery = () => {

      request.post(`${LOCAL_FLEX_URL}/_command/discover`, (err, response, body) => {
          const json = JSON.parse(body);
          const { dataLink, businessLogic, auth } = json;

        //   readline.cursorTo(process.stdout, -1);
            // process.stdout.write(`waiting ...`);

          dataLink.serviceObjects.forEach((serviceObject) => {
              const url = `${LOCAL_FLEX_URL}/${serviceObject}`;
              console.log(url);
          });

          businessLogic.handlers.forEach((handler) => {
              const url = `${LOCAL_FLEX_URL}/_flexFunctions/${handler}`;
              process.stdout.clearLine();
              console.log(url);
          });

          auth.handlers.forEach((handler) => {
              const url = `${LOCAL_FLEX_URL}/_auth/${handler}`;
              console.log(url);
          });
      });
  }

  app.listen(port, (err) => {
    if (err) {
      return console.log(err);
    }
    if (isInteractive) {
      clearConsole();
    }

    console.log(chalk.cyan('Starting the development server...\n'));
  });
}

module.exports = DevServer;
