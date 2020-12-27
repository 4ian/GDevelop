namespace gdjs {
  /**
   * Firebase Tools Collection
   * @fileoverview
   * @author arthuro555
   */

  /**
   * Firebase Storage Event Tools
   * @namespace
   */
  gdjs.evtTools.firebase.storage = { uploads: new gdjs.UIDArray() };

  /**
   * Uploads a file as string to the firebase storage bucket.
   * @param file - The entire file as string.
   * @param onlinePath - The path under wich the file will be accessible on the bucket.
   * @param [type] - The type/format of the string to upload.
   * @param [callbackValueVariable] - The variable where to store the result (url to the file).
   * @param [callbackStateVariable] - The variable where to store if the operation was successful.
   * @param [callbackUIDVariable] - The variable where to store the upload ID.
   * @param [callbackProgressVariable] - The variable where to store the progress.
   */
  gdjs.evtTools.firebase.storage.upload = function (
    file: string,
    onlinePath: string,
    type?: 'none' | 'base64' | 'base64url' | 'data_url',
    callbackValueVariable?: gdjs.Variable,
    callbackStateVariable?: gdjs.Variable,
    callbackUIDVariable?: gdjs.Variable,
    callbackProgressVariable?: gdjs.Variable
  ) {
    type = type === 'none' ? undefined : type;
    let uploadTask;
    try {
      uploadTask = firebase
        .storage()
        .ref()
        .child(onlinePath)
        .putString(file, type);
    } catch (e) {
      if (typeof callbackStateVariable !== 'undefined') {
        callbackStateVariable.setString(e.message);
      }
      return;
    }
    let uploadID;
    if (typeof callbackUIDVariable !== 'undefined') {
      // Only bother pushing if the ID will be stored.
      uploadID = gdjs.evtTools.firebase.storage.uploads.push(uploadTask);
      callbackUIDVariable.setNumber(uploadID);
    }
    uploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      (uploadProgress) => {
        if (typeof callbackProgressVariable !== 'undefined') {
          gdjs.evtTools.network._objectToVariable(
            uploadProgress,
            callbackProgressVariable,
            // Remove circular reference.
            ['tasks']
          );
        }
      },
      (error) => {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString(error.message);
        }
      },
      () => {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString('ok');
        }
        if (typeof callbackUIDVariable !== 'undefined') {
          gdjs.evtTools.firebase.storage.uploads.remove(
            // Free memory.
            uploadID
          );
        }
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
          if (typeof callbackStateVariable !== 'undefined') {
            callbackStateVariable.setString(downloadURL);
          }
        });
      }
    );
  };

  /**
   * Generate a download URL for a file.
   * @param filePath - The path in the remote storage bucket to the file to download.
   * @param [callbackValueVariable] - The variable where to store the result.
   * @param [callbackStateVariable] - The variable where to store if the operation was successful.
   */
  gdjs.evtTools.firebase.storage.getDownloadURL = function (
    filePath: string,
    callbackValueVariable?: gdjs.Variable,
    callbackStateVariable?: gdjs.Variable
  ) {
    firebase
      .storage()
      .ref()
      .child(filePath)
      .getDownloadURL()
      .then(function (downloadURL) {
        if (typeof callbackValueVariable !== 'undefined') {
          callbackValueVariable.setString(downloadURL);
        }
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString('ok');
        }
      })
      .catch(function (error) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString(error.message);
        }
      });
  };

  /**
   * Deletes a file on the remote storage bucket.
   * @param filePath - The path in the remote storage bucket to the file to download.
   * @param [callbackStateVariable] - The variable where to store if the operation was successful.
   */
  gdjs.evtTools.firebase.storage.delete = function (
    filePath: string,
    callbackStateVariable?: gdjs.Variable
  ) {
    firebase
      .storage()
      .ref()
      .child(filePath)
      .delete()
      .then(function () {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString('ok');
        }
      })
      .catch(function (error) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString(error.message);
        }
      });
  };
}
