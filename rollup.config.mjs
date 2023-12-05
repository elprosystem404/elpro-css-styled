/*--- https://blog.logrocket.com/how-to-build-component-library-react-typescript/

https://github.com/GovTechSG/sgds-govtech-react/blob/v2/rollup.config.js

export NODE_OPTIONS="--max-old-space-size=8192"

 */

import { PATH } from './config/path.config';
import {
    createConfig,
    getFolders,
    safePackageName,
} from './config/rollup.config';

const packageJson = require(PATH.packagejson);

//--- folders including root access point
// const folders = ['', ...getFolders(pathSrc)];

const folders = getFolders(PATH.src); // ['css', 'styled'] 

const config = folders
    .map((folder) =>
        createConfig(
            packageJson,
            folder ? `${folder}/` : '',
            'index.js'
        )
    )
    .flat();

//

export default config;