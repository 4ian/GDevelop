// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { AccordionHeader, AccordionBody, Accordion } from '../UI/Accordion';
import { IconContainer } from '../UI/IconContainer';
import { Column, Line } from '../UI/Grid';
import {
  type ExtensionShortHeader,
  getUserExtensionShortHeaders,
} from '../Utils/GDevelopServices/Extension';
import {
  type ExampleShortHeader,
  getUserExampleShortHeaders,
} from '../Utils/GDevelopServices/Example';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import Text from '../UI/Text';
import BackgroundText from '../UI/BackgroundText';
import EmptyMessage from '../UI/EmptyMessage';

type ContributionLineProps = {|
  fullName: string,
  previewIconUrl?: string,
  shortDescription?: string,
|};

export const ContributionLine = ({
  fullName,
  previewIconUrl,
  shortDescription,
}: ContributionLineProps) => (
  <Line>
    {previewIconUrl && (
      <IconContainer alt={fullName} src={previewIconUrl} size={64} />
    )}
    <Column expand>
      <Text noMargin>{fullName}</Text>
      <Text noMargin size="body2">
        {shortDescription}
      </Text>
    </Column>
  </Line>
);

type ExamplesAccordionProps = {|
  examples: Array<ExampleShortHeader>,
  exampleError: ?Error,
|};

export const ExamplesAccordion = ({
  examples,
  exampleError,
}: ExamplesAccordionProps) => {
  if (exampleError)
    return (
      <Column>
        <Line alignItems="center">
          <Text>
            <Trans>Error retrieving the examples</Trans>
          </Text>
        </Line>
      </Column>
    );

  return (
    <Accordion>
      <AccordionHeader>
        <Text displayInlineAsSpan>
          <Trans>Examples ({examples.length})</Trans>
        </Text>
      </AccordionHeader>
      <AccordionBody disableGutters>
        {examples.length === 0 ? (
          <EmptyMessage>
            <Trans>You haven't contributed any examples</Trans>
          </EmptyMessage>
        ) : (
          <Column>
            {examples.map(example => (
              <ContributionLine
                key={example.name}
                shortDescription={example.shortDescription}
                fullName={example.name}
                previewIconUrl={
                  example.previewImageUrls ? example.previewImageUrls[0] : ''
                }
              />
            ))}
          </Column>
        )}
      </AccordionBody>
    </Accordion>
  );
};

type ExtensionsAccordionProps = {|
  extensions: Array<ExtensionShortHeader>,
  extensionError: ?Error,
|};

export const ExtensionsAccordion = ({
  extensions,
  extensionError,
}: ExtensionsAccordionProps) => {
  if (extensionError)
    return (
      <Column>
        <Line alignItems="center">
          <Text>
            <Trans>Error retrieving the extensions</Trans>
          </Text>
        </Line>
      </Column>
    );

  return (
    <Accordion>
      <AccordionHeader>
        <Text displayInlineAsSpan>
          <Trans>Extensions ({extensions.length})</Trans>
        </Text>
      </AccordionHeader>
      <AccordionBody disableGutters>
        {extensions.length === 0 ? (
          <EmptyMessage>
            <Trans>You haven't contributed any extensions</Trans>
          </EmptyMessage>
        ) : (
          <Column>
            {extensions.map(extension => (
              <ContributionLine
                key={extension.name}
                shortDescription={extension.shortDescription}
                fullName={extension.fullName}
                previewIconUrl={extension.previewIconUrl}
              />
            ))}
          </Column>
        )}
      </AccordionBody>
    </Accordion>
  );
};

// Change examples to assets when the feature is developed.
type AssetsAccordionProps = {|
  examples: ?Array<ExampleShortHeader>,
|};

const AssetsAccordion = ({ examples }: AssetsAccordionProps) => (
  <Accordion disabled>
    <AccordionHeader>
      <Text displayInlineAsSpan>
        <Trans>Assets (coming soon!)</Trans>
      </Text>
    </AccordionHeader>
  </Accordion>
);

type Props = {|
  userId: string,
|};

const ContributionDetails = ({ userId }: Props) => {
  const [
    extensions,
    setExtensions,
  ] = React.useState<?Array<ExtensionShortHeader>>(null);
  const [examples, setExamples] = React.useState<?Array<ExampleShortHeader>>(
    null
  );
  const [extensionError, setExtensionError] = React.useState<?Error>(null);
  const [exampleError, setExampleError] = React.useState<?Error>(null);

  const fetchUserExtensions = React.useCallback(
    () => {
      (async () => {
        if (!userId) return;
        try {
          const extensions = await getUserExtensionShortHeaders(userId);
          setExtensions(extensions);
        } catch (error) {
          console.error('Error while loading extensions:', error);
          setExtensionError(error);
        }
      })();
    },
    [userId]
  );

  React.useEffect(
    () => {
      fetchUserExtensions();
    },
    [fetchUserExtensions]
  );

  const fetchUserExamples = React.useCallback(
    () => {
      (async () => {
        if (!userId) return;
        try {
          const examples = await getUserExampleShortHeaders(userId);
          setExamples(examples);
        } catch (error) {
          console.error('Error while loading examples:', error);
          setExampleError(error);
        }
      })();
    },
    [userId]
  );

  React.useEffect(
    () => {
      fetchUserExamples();
    },
    [fetchUserExamples]
  );

  return (
    <Column noMargin>
      <Line alignItems="center">
        <Text size="block-title">
          <Trans>Contributions</Trans>
        </Text>
      </Line>
      {examples && extensions ? (
        <>
          <ExtensionsAccordion
            extensions={extensions}
            extensionError={extensionError}
          />
          <ExamplesAccordion examples={examples} exampleError={exampleError} />
          <AssetsAccordion examples={examples} />
          <Column>
            <BackgroundText>
              <Trans>
                Missing some contributions? If you are the author, create a Pull
                Request on the corresponding GitHub repository after adding your
                username in the authors of the example or the extension - or
                directly ask the original author to add your username.
              </Trans>
            </BackgroundText>
          </Column>
        </>
      ) : (
        <PlaceholderLoader />
      )}
    </Column>
  );
};

export default ContributionDetails;
