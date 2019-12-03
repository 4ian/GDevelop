// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import * as React from 'react';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import HelpButton from '../../UI/HelpButton';
import { Line, Column } from '../../UI/Grid';
import ColorPicker from '../../UI/ColorField/ColorPicker';
import MiniToolbar, { MiniToolbarText } from '../../UI/MiniToolbar';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import { getSelectedEvents } from '../SelectionHandler';

const gd = global.gd;

const toolbarItemStyle = {
  marginRight: 10,
};

const styles = {
  sizeTextField: {
    width: 90,
    ...toolbarItemStyle,
  },
  toolbarItem: toolbarItemStyle,
  checkbox: toolbarItemStyle,
};

type Props = {|
  event: any,
  open: boolean,
  onClose: () => void,
  onApply: () => void,
|};

type State = {|
  searchText: string,
  textValue: any,
|};

//TODO prendre en compte aussi les commentaires des groupes, vérifié le type de l'event getType()
//Puis selon le cas retourné le text avec la methode approprié a l'event getComment() ou getName()
//Voir comment recup l'event car ma façon de faire dans le state récupère ce text "\"
export default class TextEditorDialog extends React.PureComponent<
  Props,
  State
> {
  recupereLecommentaire = () => {
    return gd
      .asCommentEvent(
        getSelectedEvents(this.props.event).some(event => {
          return event;
        })
      )
      .getComment();
  };

  state = {
    searchText: '',
    textValue: this.recupereLecommentaire(),
  };

  componentWillReceiveProps(newProps: Props) {
    if (newProps.open && !this.props.open) {
    }
  }

  _handleSearchTextChange = (searchText: string) => {
    this.setState({
      searchText,
    });
  };

  render() {
    const { event, open, onApply, onClose } = this.props;

    console.log(event);

    return (
      <Dialog
        title={<Trans>Text editor</Trans>}
        onRequestClose={onClose}
        noMargin
        actions={[
          <FlatButton
            key="close"
            label={<Trans>Cancel</Trans>}
            primary={false}
            onClick={onClose}
          />,
          <FlatButton
            key={'Apply'}
            label={<Trans>Apply</Trans>}
            primary
            onClick={onApply}
            keyboardFocused
          />,
        ]}
        secondaryActions={[
          <HelpButton
            key="help"
            helpPagePath="/interface/scene-editor/layers-and-cameras"
          />,
        ]}
        open={open}
      >
        <Column noMargin>
          <MiniToolbar>
            <MiniToolbarText>
              <Trans />
            </MiniToolbarText>
            <MiniToolbarText>
              <Trans>Background color:</Trans>
            </MiniToolbarText>
            <ColorPicker
              style={styles.sizeTextField}
              disableAlpha
              color={{
                r: 125,
                g: 125,
                b: 125,
                a: 255,
              }}
              onChangeComplete={color => {
                this.forceUpdate();
              }}
            />
            <MiniToolbarText>
              <Trans>Text color:</Trans>
            </MiniToolbarText>
            <ColorPicker
              style={styles.sizeTextField}
              disableAlpha
              color={{
                r: 125,
                g: 125,
                b: 125,
                a: 255,
              }}
              onChangeComplete={color => {
                this.forceUpdate();
              }}
            />
          </MiniToolbar>
          <Line noMargin>
            <Column expand>
              <Line>
                <SemiControlledTextField
                  commitOnBlur
                  hintText={t`Enter the text to be displayed in your comment`}
                  fullWidth
                  multiLine
                  rows={8}
                  rowsMax={8}
                  value={this.state.textValue}
                  onChange={value => {
                    this.setState({
                      textValue: value,
                    });
                    //event.setComment(value);
                    this.forceUpdate();
                  }}
                />
              </Line>
            </Column>
          </Line>
        </Column>
      </Dialog>
    );
  }
}
