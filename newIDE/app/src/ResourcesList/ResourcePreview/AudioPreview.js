// @flow
import * as React from 'react';
import ResourcesLoader from '../../ResourcesLoader';
import Audiotrack from 'material-ui/svg-icons/image/audiotrack';

const styles = {
  previewContainer: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    border: '#AAAAAA 1px solid',
    background: 'url("res/transparentback.png") repeat',
  },
  icon: { width: 60, height: 60 },
};

type Props = {|
  project: gdProject,
  resourceName: string,
  resourcesLoader: typeof ResourcesLoader,
  children?: any,
  style?: Object,
  resourcePath?: string,
|};

/**
 * Display the preview for a resource of a project with kind "audio".
 */
export default class AudioPreview extends React.Component<Props, void> {
  render() {
    return (
      <div style={styles.previewContainer}>
        <Audiotrack style={styles.icon} />
      </div>
    );
  }
}
