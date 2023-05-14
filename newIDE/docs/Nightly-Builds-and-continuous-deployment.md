# Nightly Builds and continuous deployment

GDevelop is using CircleCI (a continuous deployment/integration service) and AppVeyor to automatically build new versions for **every commit on `master`** branch.

You can download these here - **replace XX by the current version number**:

- Windows: `https://gdevelop-releases.s3.amazonaws.com/master/latest/GDevelop 5 Setup 5.1.XXX.exe`
- macOS: `https://gdevelop-releases.s3.amazonaws.com/master/latest/GDevelop 5-5.1.XXX-mac.zip`
- Linux: `https://gdevelop-releases.s3.amazonaws.com/master/latest/GDevelop 5-5.1.XXX.AppImage`

> ⚠️ Be sure to check if the latest build was successfully done: [![Build status](https://circleci.com/gh/4ian/GDevelop.svg?style=shield)](https://app.circleci.com/pipelines/github/4ian/GDevelop). If this icon is not green, wait a bit before downloading the latest version.

> ⚠️ In theory, the builds from `master` branch should always be stable and working well. In practice, they are not tested and can contain bugs or regressions. Make backups of your games and **use them at your own risk**. The software is provided "as is", **without warranty of any kind**. For more information, read the [license under which GDevelop is provided](https://github.com/4ian/GDevelop/blob/master/LICENSE.md).

## About Nightly Builds and continuous deployment

> "Nightly Builds" are the name given to versions of software being built every day automatically using the latest code source. "Continuous Deployment" (also shortened to "CD") is the name for the process that builds a new version of a software for every commit to the master branch of the source code.

- You can see how it's done in [this config file](https://github.com/4ian/GDevelop/blob/master/.circleci/config.yml). Versions are stored on an Amazon S3 bucket but _not_ published as they can sometimes be unstable.
- New public versions are still published manually (see the [README](../README.md) about deployment) to allow for manual testing.

> In theory, `master` branch should always be stable and working well. In practice, it's not always the case - hence manual publishing of new versions.

## How do I download a "Nightly Build" for a specific commit?

1. Verify that the CircleCI build was done for the commit. Click on the green check or the yellow circle on GitHub next to the commit or checks, and verify that `ci/circleci: build — Your tests passed on CircleCI!` is written - otherwise the build is still being done.
2. Find the hash of the commit. Usually, click on a commit title (in a Pull Requests or in the list of commits of a branch) and read the _hash_ in the URL. For example, for <https://github.com/4ian/GDevelop/commit/5c648e3f2b8c444bd99221cea56b92c00cdddddd>, the hash is `5c648e3f2b8c444bd99221cea56b92c00cdddddd`.
3. Download the version built for it (replace XX, THE_BRANCH and THE_COMMIT_HASH):

- Windows: `https://gdevelop-releases.s3.amazonaws.com/THE_BRANCH/commit/THE_COMMIT_HASH/GDevelop 5 Setup 5.1.XXX.exe`
- macOS: `https://gdevelop-releases.s3.amazonaws.com/THE_BRANCH/commit/THE_COMMIT_HASH/GDevelop 5-5.1.XXX-mac.zip`
- Linux: `https://gdevelop-releases.s3.amazonaws.com/THE_BRANCH/commit/THE_COMMIT_HASH/GDevelop 5-5.1.XXX.AppImage`
