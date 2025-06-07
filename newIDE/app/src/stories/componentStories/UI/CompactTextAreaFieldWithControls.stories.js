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
import SelectField from '../../../UI/SelectField';

export default {
  title: 'UI Building Blocks/CompactTextAreaFieldWithControls',
  component: CompactTextAreaFieldWithControls,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => {
  const [value, setValue] = React.useState<string>('');
  return (
    <ElementHighlighterProvider
      elements={[{ label: 'Default', id: 'default' }]}
    >
      <ColumnStackLayout expand>
        <CompactTextAreaFieldWithControls
          value={value}
          onChange={setValue}
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
        <CompactTextAreaFieldWithControls
          value={value}
          onChange={setValue}
          id="default"
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
      </ColumnStackLayout>
    </ElementHighlighterProvider>
  );
};
