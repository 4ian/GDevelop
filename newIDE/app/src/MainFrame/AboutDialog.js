// @flow
import React, { PureComponent } from 'react';
import { List, ListItem } from 'material-ui/List';
import Dialog from '../UI/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Column, Line } from '../UI/Grid';
import Window from '../Utils/Window';
import optionalRequire from '../Utils/OptionalRequire';
import IconButton from 'material-ui/IconButton';
import OpenInNew from 'material-ui/svg-icons/action/open-in-new';
import PreferencesContext from './Preferences/PreferencesContext';
import {
  getUpdateStatusLabel,
  getUpdateButtonLabel,
  canDownloadUpdate,
  type UpdateStatus,
} from './UpdaterTools';
const electron = optionalRequire('electron');
const app = electron ? electron.remote.app : null;
const gd = global.gd;

type Props = {
  open: boolean,
  onClose: Function,
  updateStatus: UpdateStatus,
};

// There must be missing tons of people.
// If you contributed to GDevelop but you're not in the list, please
// send a Pull Request on GitHub or open an issue ;)
const contributors = [
  // GitHub contributors
  {
    name: 'Victor Levasseur',
    description:
      'Numerous contributions to GDevelop core and various extensions',
  },
  {
    name: 'Lizard-13',
    description:
      'Numerous contributions to GDevelop (particle engine, bugfixes, new conditions, examples, tutorials...)',
  },
  { name: 'ale26reg', description: 'Contributions to GDevelop' },
  { name: 'dos1', description: 'Contributions to GDevelop' },
  { name: 'Bouh', description: 'Contributions to GDevelop' },
  {
    name: 'Todor Imreorov',
    description: 'Contributions to GDevelop: added Piskel sprite editor',
  },
  { name: 'brylie', description: 'Contributions to GDevelop' },
  { name: 'Nnarol', description: 'Contributions to GDevelop' },
  { name: 'wild-master', description: 'Contributions to GDevelop' },
  { name: 'RandomShaper', description: 'Contributions to GDevelop' },
  { name: 'RyanNerd', description: 'Contributions to GDevelop' },
  { name: 'greater', description: 'Contributions to GDevelop' },
  { name: 'triptych', description: 'Contributions to GDevelop' },
  {
    name: 'Wend1go',
    description: 'Contributions to GDevelop, Tutorials, Examples',
  },
  { name: 'mattiascibien', description: 'Contributions to GDevelop' },
  { name: 'araujo921', description: 'Contributions to GDevelop' },
  { name: 'ronnystandtke', description: 'Contributions to GDevelop' },
  {
    name: 'Thomas Flecy',
    description: 'Contributions to GDevelop (original sound object extension)',
  },

  // Community members:
  {
    name: 'ddabrahim',
    description: 'Lots of examples bundled with GDevelop',
    link: 'https://gametemplates.itch.io/',
  },
  {
    name: 'Gametemplates',
    description: 'Examples bundled with GDevelop',
    link: 'https://gametemplates.itch.io/',
  },
  { name: 'Mats', description: 'Tutorials, Examples' },
  { name: 'erdo', description: 'Tutorials, Examples' },
  { name: 'Jubileuksen3', description: 'Tutorials, Examples' },
  { name: 'LucaTexas', description: 'Tutorials, Examples' },
  { name: 'Kink', description: 'Forum moderator, tutorials, Examples' },
  { name: 'RicoTrooper', description: 'Tutorials' },
  { name: 'kalel', description: 'Tutorials' },
  { name: 'mtarzaim', description: 'Tutorials' },
  { name: 'Darkhog', description: 'Examples' },
  { name: 'Ricardo Graca', description: 'Tutorials, Examples' },
  { name: 'Diego Schiavon', description: 'Indiegogo Ubuntu contributor' },
  { name: 'conceptgame', description: 'Indiegogo super contributor' },
  {
    name: 'Jose David Coartas Correa',
    description:
      'Author of Digitopolis (a book on how to make games with GDevelop4)',
  },

  {
    name: 'François Dumortier',
    description: 'GDevelop logo design',
    link: 'http://www.fdumortier.com',
  },
  {
    name: 'Constantine Shvetsov',
    description: 'Design of all the awesome icons',
  },
  {
    name: 'MillionthVector',
    description: 'Assets of various examples',
  },
];

export default class AboutDialog extends PureComponent<Props, *> {
  gdVersionString = '';
  appVersionString = '';

  constructor() {
    super();
    this.gdVersionString = gd ? gd.VersionWrapper.fullString() : 'Unknown';
    this.appVersionString = app ? app.getVersion() : '5';
  }

  _openContributePage = () => {
    Window.openExternalURL('https://gdevelop-app.com/contribute/');
  };

  _openLink = (link: string) => {
    if (!link) return;

    Window.openExternalURL(link);
  };

  render() {
    const { open, onClose, updateStatus } = this.props;
    if (!open) return null;

    const updateStatusString = getUpdateStatusLabel(updateStatus.status);
    const updateButtonLabel = getUpdateButtonLabel(updateStatus.status);

    return (
      <Dialog
        actions={[
          <FlatButton
            label="GDevelop Website"
            primary={false}
            onClick={() => Window.openExternalURL('http://gdevelop-app.com')}
          />,
          <FlatButton label="Close" primary={false} onClick={onClose} />,
        ]}
        onRequestClose={onClose}
        open={open}
        contentStyle={{
          maxWidth: 535,
        }}
        noMargin
        autoScrollBodyContent
      >
        <PreferencesContext.Consumer>
          {({ values, checkUpdates }) => (
            <Column noMargin>
              <img
                src="res/GD-logo.png"
                alt="GDevelop logo"
                width="535"
                height="283"
              />
              <Tabs onChange={() => this.forceUpdate()}>
                <Tab label="About GDevelop" value="about">
                  <Column>
                    <Line>
                      GDevelop {this.appVersionString} based on GDevelop.js{' '}
                      {this.gdVersionString}
                    </Line>
                    <Line>{updateStatusString}</Line>
                    <Line justifyContent="center">
                      {!!updateStatusString && (
                        <FlatButton
                          label={updateButtonLabel}
                          onClick={() =>
                            checkUpdates(canDownloadUpdate(updateStatus.status))
                          }
                        />
                      )}
                    </Line>
                  </Column>
                </Tab>
                <Tab label="Contributors" value="contributors">
                  <Column>
                    <p>GDevelop was created by Florian "4ian" Rival.</p>
                    <p>Contributors, in no particular order:</p>
                  </Column>
                  <List>
                    {contributors.map(contributor => (
                      <ListItem
                        key={contributor.name}
                        primaryText={contributor.name}
                        secondaryText={<p>{contributor.description}</p>}
                        secondaryTextLines={
                          contributor.description.length < 30 ? 1 : 2
                        }
                        rightIconButton={
                          contributor.link ? (
                            <IconButton
                              onClick={() =>
                                this._openLink(contributor.link || '')
                              }
                            >
                              <OpenInNew />
                            </IconButton>
                          ) : null
                        }
                      />
                    ))}
                  </List>
                  <Column expand>
                    <p>
                      Thanks to all users of GDevelop! There must be missing
                      tons of people, please send your name if you've
                      contributed and you're not listed.
                    </p>
                    <Line alignItems="center" justifyContent="center">
                      <FlatButton
                        label="Contribute to GDevelop"
                        onClick={this._openContributePage}
                      />
                    </Line>
                  </Column>
                </Tab>
              </Tabs>
            </Column>
          )}
        </PreferencesContext.Consumer>
      </Dialog>
    );
  }
}
