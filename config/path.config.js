import path from 'path'
import fs from 'fs-extra';

export const appDirectory = fs.realpathSync(process.cwd());
export const resolveApp = function(relativePath) {
    return path.resolve(appDirectory, relativePath);
};

export const PATH = {  
    app:appDirectory,  
    tsconfigJson:resolveApp('tsconfig.json'),
    packagejson:resolveApp('package.json'),
    root:resolveApp('..'),
    src:resolveApp('src'),
    build:resolveApp('build'),
    dist:resolveApp('dist'),
}