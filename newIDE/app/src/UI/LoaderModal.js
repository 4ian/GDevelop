// @flow
import React from 'react';
import { I18n } from '@lingui/react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';

import Text from './Text';
import CircularProgress from './CircularProgress';
import { Column, Spacer } from './Grid';

const loaderSize = 50;
const dialogWithMessageWidth = 250;

const styles = {
  dialogContent: {
    padding: 10,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
  },
};

function useDelayedBoolean(target: boolean, delayMs: number): boolean {
  const [value, setValue] = React.useState<boolean>(false);
  const timerRef = React.useRef<?TimeoutID>(null);

  React.useEffect(
    () => {
      if (target) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setValue(true);
          timerRef.current = null;
        }, delayMs);
      } else {
        setValue(false);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    },
    [target, delayMs]
  );

  return value;
}

type Props = {|
  show: boolean,
  message?: ?MessageDescriptor,
  progress?: ?number,
|};

const transitionDuration = { enter: 400 };

const LoaderModal = ({ progress, message, show }: Props) => {
  const delayedShow = useDelayedBoolean(show, 150);
  const isInfinite = progress === null || progress === undefined;
  if (!delayedShow) return null;

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog open transitionDuration={transitionDuration}>
          <DialogContent style={styles.dialogContent}>
            <div
              style={{
                width: message ? dialogWithMessageWidth : undefined,
              }}
            >
              <Column noMargin alignItems="center" expand>
                <CircularProgress
                  size={loaderSize}
                  disableShrink={isInfinite}
                  value={isInfinite ? undefined : progress}
                  variant={isInfinite ? 'indeterminate' : 'determinate'}
                />
                {message && (
                  <>
                    <Spacer />
                    <Text noMargin align="center">
                      {i18n._(message)}
                    </Text>
                  </>
                )}
              </Column>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </I18n>
  );
};

export default LoaderModal;
