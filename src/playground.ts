import configurations from './configurations';
import './extensions';
// TODO change logger to just use console in this case
import logger from './utilities/logger';
import * as moment from 'moment';

const enableddMarker = new Array(20).join('*');
const disableddMarker = new Array(20).join('#');
if (configurations.email.enabled) {
    logger.info(`${enableddMarker} EMAIL ENABLED ${enableddMarker}`);
} else {
    logger.info(`${disableddMarker} EMAIL DISABLED ${disableddMarker}`);
}

import { sync } from './database';
import cronicleHelper, { CronicleConstants, CroniclePlugins, HttpMethod } from './utilities/cronicle-helper';

(async (): Promise<void> => {
    await sync();

    logger.info('Playground start');
    // await cronicleHelper.deleteAll();
    // return;
    const resultPromises: Array<Promise<unknown>> = []; 
    for (let i = 0; i < 1001; i++) {
        let result: unknown; 
        try {
            const resultPromise = cronicleHelper.createJob({
                plugin: CroniclePlugins.HTTP_REQUEST,
                enabled: true,
                title: `Iteration: ${i}; Date: ${new Date().toString()}`,
                timing: moment().add(1, 'minutes'),
                params: {
                    method: HttpMethod.POST,
                    url: 'http://localhost:3001/backend-api/hook'
                }
            });
            resultPromise.then((data: unknown) => {
                console.log(data);
            });
            resultPromises.push(resultPromise);
            // result = resp.data;
        } catch (e) {
            // result = e.message;
        }
        // logger.info(JSON.stringify(result, null, 2));    
    }
    await Promise.all(resultPromises);
    logger.info('Playground done');
})();
