// @flow
import * as React from 'react';
import ThemeConsumer from '../../../UI/Theme/ThemeConsumer';

const styles = {
  logo: {
    width: '100%',
  },
};

const EducationTutorialImage = () => (
  <ThemeConsumer>
    {muiTheme => (
      <img
        src={muiTheme.educationTutorialImage.src}
        alt=""
        style={styles.logo}
      />
    )}
  </ThemeConsumer>
);

export default EducationTutorialImage;
