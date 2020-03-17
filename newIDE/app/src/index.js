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
import { register } from './serviceWorker';
import './UI/iconmoon-font.css'; // Styles for Iconmoon font.
import optionalRequire from './Utils/OptionalRequire.js';
import { showErrorBox } from './UI/Messages/MessageBox';
const GD_STARTUP_TIMES = global.GD_STARTUP_TIMES || [];
const initializeGDevelopJs = global.initializeGDevelopJs;

// No i18n in this file

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
    GD_STARTUP_TIMES.push(["bootstrapperComponentDidMount", performance.now()]);

    initializeGDevelopJs().then(gd => {
      global.gd = gd;
      GD_STARTUP_TIMES.push(["libGD.js initialization done", performance.now()]);

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
    })
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
if (rootElement) {
  GD_STARTUP_TIMES.push(['reactDOMRenderCall', performance.now()]);
  ReactDOM.render(<Bootstrapper />, rootElement);
}
else console.error('No root element defined in index.html');

// registerServiceWorker();
register();
sendProgramOpening();
