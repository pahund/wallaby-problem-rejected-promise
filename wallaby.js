/**
 * wallaby.js
 *
 * Configuration for the wallaby.js test runner, which is available as a plugin for JetBrains IDEs
 * (IntelliJ IDEA, WebStorm, etc.) as well as Sublime, Atom, Visual Studio and VS Code.
 *
 * (C) 2016 mobile.de GmbH
 *
 * @author <a href="mailto:pahund@team.mobile.de">Patrick Hund</a>
 * @since 17 Nov 2016
 */
module.exports = wallaby => ({
    files: [
        'src/**/*.js',
        'src/**/*.scss'
    ],

    tests: [
        'test/**/*Test.js'
    ],

    env: {
        type: 'node',
        runner: '/usr/local/bin/node'
    },

    workers: {
        recycle: true
    },

    testFramework: 'mocha',

    compilers: {
        '**/*.js': wallaby.compilers.babel()
    },

    bootstrap: () => {
        const path = require('path');
        const setupPath = path.join(wallaby.localProjectDir, 'test/setup');
        require(setupPath);
    },

    // reportUnhandledPromises: false
});
