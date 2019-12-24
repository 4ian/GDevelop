const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const recursive = require('recursive-readdir');

const corePath = path.join(__dirname, '../../../Core/GDCore');
const extensionsPath = path.join(__dirname, '../../../Extensions');
const newIdeAppSrcPath = path.join(__dirname, '../src');
const verbose = true;
const dryRun = false;

const excludedPaths = ['locales'];

let totalSentenceReplacementCount = 0;
let totalParameterReplacementCount = 0;
let totalSimplificationCount = 0;

const sanitizeExtracts = extract => {
  return extract.replace(/"\s+"/g, '').trim();
};

const isSubjectTheObject = subject => {
  return subject.match(/^_PARAM0_/);
};

const uncapitalize = str => {
  if (!str) return str;
  return str[0].toLowerCase() + str.substr(1);
}

const normalizeSubject = subject => {
  if (subject.indexOf('the ') !== 0 &&
  subject.indexOf('The ') !== 0) return 'the ' + uncapitalize(subject);
  return uncapitalize(subject);
};

const normalizeExtraDetails = extraDetails => {
  if (!extraDetails) return;
  if (extraDetails === 'seconds') {
    return '(in seconds)'
  }
  if (extraDetails === 'deg.') {
    return '(in degrees)'
  }

  if (extraDetails.indexOf('(') !== 0) {
    console.warn('⚠️ Extra details found but not normalized:', extraDetails);
  }

  return extraDetails;
}

