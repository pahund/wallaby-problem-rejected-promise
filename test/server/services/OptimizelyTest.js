/**
 * OptimizelyTest.js
 */

import { expect } from 'chai';
import mockery from 'mockery';
import { sandbox, match } from 'sinon';
import { DEBUG, INFO, WARNING, ERROR } from '../../../src/shared/utils/optimizelyLogLevels';

const userId = '1234';
const variants = { 'experiment-1': 'variant-1' };
const data = [{ version: 2 }];
const client = {
    activate: experiment => variants[experiment]
};
const cookieName = 'ilovecookies';
const req = 'req';
const res = 'res';

const scenarios = {
    NORMAL: 0,
    DEBUG_ENABLED: 1,
    FETCH_DATA_FAILURE: 2
};

describe('[server/services/Optimizely]', () => {
    describe('When I instantiate a Optimizely service', () => {
        let mySandbox,
            optimizely,
            fake,
            logger;
        beforeEach(() => {
            ({
                mySandbox,
                optimizely,
                fake,
                logger
            } = setup(scenarios.NORMAL));
        });
        describe('the “data” property', () => it('is not set', () => expect(optimizely.data).to.equal(null)));
        describe('and I try to get variants', () => {
            let gonnaThrow;
            beforeEach(() => gonnaThrow = () => optimizely.getVariants());
            describe('an error', () => it('is thrown because no data was fetched', () => gonnaThrow.should.throw(
                'Cannot get Optimizely config for incoming request, no data; did you forget to call fetch?'
            )));
        });
        describe('and I call the “log with optimizely client” method', () => {
            describe('with log level “debug” and a message', () => {
                beforeEach(() => optimizely.logWithOptimizelyClient(DEBUG, 'fred'));
                describe('the debug logger', () => it('is not called', () =>
                    fake.loggerDebug.should.not.have.been.called
                ));
            });
            describe('with log level “info” and a message', () => {
                beforeEach(() => optimizely.logWithOptimizelyClient(INFO, 'bazong'));
                describe('the info logger', () => it('is not called', () =>
                    fake.loggerInfo.should.not.have.been.called
                ));
            });
            describe('with log level “warning” and a message', () => {
                beforeEach(() => optimizely.logWithOptimizelyClient(WARNING, 'rapante'));
                describe('the warning logger', () => it('is not called', () =>
                    fake.loggerWarn.should.not.have.been.called
                ));
            });
            describe('with log level “error” and a message', () => {
                beforeEach(() => optimizely.logWithOptimizelyClient(ERROR, 'grault'));
                describe('the error logger', () => it('is not called', () =>
                    fake.loggerError.should.not.have.been.called
                ));
            });
        });
        describe('and I call the “fetch” method', () => {
            beforeEach(() => optimizely.fetch());
            describe('the “with usecase” utility function', () => {
                it('is called with the correct usecase ID', () =>
                    fake.withUsecase.should.have.been.calledWith('outbound.optimizely.json')
                );
                it('is called with the provided logger', () =>
                    fake.withUsecase.should.have.been.calledWith(match.any, logger)
                );
            });
            describe('the “get optimizely data” utility function', () => {
                it('is called with the correct URL', () => fake.getData.should.have.been.calledWith('http://url.de'));
                it('is called with the correct logger', () =>
                    fake.getData.should.have.been.calledWith(match.any, logger)
                );
            });
            describe('the “get optimizely client” utility function', () => {
                it('is called with the correct data', () => fake.getClient.should.have.been.calledWith(data));
                it('is called with the instance\'s optimizely logger method', () =>
                    fake.getClient.should.have.been.calledWith(match.any, optimizely.logWithOptimizelyClient)
                );
            });
            describe('the “data” property', () =>
                it('is set with the correct data', () => optimizely.data.should.deep.equal(data))
            );
            describe('and I get variants for a request and response', () => {
                let result;
                beforeEach(() => result = optimizely.getVariants(req, res));
                describe('the “get optimizely user ID” utility function', () => {
                    it('is called with the configured cookie name', () =>
                        fake.getUserId.should.have.been.calledWith(cookieName)
                    );
                    it('is called with the provided request', () =>
                        fake.getUserId.should.have.been.calledWith(match.any, req)
                    );
                    it('is called with the provided response', () =>
                        fake.getUserId.should.have.been.calledWith(match.any, match.any, res)
                    );
                });
                describe('the result', () => {
                    it('contains variants', () => result.variants.should.deep.equal({ 'experiment-1': 'variant-1' }));
                    it('contains a user ID', () => result.userId.should.equal(userId));
                });
            });
        });
        describe('and I call the “fetch safely” method', () => {
            let result;
            beforeEach(() => result = optimizely.fetchSafely());
            describe('the result', () => it('is resolved with “true”', () => result.should.eventually.equal(true)));
            describe('the “with usecase” utility function', () => {
                it('is called with the correct usecase ID', () =>
                    fake.withUsecase.should.have.been.calledWith('outbound.optimizely.json')
                );
                it('is called with the provided logger', () =>
                    fake.withUsecase.should.have.been.calledWith(match.any, logger)
                );
            });
            describe('the “get optimizely data” utility function', () => {
                it('is called with the correct URL', () => fake.getData.should.have.been.calledWith('http://url.de'));
                it('is called with the correct logger', () =>
                    fake.getData.should.have.been.calledWith(match.any, logger)
                );
            });
            describe('the “get optimizely client” utility function', () => {
                it('is called with the correct data', () => fake.getClient.should.have.been.calledWith(data));
                it('is called with the instance\'s optimizely logger method', () =>
                    fake.getClient.should.have.been.calledWith(match.any, optimizely.logWithOptimizelyClient)
                );
            });
            describe('the “data” property', () =>
                it('is set with the correct data', () => optimizely.data.should.deep.equal(data))
            );
            describe('and I get variants for a request and response', () => {
                beforeEach(() => result = optimizely.getVariants(req, res));
                describe('the “get optimizely user ID” utility function', () => {
                    it('is called with the configured cookie name', () =>
                        fake.getUserId.should.have.been.calledWith(cookieName)
                    );
                    it('is called with the provided request', () =>
                        fake.getUserId.should.have.been.calledWith(match.any, req)
                    );
                    it('is called with the provided response', () =>
                        fake.getUserId.should.have.been.calledWith(match.any, match.any, res)
                    );
                });
                describe('the result', () => {
                    it('contains variants', () => result.variants.should.deep.equal({ 'experiment-1': 'variant-1' }));
                    it('contains a user ID', () => result.userId.should.equal(userId));
                });
            });
            describe('and I call the “fetch safely” method once again', () => {
                beforeEach(() => result = optimizely.fetchSafely());
                describe('the result', () => it('is resolved with “true”', () => result.should.eventually.equal(true)));
                describe('the “with usecase” utility function', () =>
                    it('is not called again', () => fake.withUsecase.should.have.been.calledOnce)
                );
                describe('the “get optimizely data” utility function', () =>
                    it('is is not called again', () => fake.getData.should.have.been.calledOnce)
                );
                describe('the “get optimizely client” utility function', () => {
                    it('is not called again', () => fake.getClient.should.have.been.calledOnce);
                });
                describe('the “data” property', () =>
                    it('still has the correct data', () => optimizely.data.should.deep.equal(data))
                );
                describe('and I get variants for a request and response', () => {
                    beforeEach(() => result = optimizely.getVariants(req, res));
                    describe('the “get optimizely user ID” utility function', () => {
                        it('is called with the configured cookie name', () =>
                            fake.getUserId.should.have.been.calledWith(cookieName)
                        );
                        it('is called with the provided request', () =>
                            fake.getUserId.should.have.been.calledWith(match.any, req)
                        );
                        it('is called with the provided response', () =>
                            fake.getUserId.should.have.been.calledWith(match.any, match.any, res)
                        );
                    });
                    describe('the result', () => {
                        it('contains variants', () =>
                            result.variants.should.deep.equal({ 'experiment-1': 'variant-1' })
                        );
                        it('contains a user ID', () => result.userId.should.equal(userId));
                    });
                });
            });
        });
        describe('and I set the data property', () => {
            beforeEach(() => optimizely.data = data);
            describe('the “get optimizely client” utility function', () => {
                it('is called with the correct data', () => fake.getClient.should.have.been.calledWith(data));
                it('is called with the instance\'s optimizely logger', () =>
                    fake.getClient.should.have.been.calledWith(match.any, optimizely.logWithOptimizelyClient)
                );
            });
        });
        afterEach(() => teardown(mySandbox));
    });
    describe('When I instantiate a Optimizely service and the Optimizely API cannot be reached', () => {
        let mySandbox,
            optimizely,
            fake,
            logger;
        beforeEach(() => {
            ({
                mySandbox,
                optimizely,
                fake,
                logger
            } = setup(scenarios.FETCH_DATA_FAILURE));
        });
        describe('and I call the “fetch” method', () => {
            let result;
            beforeEach(() => {
                // important: no short hand arrow function here!
                result = optimizely.fetch();
                result.catch(() => {});
            });
            describe('the result', () => {
                it('is a promise', () => result.should.be.a('promise'));
                it('is rejected', () => result.should.be.rejectedWith('nope'));
            });
            describe('the “with usecase” utility function', () => {
                it('is called with the correct usecase ID', () =>
                    fake.withUsecase.should.have.been.calledWith('outbound.optimizely.json')
                );
                it('is called with the provided logger', () =>
                    fake.withUsecase.should.have.been.calledWith(match.any, logger)
                );
            });
            describe('the “get optimizely data” utility function', () => {
                it('is called with the correct URL', () => fake.getData.should.have.been.calledWith('http://url.de'));
                it('is called with the correct logger', () =>
                    fake.getData.should.have.been.calledWith(match.any, logger)
                );
            });
            describe('the “data” property', () => it('is not set', () => expect(optimizely.data).to.equal(null)));
            describe('and I try to get variants', () => {
                let gonnaThrow;
                beforeEach(() => gonnaThrow = () => optimizely.getVariants());
                describe('an error', () => it('is thrown because no data was fetched', () => gonnaThrow.should.throw(
                    'Cannot get Optimizely config for incoming request, no data; did you forget to call fetch?'
                )));
            });
        });
        afterEach(() => teardown(mySandbox));
    });
    describe('When I instantiate a Optimizely service in debug mode', () => {
        let mySandbox,
            optimizely,
            fake;
        beforeEach(() => {
            ({
                mySandbox,
                optimizely,
                fake
            } = setup(scenarios.DEBUG_ENABLED));
        });
        describe('and I call the “log with optimizely client” method', () => {
            describe('with log level “debug” and a message', () => {
                beforeEach(() => optimizely.logWithOptimizelyClient(DEBUG, 'fred'));
                describe('the debug logger', () => it('is called with the message', () =>
                    fake.loggerDebug.should.have.been.calledWith('fred')
                ));
            });
            describe('with log level “info” and a message', () => {
                beforeEach(() => optimizely.logWithOptimizelyClient(INFO, 'bazong'));
                describe('the info logger', () => it('is called with the message', () =>
                    fake.loggerInfo.should.have.been.calledWith('bazong')
                ));
            });
            describe('with log level “warning” and a message', () => {
                beforeEach(() => optimizely.logWithOptimizelyClient(WARNING, 'rapante'));
                describe('the warning logger', () => it('is called with the message', () =>
                    fake.loggerWarn.should.have.been.calledWith('rapante')
                ));
            });
            describe('with log level “error” and a message', () => {
                beforeEach(() => optimizely.logWithOptimizelyClient(ERROR, 'grault'));
                describe('the error logger', () => it('is called with the message', () =>
                    fake.loggerError.should.have.been.calledWith('grault')
                ));
            });
        });
        afterEach(() => teardown(mySandbox));
    });
});

