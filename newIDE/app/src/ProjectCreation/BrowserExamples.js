import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import { sendNewGameCreated } from '../Utils/Analytics/EventSender';
import { Column, Line } from '../UI/Grid';
import Text from '../UI/Text';
import ExamplesList from './ExamplesList';
import InternalFileStorageProvider from '../ProjectsStorage/InternalFileStorageProvider';
import ExamplesInformation from './ExamplesInformation';

// To add a new example, add it first in resources/examples (at which point you can see it
// in the desktop version), then run these scripts:
// * scripts/update-examples-information-from-resources-examples.js (update metadata)
// * scripts/update-fixtures-from-resources-examples.js (update web-app examples)
// and upload the examples to `gdevelop-resources` s3.
const exampleNames: Array<string> = Object.keys(ExamplesInformation);

export default class BrowserExamples extends Component {
  render() {
    return (
      <Column noMargin>
        <Line>
          <Column>
            <Text>
              <Trans>Choose or search for an example to open:</Trans>
            </Text>
          </Column>
        </Line>
        <Line>
          <ExamplesList
            exampleNames={exampleNames}
            onCreateFromExample={exampleName => {
              sendNewGameCreated(exampleName);
              this.props.onOpen(InternalFileStorageProvider, {
                fileIdentifier: `example://${exampleName}`,
              });
            }}
          />
        </Line>
      </Column>
    );
  }
}
