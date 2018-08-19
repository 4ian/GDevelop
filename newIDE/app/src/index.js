// @flow
import 'element-closest';
import React, { Component, type Element } from 'react';
import ReactDOM from 'react-dom';
import Authentification from './Utils/GDevelopServices/Authentification';
import {
  sendProgramOpening,
  installAnalyticsEvents,
} from './Utils/Analytics/EventSender';
import { installRaven } from './Utils/Analytics/Raven';
import { installFullstory } from './Utils/Analytics/Fullstory';
import { unregister } from './registerServiceWorker';
import './UI/iconmoon-font.css'; // Styles for Iconmoon font.
import optionalRequire from './Utils/OptionalRequire.js';
import { showErrorBox } from './UI/Messages/MessageBox';

// Uncomment to enable logs in console when a component is potentially doing
// an unnecessary update
// import { profileUnnecessaryUpdates } from './Utils/DevTools/UpdatesProfiler';
// profileUnnecessaryUpdates();

const electron = optionalRequire('electron');

type State = {|
  App: ?Element<*>,
|};

class Bootstrapper extends Component<{}, State> {
  state = {
    App: null,
  };
  authentification = new Authentification();

  componentDidMount() {
    installAnalyticsEvents(this.authentification);
    installRaven();
    installFullstory();

    if (electron) {
      import(/* webpackChunkName: "local-app" */ './LocalApp')
        .then(module =>
          this.setState({
            App: module.create(this.authentification),
          })
        )
        .catch(this.handleLoadError);
    } else {
      import(/* webpackChunkName: "browser-app" */ './BrowserApp')
        .then(module =>
          this.setState({
            App: module.create(this.authentification),
          })
        )
        .catch(this.handleLoadError);
    }
  }

  handleLoadError(err) {
    const message = !electron
      ? 'Please reload the page and check your internet connectivity.'
      : 'Please restart the application or reinstall the latest version if the problem persists.';
    showErrorBox(`Unable to load GDevelop. ${message}`, err);
  }

  render() {
    const { App } = this.state;

    if (App) return App;
    return null;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) ReactDOM.render(<Bootstrapper />, rootElement);
else console.error('No root element defined in index.html');

// registerServiceWorker();
unregister();
sendProgramOpening();
