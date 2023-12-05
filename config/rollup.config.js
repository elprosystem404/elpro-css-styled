// import resolve from '@rollup/plugin-node-resolve';
// import terser from '@rollup/plugin-terser';
// import generatePackageJson from 'rollup-plugin-generate-package-json';
// import typescript from '@rollup/plugin-typescript';
import path from 'path';
import * as fs from 'fs-extra';
import { dts } from 'rollup-plugin-dts';
import commonjs from '@rollup/plugin-commonjs';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { PATH } from './path.config';
import replace from '@rollup/plugin-replace';


const filterDirs = (name) => {
  const split = name.split('.');
  return split.length > 1 ? false : true;
};

export const getFolders = (pathSrc) => {
  const srcDirs = fs.readdirSync(pathSrc, 'utf8');
  return srcDirs.filter((name) => filterDirs(name));
};

export const safePackageName = (name) =>
  name
    .toLowerCase()
    .replace(/(^@.*\/)|((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, '');

// ......................................
////  outputFile
// ......................................

const outputFile = (packageName, folder) => {
  const outputname = packageName;
  const outputfolder = `${folder}${outputname}`;
  const options = [
    {
      format: 'cjs',
      ext: '.cjs.js',
    },
    { format: 'cjs', ext: '.cjs.dev.js' },
    { format: 'cjs', ext: '.cjs.prod.js' },
    { format: 'cjs', ext: '.cjs.mjs' },
    { format: 'esm', ext: '.esm.mjs' },
  ];
  return options.map((opt) => {
    return {
      file: path.join(PATH.dist, `${outputfolder}${opt.ext}`),
      format: `${opt.format}`,
      sourcemap: true,
      exports: 'named',
      globals: { react: 'React' },
    };
  });
};

// ......................................
////  createConfig
// ......................................

export const createConfig = (packageJson, folder, filename) => {
  const packageName = safePackageName(packageJson.name)
  const input = path.join(PATH.src, `${folder}${filename}`);
  const output = outputFile(packageName, folder);
  const plugins = [
    replace({
      preventAssignment: true,
      __IS_DEV__: process.env.NODE_ENV === 'development',
    }),
    nodeResolve({
      browser: true,
    }),
    commonjs({
      include: /\/node_modules\//,
    }),
    peerDepsExternal(),
    babel({
      babelHelpers: 'bundled',
      exclude: '/node_modules',
      extensions: ['.js','.ts', '.tsx'],
      presets: [
        '@babel/preset-env',
        '@babel/preset-react',
        '@babel/preset-typescript',
      ],
    }),
  //  typescript({ tsconfig: PATH.tsconfigJson }),
  ];
  const external = ['react', 'react-dom'];

  const configTypes = createConfigTypes( folder, input);

  return [
    {
      input,
      output,
      plugins,
      external,
    },
    configTypes,
  ];
};

// ......................................
////  createConfigTypes
// ......................................

export const createConfigTypes = ( folder, inputName) => {
  
  const input = inputName
  const outputfolder = [
    { file: path.join(PATH.dist, `${folder}types.d.ts`), format: 'es' },
  ];
  const external = [];

  return {
    input,
    output: outputfolder,
    plugins: [dts()],
    external,
  };
};
