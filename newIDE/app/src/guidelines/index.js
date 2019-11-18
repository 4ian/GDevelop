// @flow
import React, { PureComponent } from 'react';
import Button from '@material-ui/core/Button';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import guidelines from './data.js';
import Window from '../Utils/Window';
import { getHelpLink } from '../Utils/HelpLink';
import { Line } from '../UI/Grid';
import './style.css';


//TODO 
/*
- Rendre la arrow du Guidelines dans les couleurs du thème.
- Ouvrir le Guideline et "Create a new project" ou un Dialog qui rend le fond noir transparent ajoute un style qui provient de nul part directement sur le body.
style="overflow: hidden; padding-right: 17px;"
Cela ne provient pas de "import './style.css';"
- Si aucun marqueur existe, que faire, (la position devrait être 0;0 ?)
*/

const styles = {
  guidelineContainer: {
    maxWidth: 400,
    padding: 10,
  },
  guidelineDescription: {
    paddingBottom: 10,
    overflow: 'hidden',
  },
  guidelineImage: {
    width: '100%',
  },
};

type State = {|
  open: boolean,
  index: number,
  indexMax: number,
  anchor: *,
  arrowRef: *,
|};

type Props = {|
  open: boolean,
  closeHandler: () => void,
|};

export default class GuidelinePopOver extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      open: props.open,
      index: 0,
      indexMax: guidelines.length - 1,
      anchor: null,
      arrowRef: null,
    };
  }

  componentWillReceiveProps(newProps: Props) {
    this._updatePopover();
    if (newProps.open !== this.props.open) {
      this.setState({
        open: newProps.open,
      });
    }
  }

  _handleArrowRef = (node: any) => {
    this.setState({
      arrowRef: node,
    });
  };

  _updatePopover = () => {
    let elementHTML = document.querySelectorAll(
      '.guideline-' + guidelines[this.state.index].positionBind
    )[0];

    if (!elementHTML) {
      console.log(
        "The anchor for GuidelinePopOver doesn't exist. Guidelines cannot working."
      );
      return;
    }
    this.setState({
      anchor: elementHTML,
    });
  };

  reset = () => {
    this.setState(
      {
        index: 0,
      },
      () => {
        this._updatePopover();
      }
    );
  };

  back = () => {
    this.setState(
      currentState => ({
        index: Math.min(currentState.indexMax, currentState.index - 1),
      }),
      () => {
        this._updatePopover();
      }
    );
  };

  next = () => {
    this.setState(
      currentState => ({
        index: Math.min(currentState.indexMax, currentState.index + 1),
      }),
      () => {
        this._updatePopover();
      }
    );
  };

  close = () => {
    this.setState({
      open: false,
    });
  };

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

    if (guidelines[this.state.index].imageSource !== undefined) {
      imageTutorial = (
        <img
          src={guidelines[this.state.index].imageSource}
          alt={guidelines[this.state.index].imageAlt}
          style={styles.guidelineImage}
        />
      );
    } else {
      imageTutorial = null;
    }

    return (
      <div>
        <Popper
          open={open}
          anchorEl={this.state.anchor}
          placement="bottom"
          modifiers={{
            flip: {
              enabled: true,
            },
            preventOverflow: {
              enabled: true,
              boundariesElement: 'scrollParent',
            },
            arrow: {
              enabled: true,
              element: this.state.arrowRef,
            },
          }}
          className="guidelineArrowContainer"
          x-arrow
        >
          <div ref={this._handleArrowRef} className="guidelineArrow" />

          <Paper elevation={24} style={styles.guidelineContainer}>
            <div style={styles.guidelineDescription}>
              <Line>
                <Typography variant="h5">
                  {guidelines[this.state.index].title}
                </Typography>
              </Line>
              <Line>
                <Typography wrap="true">
                  {guidelines[this.state.index].description}
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
