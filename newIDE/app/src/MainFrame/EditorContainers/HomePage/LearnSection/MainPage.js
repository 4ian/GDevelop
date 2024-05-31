// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Line, Column, Spacer } from '../../../../UI/Grid';
import Text from '../../../../UI/Text';
import Window from '../../../../Utils/Window';
import { Trans } from '@lingui/macro';
import TranslateIcon from '@material-ui/icons/Translate';
import { ColumnStackLayout, LineStackLayout } from '../../../../UI/Layout';
import { type HomeTab } from '../HomePageMenu';
import {
  type TutorialCategory,
  type Tutorial,
} from '../../../../Utils/GDevelopServices/Tutorial';
import SectionContainer, { SectionRow } from '../SectionContainer';
import FlatButton from '../../../../UI/FlatButton';
import {
  useResponsiveWindowSize,
  type WindowSizeType,
} from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import { CardWidget, SMALL_WIDGET_SIZE } from '../CardWidget';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { makeStyles } from '@material-ui/core/styles';
import ImageTileRow from '../../../../UI/ImageTileRow';
import { formatTutorialToImageTileComponent, TUTORIAL_CATEGORY_TEXTS } from '.';
import GuidedLessons from '../InAppTutorials/GuidedLessons';
import ChevronArrowRight from '../../../../UI/CustomSvgIcons/ChevronArrowRight';
import Upload from '../../../../UI/CustomSvgIcons/Upload';
import WikiSearchBar from '../../../../UI/WikiSearchBar';
import FlingGame from '../InAppTutorials/FlingGame';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { type Limits } from '../../../../Utils/GDevelopServices/Usage';
import { PrivateTutorialViewDialog } from '../../../../AssetStore/PrivateTutorials/PrivateTutorialViewDialog';
import { EducationCard } from './EducationCard';
import InAppTutorialContext from '../../../../InAppTutorial/InAppTutorialContext';
import PreferencesContext from '../../../Preferences/PreferencesContext';

const useStyles = makeStyles({
  tile: {
    width: '100%',
  },
});

const getHelpItemsColumnsFromWidth = (
  windowSize: WindowSizeType,
  isLandscape: boolean
) => {
  switch (windowSize) {
    case 'small':
      return isLandscape ? 4 : 1;
    case 'medium':
      return 3;
    case 'large':
      return 4;
    case 'xlarge':
      return 5;
    default:
      return 3;
  }
};

const getTutorialsColumnsFromWidth = (
  windowSize: WindowSizeType,
  isLandscape: boolean
) => {
  switch (windowSize) {
    case 'small':
      return isLandscape ? 5 : 1;
    case 'medium':
      return 3;
    case 'large':
      return 5;
    case 'xlarge':
      return 6;
    default:
      return 3;
  }
};

const HELP_ITEMS_MAX_COLUMNS = getHelpItemsColumnsFromWidth('xlarge', true);
const styles = {
  grid: {
    textAlign: 'center',
    maxWidth: (SMALL_WIDGET_SIZE + 2 * 5) * HELP_ITEMS_MAX_COLUMNS, // Avoid tiles taking too much space on large screens.
  },
  helpItem: {
    padding: 10,
    flex: 1,
    display: 'flex',
  },
};

type TutorialsRowProps = {|
  limits: ?Limits,
  tutorials: Tutorial[],
  category: TutorialCategory,
  onSelectCategory: TutorialCategory => void,
  onSelectTutorial: (tutorial: Tutorial) => void,
|};

export const TutorialsRow = ({
  limits,
  tutorials,
  category,
  onSelectCategory,
  onSelectTutorial,
}: TutorialsRowProps) => (
  <I18n>
    {({ i18n }) => (
      <ImageTileRow
        title={TUTORIAL_CATEGORY_TEXTS[category].title}
        description={TUTORIAL_CATEGORY_TEXTS[category].description}
        items={tutorials
          .filter(tutorial => tutorial.category === category)
          .map(tutorial =>
            formatTutorialToImageTileComponent({
              i18n,
              limits,
              tutorial,
              onSelectTutorial,
            })
          )}
        onShowAll={() => onSelectCategory(category)}
        showAllIcon={<ChevronArrowRight fontSize="small" />}
        getColumnsFromWindowSize={getTutorialsColumnsFromWidth}
        getLimitFromWindowSize={getTutorialsColumnsFromWidth}
      />
    )}
  </I18n>
);

type Props = {|
  onOpenExampleStore: () => void,
  onTabChange: (tab: HomeTab) => void,
  onSelectCategory: (?TutorialCategory) => void,
  tutorials: Array<Tutorial>,
  selectInAppTutorial: (tutorialId: string) => void,
|};

