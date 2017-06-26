/**
 * setup.js
 *
 * Setup for Mocha tests, used to make the sass style modules work without webpack loaders.
 *
 * (C) 2016 mobile.de GmbH
 *
 * @see https://gist.github.com/ryanseddon/e76fd16af2f8f4f4bed8
 * @author <a href="mailto:pahund@team.mobile.de">Patrick Hund</a>
 * @since 16 Apr 2016
 */

if (!global._babelPolyfill) {
    require('babel-polyfill');
}

const hook = require('css-modules-require-hook');
const sass = require('node-sass');
const jsdom = require('jsdom').jsdom;
const path = require('path');
const exposedProperties = ['window', 'navigator', 'document', 'location'];
const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const chaiEnzyme = require('chai-enzyme');

chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(chaiEnzyme());

hook({
    extensions: ['.scss'],
    preprocessCss(css, filepath) {
        const result = sass.renderSync({
            data: css,
            includePaths: [path.resolve(filepath, '..')]
        });
        return result.css;
    }
});

global.document = jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;

Object.keys(document.defaultView).forEach(property => {
    if (typeof global[property] === 'undefined') {
        exposedProperties.push(property);
        global[property] = document.defaultView[property];
    }
});

global.navigator = {
    userAgent: 'mocha'
};

global.HTMLElement = typeof HTMLElement === 'undefined' ? () => {} : HTMLElement;
