import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import Dialog from '../UI/Dialog';
import ListIcon from '../UI/ListIcon';
import { List, ListItem, makeSelectable } from 'material-ui/List';
const SelectableList = makeSelectable(List);
const gd = global.gd;

const styles = {
  icon: { borderRadius: 0 },
  explanations: {
    textAlign: 'center',
    margin: 20,
  },
};

const publicImageUrls = [
  // Platformer images (see platformer.json in fixtures)
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/p1_stand.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/p1_jump.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/p1_walk01.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/p1_walk02.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/p1_walk03.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/p1_walk04.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/p1_walk05.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/p1_walk06.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/p1_walk07.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/p1_walk08.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/p1_walk09.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/p1_walk10.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/p1_walk11.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/brickWall.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/bridge.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/grassHalfMid.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/castleCenter.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/bridgeLogs.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/Left.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/Right.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/ladder_mid.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/Grass.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/PlayerArea.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/slimeWalk1.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/slimeWalk2.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/slimeDead.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/flyFly1.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/flyFly2.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/flyDead.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/cloud1.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/cloud2.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/cloud3.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/bush.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/cactus.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/plant.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/coinGold.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/shadedDark06.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/shadedDark05.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/shadedDark45.png',
  'https://df5lqcdudryde.cloudfront.net/examples/platformer/shadedDark09.png',

  // Space shooter images (see space-shooter.json in fixtures)
  'https://df5lqcdudryde.cloudfront.net/examples/space-shooter/playerShip2_blue.png',
  'https://df5lqcdudryde.cloudfront.net/examples/space-shooter/meteorBrown_med1.png',
  'https://df5lqcdudryde.cloudfront.net/examples/space-shooter/laserBlue03.png',
  'https://df5lqcdudryde.cloudfront.net/examples/space-shooter/enemyBlack1.png',
  'https://df5lqcdudryde.cloudfront.net/examples/space-shooter/enemyBlue2.png',
  'https://df5lqcdudryde.cloudfront.net/examples/space-shooter/purpleSpaceBackground.png',
  'https://df5lqcdudryde.cloudfront.net/examples/space-shooter/laserBlue09.png',
  'https://df5lqcdudryde.cloudfront.net/examples/space-shooter/laserBlue10.png',
  'https://df5lqcdudryde.cloudfront.net/examples/space-shooter/laserBlue11.png',
  'https://df5lqcdudryde.cloudfront.net/examples/space-shooter/enemyGreen3.png',
  'https://df5lqcdudryde.cloudfront.net/examples/space-shooter/laserRed16.png',
  'https://df5lqcdudryde.cloudfront.net/examples/space-shooter/laserRed09.png',
  'https://df5lqcdudryde.cloudfront.net/examples/space-shooter/laserRed10.png',
  'https://df5lqcdudryde.cloudfront.net/examples/space-shooter/laserRed11.png',
];

const nameFromUrl = (url: string): string => {
  const urlParts = url.split('/');
  return urlParts[urlParts.length - 1].replace('.png', '');
};

export default [
  {
    name: 'gdResourcesChooser',
    displayName: 'Choose an image from library',
    kind: 'image',
    component: class GdResourcesChooser extends Component {
      state = {
        open: false,
        resolveWithResources: null,
        chosenImageUrl: null,
      };

      constructor(props) {
        super(props);

        // Cache rendered public images list to avoid doing this each time
        // a rendering is done.
        this.listItems = publicImageUrls.map((url: string) => {
          return (
            <ListItem
              value={url}
              key={url}
              primaryText={nameFromUrl(url)}
              leftAvatar={<ListIcon src={url} />}
            />
          );
        });
      }

      chooseResources = (
        project,
        multiSelections = true
      ): Promise<Array<any>> => {
        return new Promise(resolve => {
          this.setState({
            open: true,
            resolveWithResources: resolve,
          });
        });
      };

      _onChoose = () => {
        const { resolveWithResources, chosenImageUrl } = this.state;
        if (!resolveWithResources) return;

        const imageResource = new gd.ImageResource();
        imageResource.setFile(chosenImageUrl);
        imageResource.setName(chosenImageUrl);

        resolveWithResources([imageResource]);
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

      _handleChangeImage = (e, chosenImageUrl) => {
        this.setState({
          chosenImageUrl,
        });
      };

      render() {
        // Avoid rendering the dialog if it's not opened.
        if (!this.state.open) return null;

        const actions = [
          <FlatButton label="Close" primary={false} onClick={this._onClose} />,
          <FlatButton
            label="Choose"
            primary={false}
            disabled={!this.state.chosenImageUrl}
            onClick={this._onChoose}
          />,
        ];

        return (
          <Dialog
            title="Choose an image from the library"
            actions={actions}
            open={this.state.open}
            noMargin
            autoScrollBodyContent
          >
            <div style={styles.explanations}>
              <p>
                Adding images from Dropbox, Google Drive... is coming soon!
                Download GDevelop desktop version to use your own assets.
              </p>
            </div>
            <SelectableList
              value={this.state.chosenImageUrl}
              onChange={this._handleChangeImage}
            >
              {this.listItems}
            </SelectableList>
          </Dialog>
        );
      }
    },
  },
];
