import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import ListIcon from '../UI/ListIcon';
import { List, ListItem } from '../UI/List';
import Text from '../UI/Text';
import RaisedButton from '../UI/RaisedButton';
import { Line } from '../UI/Grid';
import Window from '../Utils/Window';
const gd = global.gd;

const styles = {
  explanations: {
    textAlign: 'center',
    margin: 20,
  },
};

const publicImageUrls = [
  // Platformer images (see platformer.json in fixtures)
  'https://resources.gdevelop-app.com/examples/platformer/p1_stand.png',
  'https://resources.gdevelop-app.com/examples/platformer/p1_jump.png',
  'https://resources.gdevelop-app.com/examples/platformer/p1_walk01.png',
  'https://resources.gdevelop-app.com/examples/platformer/p1_walk02.png',
  'https://resources.gdevelop-app.com/examples/platformer/p1_walk03.png',
  'https://resources.gdevelop-app.com/examples/platformer/p1_walk04.png',
  'https://resources.gdevelop-app.com/examples/platformer/p1_walk05.png',
  'https://resources.gdevelop-app.com/examples/platformer/p1_walk06.png',
  'https://resources.gdevelop-app.com/examples/platformer/p1_walk07.png',
  'https://resources.gdevelop-app.com/examples/platformer/p1_walk08.png',
  'https://resources.gdevelop-app.com/examples/platformer/p1_walk09.png',
  'https://resources.gdevelop-app.com/examples/platformer/p1_walk10.png',
  'https://resources.gdevelop-app.com/examples/platformer/p1_walk11.png',
  'https://resources.gdevelop-app.com/examples/platformer/brickWall.png',
  'https://resources.gdevelop-app.com/examples/platformer/bridge.png',
  'https://resources.gdevelop-app.com/examples/platformer/grassHalfMid.png',
  'https://resources.gdevelop-app.com/examples/platformer/castleCenter.png',
  'https://resources.gdevelop-app.com/examples/platformer/bridgeLogs.png',
  'https://resources.gdevelop-app.com/examples/platformer/Left.png',
  'https://resources.gdevelop-app.com/examples/platformer/Right.png',
  'https://resources.gdevelop-app.com/examples/platformer/ladder_mid.png',
  'https://resources.gdevelop-app.com/examples/platformer/Grass.png',
  'https://resources.gdevelop-app.com/examples/platformer/PlayerArea.png',
  'https://resources.gdevelop-app.com/examples/platformer/slimeWalk1.png',
  'https://resources.gdevelop-app.com/examples/platformer/slimeWalk2.png',
  'https://resources.gdevelop-app.com/examples/platformer/slimeDead.png',
  'https://resources.gdevelop-app.com/examples/platformer/flyFly1.png',
  'https://resources.gdevelop-app.com/examples/platformer/flyFly2.png',
  'https://resources.gdevelop-app.com/examples/platformer/flyDead.png',
  'https://resources.gdevelop-app.com/examples/platformer/cloud1.png',
  'https://resources.gdevelop-app.com/examples/platformer/cloud2.png',
  'https://resources.gdevelop-app.com/examples/platformer/cloud3.png',
  'https://resources.gdevelop-app.com/examples/platformer/bush.png',
  'https://resources.gdevelop-app.com/examples/platformer/cactus.png',
  'https://resources.gdevelop-app.com/examples/platformer/plant.png',
  'https://resources.gdevelop-app.com/examples/platformer/coinGold.png',
  'https://resources.gdevelop-app.com/examples/platformer/shadedDark06.png',
  'https://resources.gdevelop-app.com/examples/platformer/shadedDark05.png',
  'https://resources.gdevelop-app.com/examples/platformer/shadedDark45.png',
  'https://resources.gdevelop-app.com/examples/platformer/shadedDark09.png',

  // Subset of space shooter images (see space-shooter.json in fixtures)
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/player Ship/idle1.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/player Ship/idle2.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/player Ship/up1.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/player Ship/up2.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/player Ship/down1.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/player Ship/down2.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/background/space bg.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/background/corridor.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/asteroid/asteroid1.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/asteroid/asteroid2.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/asteroid/asteroid3.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/enemy2/enemy200.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/enemy2/enemy201.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/enemy2/enemy202.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/enemy2/enemy203.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/enemy2/enemy204.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/enemy2/enemy205.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/enemy2/enemy206.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/enemy2/enemy207.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/enemy2/enemy208.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/enemy2/enemy209.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/enemy2/enemy210.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/enemy2/enemy211.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/player Ship/bullet.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/powerUp/powerUp00.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/powerUp/powerUp01.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/powerUp/powerUp02.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/powerUp/powerUp03.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/powerUp/powerUp04.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/explosion/explosion00.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/explosion/explosion01.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/explosion/explosion02.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/explosion/explosion03.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/explosion/explosion04.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/explosion/explosion05.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/enemy3/enemy3.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/enemy bullet/enemyBullet00.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/enemy bullet/enemyBullet01.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/enemy bullet/enemyBullet02.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/tiles mechanical/tiles mechanical 1.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/tiles mechanical/tiles mechanical 2.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/background/boss background.png',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/gameover.png',
];

