import React, { PureComponent } from 'react';
import Button from '@material-ui/core/Button';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import guidelines from './data.js';
import Window from '../Utils/Window';
import { getHelpLink } from '../Utils/HelpLink';
import { Line } from '../UI/Grid';

//TODO wrap l'image dans le Paper avec l'overflow hidden
//Actuellement l'image dépasse du Paper alors qu'il y a une marge autour du Popper
const styles = {
  container: {
    maxWidth: 400,
    padding: 10,
    marginTop: 10,
    overflow: 'hidden',
  },
  description: {
    paddingBottom: 10,
  },
};

type State = {|
  open: boolean,
  index: number,
  indexData: number,
  indexMax: number,
  //TODO
  //anchor: HTML node quelque chose (le node qui contient le className/attribut)
|};

type Props = {|
  open: boolean,
|};

//TODO
//PureComponent ou React.Component<Props, State> voir la doc pour comprendre la différence.
//Le bouton restart du tuto ferme le Popper mais le reouvre pas et surtout ne reset pas le Popper a l'index 0...

export default class GuidelinePopOver extends PureComponent<Props, State> {
  _inputRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      open: props.open,
      index: 0,
      indexData: 0,
      indexMax: guidelines.length - 1,
      anchor: document.getElementsByClassName('socialNetwork'),
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.open !== this.props.open) {
      this.setState({
        open: newProps.open,
      });
    }
    console.log('BOUH--------');
    console.log(document.getElementsByClassName('socialNetwork'));
    //console.log(document.querySelector('[data-guidelines]'));
    //Sa fonctionne pas avec les attibuts en général donc data-guidelines non plus
  }

  //TODO BOUH
  //Pour next() et back()
  //Actualise le state anchor avec la valeur de l'attribut où je veux ancré Popper
  //Valeur a recup dans data.js

  next = () => {
    this.setState(currentState => ({
      index: Math.min(currentState.indexMax, currentState.index + 1),
    }));
  };

  back = () => {
    this.setState(currentState => ({
      index: Math.min(currentState.indexMax, currentState.index - 1),
    }));
  };

  componentDidMount() {}

  componentDidUpdate(prevProps, prevState) {
    if (this.state.index !== prevState.index) {
      this.setState({ indexData: this.state.index });
    }
  }

  render() {
    const { open } = this.state;

    let nextOrFinish;
    let imageTutorial;
    let closeOrWikipage;

    if (this.state.index === this.state.indexMax) {
      nextOrFinish = (
        <Button
          variant="contained"
          color="primary"
          onClick={this.props.closeHandler}
        >
          Finish
        </Button>
      );
    } else {
      nextOrFinish = (
        <Button
          variant="contained"
          color="primary"
          disabled={this.state.index === this.state.indexMax}
          onClick={this.next}
        >
          Next
        </Button>
      );
    }

    if (this.state.index === this.state.indexMax) {
      closeOrWikipage = (
        <Button
          variant="contained"
          onClick={() => {
            Window.openExternalURL(getHelpLink('/tutorials'));
          }}
        >
          See wikipage
        </Button>
      );
    } else {
      closeOrWikipage = (
        <Button variant="contained" onClick={this.props.closeHandler}>
          Close
        </Button>
      );
    }

    if (guidelines[this.state.indexData].imageSource !== undefined) {
      imageTutorial = (
        <img
          src={guidelines[this.state.indexData].imageSource}
          alt={guidelines[this.state.indexData].imageAlt}
        />
      );
    } else {
      imageTutorial = null;
    }

    return (
      <div>
        <Popper
          action={this._inputRef}
          open={open}
          anchorEl={this.state.anchor}
        >
          <Paper style={styles.container}>
            <div style={styles.description}>
              <Line>
                <Typography variant="h5">
                  {guidelines[this.state.indexData].title}
                </Typography>
              </Line>
              <Line>
                <Typography wrap="true">
                  {guidelines[this.state.indexData].description}
                </Typography>
              </Line>
              <Line>{imageTutorial}</Line>
            </div>
            <Line alignItems="center" justifyContent="space-between">
              <Line>{closeOrWikipage}</Line>
              <Line alignItems="center">
                <Typography style={{ marginRight: 10 }}>
                  {this.state.index + 1} of {this.state.indexMax + 1}
                </Typography>
                <Button
                  variant="contained"
                  disabled={this.state.index === 0 ? true : false}
                  onClick={this.back}
                >
                  Back
                </Button>

                {nextOrFinish}
              </Line>
            </Line>
          </Paper>
        </Popper>
      </div>
    );
  }
}
