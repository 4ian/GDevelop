import * as React from 'react';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { Column, Line } from '../UI/Grid';

const styles = {
  orDivider: {
    marginLeft: 15,
    marginTop: 2,
  },
};

export default props => (
  <Column>
    <Line>
      <p>
        You are not connected. Create a profile and connect to access to
        GDevelop online services, like building your game for Android in one
        click!
      </p>
    </Line>
    <Line justifyContent="center" alignItems="center">
      <RaisedButton label="Create my profile" onClick={props.onLogin} primary />
      <span style={styles.orDivider}>or</span>
      <FlatButton label="Login" onClick={props.onLogin} />
    </Line>
  </Column>
);