const publicAudioUrls = [
  // Platformer audio (see platformer.json in fixtures)
  'https://resources.gdevelop-app.com/examples/platformer/jump.wav',
  'https://resources.gdevelop-app.com/examples/platformer/coin.wav',

  // Space shooter audio (see space-shooter.json in fixtures)
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/audio/sfx_shieldDown.ogg',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/audio/sfx_twoTone.ogg',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/audio/sfx_laser1.ogg',
  'https://resources.gdevelop-app.com/examples/space-shooter/assets/audio/Heal.wav',
];

const publicFontUrls = [
  // Platformer fonts (see platformer.json in fixtures)
  'https://resources.gdevelop-app.com/examples/platformer/Bimbo_JVE.ttf',
];

const publicVideoUrls = [
  // Video Player example video
  'https://resources.gdevelop-app.com/examples/video-player/The-Daily-Dweebs-By-Blender-Foundation-Short.mp4',
];

const publicJsonUrls = [
  // Yarn example - todo Upload elsewhere?
  'https://raw.githubusercontent.com/jhayley/bondage.js/master/tests/yarn_files/assignment.json',
];

const nameFromUrl = (url: string): string => {
  const urlParts = url.split('/');
  return urlParts[urlParts.length - 1]
    .replace('.png', '')
    .replace('.wav', '')
    .replace('.ogg', '')
    .replace('.json', '')
    .replace('.mp4', '');
};

class GenericResourcesChooser extends Component {
  state = {
    open: false,
    resolveWithResources: null,
  };

  constructor(props) {
    super(props);

    // Cache rendered public images list to avoid doing this each time
    // a rendering is done.
    this.listItems = props.urls.map((url: string) => {
      return (
        <ListItem
          key={url}
          primaryText={nameFromUrl(url)}
          leftIcon={
            props.urlsAreImages ? (
              <ListIcon iconSize={40} src={url} />
            ) : (
              undefined
            )
          }
          onClick={() => this._onChoose(url)}
        />
      );
    });
  }

  chooseResources = (project, multiSelections = true): Promise<Array<any>> => {
    return new Promise(resolve => {
      this.setState({
        open: true,
        resolveWithResources: resolve,
      });
    });
  };

  _onChoose = (chosenResourceUrl: string) => {
    const { resolveWithResources } = this.state;
    if (!resolveWithResources) return;

    const newResource = this.props.createNewResource();
    newResource.setFile(chosenResourceUrl);
    newResource.setName(chosenResourceUrl);

    resolveWithResources([newResource]);
    this.setState({
      open: false,
      resolveWithResources: null,
    });
  };

  _onClose = () => {
    const { resolveWithResources } = this.state;
    if (!resolveWithResources) return;

    resolveWithResources([]);
    this.setState({
      open: false,
      resolveWithResources: null,
    });
  };

  _onOpenWebsite() {
    Window.openExternalURL('http://gdevelop-app.com');
  }