function setup(
    scenario
) {
    const mySandbox = sandbox.create();
    const rejection = Promise.reject(new Error('nope'));
    rejection.catch(() => {});
    const fake = {
        getUserId: mySandbox.stub().returns(userId),
        getData: mySandbox.stub().returns(scenario === scenarios.FETCH_DATA_FAILURE ?
            rejection : Promise.resolve(data)),
        getClient: mySandbox.stub().returns(client),
        withUsecase: mySandbox.stub().callsFake((name, logger, func) => (...args) => func(...args)),
        loggerDebug: mySandbox.spy(),
        loggerInfo: mySandbox.spy(),
        loggerWarn: mySandbox.spy(),
        loggerError: mySandbox.spy()
    };

    mockery.enable({
        useCleanCache: true,
        warnOnUnregistered: false
    });
    mockery.registerMock('./utils/getOptimizelyUserId', fake.getUserId);
    mockery.registerMock('./utils/getOptimizelyData', fake.getData);
    mockery.registerMock('../../shared/utils/getOptimizelyClient', fake.getClient);
    mockery.registerMock('../metrics/withUsecase', fake.withUsecase);
    mockery.registerMock('./utils/withCircuitBreaker', () => func => func());
    const logger = {
        forFile: () => ({
            debug: fake.loggerDebug,
            error: fake.loggerError,
            warn: fake.loggerWarn,
            info: fake.loggerInfo
        })
    };
    const config = {
        optimizely: {
            experiments: ['experiment-1'],
            url: 'http://url.de',
            cookieName,
            debug: scenario === scenarios.DEBUG_ENABLED
        }
    };

    const Optimizely = require('../../../src/server/services/Optimizely').default;
    const optimizely = new Optimizely(config, logger);
    return {
        mySandbox,
        fake,
        logger,
        optimizely
    };
}

function teardown(mySandbox) {
    mockery.deregisterAll();
    mockery.disable();
    mySandbox.restore();
}
