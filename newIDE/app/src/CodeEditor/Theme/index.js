// @flow
import TomorrowNight from './TomorrowNight';
import Monokai from './Monokai';
import Tomorrow from './Tomorrow';
import SolarizedDark from './SolarizedDark';
import SolarizedLight from './SolarizedLight';
import VibrantInk from './VibrantInk';
import GitHub from './GitHub';
import NordDark from './NordDark';
import OneDark from './OneDark';
import RosePine from './RosePine';

type CodeEditorTheme = {|
  name: string,
  themeName: string,
  themeData?: any,
|};

// Want to add a new theme? Grab a theme made for Visual Studio Code (Monaco Editor)
// (for example on https://bitwiser.in/monaco-themes/). Copy an existing file (like Monokai.js),
// replace themeData, update the name, and finally add it to this list
// (+import it at the top of the file):
const themes: Array<CodeEditorTheme> = [
  // Built-in Monaco editor themes
  {
    name: 'Visual Studio',
    themeName: 'vs',
  },
  {
    name: 'Visual Studio Dark',
    themeName: 'vs-dark',
  },
  // Third parties themes
  GitHub,
  Monokai,
  SolarizedDark,
  SolarizedLight,
  Tomorrow,
  TomorrowNight,
  VibrantInk,
  NordDark,
  OneDark,
  RosePine,
];

export const getAllThemes = () => themes;