  render() {
    // Avoid rendering the dialog if it's not opened.
    if (!this.state.open) return null;

    const actions = [
      <FlatButton
        key="close"
        label={<Trans>Close</Trans>}
        primary={false}
        onClick={this._onClose}
      />,
    ];

    return (
      <Dialog
        title={this.props.title}
        actions={actions}
        cannotBeDismissed={false}
        open={this.state.open}
        noMargin
      >
        <div style={styles.explanations}>
          <Text>
            <Trans>
              You can choose a resource from the library below. Adding resources
              from Dropbox, Google Drive... is coming soon! Download GDevelop
              for desktop to use your own assets.
            </Trans>
          </Text>
          <Line justifyContent="center">
            <RaisedButton
              primary
              label={<Trans>Download GDevelop desktop app</Trans>}
              onClick={this._onOpenWebsite}
            />
          </Line>
        </div>
        <List>{this.listItems}</List>
      </Dialog>
    );
  }
}

export default [
  {
    name: 'publicAudioUrlChooser',
    displayName: 'Choose an audio file from library',
    kind: 'audio',
    component: class AudioResourceChooser extends React.Component {
      chooseResources = () => {
        if (this._chooser) return this._chooser.chooseResources();
      };
      render() {
        return (
          <GenericResourcesChooser
            {...this.props}
            urls={publicAudioUrls}
            urlsAreImages={false}
            createNewResource={() => new gd.AudioResource()}
            title={<Trans>Choose an audio file from the library</Trans>}
            ref={chooser => (this._chooser = chooser)}
          />
        );
      }
    },
  },
  {
    name: 'publicImageUrlChooser',
    displayName: 'Choose an image from library',
    kind: 'image',
    component: class ImageResourceChooser extends React.Component {
      chooseResources = () => {
        if (this._chooser) return this._chooser.chooseResources();
      };
      render() {
        return (
          <GenericResourcesChooser
            {...this.props}
            urls={publicImageUrls}
            urlsAreImages
            createNewResource={() => new gd.ImageResource()}
            title={<Trans>Choose an image from the library</Trans>}
            ref={chooser => (this._chooser = chooser)}
          />
        );
      }
    },
  },
  {
    name: 'publicFontUrlChooser',
    displayName: 'Choose a font from library',
    kind: 'font',
    component: class FontResourceChooser extends React.Component {
      chooseResources = () => {
        if (this._chooser) return this._chooser.chooseResources();
      };
      render() {
        return (
          <GenericResourcesChooser
            {...this.props}
            urls={publicFontUrls}
            urlsAreImages={false}
            createNewResource={() => new gd.FontResource()}
            title={<Trans>Choose a font from the library</Trans>}
            ref={chooser => (this._chooser = chooser)}
          />
        );
      }
    },
  },
  {
    name: 'publicVideoUrlChooser',
    displayName: 'Choose a video from library',
    kind: 'video',
    component: class VideoResourceChooser extends React.Component {
      chooseResources = () => {
        if (this._chooser) return this._chooser.chooseResources();
      };
      render() {
        return (
          <GenericResourcesChooser
            {...this.props}
            urls={publicVideoUrls}
            urlsAreImages={false}
            createNewResource={() => new gd.VideoResource()}
            title={<Trans>Choose a video from the library</Trans>}
            ref={chooser => (this._chooser = chooser)}
          />
        );
      }
    },
  },
  {
    name: 'publicJsonUrlChooser',
    displayName: 'Choose a json file from library',
    kind: 'json',
    component: class JsonResourceChooser extends React.Component {
      chooseResources = () => {
        if (this._chooser) return this._chooser.chooseResources();
      };
      render() {
        return (
          <GenericResourcesChooser
            {...this.props}
            urls={publicJsonUrls}
            urlsAreImages={false}
            createNewResource={() => new gd.JsonResource()}
            title={<Trans>Choose a Json File from the library</Trans>}
            ref={chooser => (this._chooser = chooser)}
          />
        );
      }
    },
  },
];
