// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import {
  ClosableTabs,
  ClosableTab,
  TabContentContainer,
} from '../../UI/ClosableTabs';
import ValueStateHolder from '../ValueStateHolder';
import FixedHeightFlexContainer from '../FixedHeightFlexContainer';
import { Column } from '../../UI/Grid';
import DragAndDropContextProvider from '../../UI/DragAndDrop/DragAndDropContextProvider';
import ObjectsList from '../../ObjectsList';
import GDevelopJsInitializerDecorator, {
  testProject,
} from '../GDevelopJsInitializerDecorator';
import { type HotReloadPreviewButtonProps } from '../../HotReload/HotReloadPreviewButton';
import Home from '../../UI/CustomSvgIcons/Home';
import fakeResourceManagementProps from '../FakeResourceManagement';

export default {
  title: 'UI Building Blocks/ClosableTabs',
  component: ClosableTabs,
  decorators: [GDevelopJsInitializerDecorator],
};

export const ThreeTabs = () => (
  <ValueStateHolder
    initialValue={0}
    render={(value, onChange) => (
      <FixedHeightFlexContainer height={400}>
        <Column expand>
          <ClosableTabs>
            <ClosableTab
              onActivated={action('Tab 1 activated')}
              closable={false}
              active={value === 0}
              onClick={() => onChange(0)}
              label={null}
              icon={<Home />}
              onClose={action('Close tab 1')}
              onCloseAll={action('Close all')}
              onCloseOthers={action('Close others')}
            />
            <ClosableTab
              onActivated={action('Tab 2 activated')}
              closable
              active={value === 1}
              onClick={() => onChange(1)}
              label="Tab 2"
              icon={null}
              onClose={action('Close tab 2')}
              onCloseAll={action('Close all')}
              onCloseOthers={action('Close others')}
            />
            <ClosableTab
              onActivated={action('Tab 3 activated')}
              closable
              active={value === 2}
              onClick={() => onChange(2)}
              label="Tab 3 with a long label"
              icon={null}
              onClose={action('Close tab 3')}
              onCloseAll={action('Close all')}
              onCloseOthers={action('Close others')}
            />
          </ClosableTabs>
          {
            <TabContentContainer active={value === 0}>
              <div
                style={{ backgroundColor: 'green', height: '100%', flex: 1 }}
              >
                Tab 1 content
              </div>
            </TabContentContainer>
          }
          {
            <TabContentContainer active={value === 1}>
              <div
                style={{ backgroundColor: 'green', height: '100%', flex: 1 }}
              >
                Tab 2 content
              </div>
            </TabContentContainer>
          }
          {
            <TabContentContainer active={value === 2}>
              <div
                style={{ backgroundColor: 'green', height: '100%', flex: 1 }}
              >
                Tab 3 content
              </div>
            </TabContentContainer>
          }
        </Column>
      </FixedHeightFlexContainer>
    )}
  />
);

export const LongLabels = () => (
  <ValueStateHolder
    initialValue={0}
    render={(value, onChange) => (
      <FixedHeightFlexContainer height={400}>
        <Column expand>
          <ClosableTabs>
            <ClosableTab
              onActivated={action('Tab 1 activated')}
              closable
              active={value === 0}
              label="Tab 1 with a very very long label"
              icon={null}
              onClose={action('Close tab 1')}
              onCloseAll={action('Close all')}
              onCloseOthers={action('Close others')}
              onClick={() => onChange(0)}
            />
            <ClosableTab
              onActivated={action('Tab 2 activated')}
              closable
              active={value === 1}
              onClick={() => onChange(1)}
              label="Small 2"
              icon={null}
              onClose={action('Close tab 2')}
              onCloseAll={action('Close all')}
              onCloseOthers={action('Close others')}
            />
            <ClosableTab
              onActivated={action('Tab 3 activated')}
              closable
              active={value === 2}
              onClick={() => onChange(2)}
              label="Tab 3 with a very very loooooooooooooooooooooooooooooooooooooooooong label"
              icon={null}
              onClose={action('Close tab 3')}
              onCloseAll={action('Close all')}
              onCloseOthers={action('Close others')}
            />
            <ClosableTab
              onActivated={action('Tab 4 activated')}
              closable
              active={value === 3}
              onClick={() => onChange(3)}
              label="Small 4"
              icon={null}
              onClose={action('Close tab 4')}
              onCloseAll={action('Close all')}
              onCloseOthers={action('Close others')}
            />
          </ClosableTabs>
          {
            <TabContentContainer active={value === 0}>
              <div
                style={{ backgroundColor: 'green', height: '100%', flex: 1 }}
              >
                Tab 1 content
              </div>
            </TabContentContainer>
          }
          {
            <TabContentContainer active={value === 1}>
              <div
                style={{ backgroundColor: 'green', height: '100%', flex: 1 }}
              >
                Tab 2 content
              </div>
            </TabContentContainer>
          }
          {
            <TabContentContainer active={value === 2}>
              <div
                style={{ backgroundColor: 'green', height: '100%', flex: 1 }}
              >
                Tab 3 content
              </div>
            </TabContentContainer>
          }
          {
            <TabContentContainer active={value === 3}>
              <div
                style={{ backgroundColor: 'green', height: '100%', flex: 1 }}
              >
                Tab 4 content
              </div>
            </TabContentContainer>
          }
        </Column>
      </FixedHeightFlexContainer>
    )}
  />
);

