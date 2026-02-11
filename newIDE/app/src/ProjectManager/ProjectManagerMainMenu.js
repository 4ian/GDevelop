// @flow
import * as React from 'react';
import { Column, Line, Spacer } from '../UI/Grid';
import {
  adaptFromDeclarativeTemplate,
  buildMainMenuDeclarativeTemplate,
  type MainMenuCallbacks,
  type BuildMainMenuProps,
} from '../MainFrame/MainMenu';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import classes from './ProjectManagerMainMenu.module.css';
import classNames from 'classnames';
import TextButton from '../UI/TextButton';
import ChevronArrowLeft from '../UI/CustomSvgIcons/ChevronArrowLeft';
import { Trans } from '@lingui/macro';
import { LineStackLayout } from '../UI/Layout';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { isNativeMobileApp } from '../Utils/Platform';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import Text from '../UI/Text';
import ChevronArrowRight from '../UI/CustomSvgIcons/ChevronArrowRight';

type Props = {|
  project: ?gdProject,
  closeDrawer: () => void,
  mainMenuCallbacks: MainMenuCallbacks,
  buildMainMenuProps: BuildMainMenuProps,

  // Props controlled by the parent component
  // so we can adapt the layout based on the selection.
  selectedMainMenuItemIndices: Array<number>,
  setSelectedMainMenuItemIndices: (Array<number>) => void,
|};

const ProjectManagerMainMenu = ({
  project,
  closeDrawer,
  mainMenuCallbacks,
  buildMainMenuProps,
  selectedMainMenuItemIndices,
  setSelectedMainMenuItemIndices,
}: Props) => {
  const mainMenuItems = React.useMemo(
    () =>
      adaptFromDeclarativeTemplate(
        buildMainMenuDeclarativeTemplate(buildMainMenuProps),
        mainMenuCallbacks
      ),
    [buildMainMenuProps, mainMenuCallbacks]
  );

  const { isMobile } = useResponsiveWindowSize();
  const shouldUseNativeMenu = !isNativeMobileApp() && !isMobile;

  const enhanceMenuItems = React.useCallback(
    (menuItems: Array<MenuItemTemplate>): Array<MenuItemTemplate> =>
      menuItems.map((menuItem, index) => {
        if (menuItem.submenu) {
          return {
            ...menuItem,
            submenu: enhanceMenuItems(menuItem.submenu),
          };
        }

        if (menuItem.click) {
          const originalClick = menuItem.click;
          // $FlowFixMe - Flow is not able to make the difference between checkbox & classic item.
          const newMenuItem: MenuItemTemplate = {
            ...menuItem,
            click: () => {
              // Close the drawer when an item is clicked, as it's likely to be a navigation action.
              originalClick();
              closeDrawer();
            },
          };
          return newMenuItem;
        }

        return menuItem;
      }),
    [closeDrawer]
  );

  const visibleMenuItems = React.useMemo(
    () => {
      let displayedMenuItems = mainMenuItems;
      for (const index of selectedMainMenuItemIndices) {
        const menuItem = displayedMenuItems[index];
        if (!menuItem || !menuItem.submenu) {
          break;
        }

        displayedMenuItems = menuItem.submenu;
      }

      return enhanceMenuItems(displayedMenuItems);
    },
    [mainMenuItems, selectedMainMenuItemIndices, enhanceMenuItems]
  );

  const isNavigatingInsideSubMenu = selectedMainMenuItemIndices.length > 0;
  const onBack = React.useCallback(
    () => {
      if (selectedMainMenuItemIndices.length === 0) {
        return;
      }

      setSelectedMainMenuItemIndices(
        selectedMainMenuItemIndices.slice(
          0,
          selectedMainMenuItemIndices.length - 1
        )
      );
    },
    [selectedMainMenuItemIndices, setSelectedMainMenuItemIndices]
  );

  const onBuildSubMenuTemplate = React.useCallback(
    (topMenuIndex: number): MenuItemTemplate[] => {
      const menuItem = mainMenuItems[topMenuIndex];
      if (!menuItem || !menuItem.submenu) {
        return [];
      }

      return enhanceMenuItems(menuItem.submenu);
    },
    [mainMenuItems, enhanceMenuItems]
  );

  return (
    <Line noMargin>
      <Column expand>
        {isNavigatingInsideSubMenu && (
          <Line noMargin expand alignItems="flex-start">
            <TextButton
              icon={<ChevronArrowLeft />}
              label={<Trans>Back</Trans>}
              onClick={onBack}
            />
          </Line>
        )}
        {/* Root items as buttons */}
        {!isNavigatingInsideSubMenu && (
          <Line noMargin expand>
            {mainMenuItems.map((item, index) => {
              if (item.type === 'separator') return null;
              // Use a "native" or "simulated native" menu on desktop & web, or handle navigation on mobile
              return (
                <React.Fragment key={index}>
                  {index !== 0 && (
                    <>
                      <Spacer />
                      <div className={classes.verticalSeparator} />
                      <Spacer />
                    </>
                  )}
                  {shouldUseNativeMenu ? (
                    <ElementWithMenu
                      element={
                        <TextButton
                          label={item.label}
                          onClick={() => {
                            // Handled by ElementWithMenu
                          }}
                          fullWidth
                        />
                      }
                      buildMenuTemplate={() => onBuildSubMenuTemplate(index)}
                    />
                  ) : (
                    <TextButton
                      label={item.label}
                      onClick={() => {
                        // Assume root items always have a submenu.
                        setSelectedMainMenuItemIndices([
                          ...selectedMainMenuItemIndices,
                          index,
                        ]);
                      }}
                      fullWidth
                    />
                  )}
                </React.Fragment>
              );
            })}
          </Line>
        )}
        {/* Submenu items as rows, which will be visible only on mobile */}
        {isNavigatingInsideSubMenu && (
          <Column expand>
            {visibleMenuItems.map((item, index) =>
              item.type === 'separator' ? (
                <div key={index} className={classes.horizontalSeparator} />
              ) : (
                <div
                  className={classNames({
                    [classes.menuItem]: true,
                    [classes.disabled]: !item.submenu && item.enabled === false,
                  })}
                  key={index}
                  onClick={() => {
                    if (item.enabled === false) return;

                    if (item.click) {
                      item.click();
                    } else if (item.submenu) {
                      setSelectedMainMenuItemIndices([
                        ...selectedMainMenuItemIndices,
                        index,
                      ]);
                    }
                  }}
                >
                  <LineStackLayout
                    noMargin
                    expand
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Text
                      style={{
                        opacity: item.enabled === false ? 0.5 : undefined,
                      }}
                    >
                      {item.label}
                    </Text>
                    {item.submenu && <ChevronArrowRight />}
                  </LineStackLayout>
                </div>
              )
            )}
          </Column>
        )}
      </Column>
    </Line>
  );
};

export default ProjectManagerMainMenu;
