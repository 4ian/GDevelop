import expect from 'expect.js';
import sinon from 'sinon';

// Expose expect.js and sinon globally like Karma used to do.
// Vitest provides its own expect, but tests rely on expect.js syntax.
// eslint-disable-next-line no-undef
global.expect = expect;
// eslint-disable-next-line no-undef
global.sinon = sinon;
