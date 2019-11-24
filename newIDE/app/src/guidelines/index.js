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
- Le clique est détecté sur le bouton (je n'arrive pas a mettre un addEventListener() ou onclick() sur le HTMLelement, je pense toujours pas avoir saisis a quel moment j'ai un element du html, ou l'element du DOM, ou encore celui du DOM react, je vais me renseigné.)
- Le tuto passe a la suite, soit une popper explicative, soit le bouton en surbrillance.
- Etc... le tuto continue...

Les datas sont à écrire, je le ferait en français puis ont verra pour des traductions anglaise.
A ce sujet comment on fait pour rendre les datas de l'objet traduisible ? On utilise quoi la fonction t(), le compoment <Trans> ou <i18n>.
Pour quoi trois système de traduction ?

Pour les boutons j'ai ajouté comme tu disais un identifiant via le className par un props. C'est ultra simple pour récupéré l'element !
En faite c'était une super idée que tu avait! J'avais mal compris l'interêt et la portée, désolé.
Donc j'ai fait pareil pour ne plus avoir de GuidelineMarker.

Pour le thème de la flèche de <popper> il faut même que le css utilise la couleur du thème actuel, mais dans les fichiers css on n'y met pas de variable.
J'ai pas trop envie de mettre le css du popper et celui de la flèche dans deux dossiers différents.
Je ne sais pas trop où mettre ce css.

//A voir plus tard lorsque la base sera plus avancé, je garde des notes ici.
- Le <Guideline> avec le poppper ajoute un décalage sur le body lorsqu'une que <Dialog> qui rend le fond noir transparent, ajoute un style qui provient de nul part directement sur le body.
style="overflow: hidden; padding-right: 17px;"
Cela ne provient pas de "import './style.css' à premeire vu

- Si aucun marqueur existe, que faire, (la position devrait être 0;0 ? la popper indique une erreur ? Est-ce qu'on occupe de géré une érreur des datas ? (pas sur que ce soit utile les data doivent être sûr à 100%))
Basiquement à quel moment se dire je doit géré l'erreur. A quel moment mon code n'est pas certain d'être executé comme il faut.
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

  userActionValidate() {
    /*
    Quelque part dans ce fichier mettre un listener sur le bouton qui a l'ID "clickTarget"
    lorsqu'il y a un clique dessus : 
    recupère l'element par son ID clickTarget
    Supprime son ID
    incrémente le state index
    */
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
    const elementHTML = document.querySelectorAll(
      '.guideline-' + guidelines[this.state.index].positionBind
    )[0];

    //Add blink effect only on buttons with props identifier="XXX"
    if (guidelines[this.state.index].type === 'clickTarget') {
      elementHTML.setAttribute('id', 'clickTarget');
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
        {guidelines[this.state.index].type === 'text' && !!open  && (
          <ThemeConsumer>
            {muiTheme => (
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
                  //className={muiTheme.eventsSheetRootClassName.guidelineArrowContainer}
                  className="guidelineArrowContainer"
                >
                  <div
                    ref={this._handleArrowRef}
                    className="guidelineArrow"
                    //className={muiTheme.eventsSheetRootClassName.guidelineArrow}
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
