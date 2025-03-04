// @flow
import * as React from 'react';
import { aboveMaterialUiMaxZIndex } from '../UI/MaterialUISpecificUtil';
import { useInterval } from '../Utils/UseInterval';

const blockingLayerZIndex = aboveMaterialUiMaxZIndex;
export const itemAboveBlockingLayerZIndex = blockingLayerZIndex + 1;

type Props = {|
  elements: Array<HTMLElement>,
|};

const BlockingLayerWithHoles = ({ elements }: Props) => {
  const [holes, setHoles] = React.useState([]);

  const updateHoles = React.useCallback(
    () => {
      const newHoles = elements.map(element => {
        const { top, left, width, height } = element.getBoundingClientRect();
        return {
          top,
          left,
          width,
          height,
        };
      });
      setHoles(newHoles);
    },
    [elements]
  );

  React.useEffect(
    () => {
      // Update hole position on scroll & resize
      window.addEventListener('wheel', updateHoles);
      window.addEventListener('touchmove', updateHoles);
      window.addEventListener('resize', updateHoles);
      updateHoles(); // Initial position update

      return () => {
        window.removeEventListener('wheel', updateHoles);
        window.removeEventListener('touchmove', updateHoles);
        window.removeEventListener('resize', updateHoles);
      };
    },
    [updateHoles]
  );

  // We also update the hole position every second, as the item may keep moving
  // on the deceleration phase of a scroll.
  useInterval(updateHoles, 1000);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'all',
        zIndex: blockingLayerZIndex,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,.25)',
        /* Creating holes for elements */
        clipPath: `polygon(
        0% 0%, 100% 0%, 100% 100%, 0% 100%, /* Outer bounds */
        ${holes
          .map(hole => {
            const { top, left, width, height } = hole;
            return `0% ${top}px,
              ${left}px ${top}px, 
              ${left}px ${top + height}px, 
              ${left + width}px ${top + height}px, 
              ${left + width}px ${top}px, 
              0% ${top}px
            `;
          })
          .join(',')}
      )`,
      }}
      id="BlockingLayerWithHoles"
    />
  );
};

export default BlockingLayerWithHoles;
