namespace gdjs {
  export namespace evtTools {
    export namespace firebaseTools {
      /**
       * Firebase Storage Event Tools
       * @namespace
       */
      export namespace storage {
        /**
         * The map containing all current uploads.
         */
        export const uploads = new Map<string, firebase.storage.UploadTask>();

        /**
         * Uploads a file as string to the firebase storage bucket.
         * @param file - The entire file as string.
         * @param onlinePath - The path under which the file will be accessible on the bucket.
         * @param [type] - The type/format of the string to upload.
         * @param [callbackStateVariable] - The variable where to store if the operation was successful.
         * @param [callbackValueVariable] - The variable where to store the result (url to the file).
         */
        export const uploadFile = (
          uploadID: string,
          file: string,
          onlinePath: string,
          type?: 'none' | 'base64' | 'base64url' | 'data_url',
          callbackStateVariable?: gdjs.Variable,
          callbackValueVariable?: gdjs.Variable
        ) => {
          try {
            var uploadTask = firebase
              .storage()
              .ref(onlinePath)
              .putString(file, type === 'none' ? undefined : type);
          } catch (e) {
            if (typeof callbackStateVariable !== 'undefined')
              callbackStateVariable.setString(e.message);
            return;
          }

          uploads.set(uploadID, uploadTask);
          uploadTask.on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            () => {},
            (error) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString(error.message);
            },
            () => {
              // Free memory from the finished upload task
              uploads.delete(uploadID);

              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString('ok');

              if (typeof callbackValueVariable !== 'undefined')
                uploadTask.snapshot.ref
                  .getDownloadURL()
                  .then((url) => callbackValueVariable.setString(url));
            }
          );
        };

        /**
         * Generate a download URL for a file.
         * @param filePath - The path in the remote storage bucket to the file to download.
         * @param [callbackValueVariable] - The variable where to store the result.
         * @param [callbackStateVariable] - The variable where to store if the operation was successful.
         */
        export const getDownloadURL = (
          filePath: string,
          callbackValueVariable?: gdjs.Variable,
          callbackStateVariable?: gdjs.Variable
        ) => {
          firebase
            .storage()
            .ref(filePath)
            .getDownloadURL()
            .then(function (downloadURL) {
              if (typeof callbackValueVariable !== 'undefined')
                callbackValueVariable.setString(downloadURL);

              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString('ok');
            })
            .catch(function (error) {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString(error.message);
            });
        };

        /**
         * Deletes a file on the remote storage bucket.
         * @param filePath - The path in the remote storage bucket to the file to download.
         * @param [callbackStateVariable] - The variable where to store if the operation was successful.
         */
        export const deleteFile = (
          filePath: string,
          callbackStateVariable?: gdjs.Variable
        ) => {
          firebase
            .storage()
            .ref(filePath)
            .delete()
            .then(function () {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString('ok');
            })
            .catch(function (error) {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString(error.message);
            });
        };
      }
    }
  }
}
