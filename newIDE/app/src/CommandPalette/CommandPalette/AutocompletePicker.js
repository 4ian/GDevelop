// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import ListIcon from '../../UI/ListIcon';
import { useShortcutMap } from '../../KeyboardShortcuts';
import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Chip from '../../UI/Chip';
import TextField from '@material-ui/core/TextField';
import ChevronRightIcon from '../../UI/CustomSvgIcons/ChevronArrowRight';
import Autocomplete from '@material-ui/lab/Autocomplete';
import filterOptions from './FilterOptions';
import {
  type NamedCommand,
  type CommandOption,
  type GoToWikiCommand,
} from '../CommandManager';
import commandsList, { commandAreas } from '../CommandsList';
import { getShortcutDisplayName } from '../../KeyboardShortcuts';
import Book from '../../UI/CustomSvgIcons/Book';
import {
  getHierarchyAsArray,
  getHitLastHierarchyLevel,
  type AlgoliaSearchHit as AlgoliaSearchHitType,
} from '../../Utils/AlgoliaSearch';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import { useShouldAutofocusInput } from '../../UI/Responsive/ScreenTypeMeasurer';

const useStyles = makeStyles(theme => ({
  listItemContainer: {
    width: '100%',
  },
  rootSmallPadding: {
    paddingLeft: 0,
  },
  wikiPrimaryTextHierarchy: {
    color: theme.palette.text.secondary,
  },
  wikiSecondaryText: {
    color: theme.palette.text.primary,
  },
}));

const styles = {
  chip: {
    borderRadius: 3,
  },
};

type Item = NamedCommand | CommandOption | GoToWikiCommand;

const HitPrimaryText = (
  hit: any,
  { removeLastLevel }: { removeLastLevel: boolean }
) => {
  const classes = useStyles();

  let hierarchyArray = getHierarchyAsArray(hit.hierarchy);

  hierarchyArray = hierarchyArray.slice(
    0,
    hierarchyArray.length - (removeLastLevel ? 1 : 0)
  );

  const lastElement = hierarchyArray.pop();

  return (
    <>
      <span className={classes.wikiPrimaryTextHierarchy}>
        {hierarchyArray.map(item => `${item} > `)}
      </span>{' '}
      <span>{lastElement}</span>
    </>
  );
};

type Props<T> = {|
  onClose: () => void,
  onSelect: (item: T) => void,
  onInputChange?: (value: string) => void,
  items: Array<T>,
  placeholder: MessageDescriptor,
  i18n: I18nType,
|};

type AlgoliaSearchHitItemProps = {| hit: AlgoliaSearchHitType |};

export const AlgoliaSearchHit = ({ hit }: AlgoliaSearchHitItemProps) => {
  const { isMobile } = useResponsiveWindowSize();
  const classes = useStyles();
  let secondaryText;
  let removeLastLevel = false;
  if (hit.content) {
    secondaryText = hit.content;
  } else {
    removeLastLevel = true;
    secondaryText = getHitLastHierarchyLevel(hit);
  }
  const primaryText = HitPrimaryText(hit, { removeLastLevel });
  return (
    <ListItem
      dense
      component="div"
      ContainerComponent="div"
      classes={{
        container: classes.listItemContainer,
        root: isMobile ? classes.rootSmallPadding : null,
      }}
    >
      <ListItemIcon>
        <Book />
      </ListItemIcon>
      <ListItemText
        primary={primaryText}
        secondary={
          <span className={classes.wikiSecondaryText}>{secondaryText}</span>
        }
      />
    </ListItem>
  );
};

const AutocompletePicker = (
  props: Props<NamedCommand | GoToWikiCommand> | Props<CommandOption>
) => {
  const { isMobile, isMediumScreen } = useResponsiveWindowSize();
  const shouldAutofocusInput = useShouldAutofocusInput();
  const [open, setOpen] = React.useState(true);
  const shortcutMap = useShortcutMap();
  const classes = useStyles();

  const handleClose = (_, reason) => {
    if (reason === 'select-option' || reason === 'toggleInput') return;
    props.onClose();
  };

  const handleSelect = (_, item) => {
    props.onSelect(item);
  };

  const getItemHint = React.useCallback(
    (item: Item) => {
      if (isMobile || isMediumScreen) return null;
      if (item.text) return null;
      else if (item.name) {
        const shortcutString = shortcutMap[item.name];
        if (!shortcutString) return null;
        const shortcutDisplayName = getShortcutDisplayName(shortcutString);
        return (
          <ListItemSecondaryAction>
            <Chip label={shortcutDisplayName} style={styles.chip} />
          </ListItemSecondaryAction>
        );
      }
    },
    [shortcutMap, isMobile, isMediumScreen]
  );

  const getItemText = React.useCallback(
    (item: Item) => {
      if (item.text) return item.text;
      else if (item.name) {
        const { area, displayText } = commandsList[item.name];
        const areaText = commandAreas[area];
        return props.i18n._(areaText) + ' 〉' + props.i18n._(displayText);
      }
    },
    [props.i18n]
  );

  const getItemIcon = React.useCallback((item: Item) => {
    if (item.text && item.iconSrc) {
      return <ListIcon iconSize={20} src={item.iconSrc} />;
    } else if (item.icon) return item.icon;
    else return <ChevronRightIcon />;
  }, []);

  const renderOption = React.useCallback(
    (item: Item) => {
      if (item.hit) {
        return <AlgoliaSearchHit hit={item.hit} />;
      }
      return (
        <ListItem
          dense
          component="div"
          ContainerComponent="div"
          classes={{
            container: classes.listItemContainer,
            root: isMobile ? classes.rootSmallPadding : null,
          }}
        >
          <ListItemIcon>{getItemIcon(item)}</ListItemIcon>
          <ListItemText primary={getItemText(item)} />
          {getItemHint(item)}
        </ListItem>
      );
    },
    [
      classes.listItemContainer,
      classes.rootSmallPadding,
      isMobile,
      getItemText,
      getItemHint,
      getItemIcon,
    ]
  );

  return (
    <Autocomplete
      open={open}
      onClose={handleClose}
      onOpen={() => setOpen(true)}
      options={props.items}
      getOptionLabel={getItemText}
      onChange={handleSelect}
      onInputChange={(e, value, reason) => {
        if (reason === 'input' && props.onInputChange) {
          props.onInputChange(value);
        }
      }}
      openOnFocus
      autoHighlight
      filterOptions={filterOptions}
      renderInput={params => (
        <TextField
          {...params}
          placeholder={props.i18n._(props.placeholder)}
          variant="outlined"
          autoFocus={shouldAutofocusInput}
        />
      )}
      renderOption={renderOption}
    />
  );
};

export default AutocompletePicker;
