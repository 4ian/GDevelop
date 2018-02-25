// @flow
import * as React from 'react';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Dialog from '../UI/Dialog';
import SubscriptionChecker from '../Profile/SubscriptionChecker';

type Props = {|
  project: gdProject,
  open: boolean,
  onClose: Function,
  onApply: Function,
  onChangeSubscription: () => void,
|};

type State = {|
  windowDefaultWidth: number,
  windowDefaultHeight: number,
  name: string,
  author: string,
  packageName: string,
  orientation: string,
  showGDevelopSplash: boolean,
|};

export default class ProjectPropertiesDialog extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = this._loadFrom(props.project);
  }

  _subscriptionChecker: ?SubscriptionChecker = null;

  _loadFrom(project: gdProject): State {
    return {
      windowDefaultWidth: project.getMainWindowDefaultWidth(),
      windowDefaultHeight: project.getMainWindowDefaultHeight(),
      name: project.getName(),
      author: project.getAuthor(),
      packageName: project.getPackageName(),
      orientation: project.getOrientation(),
      showGDevelopSplash: project.getLoadingScreen().isGDevelopSplashShown(),
    };
  }

  componentWillReceiveProps(newProps: Props) {
    if (
      (!this.props.open && newProps.open) ||
      (newProps.open && this.props.project !== newProps.project)
    ) {
      this.setState(this._loadFrom(newProps.project));
    }
  }

  _onApply = () => {
    const { project } = this.props;
    const {
      windowDefaultWidth,
      windowDefaultHeight,
      name,
      author,
      packageName,
      orientation,
      showGDevelopSplash,
    } = this.state;
    project.setDefaultWidth(windowDefaultWidth);
    project.setDefaultHeight(windowDefaultHeight);
    project.setName(name);
    project.setAuthor(author);
    project.setPackageName(packageName);
    project.setOrientation(orientation);
    project.getLoadingScreen().showGDevelopSplash(showGDevelopSplash);

    this.props.onApply();
  };

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={false}
        onClick={this.props.onClose}
      />,
      <FlatButton
        label="Apply"
        primary={true}
        keyboardFocused={true}
        onClick={this._onApply}
      />,
    ];
    const {
      name,
      windowDefaultWidth,
      windowDefaultHeight,
      author,
      packageName,
      orientation,
      showGDevelopSplash,
    } = this.state;

    return (
      <React.Fragment>
        <Dialog
          actions={actions}
          open={this.props.open}
          onRequestClose={this.props.onClose}
          autoScrollBodyContent={true}
        >
          <TextField
            floatingLabelText="Game name"
            fullWidth
            type="text"
            value={name}
            onChange={(e, value) => this.setState({ name: value })}
          />
          <TextField
            floatingLabelText="Game's window width"
            fullWidth
            type="number"
            value={windowDefaultWidth}
            onChange={(e, value) =>
              this.setState({
                windowDefaultWidth: Math.max(0, parseInt(value, 10)),
              })}
          />
          <TextField
            floatingLabelText="Game's window height"
            fullWidth
            type="number"
            value={windowDefaultHeight}
            onChange={(e, value) =>
              this.setState({
                windowDefaultHeight: Math.max(0, parseInt(value, 10)),
              })}
          />
          <TextField
            floatingLabelText="Author name"
            fullWidth
            hintText="Your name"
            type="text"
            value={author}
            onChange={(e, value) => this.setState({ author: value })}
          />
          <TextField
            floatingLabelText="Package name (for iOS and Android)"
            fullWidth
            hintText="com.example.mygame"
            type="text"
            value={packageName}
            onChange={(e, value) => this.setState({ packageName: value })}
          />
          <SelectField
            fullWidth
            floatingLabelText="Device orientation (for iOS and Android)"
            value={orientation}
            onChange={(e, i, value) => this.setState({ orientation: value })}
          >
            <MenuItem value="default" primaryText="Platform default" />
            <MenuItem value="landscape" primaryText="Landscape" />
            <MenuItem value="portrait" primaryText="Portrait" />
          </SelectField>
          <Checkbox
            label="Display GDevelop splash at startup (in exported game)"
            checked={showGDevelopSplash}
            onCheck={(e, checked) => {
              if (!checked) {
                if (
                  this._subscriptionChecker &&
                  !this._subscriptionChecker.checkHasSubscription()
                )
                  return;
              }

              this.setState({
                showGDevelopSplash: checked,
              });
            }}
          />
        </Dialog>
        <SubscriptionChecker
          ref={subscriptionChecker =>
            (this._subscriptionChecker = subscriptionChecker)}
          onChangeSubscription={() => {
            this.props.onClose();
            this.props.onChangeSubscription();
          }}
          mode="mandatory"
          title="Disable GDevelop splash at startup"
        />
      </React.Fragment>
    );
  }
}
