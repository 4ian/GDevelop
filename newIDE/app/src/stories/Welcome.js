import React from 'react';

const styles = {
  main: {
    margin: 15,
    maxWidth: 600,
    lineHeight: 1.4,
    fontFamily:
      '"Helvetica Neue", Helvetica, "Segoe UI", Arial, freesans, sans-serif',
  },

  logo: {
    width: 200,
  },

  link: {
    color: '#1474f3',
    textDecoration: 'none',
    borderBottom: '1px solid #1474f3',
    paddingBottom: 2,
  },

  code: {
    fontSize: 15,
    fontWeight: 600,
    padding: '2px 5px',
    border: '1px solid #eae9e9',
    borderRadius: 4,
    backgroundColor: '#f3f2f2',
    color: '#3a3a3a',
  },

  codeBlock: {
    backgroundColor: '#f3f2f2',
    padding: '1px 10px',
    margin: '10px 0',
  },
};

const codeBlock = `
// Add this code to "src/stories/index.js"

import '../index.css';
import App from '../App';

storiesOf('App', module)
  .add('default view', () => (
    &lt;App /&gt;
  ))
`;

export default class Welcome extends React.Component {
  render() {
    return (
      <div style={styles.main}>
        <h1>Welcome to STORYBOOK</h1>
        <p>This is a UI component dev environment for GDevelop.</p>
        <p>
          We've added some basic stories inside the{' '}
          <code style={styles.code}>src/stories</code> directory.
          <br />
          A story is a single state of one or more UI components. You can have
          as many stories as you want.
          <br />
          (Basically a story is like a visual test case.)
        </p>
        <p>
          Just like that, you can add your own components as stories.
          <br />
          Here's how to add your <code style={styles.code}>App</code> component
          as a story.
        </p>
        <div
          style={styles.codeBlock}
          dangerouslySetInnerHTML={{ __html: `<pre>${codeBlock}</pre>` }}
        />
        <p>
          Usually we create stories with smaller UI components in the app.<br />
          Have a look at the{' '}
          <a
            style={styles.link}
            href="https://storybooks.js.org/docs/react-storybook/basics/writing-stories"
            target="_blank"
          >
            Writing Stories
          </a>{' '}
          section in our documentation.
        </p>
      </div>
    );
  }
}
