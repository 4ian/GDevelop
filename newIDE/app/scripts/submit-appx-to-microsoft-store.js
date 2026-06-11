// @ts-check
/**
 * This script submits an appx file as a new version of GDevelop on the
 * Microsoft Store (Microsoft Partner Center) and sends it for publishing,
 * using the Microsoft Store submission API
 * (see https://learn.microsoft.com/en-us/windows/uwp/monetize/create-and-manage-submissions-using-windows-store-services).
 *
 * The appx file can be downloaded with `download-all-build-artifacts.js`.
 *
 * ## One time setup: get the credentials (tenant ID, client ID, client secret)
 *
 * The API is authenticated with an Azure AD application associated with the
 * Partner Center account:
 * 1. In Partner Center, ensure the account is associated with an Azure AD directory
 *    (Account settings > Organization profile > Tenants).
 * 2. In Partner Center, go to Account settings > User management > Azure AD applications,
 *    and add (or create) the Azure AD application that will be used by this script.
 *    Make sure to assign it the **Manager** role.
 * 3. Click the name of the Azure AD application and copy the **Tenant ID** and **Client ID**.
 * 4. Click "Add new key" and copy the generated **Key** (the client secret) -
 *    it won't be shown again.
 *
 * Then, set these environment variables before running the script:
 * - MICROSOFT_PARTNER_CENTER_TENANT_ID
 * - MICROSOFT_PARTNER_CENTER_CLIENT_ID
 * - MICROSOFT_PARTNER_CENTER_CLIENT_SECRET
 *
 * ## What the script does
 *
 * 1. Gets an Azure AD access token.
 * 2. Checks there is no pending submission for the app (a pending submission can be
 *    deleted with --deletePendingSubmission, but only if it was not created/modified
 *    manually in the Partner Center interface - in which case the API can't touch it).
 * 3. Creates a new submission (a copy of the last published one: listing, pricing, etc.
 *    are kept as is).
 * 4. Replaces the packages of the submission by the given appx file.
 * 5. Uploads the appx (in a zip archive, as required by the API).
 * 6. Commits the submission, which sends it to certification and then publishing
 *    (the "target publish mode" of the last published submission is kept, which is
 *    "Immediate" for GDevelop: the new version goes live as soon as it passes certification).
 * 7. Polls the submission status until the commit is confirmed.
 *
 * ⚠️ Once a submission is created with this API, don't modify it in the Partner Center
 * interface, or it won't be manageable by the API anymore.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');
const shell = require('shelljs');
const { default: axios } = require('axios');
const AdmZip = require('adm-zip');
const args = require('minimist')(process.argv.slice(2));

// The Store ID of "GDevelop 5", as shown in Partner Center on the "Product identity" page
// (https://partner.microsoft.com/en-us/dashboard/products/9NGS8QR5D9PL/overview).
const defaultApplicationId = '9NGS8QR5D9PL';

const submissionApiBaseUrl = 'https://manage.devcenter.microsoft.com/v1.0/my';

if (!args['appxFile']) {
  shell.echo(
    '❌ You must pass --appxFile with the path to the appx file to submit (downloaded with download-all-build-artifacts.js).'
  );
  shell.exit(1);
}
const appxFilePath = path.resolve(args['appxFile']);
const applicationId = args['applicationId'] || defaultApplicationId;
const deletePendingSubmission = !!args['deletePendingSubmission'];

const tenantId = process.env.MICROSOFT_PARTNER_CENTER_TENANT_ID || '';
const clientId = process.env.MICROSOFT_PARTNER_CENTER_CLIENT_ID || '';
const clientSecret = process.env.MICROSOFT_PARTNER_CENTER_CLIENT_SECRET || '';
if (!tenantId || !clientId || !clientSecret) {
  shell.echo(
    '❌ You must set the MICROSOFT_PARTNER_CENTER_TENANT_ID, MICROSOFT_PARTNER_CENTER_CLIENT_ID and MICROSOFT_PARTNER_CENTER_CLIENT_SECRET environment variables (see the instructions at the top of this script to get them from Partner Center).'
  );
  shell.exit(1);
}

if (!fs.existsSync(appxFilePath)) {
  shell.echo(`❌ The appx file "${appxFilePath}" does not exist.`);
  shell.exit(1);
}

/**
 * Get an Azure AD access token for the Microsoft Store submission API.
 * @returns {Promise<string>}
 */
