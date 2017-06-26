/**
 * getOptimizelyData.js
 *
 * Gets the optimizely config from Optimizely's CDN
 *
 * (C) 2017 mobile.de GmbH
 *
 * @author <a href="mailto:pahund@team.mobile.de">Patrick Hund</a>
 * @since 02 Jan 2017
 * @see https://developers.optimizely.com/x/solutions/sdks/getting-started/index.html?language=javascript
 */

import axios from 'axios';

export default async (url, logger) => {
    try {
        return (await axios.get(url)).data;
    } catch (err) {
        logger.forFile('server/services/utils/getOptimizelyData.js')
            .error(`failed to fetch JSON from Optimizely API from ${url}`, err);
        throw err;
    }
};