const MainPage = ({
  onOpenExampleStore,
  onTabChange,
  onSelectCategory,
  tutorials,
  selectInAppTutorial,
}: Props) => {
  const { limits } = React.useContext(AuthenticatedUserContext);
  const { onLoadInAppTutorialFromLocalFile } = React.useContext(
    InAppTutorialContext
  );
  const {
    values: { showInAppTutorialDeveloperMode },
  } = React.useContext(PreferencesContext);
  const classes = useStyles();
  const {
    windowSize,
    isMobile,
    isLandscape,
    isMediumScreen,
  } = useResponsiveWindowSize();
  const helpItems: {
    title: React.Node,
    description: React.Node,
    action: () => void,
    disabled?: boolean,
  }[] = [
    {
      title: <Trans>Documentation</Trans>,
      description: <Trans>Find the complete documentation on everything</Trans>,
      action: () =>
        Window.openExternalURL('https://wiki.gdevelop.io/gdevelop5/'),
    },
    {
      title: <Trans>Examples</Trans>,
      description: <Trans>Have look at existing games from the inside</Trans>,
      action: onOpenExampleStore,
    },
    {
      title: <Trans>Community</Trans>,
      description: <Trans>Ask your questions to the community</Trans>,
      action: () => onTabChange('community'),
    },
  ].filter(Boolean);

  const [
    selectedTutorial,
    setSelectedTutorial,
  ] = React.useState<Tutorial | null>(null);

  return (
    <SectionContainer title={<Trans>Help and guides</Trans>}>
      <SectionRow>
        <WikiSearchBar />
      </SectionRow>
      <SectionRow>
        <Line noMargin>
          <GridList
            cols={getHelpItemsColumnsFromWidth(windowSize, isLandscape)}
            style={styles.grid}
            cellHeight="auto"
            spacing={10}
          >
            {helpItems.map((helpItem, index) => (
              <GridListTile key={index} classes={{ tile: classes.tile }}>
                <CardWidget
                  onClick={helpItem.action}
                  key={index}
                  size="large"
                  disabled={helpItem.disabled}
                  useDefaultDisabledStyle
                >
                  <div style={styles.helpItem}>
                    <ColumnStackLayout
                      expand
                      justifyContent="center"
                      useFullHeight
                    >
                      <Text noMargin size="block-title">
                        {helpItem.title}
                      </Text>
                      <Text noMargin size="body" color="secondary">
                        {helpItem.description}
                      </Text>
                    </ColumnStackLayout>
                  </div>
                </CardWidget>
              </GridListTile>
            ))}
          </GridList>
        </Line>
      </SectionRow>
      <SectionRow>
        <Line justifyContent="space-between" noMargin>
          <Text noMargin size="section-title">
            <Trans>Guided lessons</Trans>
          </Text>
          {showInAppTutorialDeveloperMode && (
            <FlatButton
              label={<Trans>Load local lesson</Trans>}
              onClick={onLoadInAppTutorialFromLocalFile}
            />
          )}
        </Line>
        <GuidedLessons selectInAppTutorial={selectInAppTutorial} />
      </SectionRow>
      <>
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
          {limits &&
          limits.capabilities.classrooms &&
          limits.capabilities.classrooms.hideUpgradeNotice ? null : (
            <>
              <Spacer />
              <EducationCard
                onSeeResources={() => onSelectCategory('education-curriculum')}
              />
            </>
          )}
        </SectionRow>
        <SectionRow>
          <TutorialsRow
            limits={limits}
            category="official-beginner"
            onSelectCategory={onSelectCategory}
            onSelectTutorial={setSelectedTutorial}
            tutorials={tutorials}
          />
        </SectionRow>
        <SectionRow>
          <TutorialsRow
            limits={limits}
            category="official-intermediate"
            onSelectCategory={onSelectCategory}
            onSelectTutorial={setSelectedTutorial}
            tutorials={tutorials}
          />
        </SectionRow>
        <SectionRow>
          <TutorialsRow
            limits={limits}
            category="official-advanced"
            onSelectCategory={onSelectCategory}
            onSelectTutorial={setSelectedTutorial}
            tutorials={tutorials}
          />
        </SectionRow>
        <SectionRow>
          <Text noMargin size="section-title">
            <Trans>Create and Publish a Fling game</Trans>
          </Text>
          <Text size="body" color="secondary" noMargin>
            <Trans>
              3-part tutorial to creating and publishing a game from scratch.
            </Trans>
          </Text>
          <FlingGame selectInAppTutorial={selectInAppTutorial} />
        </SectionRow>
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
            <LineStackLayout noMargin>
              {!isMobile && (
                <FlatButton
                  onClick={() => {
                    Window.openExternalURL(
                      'https://github.com/GDevelopApp/GDevelop-examples/issues/new/choose'
                    );
                  }}
                  primary
                  leftIcon={<Upload />}
                  label={
                    isMediumScreen ? (
                      <Trans>Submit an example</Trans>
                    ) : (
                      <Trans>Submit your project as an example</Trans>
                    )
                  }
                />
              )}
              {!isMobile && (
                <FlatButton
                  onClick={() => {
                    Window.openExternalURL(
                      'https://airtable.com/shrv295oHlsuS69el'
                    );
                  }}
                  primary
                  leftIcon={<TranslateIcon />}
                  label={
                    isMediumScreen ? (
                      <Trans>Submit a tutorial</Trans>
                    ) : (
                      <Trans>
                        Submit a tutorial translated in your language
                      </Trans>
                    )
                  }
                />
              )}
            </LineStackLayout>
          </LineStackLayout>
          <Line noMargin>
            <Text noMargin>
              <Trans>Learn by doing</Trans>
            </Text>
          </Line>
        </SectionRow>
        <SectionRow>
          <TutorialsRow
            limits={limits}
            category="education-curriculum"
            onSelectCategory={onSelectCategory}
            onSelectTutorial={setSelectedTutorial}
            tutorials={tutorials}
          />
        </SectionRow>
        <SectionRow>
          <TutorialsRow
            limits={limits}
            category="full-game"
            onSelectCategory={onSelectCategory}
            onSelectTutorial={setSelectedTutorial}
            tutorials={tutorials}
          />
        </SectionRow>
        <SectionRow>
          <TutorialsRow
            limits={limits}
            category="game-mechanic"
            onSelectCategory={onSelectCategory}
            onSelectTutorial={setSelectedTutorial}
            tutorials={tutorials}
          />
        </SectionRow>
        {selectedTutorial && (
          <PrivateTutorialViewDialog
            tutorial={selectedTutorial}
            onClose={() => setSelectedTutorial(null)}
          />
        )}
      </>
    </SectionContainer>
  );
};

export default MainPage;