const getAccessToken = async () => {
  const response = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/token`,
    [
      'grant_type=client_credentials',
      `client_id=${encodeURIComponent(clientId)}`,
      `client_secret=${encodeURIComponent(clientSecret)}`,
      `resource=${encodeURIComponent('https://manage.devcenter.microsoft.com')}`,
    ].join('&'),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      },
    }
  );
  return response.data.access_token;
};

/**
 * Upload a file to Azure Blob Storage using the SAS URI given by the submission API.
 * @param {string} fileUploadUrl
 * @param {string} filePath
 * @returns {Promise<void>}
 */
const uploadFileToAzureBlob = (fileUploadUrl, filePath) =>
  new Promise((resolve, reject) => {
    const fileSize = fs.statSync(filePath).size;
    const request = https.request(
      // '+' characters in the SAS signature must be percent-encoded,
      // or the upload is rejected with an authentication error.
      fileUploadUrl.replace(/\+/g, '%2B'),
      {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Length': fileSize,
        },
      },
      response => {
        let body = '';
        response.on('data', chunk => (body += chunk));
        response.on('end', () => {
          if (
            response.statusCode &&
            response.statusCode >= 200 &&
            response.statusCode < 300
          ) {
            resolve();
          } else {
            reject(
              new Error(
                `Upload failed with status ${response.statusCode}: ${body}`
              )
            );
          }
        });
      }
    );
    request.on('error', reject);
    fs.createReadStream(filePath).pipe(request);
  });

const formatApiError = error => {
  if (error.response) {
    return `${error.response.status} ${JSON.stringify(error.response.data)}`;
  }
  return error.message || String(error);
};

const sleep = timeInMs => new Promise(resolve => setTimeout(resolve, timeInMs));

(async () => {
  shell.echo(`ℹ️ Getting an Azure AD access token...`);
  let accessToken;
  try {
    accessToken = await getAccessToken();
  } catch (error) {
    shell.echo(
      `❌ Unable to get an access token (check the credentials in the environment variables): ${formatApiError(
        error
      )}`
    );
    shell.exit(2);
  }

  const api = axios.create({
    baseURL: `${submissionApiBaseUrl}/applications/${applicationId}`,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // Check if there is already a pending (in progress) submission, as the API
  // refuses to create a new one in this case.
  shell.echo(`ℹ️ Getting the app information (application id: ${applicationId})...`);
  try {
    const appResponse = await api.get('');
    const app = appResponse.data;
    shell.echo(`ℹ️ Found app "${app.primaryName}".`);

    if (app.pendingApplicationSubmission) {
      const pendingSubmissionId = app.pendingApplicationSubmission.id;
      if (!deletePendingSubmission) {
        shell.echo(
          `❌ There is already a pending submission (id: ${pendingSubmissionId}). Pass --deletePendingSubmission to delete it and create a new one (this only works if it was created by the API - a submission created or modified in the Partner Center interface must be deleted manually there).`
        );
        shell.exit(3);
      }

      shell.echo(
        `⚠️ Deleting the pending submission (id: ${pendingSubmissionId})...`
      );
      await api.delete(`/submissions/${pendingSubmissionId}`);
    }
  } catch (error) {
    shell.echo(`❌ Error while inspecting the app: ${formatApiError(error)}`);
    shell.exit(2);
  }

  // Create a new submission, which is a copy of the last published one.
  shell.echo(`ℹ️ Creating a new submission...`);
  let submission;
  try {
    const response = await api.post('/submissions');
    submission = response.data;
  } catch (error) {
    shell.echo(
      `❌ Error while creating the submission: ${formatApiError(error)}`
    );
    shell.exit(2);
  }
  const submissionId = submission.id;
  shell.echo(`ℹ️ Created submission (id: ${submissionId}).`);

  // Replace the packages: mark the existing ones for deletion and add the new appx.
  const appxFileName = path.basename(appxFilePath);
  submission.applicationPackages.forEach(applicationPackage => {
    applicationPackage.fileStatus = 'PendingDelete';
  });
  submission.applicationPackages.push({
    fileName: appxFileName,
    fileStatus: 'PendingUpload',
  });

  shell.echo(
    `ℹ️ Updating the submission to replace the packages by "${appxFileName}"...`
  );
  try {
    await api.put(`/submissions/${submissionId}`, submission);
  } catch (error) {
    shell.echo(
      `❌ Error while updating the submission: ${formatApiError(error)}`
    );
    shell.exit(2);
  }

  // The API requires the package(s) to be uploaded in a single zip archive.
  shell.echo(`ℹ️ Zipping the appx file (this can take a while)...`);
  const zipFilePath = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'gd-appx-submission-')),
    'submission.zip'
  );
  const zip = new AdmZip();
  zip.addLocalFile(appxFilePath);
  zip.writeZip(zipFilePath);

  shell.echo(`ℹ️ Uploading the zip archive (this can take a while)...`);
  try {
    await uploadFileToAzureBlob(submission.fileUploadUrl, zipFilePath);
  } catch (error) {
    shell.echo(`❌ Error while uploading the appx: ${formatApiError(error)}`);
    shell.exit(2);
  } finally {
    shell.rm('-f', zipFilePath);
  }

  // Commit the submission: this sends it to the Store for certification and
  // then publishing (according to the submission "targetPublishMode").
  shell.echo(`ℹ️ Committing the submission...`);
  try {
    await api.post(`/submissions/${submissionId}/commit`);
  } catch (error) {
    shell.echo(
      `❌ Error while committing the submission: ${formatApiError(error)}`
    );
    shell.exit(2);
  }

  // Poll the status until the commit is confirmed by the Store.
  shell.echo(`ℹ️ Waiting for the Store to confirm the submission...`);
  while (true) {
    await sleep(30 * 1000);

    let status;
    try {
      const response = await api.get(`/submissions/${submissionId}/status`);
      status = response.data;
    } catch (error) {
      shell.echo(
        `⚠️ Error while getting the submission status (will retry): ${formatApiError(
          error
        )}`
      );
      continue;
    }

    shell.echo(`ℹ️ Submission status: ${status.status}.`);
    if (status.status === 'CommitStarted') {
      continue; // Still being processed, keep polling.
    }

    if (status.status === 'CommitFailed') {
      shell.echo(
        `❌ The submission commit failed: ${JSON.stringify(
          status.statusDetails,
          null,
          2
        )}`
      );
      shell.exit(4);
    }

    // Any other status (PreProcessing, Certification, Publishing, Published...)
    // means the submission was accepted and is on its way to be published.
    shell.echo(
      `✅ Submission sent for publishing. You can follow the certification and publishing progress on https://partner.microsoft.com/en-us/dashboard/products/${applicationId}/overview`
    );
    break;
  }
})();