const hotReloadPreviewButtonProps: HotReloadPreviewButtonProps = {
  hasPreviewsRunning: false,
  launchProjectDataOnlyPreview: action('launchProjectDataOnlyPreview'),
  launchProjectWithLoadingScreenPreview: action(
    'launchProjectWithLoadingScreenPreview'
  ),
};

export const WithObjectsList = () => (
  <ValueStateHolder
    initialValue={0}
    render={(value, onChange) => (
      <DragAndDropContextProvider>
        <FixedHeightFlexContainer height={400}>
          <Column expand>
            <ClosableTabs>
              <ClosableTab
                onActivated={action('Tab 1 activated')}
                closable
                active={value === 0}
                label="Tab 1"
                icon={null}
                onClick={() => onChange(0)}
                onClose={action('Close tab 1')}
                onCloseAll={action('Close all')}
                onCloseOthers={action('Close others')}
              />
              <ClosableTab
                onActivated={action('Tab 2 activated')}
                closable
                active={value === 1}
                label="Tab 2"
                icon={null}
                onClick={() => onChange(1)}
                onClose={action('Close tab 2')}
                onCloseAll={action('Close all')}
                onCloseOthers={action('Close others')}
              />
              <ClosableTab
                onActivated={action('Tab 3 activated')}
                closable
                active={value === 2}
                label="Tab 3"
                icon={null}
                onClick={() => onChange(2)}
                onClose={action('Close tab 3')}
                onCloseAll={action('Close all')}
                onCloseOthers={action('Close others')}
              />
            </ClosableTabs>
            {
              <TabContentContainer active={value === 0}>
                <div
                  style={{
                    backgroundColor: 'green',
                    height: '100%',
                    flex: 1,
                  }}
                >
                  The second tab has a list of objects. Check that the scrolling
                  position is maintained while navigating between tabs.
                </div>
              </TabContentContainer>
            }
            {
              <TabContentContainer active={value === 1}>
                <ObjectsList
                  getThumbnail={() => 'res/unknown32.png'}
                  project={testProject.project}
                  objectsContainer={testProject.testLayout}
                  layout={testProject.testLayout}
                  resourceManagementProps={fakeResourceManagementProps}
                  onEditObject={action('On edit object')}
                  onExportAssets={action('On export assets')}
                  onAddObjectInstance={action('On add instance to the scene')}
                  selectedObjectFolderOrObjectsWithContext={[]}
                  getValidatedObjectOrGroupName={newName => newName}
                  onDeleteObjects={(objectsWithContext, cb) => cb(true)}
                  onRenameObjectFolderOrObjectWithContextFinish={(
                    objectFolderOrObjectWithContext,
                    newName,
                    cb
                  ) => cb(true)}
                  onObjectCreated={() => {}}
                  onObjectFolderOrObjectWithContextSelected={() => {}}
                  hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
                  canInstallPrivateAsset={() => false}
                />
              </TabContentContainer>
            }
            {
              <TabContentContainer active={value === 2}>
                <div
                  style={{
                    backgroundColor: 'green',
                    height: '100%',
                    flex: 1,
                  }}
                >
                  Tab 3 content
                </div>
              </TabContentContainer>
            }
          </Column>
        </FixedHeightFlexContainer>
      </DragAndDropContextProvider>
    )}
  />
);
