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

const useStyles = makeStyles(theme => ({
  listItemContainer: {
    width: '100%',
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

type Item = NamedCommand | CommandOption;

const getHierarchyAsArray = (hierarchy: {
  lvl0: string,
  lvl1: string,
  lvl2: string,
  lvl3: string,
  lvl4: string,
  lvl5: string,
  lvl6: string,
}): Array<string> =>
  Object.entries(hierarchy)
    .reduce((acc, [level, content]) => {
      if (content) {
        acc.push([Number(level.replace('lvl', '')), content]);
      }
      return acc;
    }, [])
    .sort((a, b) => a[0] - b[0])
    // $FlowFixMe[incompatible-return] - Object.entries does not keep values types.
    .map(item => item[1]);

const getHitLastHierarchyLevel = (hit: any) => {
  const hierarchyArray = getHierarchyAsArray(hit.hierarchy);
  return hierarchyArray[hierarchyArray.length - 1];
};

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

const Hit = ({ hit }: {| hit: any |}) => {
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
      classes={{ container: classes.listItemContainer }}
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
  const [open, setOpen] = React.useState(true);
  const shortcutMap = useShortcutMap();
  const classes = useStyles();

  const handleClose = (_, reason) => {
    if (reason === 'select-option') return;
    props.onClose();
  };

  const handleSelect = (_, item) => {
    props.onSelect(item);
  };

  const getItemHint = (item: Item) => {
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
  };

  const getItemText = (item: Item) => {
    if (item.text) return item.text;
    else if (item.name) {
      const { area, displayText } = commandsList[item.name];
      const areaText = commandAreas[area];
      return props.i18n._(areaText) + ' 〉' + props.i18n._(displayText);
    }
  };

  const getItemIcon = (item: Item) => {
    if (item.text && item.iconSrc) {
      return <ListIcon iconSize={20} src={item.iconSrc} />;
    } else if (item.icon) return item.icon;
    else return <ChevronRightIcon />;
  };

  return (
    <Autocomplete
      open={open}
      onClose={handleClose}
      onOpen={() => setOpen(true)}
      options={props.items}
      getOptionLabel={getItemText}
      onChange={handleSelect}
      onInputChange={(e, value) => {
        if (props.onInputChange) props.onInputChange(value);
      }}
      openOnFocus
      autoHighlight
      filterOptions={filterOptions}
      renderInput={params => (
        <TextField
          {...params}
          placeholder={props.i18n._(props.placeholder)}
          variant="outlined"
          autoFocus
        />
      )}
      renderOption={item => {
        if (item.hit) {
          return <Hit hit={item.hit} />;
        }
        return (
          <ListItem
            dense
            component="div"
            ContainerComponent="div"
            classes={{ container: classes.listItemContainer }}
          >
            <ListItemIcon>{getItemIcon(item)}</ListItemIcon>
            <ListItemText primary={getItemText(item)} />
            {getItemHint(item)}
          </ListItem>
        );
      }}
    />
  );
};

export default AutocompletePicker;
