// @ts-check

/**
 * Drives a page from the test: the generic helpers installed in it, plus what
 * needs real input events (drag and drop, keyboard).
 */

const wait = durationInMs =>
  new Promise(resolve => setTimeout(resolve, durationInMs));

const click = (page, target) =>
  page.evaluate(theTarget => window.gdVisualTests.click(theTarget), target);

const exists = (page, target) =>
  page.evaluate(theTarget => window.gdVisualTests.exists(theTarget), target);

const setInputValue = (page, target, value) =>
  page.evaluate(
    (theTarget, theValue) =>
      window.gdVisualTests.setInputValue(theTarget, theValue),
    target,
    value
  );

const typeInInput = (page, target, value) =>
  page.evaluate(
    (theTarget, theValue) =>
      window.gdVisualTests.typeInInput(theTarget, theValue),
    target,
    value
  );

const rectOf = (page, target, shouldScroll) =>
  page.evaluate(
    (theTarget, scroll) => window.gdVisualTests.rectOf(theTarget, scroll),
    target,
    shouldScroll
  );

const openContextMenu = (page, target) =>
  page.evaluate(
    theTarget => window.gdVisualTests.openContextMenu(theTarget),
    target
  );

const scrollList = (page, delta, target) =>
  page.evaluate(
    (theDelta, theTarget) =>
      window.gdVisualTests.scrollList(theDelta, theTarget),
    delta,
    target
  );

const describeOverlays = page =>
  page.evaluate(() => window.gdVisualTests.describeOverlays());

/** Drag and drop with real mouse events (the drag backend handles them). */
const dragFromTo = async (page, fromTarget, toTarget, dropAfter) => {
  const from = await rectOf(page, fromTarget, true);
  if (!from) return false;
  const to = await rectOf(page, toTarget, false);
  if (!to) return false;

  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  // More than `touchSlop` (10px) is needed for the drag to start.
  await page.mouse.move(from.x + 16, from.y + 4, { steps: 4 });
  const targetX = dropAfter ? to.x + to.width / 3 : to.x;
  await page.mouse.move(targetX, to.y, { steps: 10 });
  await page.mouse.move(targetX, to.y + 2, { steps: 2 });
  await wait(150);
  await page.mouse.up();
  await wait(400);
  return true;
};

/** Collect the uncaught errors of a page (and the errors React reports). */
const watchPageErrors = page => {
  const pageErrors = [];
  page.on('pageerror', error => {
    const message = error.message || String(error);
    pageErrors.push(
      message +
        (error.stack
          ? '\n' +
            error.stack
              .split('\n')
              .slice(0, 8)
              .join('\n')
          : '')
    );
  });
  page.on('console', message => {
    const text = message.text();
    if (
      message.type() === 'error' &&
      text.includes('The above error occurred in the')
    )
      pageErrors.push('React reports: ' + text.split('\n')[1]);
  });
  return pageErrors;
};

/** Wait for something to be there, without failing the test. */
const waitFor = async (page, target, timeoutInMs = 10000) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutInMs) {
    if (await exists(page, target)) return true;
    await wait(300);
  }
  return false;
};

const closeAnyMenu = async page => {
  const { openMenuItems } = await describeOverlays(page);
  if (!openMenuItems.length) return;
  await page.keyboard.press('Escape');
  await wait(300);
};

/** Close whatever is opened over the editor, so that it is usable again. */
const closeAnyOverlay = async page => {
  const { openMenuItems, openDialogTitles } = await describeOverlays(page);
  if (openMenuItems.length) {
    await page.keyboard.press('Escape');
    await wait(300);
    return true;
  }
  if (openDialogTitles.length) {
    const closed =
      (await click(page, { dialogButton: 'Apply' })) ||
      (await click(page, { dialogButton: 'Ok' })) ||
      (await click(page, { dialogButton: 'Close' })) ||
      (await click(page, { dialogButton: 'Cancel' }));
    if (!closed) await page.keyboard.press('Escape');
    await wait(500);
    return true;
  }
  return false;
};

module.exports = {
  wait,
  click,
  exists,
  setInputValue,
  typeInInput,
  rectOf,
  openContextMenu,
  scrollList,
  describeOverlays,
  dragFromTo,
  watchPageErrors,
  waitFor,
  closeAnyMenu,
  closeAnyOverlay,
};
