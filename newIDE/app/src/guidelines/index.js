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
import ThemeConsumer from '../UI/Theme/ThemeConsumer';
import './style.css';

/*

Fonctionnement du tutoriel :
- On clique sur le bouton du tuto, il se lance
- On a une fenetre popper qui introduit ce qu'on va faire (Le platformer de base)
    http://wiki.compilgames.net/doku.php/gdevelop5/tutorials/platform-game/start
- On clique sur Next, ensuite le bouton que l'utilisateur doit utilisé à un halo bleu animé (Couleur de GD, voir pour utilisé la variable du thème)
  L'animation est avec les box-shadow et animation CSS, voir le fichier style.css ça fonctionne très bien!
- Le clique est détecté sur le bouton.
- Le tuto passe a la suite, soit un Popper explicatif, soit le bouton en surbrillance, soit les deux.
- Etc... le tuto continue...

TODO
BUG - Le <Guideline> avec le <Popper> ajoute un décalage sur le body lorsqu'une que <Dialog> qui rend le fond noir transparent, ajoute un style qui provient de nul part directement sur le body.
style="overflow: hidden; padding-right: 17px;"
Cela ne provient pas de "import './style.css' à premiere vu.

BUG - Lorsque je lance le tuto, ouvre un projet, ferme le tuto, et la relance, la Popper utilise un anchor inconnu et place mal la Popper.

BUG - Lorsque je lance le tuto, ouvre un projet, la project manager s'ouvre la suite du tuto ne sedéclenche pas.

- Comment rendre les datas de l'objet traduisible ? On utilise quoi la fonction t(), le compoment <Trans> ou <i18n>.
Pour quoi trois système de traduction ?

- Pour le thème de la flèche de <popper> il faut même que le css utilise la couleur du thème actuel, mais dans les fichiers css on n'y met pas de variable.
J'ai pas trop envie de mettre le css du popper et celui de la flèche dans deux dossiers différents.
Je ne sais pas trop où mettre ce css.

- Si aucun marqueur existe, que faire, (la position devrait être 0;0 ou centré a l'écran?)
Il faudrait créer une fake ref.
(passé en ref un element toujour affiché comme la classe "main-frame", pas possible sinon le Popper est en dehors du cadre)
*/

const styles = {
  guidelineContainer: {
    maxWidth: 400,
    padding: 10,
  },
  guidelineDescription: {
    paddingBottom: 10,
    overflow: 'hidden',
    whiteSpace: 'pre-line',
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

  userActionValidate = () => {
    console.log('clicked');
    //Attend que les fenêtres modal s'ouvrent
    //Fonctionne pas à tout les coups.
    setTimeout(this.next, 100);
  };

  _handleArrowRef = (node: any) => {
    this.setState({
      arrowRef: node,
    });
  };

  _updatePopover = () => {
    const elementHTML = document.querySelectorAll(
      '.guideline-' + guidelines[this.state.index].positionBind
    )[0];

    const clickTargetElementHTML = document.querySelectorAll(
      '.guideline-' + guidelines[this.state.index].clickTargetBind
    )[0];
    if (!clickTargetElementHTML) return;

    //Guidelines est ouvert
    if (this.state.open) {
      //Affiche le bouton à cliqué en surbrillance
      clickTargetElementHTML.setAttribute('id', 'clickTarget');
    } else {
      clickTargetElementHTML.removeAttribute('id');
    }

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
        //Selectionne et supprime l'effet de surbilliance sur le bouton d'avant.
        const previousClickTarget = document.querySelectorAll(
          '.guideline-' +
            guidelines[Math.min(this.state.indexMax, this.state.index + 1)]
              .clickTargetBind
        )[0];
        if (previousClickTarget) {
          previousClickTarget.removeAttribute('id');
        }
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
        //Selectionne et supprime l'effet de surbilliance sur le bouton d'avant.
        const previousClickTarget = document.querySelectorAll(
          '.guideline-' +
            guidelines[Math.min(this.state.indexMax, this.state.index - 1)]
              .clickTargetBind
        )[0];
        if (previousClickTarget) {
          previousClickTarget.removeAttribute('id');
        }

        this._updatePopover();
      }
    );
  };

  close = () => {
    this.setState({
      open: false,
    });
  };

  componentDidMount() {
    const clickTargetElementHTML = document.querySelectorAll(
      '.guideline-' + guidelines[this.state.index].clickTargetBind
    )[0];

    /*
    clickTarget n'est pas disponible à ce moment donc ça ne fonctionne pas avec l'ID
    const clickTargetElementHTML = document.getElementById("clickTarget");
    */

    if (clickTargetElementHTML) {
      clickTargetElementHTML.addEventListener('click', this.userActionValidate);
    }
  }

  componentWillReceiveProps(newProps: Props) {
    this._updatePopover();
    if (newProps.open !== this.props.open) {
      this.setState({
        open: newProps.open,
      });
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
        {guidelines[this.state.index] &&
          !!open &&
          guidelines[this.state.index].positionBind && (
            <ThemeConsumer>
              {muiTheme => (
                <div  className={muiTheme.guidelinesRootClassName} >
                  <Popper
                    open={open}
                    anchorEl={this.state.anchor}
                    placement={
                      guidelines[this.state.index].forceArrowOrientation
                        ? guidelines[this.state.index].forceArrowOrientation
                        : 'bottom'
                    }
                    modifiers={{
                      flip: {
                        enabled: true,
                      },
                      preventOverflow: {
                        enabled: true,
                        boundariesElement: 'window',
                      },
                      arrow: {
                        enabled: true,
                        element: this.state.arrowRef,
                      },
                    }}
                   
                     //className={'guidelineArrowContainer'}
                    className="guidelineArrowContainer"
                  >
                    <div
                      ref={this._handleArrowRef}
                      className={'guidelineArrow'}
                    />

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
              )}
            </ThemeConsumer>
          )}
      </div>
    );
  }
}
