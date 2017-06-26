/**
 * getOptimizelyUserId.js
 *
 * (C) 2017 mobile.de GmbH
 *
 * @author <a href="mailto:pahund@team.mobile.de">Patrick Hund</a>
 * @since 02 Jan 2017
 */
import uuid from 'uuid/v1';

export default (cookieName, req, res) => {
    let { [cookieName]: userId } = req.cookies;
    if (!userId) {
        userId = uuid();
        res.cookie(cookieName, userId);
    }
    return userId;
};
