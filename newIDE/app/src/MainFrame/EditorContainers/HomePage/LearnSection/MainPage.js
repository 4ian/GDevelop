// @flow
import * as React from 'react';
import { Line, Column } from '../../../../UI/Grid';
import Text from '../../../../UI/Text';
import Window from '../../../../Utils/Window';
import { Trans } from '@lingui/macro';
import PublishIcon from '@material-ui/icons/Publish';
import { LineStackLayout } from '../../../../UI/Layout';
import { type HomeTab } from '../HomePageMenu';
import {
  type TutorialCategory,
  type Tutorial,
} from '../../../../Utils/GDevelopServices/Tutorial';
import { type ExampleShortHeader } from '../../../../Utils/GDevelopServices/Example';
import { isMobile } from '../../../../Utils/Platform';
import { sendOnboardingManuallyOpened } from '../../../../Utils/Analytics/EventSender';
import SectionContainer, { SectionRow } from '../SectionContainer';
import FlatButton from '../../../../UI/FlatButton';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { CardWidget, SMALL_WIDGET_SIZE } from '../CardWidget';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { makeStyles } from '@material-ui/core/styles';
import ImageTileRow from '../../../../UI/ImageTileRow';
import { formatTutorialToImageTileComponent, TUTORIAL_CATEGORY_TEXTS } from '.';
import ArrowRight from '@material-ui/icons/ArrowRight';
import InAppTutorialContext from '../../../../InAppTutorial/InAppTutorialContext';

const useStyles = makeStyles({
  tile: {
    width: '100%',
  },
});

const getHelpItemsColumnsFromWidth = (
  width: WidthType,
  showTourHelpItem: boolean
) => {
  switch (width) {
    case 'small':
      return 1;
    case 'medium':
      return 3;
    case 'large':
    default:
      return showTourHelpItem ? 4 : 3;
  }
};

const getTutorialsColumnsFromWidth = (width: WidthType) => {
  switch (width) {
    case 'small':
      return 2;
    case 'medium':
      return 3;
    case 'large':
    default:
      return 5;
  }
};

const HELP_ITEMS_MAX_COLUMNS = getHelpItemsColumnsFromWidth('large', true);
const styles = {
  grid: {
    textAlign: 'center',
    maxWidth: (SMALL_WIDGET_SIZE + 2 * 5) * HELP_ITEMS_MAX_COLUMNS, // Avoid tiles taking too much space on large screens.
  },
  gridListTile: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  helpItem: {
    padding: 10,
  },
};

type Props = {|
  onOpenOnboardingDialog: () => void,
  onCreateProject: (?ExampleShortHeader) => void,
  onTabChange: (tab: HomeTab) => void,
  onOpenHelpFinder: () => void,
  onSelectCategory: (?TutorialCategory) => void,
  tutorials: Array<Tutorial>,
|};

const MainPage = ({
  onOpenOnboardingDialog,
  onCreateProject,
  onTabChange,
  onOpenHelpFinder,
  onSelectCategory,
  tutorials,
}: Props) => {
  const classes = useStyles();
  const { currentlyRunningInAppTutorial } = React.useContext(InAppTutorialContext);
  const windowWidth = useResponsiveWindowWidth();
  const shouldShowOnboardingButton = !isMobile();
  const helpItems: {
    title: React.Node,
    description: React.Node,
    action: () => void,
    disabled?: boolean,
  }[] = [
    shouldShowOnboardingButton
      ? {
          title: <Trans>Guided Tour</Trans>,
          description: (
            <Trans>Learn the fundamentals of the editor in 5 minutes</Trans>
          ),
          action: () => {
            sendOnboardingManuallyOpened();
            onOpenOnboardingDialog();
          },
          disabled: !!currentlyRunningInAppTutorial,
        }
      : undefined,
    {
      title: <Trans>Documentation</Trans>,
      description: <Trans>Find the complete documentation on everything</Trans>,
      action: onOpenHelpFinder,
    },
    {
      title: <Trans>Examples</Trans>,
      description: <Trans>Have look at existing games from the inside</Trans>,
      action: onCreateProject,
    },
    {
      title: <Trans>Community</Trans>,
      description: <Trans>Ask your questions to the community</Trans>,
      action: () => onTabChange('community'),
    },
  ].filter(Boolean);

  const renderTutorialsRow = (category: TutorialCategory) => (
    <ImageTileRow
      title={TUTORIAL_CATEGORY_TEXTS[category].title}
      description={TUTORIAL_CATEGORY_TEXTS[category].description}
      items={tutorials
        .filter(tutorial => tutorial.category === category)
        .map(formatTutorialToImageTileComponent)}
      onShowAll={() => onSelectCategory(category)}
      showAllIcon={<ArrowRight fontSize="small" />}
      getColumnsFromWidth={getTutorialsColumnsFromWidth}
      getLimitFromWidth={getTutorialsColumnsFromWidth}
    />
  );

  return (
    <SectionContainer title={<Trans>Help and guides</Trans>}>
      <SectionRow>
        <Line noMargin>
          <GridList
            cols={getHelpItemsColumnsFromWidth(
              windowWidth,
              shouldShowOnboardingButton
            )}
            style={styles.grid}
            cellHeight="auto"
            spacing={10}
          >
            {helpItems.map((helpItem, index) => (
              <GridListTile
                key={index}
                style={styles.gridListTile}
                classes={{ tile: classes.tile }}
              >
                <CardWidget
                  onClick={helpItem.action}
                  key={index}
                  size="small"
                  disabled={helpItem.disabled}
                >
                  <div style={styles.helpItem}>
                    <Column alignItems="center">
                      <Text size="block-title">{helpItem.title}</Text>
                      <Text size="body" color="secondary">
                        {helpItem.description}
                      </Text>
                    </Column>
                  </div>
                </CardWidget>
              </GridListTile>
            ))}
          </GridList>
        </Line>
      </SectionRow>
      <>
        <SectionRow>
          <LineStackLayout
            justifyContent="space-between"
            alignItems="center"
            noMargin
            expand
          >
            <Column noMargin>
              <Text size="title">
                <Trans>Guides and tutorials</Trans>
              </Text>
            </Column>
            <Column noMargin>
              {windowWidth === 'large' && (
                <FlatButton
                  key="submit-example"
                  onClick={() => {
                    Window.openExternalURL(
                      'https://github.com/GDevelopApp/GDevelop-examples/issues/new/choose'
                    );
                  }}
                  primary
                  leftIcon={<PublishIcon />}
                  label={<Trans>Submit your project as an example</Trans>}
                />
              )}
            </Column>
          </LineStackLayout>
          <Line noMargin>
            <Text noMargin>
              <Trans>Learn by doing</Trans>
            </Text>
          </Line>
        </SectionRow>
        <SectionRow>{renderTutorialsRow('full-game')}</SectionRow>
        <SectionRow>{renderTutorialsRow('game-mechanic')}</SectionRow>
        <SectionRow>
          <Line noMargin>
            <Text size="title">
              <Trans>Courses</Trans>
            </Text>
          </Line>
          <Line noMargin>
            <Text noMargin>
              <Trans>Learn everything about GDevelop from the ground up</Trans>
            </Text>
          </Line>
        </SectionRow>
        <SectionRow>{renderTutorialsRow('official-beginner')}</SectionRow>
        <SectionRow>{renderTutorialsRow('official-intermediate')}</SectionRow>
        <SectionRow>{renderTutorialsRow('official-advanced')}</SectionRow>
      </>
    </SectionContainer>
  );
};

export default MainPage;
