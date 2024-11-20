// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import {
  type ExampleShortHeader,
  type Example,
  getExample,
} from '../../Utils/GDevelopServices/Example';
import { isCompatibleWithAsset } from '../../Utils/GDevelopServices/Asset';
import PlaceholderError from '../../UI/PlaceholderError';
import { MarkdownText } from '../../UI/MarkdownText';
import Text from '../../UI/Text';
import AlertMessage from '../../UI/AlertMessage';
import { getIDEVersion } from '../../Version';
import { Column, Line } from '../../UI/Grid';
import Divider from '@material-ui/core/Divider';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import { ExampleThumbnailOrIcon } from './ExampleThumbnailOrIcon';
import Window from '../../Utils/Window';
import { UserPublicProfileChip } from '../../UI/User/UserPublicProfileChip';
import { ExampleDifficultyChip } from '../../UI/ExampleDifficultyChip';
import { ExampleSizeChip } from '../../UI/ExampleSizeChip';
const isDev = Window.isDev();

type Props = {|
  exampleShortHeader: ExampleShortHeader,
|};

export const openExampleInWebApp = (example: Example) => {
  Window.openExternalURL(
    `${
      isDev ? 'http://localhost:3000' : 'https://editor.gdevelop.io'
    }/?create-from-example=${example.slug}`
  );
};

const ExampleInformationPage = ({ exampleShortHeader }: Props) => {
  const [error, setError] = React.useState<?Error>(null);
  const [example, setExample] = React.useState<?Example>(null);

  const loadExample = React.useCallback(
    async () => {
      setError(null);
      try {
        const example = await getExample(exampleShortHeader);
        setExample(example);
      } catch (error) {
        setError(error);
      }
    },
    [exampleShortHeader]
  );

  React.useEffect(
    () => {
      loadExample();
    },
    [loadExample]
  );

  const isCompatible = isCompatibleWithAsset(
    getIDEVersion(),
    exampleShortHeader
  );
  const hasIcon = exampleShortHeader.previewImageUrls.length > 0;

  return (
    <ColumnStackLayout expand noMargin>
      {!isCompatible && (
        <AlertMessage kind="error">
          <Trans>
            Unfortunately, this example requires a newer version of GDevelop to
            work. Update GDevelop to be able to open this example.
          </Trans>
        </AlertMessage>
      )}
      <ResponsiveLineStackLayout
        alignItems="center"
        noMargin
        noResponsiveLandscape
      >
        {hasIcon ? (
          <ExampleThumbnailOrIcon exampleShortHeader={exampleShortHeader} />
        ) : null}
        <Column expand>
          {
            <Line>
              <div style={{ flexWrap: 'wrap' }}>
                {exampleShortHeader.difficultyLevel && (
                  <ExampleDifficultyChip
                    difficultyLevel={exampleShortHeader.difficultyLevel}
                  />
                )}
                {exampleShortHeader.codeSizeLevel && (
                  <ExampleSizeChip
                    codeSizeLevel={exampleShortHeader.codeSizeLevel}
                  />
                )}
                {exampleShortHeader.authors &&
                  exampleShortHeader.authors.map(author => (
                    <UserPublicProfileChip
                      user={author}
                      key={author.id}
                      isClickable
                    />
                  ))}
              </div>
            </Line>
          }
          <Text noMargin>{exampleShortHeader.shortDescription}</Text>
        </Column>
      </ResponsiveLineStackLayout>

      {example && example.description && (
        <Column noMargin>
          <Divider />
          <Text size="body" displayInlineAsSpan>
            <MarkdownText source={example.description} />
          </Text>
        </Column>
      )}
      {!example && error && (
        <PlaceholderError onRetry={loadExample}>
          <Trans>
            Can't load the example. Verify your internet connection or try again
            later.
          </Trans>
        </PlaceholderError>
      )}
    </ColumnStackLayout>
  );
};

export default ExampleInformationPage;
