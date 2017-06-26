/**
 * withUsecase.js
 *
 * (C) 2017 mobile.de GmbH
 *
 * @author <a href="mailto:pahund@team.mobile.de">Patrick Hund</a>
 * @since 31 Mär 2017
 */

import Usecase from './Usecase';

export default (id, logger, func) => {
    const usecase = new Usecase(id, logger);
    return async (...args) => {
        usecase.startTimer();
        let result;
        try {
            result = await func(...args);
        } catch (err) {
            usecase.stopTimer().fail();
            throw err;
        }
        usecase.stopTimer().success();
        return result;
    };
};
