// @flow
import * as React from 'react';
import Add from './CustomSvgIcons/Add';
import Search from './CustomSvgIcons/Search';
import { Column, Line } from './Grid';
import RaisedButton from './RaisedButton';
// No i18n in this file

type Props = {|
  onClick?: () => void,
  primaryText: ?React.Node,
  id?: ?string,
  kind?: 'search',
  noMargin?: boolean,
|};

export const AddListItem = (props: Props) => {
  return (
    <Column expand noMargin={props.noMargin}>
      <Line>
        <RaisedButton
          primary
          onClick={props.onClick}
          label={props.primaryText}
          id={props.id}
          icon={props.kind === 'search' ? <Search /> : <Add />}
          fullWidth
        />
      </Line>
    </Column>
  );
};
