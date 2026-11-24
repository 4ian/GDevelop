// @flow
import * as React from 'react';

import MeasuresTable from '../../../Debugger/Profiler/MeasuresTable';
import profilerOutputsTestData from '../../../fixtures/ProfilerOutputsTestData.json';
import paperDecorator from '../../PaperDecorator';

export default {
  title: 'Debugger/MeasuresTable',
  component: MeasuresTable,
  decorators: [paperDecorator],
};

export const Default = (): React.Node => (
  <MeasuresTable
    profilerMeasures={profilerOutputsTestData.framesAverageMeasures}
  />
);

export const WithoutMeasures = (): React.Node => (
  <MeasuresTable profilerMeasures={null} />
);
