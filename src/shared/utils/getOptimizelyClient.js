/**
 * getOptimizelyClient.js
 *
 * Instantiates a client instance for accessing Optimizely.
 *
 * (C) 2017 mobile.de GmbH
 *
 * @author <a href="mailto:pahund@team.mobile.de">Patrick Hund</a>
 * @since 02 Jan 2017
 * @see https://developers.optimizely.com/x/solutions/sdks/getting-started/index.html?language=javascript
 */
import optimizely from 'optimizely-client-sdk';

export default (datafile, log) => optimizely.createInstance({ datafile, logger: { log } });
