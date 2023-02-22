const fs = require('fs');

const path = require('path');

const CSVStringifier = require('csv-stringify/sync');
const CSVParse = require('csv-parse/sync');

const _set = require('lodash/set');

module.exports = async (api, options) => {

  const mode = options.mode || 'JSONtoCSV';
  const jsonDir = options.jsonDir || './src/locales';
  const csvDir = options.csvDir || './localizations';

  if (mode === 'JSONtoCSV') {

    convertJSONtoCSV(jsonDir, csvDir);

    copyReadMe(csvDir);

  } else if (mode === 'CSVtoJSON') {

    convertCSVtoJSON(csvDir, jsonDir);

  } else {
    throw new Error('unknown mode ' + mode);
  }

  addPackageScripts(api, jsonDir, csvDir);
};

const convertJSONtoCSV = function(jsonDir, csvDir) {
  fs.readdirSync(jsonDir)
      // filename to path
      .map(filename => [jsonDir, filename].join('/'))
      // read JSON Files
      .map(uri => ({uri, json: readJSONFile(uri)}))
      // add Object paths
      .map(file => {
        file.json = addObjectPaths(file.json);
        return file;
      })
      // generate CSV per locale: objPath => value
      .map(file => {
        file.csvData = generateCSVMap(file.json);
        return file;
      })
      // write CSV
      .forEach(({uri, csvData}) => writeCSVFile(uri, csvDir, csvData));
};

const convertCSVtoJSON = function(csvDir, jsonDir) {
  fs.readdirSync(csvDir)
      .map(filename => [csvDir, filename].join('/'))
      .map(uri => ({
        uri,
        content: fs.readFileSync(uri),
      }))
      .map(file => {
        file.parsedContent = CSVParse.parse(file.content, {
          columns: false,
          skip_empty_lines: true,
        });
        return file;
      })
      .forEach(
          ({uri, parsedContent}) => writeJSONFile(uri, jsonDir, parsedContent));
};

const addPackageScripts = function(api, jsonDir, csvDir) {

  let packageExt = {
    scripts: {
      'i18n-export-csv': 'vue invoke vue-cli-plugin-i18n-exchange --mode JSONtoCSV --jsonDir ' +
          jsonDir + ' --csvDir ' + csvDir,
      'i18n-import-csv': 'vue invoke vue-cli-plugin-i18n-exchange --mode CSVtoJSON --jsonDir ' +
          jsonDir + ' --csvDir ' + csvDir,
    },
  };

  api.extendPackage(packageExt);
};

const readJSONFile = function(uri) {
  const content = fs.readFileSync(uri);
  return JSON.parse(content.toString());
};

const addObjectPaths = function(
    obj, objectPath = [], objectPathKey = '$_path') {
  if (Array.isArray(obj)) {

    obj.map((item, idx) => addObjectPaths(item, [...objectPath, idx],
        objectPathKey));

  } else if (typeof obj === 'object') {
    obj[objectPathKey] = objectPath;
    for (const key in obj) {
      obj[key] = addObjectPaths(obj[key], [...objectPath, key], objectPathKey);
    }
  }

  return obj;
};

const generateCSVMap = function(
    srcObject, result = {}, objectPathKey = '$_path') {

  if (Array.isArray(srcObject)) {
    srcObject.forEach(value => result = generateCSVMap(value, result));
  } else if (typeof srcObject === 'object') {
    for (const key in srcObject) {
      const value = srcObject[key];

      if (typeof value === 'string') {
        const resultKey = [
          ...srcObject[objectPathKey],
          key,
        ].join('.');

        result[resultKey] = value;
      } else {
        result = generateCSVMap(value, result);
      }

    }
  }

  return result;
};

const writeCSVFile = function(srcFile, csvDir, csvData) {

  const [localeName] = srcFile.split('/').pop().split('.');
  const targetFile = [csvDir, localeName].join('/') + '.csv';

  if (!fs.existsSync(csvDir)) {
    fs.mkdirSync(csvDir);
  }

  const stringified = CSVStringifier.stringify(Object.entries(csvData));

  fs.writeFileSync(targetFile, stringified);

  console.info(
      '✅ CSV file for locale "' + localeName + '" created successfully in ' +
      csvDir,
  );

};

const writeJSONFile = function(srcFileUri, jsonDir, contents) {
  const [locale] = srcFileUri.split('/').pop().split('.');
  const targetFileUri = [jsonDir, locale].join('/') + '.json';

  let result = {};

  if (fs.existsSync(targetFileUri)) {
    result = fs.readFileSync(targetFileUri);
  }

  contents.forEach(([key, value]) => {
    _set(result, key, value);
  });

  console.log(locale, targetFileUri, result);

  fs.writeFileSync(targetFileUri, JSON.stringify(result));

};

const copyReadMe = function(csvDir) {
  fs.copyFileSync('./static/README.md', csvDir);
  fs.copyFileSync('./static/README.txt', csvDir);
};
