/**
 * Optimizely service used for A/B testing.
 */

import getOptimizelyClient from '../../shared/utils/getOptimizelyClient';

import { DEBUG, INFO, WARNING, ERROR } from '../../shared/utils/optimizelyLogLevels';
import withUsecase from '../metrics/withUsecase';
import getOptimizelyData from './utils/getOptimizelyData';
import getOptimizelyUserId from './utils/getOptimizelyUserId';
import withCircuitBreaker from './utils/withCircuitBreaker';

const data = Symbol('private property “data”');
const client = Symbol('private property “client”');
const circuitBreaker = Symbol('private property “circuit breaker”');

export default class {
    constructor(config, logger) {
        this[client] = null;
        this[data] = null;
        this[circuitBreaker] = withCircuitBreaker();
        ({
            error: this.logError,
            debug: this.logDebug,
            warn: this.logWarn,
            info: this.logInfo
        } = logger.forFile('server/services/Optimizely.js'));
        ({ optimizely: {
            debug: this.debug,
            experiments: this.experiments,
            url: this.url,
            cookieName: this.cookieName
        } } = config);
        this.pollyLogger = logger;
    }

    /**
     * Logger wrapper used by the internal Optimizely client, visible for testing purposes.
     * @param level The log level
     * @param message The message to log
     */
    logWithOptimizelyClient(level, message) {
        if (!this.debug) {
            return;
        }
        switch (level) {
            case DEBUG:
                this.logDebug(message);
                break;
            case INFO:
                this.logInfo(message);
                break;
            case WARNING:
                this.logWarn(message);
                break;
            case ERROR:
                this.logError(message);
                break;
            default:
        }
    }

    /**
     * Asynchronously loads Optimizely setup data from the Optimizely API.
     *
     * @throws An error is thrown if fetching data from the API has failed
     */
    async fetch() {
        this.data = await withUsecase(
            'outbound.optimizely.json', this.pollyLogger, getOptimizelyData
        )(this.url, this.pollyLogger);
        if (this.data) {
            this.logDebug('Successfully fetched Optimizely config data from API');
        }
    }

    /**
     * Asynchronously loads Optimizely setup data from the Optimizely API if data is currently not set, otherwise simply
     * returns the data previously fetched.
     *
     * Uses a circuit breaker for fetching the data to prevent spamming of the log files with
     * error messages when the Optimizely API goes down.
     *
     * If fetching data fails (or circuit breaker is open), no error is thrown.
     *
     * @returns A promise resolved with boolean true when the data is available or has been loaded successfully,
     *          or boolean false if loading the data has failed
     */
    async fetchSafely() {
        if (this.data) {
            return true;
        }
        try {
            await this[circuitBreaker](() => this.fetch());
        } catch (err) {
            // intentionally left blank; error is logged elsewhere
        }
        return this.data !== null;
    }

    /**
     * Sets the Optimizely configuration data.
     *
     * @param nextData The Optimizely configuration data to set
     */
    set data(nextData) {
        this[data] = nextData;
        if (nextData !== null) {
            this[client] = getOptimizelyClient(nextData, this.logWithOptimizelyClient);
        } else {
            this[client] = null;
        }
    }

    /**
     * Gets the Optimizely configuration data.
     *
     * @return The Optimizely configuration data object
     */
    get data() {
        return this[data];
    }

    /**
     * Resets the service client, i.e. removes the configuration data. Use this to force the {@link fetchSafely}
     * method to reload the configuration data.
     */
    reset() {
        this[data] = null;
    }

    /**
     * Gets Optimizely variants per request. The user ID is determined from the request's cookie. Variants for the
     * user are determined using the Optimizely SDK, using data previously retrieved. Note that data needs to be
     * set before calling this method, either by calling {@link fetch} / {@link fetchWithCache} or by setting
     * the data property.
     * @param req The request
     * @param res The response
     * @returns An object containing:
     *          - variants: Array with names of selected variants as strings
     *          - userId: Optimizely user ID determined from cookie
     */
    getVariants(req, res) {
        if (!this[client]) {
            throw new Error(
                'Cannot get Optimizely config for incoming request, no data; did you forget to call fetch?'
            );
        }
        const userId = getOptimizelyUserId(this.cookieName, req, res);
        const variants = this.experiments.reduce((acc, experiment) => ({
            ...acc,
            [experiment]: this[client].activate(experiment, userId)
        }), {});
        return {
            variants,
            userId
        };
    }
}
