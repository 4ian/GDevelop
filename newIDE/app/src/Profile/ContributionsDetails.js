// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { Accordion } from '../UI/Accordion';
import { AccordionHeader } from '../UI/Accordion';
import { AccordionBody } from '../UI/Accordion';
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

type LineProps = {|
  fullName: string,
  previewIconUrl?: string,
  shortDescription?: string,
|};

export const ContributionLine = ({
  fullName,
  previewIconUrl,
  shortDescription,
}: LineProps) => (
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

type Props = {
  userId: string,
};

export default ({ userId }: Props) => {
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

  const ExtensionsAccordion = () => {
    if (extensionError)
      return (
        <Column>
          <Line alignItems="center">
            <Text size="title">
              <Trans>Error retrieving the extensions</Trans>
            </Text>
          </Line>
        </Column>
      );

    return extensions ? (
      <Accordion>
        <AccordionHeader>
          <Text displayInlineAsSpan>
            <Trans>{`Extensions (${extensions.length})`}</Trans>
          </Text>
        </AccordionHeader>
        <AccordionBody disableGutters>
          <Column>
            {extensions.map(extension => (
              <ContributionLine
                shortDescription={extension.shortDescription}
                fullName={extension.fullName}
                previewIconUrl={extension.previewIconUrl}
              />
            ))}
          </Column>
        </AccordionBody>
      </Accordion>
    ) : (
      <PlaceholderLoader />
    );
  };

  const ExamplesAccordion = () => {
    if (exampleError)
      return (
        <Column>
          <Line alignItems="center">
            <Text size="title">
              <Trans>Error retrieving the examples</Trans>
            </Text>
          </Line>
        </Column>
      );

    return examples ? (
      <Accordion>
        <AccordionHeader>
          <Text displayInlineAsSpan>
            <Trans>{`Examples (${examples.length})`}</Trans>
          </Text>
        </AccordionHeader>
        <AccordionBody disableGutters>
          <Column>
            {examples.map(example => (
              <ContributionLine
                shortDescription={example.shortDescription}
                fullName={example.name}
                previewIconUrl={
                  example.previewImageUrls ? example.previewImageUrls[0] : ''
                }
              />
            ))}
          </Column>
        </AccordionBody>
      </Accordion>
    ) : (
      <PlaceholderLoader />
    );
  };

  const AssetsAccordion = () => {
    return examples ? (
      <Accordion>
        <AccordionHeader>
          <Text displayInlineAsSpan>
            <Trans>Assets (coming soon!)</Trans>
          </Text>
        </AccordionHeader>
      </Accordion>
    ) : (
      <PlaceholderLoader />
    );
  };

  return (
    <>
      {extensions && examples && (
        <Column>
          <Line alignItems="center">
            <Text size="title">
              <Trans>Contributions</Trans>
            </Text>
          </Line>
        </Column>
      )}
      <ExtensionsAccordion />
      <ExamplesAccordion />
      <AssetsAccordion />
    </>
  );
};
