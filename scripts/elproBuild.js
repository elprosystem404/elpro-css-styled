const path = require('path');
const { resolve, join, basename } = require('path');
const fs = require('fs-extra');

const appDirectory = fs.realpathSync(process.cwd());
const appDist = `${appDirectory}/dist`;
const distPath = join(appDirectory, './');

// ......................................
////  writeCjsEntryFile
// ......................................

async function writeCjsEntryFile(name, entrie = '') {
  const baseLine = `module.exports = require('./${name}`;
  const contents = `
  'use strict'

  if (process.env.NODE_ENV === 'production') {
    ${baseLine}.cjs.prod.js')
  } else {   
    ${baseLine}.cjs.dev.js')
  }
  `;

  const targetPath = path.join(`${appDist}/${entrie}`, `${name}.cjs.js`);

  return fs.outputFile(targetPath, contents);
}

// ......................................
////  writeMjsEntryFile
// ......................................

async function writeMjsEntryFile(name) {
  const contents = ` 
  export * from './${name}.esm.mjs';
    `;
  return fs.outputFile(path.join(appDist, `${name}.esm.mjs`), contents);
}

// ......................................
////  writeJson
// ......................................

const writeJson = (targetPath, obj) =>
  fs.writeFile(targetPath, JSON.stringify(obj, null, 2), 'utf8');

// ......................................
////  createPackageFile
// ......................................

async function createPackageFile(targetPath, newPackageData) {
  await writeJson(targetPath, newPackageData);
}

const createExportEntries = (name, entries) => {
  const exports = entries.reduce((acc, entrie) => {
    const key = entrie === '.' ? entrie : `./${entrie}`;
    const folder = key === '.' ? '' : `/${entrie}`;

    return {
      ...acc,
      [key]: {
        types: `./dist${folder}/index.d.ts`,
        import: `./dist${folder}/${name}.esm.mjs`,
        require: `./dist${folder}/${name}.cjs.mjs`,
      },
    };
  }, {});
  return exports;
};

// ......................................
////  getFolders
// ......................................

const filterDirs = (name) => {
  const split = name.split('.');
  return split.length > 1 ? false : true;
};

const isEqual = (arrayA, arrayB) => {
  if (arrayA.length !== arrayB.length) {
    return false;
  }
  let result = [];
  let length = arrayA.length;
  arrayA.forEach((element, index) => {
    if (arrayB[index].trim() === element.trim()) {
      result.push(true);
    } else {
      result.push(false);
    }
  });
  return result.filter(Boolean).length === length;
};

const getFolders = (appDirectory, entry) => {
  const pathResolve = resolve(appDirectory, entry);
  const folders = fs.readdirSync(pathResolve, 'utf8');
  const filteredFolders = folders.filter((name) => filterDirs(name));
  const root = isEqual(folders, filteredFolders);

  return { folders, root: !root };
};

// ......................................
////  includeFileInBuild
// ......................................

async function includeFileInBuild(file) {
  const sourcePath = resolve(process.cwd(), file);
  const targetPath = resolve(appDist, basename(file));
  await fs.copy(sourcePath, targetPath);
  // console.log(`Copied ${sourcePath} to ${targetPath}`);
}

async function writeEntryFile(name, entries, packageData) {
  entries.forEach(async (entrie) => {
    await writeCjsEntryFile(name, entrie);
    // await writeMjsEntryFile(name);
  });

  //--- create exports entries in root application
  const exports = createExportEntries(name, entries);
  const newPackageData = {
    ...packageData,
    exports: {
      './package.json': './package.json',
      ...exports,
    },
  };

  const targetPath = resolve(`${distPath}`, './package.json');
  await createPackageFile(targetPath, newPackageData);

  await includeFileInBuild('./README.md');
  await includeFileInBuild('./LICENSE');
}

// ......................................
////  run
// ......................................

async function run() {
  try {
    const packageData = JSON.parse(
      await fs.readFile(resolve(process.cwd(), './package.json'), 'utf8')
    );

    const { folders, root } = getFolders(appDirectory, 'dist');

    const entries = root ? ['.', ...folders] : folders;
    writeEntryFile(packageData.name, entries, packageData);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
