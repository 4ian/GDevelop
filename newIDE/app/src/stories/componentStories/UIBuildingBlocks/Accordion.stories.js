// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../../GDevelopJsInitializerDecorator';
import { action } from 'storybook/actions';
import paperDecorator from '../../PaperDecorator';
import FlatButton from '../../../UI/FlatButton';
import Text from '../../../UI/Text';
import IconButton from '../../../UI/IconButton';
import '../../../UI/Theme/Global/Scrollbar.css';
import '../../../UI/Theme/Global/Animation.css';
import {
  Accordion,
  AccordionActions,
  AccordionHeader,
  AccordionBody,
} from '../../../UI/Accordion';
import Trash from '../../../UI/CustomSvgIcons/Trash';

export default {
  title: 'UI Building Blocks/Accordion',
  decorators: [paperDecorator],
};

const Default = (): React.Node => (
  <React.Fragment>
    {[0, 1, 2].map(idx => (
      <Accordion key={idx}>
        <AccordionHeader
          actions={[
            <IconButton
              key="delete"
              size="small"
              onClick={ev => {
                ev.stopPropagation();
                action('Header action')();
              }}
            >
              <Trash />
            </IconButton>,
          ]}
        >
          <Text>
            {idx === 0 ? 'Simple accordion' : null}
            {idx === 1 ? 'Accordion with no body padding' : null}
            {idx === 2 ? 'Accordion with actions' : null}
          </Text>
        </AccordionHeader>
        <AccordionBody disableGutters={idx === 1}>
          <Text>
            This is a quadrilateral. A quadrilateral has four points. If yours
            has more, count again - you may be misled.
          </Text>
        </AccordionBody>
        {idx === 2 && (
          <AccordionActions
            actions={[
              <FlatButton
                primary
                label="Count"
                onClick={action('Primary action')}
              />,
            ]}
            secondaryActions={[
              <FlatButton
                label="Ignore"
                onClick={action('Secondary action')}
              />,
            ]}
          />
        )}
      </Accordion>
    ))}
  </React.Fragment>
);

export { Default as ____Default };
Default.storyName = 'default';
