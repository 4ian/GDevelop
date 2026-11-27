// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Popover from '@material-ui/core/Popover';
import IconButton from '../UI/IconButton';
import Tune from '../UI/CustomSvgIcons/Tune';
import Text from '../UI/Text';
import InlineCheckbox from '../UI/InlineCheckbox';
import { ColumnStackLayout } from '../UI/Layout';
import {
  type TemplateComplexity,
  type TemplateType,
} from './ProjectTemplatesOrdering';

const styles = {
  popoverContent: { padding: 12 },
};

const templateTypeChoices: Array<{|
  value: TemplateType,
  label: React.Node,
|}> = [
  { value: 'free', label: <Trans>Free</Trans> },
  { value: 'premium', label: <Trans>Premium</Trans> },
];
const complexityChoices: Array<{|
  value: TemplateComplexity,
  label: React.Node,
|}> = [
  { value: 'basic-controls', label: <Trans>Basic controls</Trans> },
  { value: 'starter-template', label: <Trans>Starter template</Trans> },
  { value: 'full-game', label: <Trans>Full game</Trans> },
];

const toggleValue = <T>(values: Set<T>, value: T, checked: boolean): Set<T> => {
  const newValues = new Set(values);
  if (checked) newValues.add(value);
  else newValues.delete(value);
  return newValues;
};

type Props = {|
  templateTypes: Set<TemplateType>,
  onChangeTemplateTypes: (Set<TemplateType>) => void,
  complexities: Set<TemplateComplexity>,
  onChangeComplexities: (Set<TemplateComplexity>) => void,
  disabled?: boolean,
|};

const ProjectTemplatesFilterButton = ({
  templateTypes,
  onChangeTemplateTypes,
  complexities,
  onChangeComplexities,
  disabled,
}: Props): React.Node => {
  const [anchorEl, setAnchorEl] = React.useState<?HTMLElement>(null);

  return (
    <>
      <IconButton
        size="small"
        onClick={event => setAnchorEl(event.currentTarget)}
        selected={templateTypes.size > 0 || complexities.size > 0}
        disabled={disabled}
        id="project-templates-filter-button"
      >
        <Tune />
      </IconButton>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <div style={styles.popoverContent}>
          <ColumnStackLayout noMargin>
            <Text size="sub-title" noMargin>
              <Trans>Template type</Trans>
            </Text>
            {templateTypeChoices.map(({ value, label }) => (
              <InlineCheckbox
                key={value}
                label={label}
                checked={templateTypes.has(value)}
                onCheck={(e, checked) =>
                  onChangeTemplateTypes(
                    toggleValue(templateTypes, value, checked)
                  )
                }
              />
            ))}
            <Text size="sub-title" noMargin>
              <Trans>Complexity</Trans>
            </Text>
            {complexityChoices.map(({ value, label }) => (
              <InlineCheckbox
                key={value}
                label={label}
                checked={complexities.has(value)}
                onCheck={(e, checked) =>
                  onChangeComplexities(
                    toggleValue(complexities, value, checked)
                  )
                }
              />
            ))}
          </ColumnStackLayout>
        </div>
      </Popover>
    </>
  );
};

export default ProjectTemplatesFilterButton;
