// @flow
import * as React from 'react';
import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import { CompactTextAreaFieldWithControls } from '../../../UI/CompactTextAreaFieldWithControls';
import { ColumnStackLayout, LineStackLayout } from '../../../UI/Layout';
import ElementHighlighterProvider from '../../ElementHighlighterProvider';
import { Column } from '../../../UI/Grid';
import RaisedButton from '../../../UI/RaisedButton';
import MessagesIcon from '../../../UI/CustomSvgIcons/Messages';
import CompactSelectField from '../../../UI/CompactSelectField';
import SelectOption from '../../../UI/SelectOption';
import Text from '../../../UI/Text';

export default {
  title: 'UI Building Blocks/CompactTextAreaFieldWithControls',
  component: CompactTextAreaFieldWithControls,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => {
  const [value1, setValue1] = React.useState<string>('');
  const [value2, setValue2] = React.useState<string>('');
  const [value3, setValue3] = React.useState<string>('');
  const [value4, setValue4] = React.useState<string>('');
  return (
    <ElementHighlighterProvider
      elements={[{ label: 'Default', id: 'default' }]}
    >
      <ColumnStackLayout expand>
        <Text size="sub-title">With Button</Text>
        <CompactTextAreaFieldWithControls
          value={value1}
          onChange={setValue1}
          id="default"
          controls={
            <Column>
              <LineStackLayout alignItems="center" justifyContent="flex-end">
                <RaisedButton
                  color="primary"
                  onClick={() => {}}
                  label={'Send'}
                  icon={<MessagesIcon />}
                />
              </LineStackLayout>
            </Column>
          }
        />
        <Text size="sub-title">With Button and Select</Text>
        <CompactTextAreaFieldWithControls
          value={value2}
          onChange={setValue2}
          controls={
            <Column>
              <LineStackLayout
                alignItems="flex-end"
                justifyContent="space-between"
              >
                <CompactSelectField value="test" onChange={() => {}}>
                  <SelectOption value="auto" label={`Automatic`} />
                  <SelectOption value="manual" label={`Manual`} />
                </CompactSelectField>
                <RaisedButton
                  color="primary"
                  onClick={() => {}}
                  label={'Send'}
                  icon={<MessagesIcon />}
                />
              </LineStackLayout>
            </Column>
          }
        />
        <Text size="sub-title">With fixed rows</Text>
        <CompactTextAreaFieldWithControls
          value={value3}
          onChange={setValue3}
          controls={
            <Column>
              <LineStackLayout alignItems="center" justifyContent="flex-end">
                <RaisedButton
                  color="primary"
                  onClick={() => {}}
                  label={'Send'}
                  icon={<MessagesIcon />}
                />
              </LineStackLayout>
            </Column>
          }
          rows={4}
        />
        <Text size="sub-title">With dynamic rows</Text>
        <CompactTextAreaFieldWithControls
          value={value4}
          onChange={setValue4}
          controls={
            <Column>
              <LineStackLayout alignItems="center" justifyContent="flex-end">
                <RaisedButton
                  color="primary"
                  onClick={() => {}}
                  label={'Send'}
                  icon={<MessagesIcon />}
                />
              </LineStackLayout>
            </Column>
          }
          rows={4}
          maxRows={10}
        />
      </ColumnStackLayout>
    </ElementHighlighterProvider>
  );
};
