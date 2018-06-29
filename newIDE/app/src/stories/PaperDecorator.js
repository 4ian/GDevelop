import React from 'react';
import Paper from 'material-ui/Paper';

const style = {
  padding: 10,
};

export default story => <Paper style={style}>{story()}</Paper>;
