import React, { Component } from 'react';
import { sendNewGameCreated } from '../Utils/Analytics/EventSender';
import { Column } from '../UI/Grid';
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
        <ExamplesList
          exampleNames={exampleNames}
          onCreateFromExample={exampleName => {
            sendNewGameCreated(exampleName);
            this.props.onOpen(InternalFileStorageProvider, {
              fileIdentifier: `example://${exampleName}`,
            });
          }}
        />
      </Column>
    );
  }
}
