// @flow
import * as React from 'react';

import paperDecorator from '../PaperDecorator';
import { ErrorFallbackComponent } from '../../UI/ErrorBoundary';
import { generateUUID } from 'three/src/math/MathUtils';

export default {
  title: 'ErrorBoundary/ErrorFallbackComponent',
  component: ErrorFallbackComponent,
  decorators: [paperDecorator],
};

const fakeError = new Error('Fake error for storybook');
const fakeComponentStack = `
in e
in div
in s
in f
in e
in div
in s
in div
in s
in div
in ForwardRef
in ck
in div
in ForwardRef
in ForwardRef
in Unknown
in Ff
in ForwardRef
in t
in div
in div
in t
in DragSource(t)
in DropTarget(DragSource(t))
in n
in y
in t
in div
in div
in t
in div
in t
in n
in ForwardRef
in div
in l
in n
in n
in t
in Unknown
in aI
in div
in n
in Na
in div
in xL
in Unknown
in mt
in f
in u
in v
in m`;
const fakeErrorWithCriticalStack = new Error('Fake error for storybook');
const fakeCriticalErrorStack = `
TypeError: Cannot read properties of undefined (reading 'toString') at a.getProperties (https://editor.gdevelop.io/static/js/1859.6eb1cd77.chunk.js:2:680094) at 4317 (https://editor.gdevelop.io/libGD.js?cache-buster=5.3.180-8dbf9c99ce5a0fe0417c0cb09302abcbc974d172:9:21098) at _emscripten_asm_const_iii (https://editor.gdevelop.io/libGD.js?cache-buster=5.3.180-8dbf9c99ce5a0fe0417c0cb09302abcbc974d172:9:28304) at https://editor.gdevelop.io/libGD.wasm?cache-buster=5.3.180-8dbf9c99ce5a0fe0417c0cb09302abcbc974d172:wasm-function[52]:0x26260 at https://editor.gdevelop.io/libGD.wasm?cache-buster=5.3.180-8dbf9c99ce5a0fe0417c0cb09302abcbc974d172:wasm-function[126]:0x2813d at ObjectConfiguration.GetProperties.ObjectConfiguration.GetProperties [as getProperties] (https://editor.gdevelop.io/libGD.js?cache-buster=5.3.180-8dbf9c99ce5a0fe0417c0cb09302abcbc974d172:9:1000775) at d.update (https://editor.gdevelop.io/static/js/1859.6eb1cd77.chunk.js:2:689155) at new d (https://editor.gdevelop.io/static/js/1859.6eb1cd77.chunk.js:2:688949) at Object.createNewInstanceRenderer (https://editor.gdevelop.io/static/js/5496.fae99fda.chunk.js:1:1978219) at e.getRendererOfInstance (https://editor.gdevelop.io/static/js/5496.fae99fda.chunk.js:1:1340592)
`;
fakeErrorWithCriticalStack.stack = fakeCriticalErrorStack;

export const Default = () => (
  <ErrorFallbackComponent
    componentStack={fakeComponentStack}
    error={fakeError}
    uniqueErrorId={generateUUID()}
    componentTitle="Instance properties"
  />
);

export const Critical = () => (
  <ErrorFallbackComponent
    componentStack={fakeComponentStack}
    error={fakeErrorWithCriticalStack}
    uniqueErrorId={generateUUID()}
    componentTitle="Project manager"
  />
);
