// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import prettier from 'prettier/standalone';
import babylonParser from 'prettier/parser-babylon';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import CopyIcon from '../UI/CustomSvgIcons/Copy';

// Pretty-print the generated JavaScript (it comes out essentially minified).
// Falls back to the original code if it cannot be parsed (e.g. partial code).
const formatJavaScript = (code: string): string => {
  try {
    return prettier.format(code, {
      parser: 'babylon',
      plugins: [babylonParser],
    });
  } catch (e) {
    return code;
  }
};

const styles = {
  // Scrollable, monospace, read-only view of the generated JavaScript.
  code: {
    margin: 0,
    padding: 8,
    overflow: 'auto',
    whiteSpace: 'pre',
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: 13,
    lineHeight: 1.4,
    // Fill the flex-column dialog body so it gets its own scrollbar.
    flex: 1,
    minHeight: 0,
    userSelect: 'text',
  },
};

type Props = {|
  /** The displayed scene/events name, for the dialog title. */
  name: string,
  /** The generated JavaScript code, or null while/if generation failed. */
  code: ?string,
  /** An error message if code generation failed. */
  error?: ?string,
  /**
   * True when the code is the whole behavior/object (all its functions), because
   * GDevelop cannot generate a single behavior/object method in isolation.
   */
  isWholeEntity?: boolean,
  onClose: () => void,
|};

/**
 * A read-only dialog showing the JavaScript code GDevelop generates for a
 * scene's events (the same code path used for previews/exports), with a button
 * to copy it to the clipboard.
 */
const GeneratedCodeDialog = ({
  name,
  code,
  error,
  isWholeEntity,
  onClose,
}: Props): React.Node => {
  const [justCopied, setJustCopied] = React.useState(false);

  // Format once per code change.
  const formattedCode = React.useMemo(
    () => (code ? formatJavaScript(code) : null),
    [code]
  );

  const onCopy = React.useCallback(
    () => {
      if (!formattedCode) return;
      try {
        navigator.clipboard.writeText(formattedCode);
        setJustCopied(true);
        setTimeout(() => setJustCopied(false), 2000);
      } catch (e) {
        // Clipboard not available — ignore (the text is still selectable).
      }
    },
    [formattedCode]
  );

  return (
    <Dialog
      // The scene name is composed outside the translated string: it is a
      // dynamic value (and a new message may not be in the compiled catalog yet,
      // which would otherwise show a literal "{name}").
      title={
        <>
          <Trans>Generated JavaScript for</Trans> {name}
        </>
      }
      maxWidth="lg"
      fullHeight
      flexColumnBody
      open
      onRequestClose={onClose}
      actions={[
        <FlatButton
          key="copy"
          leftIcon={<CopyIcon />}
          label={justCopied ? <Trans>Copied!</Trans> : <Trans>Copy code</Trans>}
          onClick={onCopy}
          disabled={!formattedCode}
        />,
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary
          onClick={onClose}
        />,
      ]}
    >
      {error ? (
        <Text>
          <Trans>Could not generate the code.</Trans>
          {'\n'}
          {error}
        </Text>
      ) : (
        <>
          {isWholeEntity && (
            <Text noMargin color="secondary">
              <Trans>
                This is the complete generated code for the behavior or object
                (all of its functions), as GDevelop generates them together.
              </Trans>
            </Text>
          )}
          <pre style={styles.code}>{formattedCode}</pre>
        </>
      )}
    </Dialog>
  );
};

export default GeneratedCodeDialog;
