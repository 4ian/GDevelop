import React, { PureComponent } from 'react';
import { render } from 'react-dom';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import guidelines from './data.js';
import Window from '../Utils/Window';
import { getHelpLink } from '../Utils/HelpLink';

const styles = {
  container: {
    maxWidth: 400,
    padding: 10,
  },
  description: {
    paddingBottom: 10,
  },
};

type Props = {|
  opened: boolean,
|};

export default class GuidelinePopOver extends PureComponent<Props, State> {
  _inputRef = React.createRef();

  state = {
    open: true,
    index: 0,
    indexData: 0,
    indexMax: guidelines.length - 1,
  };

  togglePopover = () => {
    this.setState(currentState => ({
      open: !currentState.open,
    }));
  };

  next = () => {
    this.setState(currentState => {
      let val = currentState.index;
      if (val === currentState.indexMax) {
        val = currentState.indexMax;
      } else {
        val = currentState.index + 1;
      }
      return {
        index: val,
      };
    });
  };

  back = () => {
    this.setState(currentState => {
      let val = currentState.index;
      if (val === 0) {
        val = 0;
      } else {
        val = currentState.index - 1;
      }
      return {
        index: val,
      };
    });
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.state.index !== prevState.index) {
      this._inputRef.current.updatePosition();

      setTimeout(() => this.setState({ indexData: this.state.index }), 300);
    }
  }

  render() {
    const { opened } = this.props;

    let nextOrFinish;
    let imageTutorial;
    let closeOrWikipage;

    if (this.state.index === this.state.indexMax) {
      nextOrFinish = (
        <Button
          variant="contained"
          color="primary"
          onClick={this.togglePopover}
        >
          Finish
        </Button>
      );
    } else {
      nextOrFinish = (
        <Button
          variant="contained"
          color="primary"
          disabled={this.state.index === this.state.indexMax ? true : false}
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
            this.togglePopover();
          }}
        >
          See wikipage
        </Button>
      );
    } else {
      closeOrWikipage = (
        <Button variant="contained" onClick={this.togglePopover}>
          Close
        </Button>
      );
    }

    if (guidelines[this.state.indexData].imageSource !== undefined) {
      imageTutorial = (
        <img
          class="fit-picture"
          src={guidelines[this.state.indexData].imageSource}
          alt={guidelines[this.state.indexData].imageAlt}
        />
      );
    } else {
      imageTutorial = () => {
        return;
      };
    }

    return (
      <div className="app">
        <Button
          variant="contained"
          disabled={this.state.open}
          onClick={this.togglePopover}
        >
          Open popover
        </Button>
        <Popover
          action={this._inputRef}
          open={this.state.open}
          anchorReference="anchorPosition"
          anchorPosition={{
            top: guidelines[this.state.index].position.x,
            left: guidelines[this.state.index].position.y,
          }}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <Grid container style={styles.container}>
            <Grid item xs={12} style={styles.description}>
              <Typography variant="h5">
                {guidelines[this.state.indexData].title}
              </Typography>
              <Typography wrap="true">
                {guidelines[this.state.indexData].description}
              </Typography>
              <br />
              {imageTutorial}
            </Grid>
            <Grid
              container
              item
              alignItems="flex-start"
              justify="flex-start"
              xs={12}
            >
              <Grid container item justify="flex-start" xs={4}>
                {closeOrWikipage}
              </Grid>
              <Grid
                container
                item
                alignItems="baseline"
                justify="flex-end"
                xs={8}
              >
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
              </Grid>
            </Grid>
          </Grid>
        </Popover>
      </div>
    );
  }
}
