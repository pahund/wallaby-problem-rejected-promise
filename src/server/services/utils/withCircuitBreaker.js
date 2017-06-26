/**
 * withCircuitBreaker.js
 *
 * (C) 2017 mobile.de GmbH
 *
 * @author <a href="mailto:pahund@team.mobile.de">Patrick Hund</a>
 * @since 31 Jan 2017
 */
import CircuitBreaker from 'circuit-breaker-js';

const defaultOptions = {
    timeoutDuration: 1000,
    volumeThreshold: 5,
    errorThreshold: 50,
    windowDuration: 10000
};

export default (options = {}) => {
    const circuitBreaker = new CircuitBreaker({
        ...defaultOptions,
        ...options
    });
    return func => new Promise((resolve, reject) => {
        circuitBreaker.run(async (success, failed) => {
            try {
                const data = await func();
                success();
                resolve(data);
            } catch (err) {
                failed();
                reject(err);
            }
        }, () => reject(new Error('circuit breaker open')));
    });
};