const patternsToReplace = [
  {
    regexp: /_\(\s*(["'])Do\s*_PARAM.__PARAM._\s+to\s+(.*)\s*of\s(([\S\s](?!["']\s*\)))*.)["']\s*\)/g,
    replacer: (match, quote, rawAttribute, rawSubject) => {
      totalSentenceReplacementCount++;

      let finalSubject = '';
      const attribute = sanitizeExtracts(rawAttribute);
      const subject = sanitizeExtracts(rawSubject);
      if (isSubjectTheObject(subject)) {
        // Some details can be after the object
        const extraSubjectDetails = subject.replace(/^_PARAM0_/, '').trim();
        finalSubject = normalizeSubject(
          attribute + (extraSubjectDetails ? ' ' + extraSubjectDetails : '')
        );
      } else {
        finalSubject = normalizeSubject(attribute + ' of ' + subject);
      }

      const replacement = `_(${quote}${finalSubject}${quote})`;

      if (verbose) {
        console.log('Replaced "' + match + '" by "' + replacement + '"');
        console.log('action finalSubject:', finalSubject);
      }

      return replacement;
    },
  },
  {
    regexp: /_\(\s*(["'])Do\s*_PARAM.__PARAM._\s+to\s+(([\S\s](?!["']\s*\)))*.)["']\s*\)/g,
    replacer: (match, quote, rawSubject) => {
      totalSentenceReplacementCount++;

      const finalSubject = normalizeSubject(sanitizeExtracts(rawSubject));

      const replacement = `_(${quote}${finalSubject}${quote})`;

      if (verbose) {
        console.log('Replaced "' + match + '" by "' + replacement + '"');
        console.log('(action standalone subject: ' + finalSubject + ')');
      }

      return replacement;
    },
  },
  {
    regexp: /_\(\s*(["'])(.*)\s*of(.*)[\s"]+is[\s"]+_PARAM.__PARAM._(([\S\s](?!\s*\),))*).?["']\s*\)/g,
    replacer: (match, quote, rawAttribute, rawSubject, rawExtraDetails) => {
      totalSentenceReplacementCount++;

      let finalSubject = '';
      const extraDetails = normalizeExtraDetails(sanitizeExtracts(rawExtraDetails));
      const attribute = sanitizeExtracts(rawAttribute);
      const subject = sanitizeExtracts(rawSubject);
      if (isSubjectTheObject(subject)) {
        // Some details can be after the object
        const extraSubjectDetails = subject.replace(/^_PARAM0_/, '').trim();
        finalSubject = normalizeSubject(
          attribute +
            (extraSubjectDetails ? ' ' + extraSubjectDetails : '') +
            (extraDetails ? ' ' + extraDetails : '')
        );
      } else {
        finalSubject = normalizeSubject(
          attribute +
            ' of ' +
            subject +
            (extraDetails ? ' ' + extraDetails : '')
        );
      }

      const replacement = `_(${quote}${finalSubject}${quote})`;

      if (verbose) {
        console.log('Replaced "' + match + '" by "' + replacement + '"');
        console.log('condition finalSubject:', finalSubject);
      }

      return replacement;
    },
  },
  {
    regexp: /_\(\s*(["'])(.*)[\s"]+is[\s"]+_PARAM.__PARAM._(([\S\s](?!\s*\),))*).?["']\s*\)/g,
    replacer: (match, quote, rawSubject, rawExtraDetails) => {
      totalSentenceReplacementCount++;

      const extraDetails = normalizeExtraDetails(sanitizeExtracts(rawExtraDetails));
      const finalSubject = normalizeSubject(
        sanitizeExtracts(rawSubject) + (extraDetails ? ' ' + extraDetails : '')
      );

      const replacement = `_(${quote}${finalSubject}${quote})`;

      if (verbose) {
        console.log('Replaced "' + match + '" by "' + replacement + '"');
        console.log('(condition standalone subject: ' + finalSubject + ')');
      }

      return replacement;
    },
  },
  // Replace AddParameter("operator") or AddParameter("relationalOperator") and related parameter
  // when used with SetManipulatedType
  {
    regexp: /.([aA])ddParameter\(\s*(["'])(operator|relationalOperator)["']\s*,\s*_\(\s*["'](.*)["']\s*\)\s*\)\s*.[aA]ddParameter\(\s*["'](.*)["']\s*,\s*_\(["'].*["']\)\s*\)(([\s\S](?!\);))*)\.[sS]etManipulatedType\(['"](.*)['"]\)/g,
    replacer: (match, a, quote, operatorType, operatorLabel, valueType, otherFunctionCalls, unused, type) => {
      totalParameterReplacementCount++;
      const isCamelCase = a === 'a';

      if (valueType === 'expression') {
        valueType = 'number'
      }

      if (operatorLabel !== "Modification's sign" && operatorLabel !== "Comparison sign" && operatorLabel !== "Sign of the test") {
        console.warn('⚠️ Unknown operator label:', operatorLabel);
      }

      if (type !== valueType) {
        console.warn('⚠️ These types differs (between value and SetManipulatedType):', type, valueType);
      }
      if (type !== 'string' && type !== 'number') {
        console.warn('⚠️ This type (for SetManipulatedType) was not recognized:', type);
      }

      let method = operatorType === 'operator' ? 'UseStandardOperatorParameters' : 'UseStandardRelationalOperatorParameters';
      if (isCamelCase) method = uncapitalize(method);

      let getCodeExtraInformationMethod = 'GetCodeExtraInformation';
      if (isCamelCase) getCodeExtraInformationMethod = uncapitalize(getCodeExtraInformationMethod);

      const replacement = `.${method}("${type}")${otherFunctionCalls}.${getCodeExtraInformationMethod}()`;
      if (verbose) {
        console.log('Replaced "' + match + '" by "' + replacement + '"');
      }

      return replacement;
    },
  },
  // Fix extra useless calls to GetCodeExtraInformation
  {
    regexp: /\s+.[gG]etCodeExtraInformation\(\);/g,
    replacer: (match) => {
      totalSimplificationCount++;

      const replacement = ';';
      if (verbose) {
        console.log('Replaced "' + match + '" by "' + replacement + '"');
      }

      return replacement;
    }
  },
  // Fix double calls to GetCodeExtraInformation
  {
    regexp: /(\s+)\.([gG])etCodeExtraInformation\(\)(([\s\S](?!;))+)\.[gG]etCodeExtraInformation\(\)/g,
    replacer: (match, spacing, g, otherFunctionCalls) => {
      totalSimplificationCount++;
      const isCamelCase = g === 'g';

      let getCodeExtraInformationMethod = 'GetCodeExtraInformation';
      if (isCamelCase) getCodeExtraInformationMethod = uncapitalize(getCodeExtraInformationMethod);

      const replacement = `${spacing}.${getCodeExtraInformationMethod}()${otherFunctionCalls}`;
      if (verbose) {
        console.log('Replaced "' + match + '" by "' + replacement + '"');
      }

      return replacement;
    }
  },
  // Fix improper calls to GetCodeExtraInformation
  {
    regexp: /((\s+)\.[sS]etFunctionName\((([\s\S](?!;))+))\.[gG]etCodeExtraInformation\(\)\s+/g,
    replacer: (match, otherFunctionCalls) => {
      totalSimplificationCount++;

      const replacement = otherFunctionCalls;
      if (verbose) {
        console.log('Replaced "' + match + '" by "' + replacement + '"');
      }

      return replacement;
    }
  }
];

const replacePattern = (source, pattern) => {
  return source.replace(pattern.regexp, pattern.replacer);
};

const replaceSentencesInFile = filePath =>
  new Promise((resolve, reject) =>
    fs.readFile(filePath, { encoding: 'utf8' }, (err, source) => {
      if (err) return reject(err);

      let newSource = source;
      patternsToReplace.forEach(pattern => {
        newSource = replacePattern(newSource, pattern);
      });

      if (source === newSource) {
        return resolve({
          filePath,
          changed: false,
        });
      }

      if (!dryRun) {
        fs.writeFile(filePath, newSource, { encoding: 'utf8' }, err => {
          if (err) {
            shell.echo(`❌ Error while writing file ${filePath}: `, err);
            return reject(err);
          }

          resolve({
            filePath,
            changed: true,
          });
        });
      } else {
        shell.echo('ℹ️  Would write ' + filePath);
        resolve({
          filePath,
          changed: true,
        });
      }
    })
  );

const readRecursiveFiles = path =>
  new Promise((resolve, reject) => {
    recursive(path, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(files);
    });
  });

const flatten = arr => [].concat(...arr);

Promise.all([
  readRecursiveFiles(corePath),
  readRecursiveFiles(extensionsPath),
  readRecursiveFiles(newIdeAppSrcPath),
]).then(
  allFileLists => {
    const files = flatten(allFileLists);

    return Promise.all(
      files.map(filePath => {
        if (excludedPaths.some(excludedPath => filePath.includes(excludedPath)))
          return null;

        return replaceSentencesInFile(filePath);
      })
    ).then(results => {
      shell.echo(`ℹ️ Made ${totalSentenceReplacementCount} sentence replacements.`);
      shell.echo(`ℹ️ Made ${totalParameterReplacementCount} parameter replacements.`);
      shell.echo(`ℹ️ Made ${totalSimplificationCount} simplification.`);
      if (dryRun) {
        shell.echo(
          `⚠️  This was a dry-run, set dryRun to false to do real changes.`
        );
        shell.exit(0);
      }
    });
  },
  err => {
    shell.echo(`❌ Error(s) occurred while reading files `, err);
    shell.exit(1);
  }
);
