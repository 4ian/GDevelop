import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import { ResourceStore } from '../AssetStore/ResourceStore';
import path from 'path';
const gd = global.gd;

class GenericResourcesChooser extends Component {
  state = {
    open: false,
    resolveWithResources: null,
  };

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
    newResource.setName(path.basename(chosenResourceUrl));
    newResource.setOrigin('gdevelop-asset-store', chosenResourceUrl);

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

  render() {
    // Avoid rendering the dialog if it's not opened.
    if (!this.state.open) return null;

    return (
      <Dialog
        title={this.props.title}
        actions={[
          <FlatButton
            key="cancel"
            label={<Trans>Cancel</Trans>}
            primary={false}
            onClick={this._onClose}
          />,
        ]}
        cannotBeDismissed={false}
        open={this.state.open}
        noMargin
      >
        <ResourceStore
          onChoose={resource => {
            this._onChoose(resource.url);
          }}
          resourceKind={this.props.resourceKind}
        />
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
            resourceKind="audio"
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
            resourceKind="image"
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
            resourceKind="font"
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
            resourceKind="video"
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
            resourceKind="json"
            createNewResource={() => new gd.JsonResource()}
            title={<Trans>Choose a Json File from the library</Trans>}
            ref={chooser => (this._chooser = chooser)}
          />
        );
      }
    },
  },
];
