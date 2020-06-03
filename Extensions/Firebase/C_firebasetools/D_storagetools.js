/**
 * Firebase Tools Collection
 * @fileoverview
 * @author arthuro555
 */


/**
 * Firebase Storage Event Tools
 * @namespace
 */
gdjs.evtTools.firebase.storage = {
    uploads: new gdjs.UIDArray()
};

/**
 * Uploads a file as string to the firebase storage bucket.
 * @param {string} file - The entire file as string.
 * @param {string} onlinePath - The path under wich the file will be accessible on the bucket.
 * @param {"none"|"base64"|"base64url"|"data_url"} [type] - The type/format of the string to upload.
 * @param {gdjs.Variable} [callbackValueVariable] - The variable where to store the result (url to the file).
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store if the operration was successful.
 * @param {gdjs.Variable} [callbackUIDVariable] - The variable where to store the upload ID.
 * @param {gdjs.Variable} [callbackProgressVariable] - The variable where to store the progress.
 */
gdjs.evtTools.firebase.storage.upload = function(file, 
                                                 onlinePath, 
                                                 type, 
                                                 callbackValueVariable,
                                                 callbackStateVariable,
                                                 callbackUIDVariable, 
                                                 callbackProgressVariable) {
    type = type === "none" ? undefined : type;

    let uploadTask;
    try {
        uploadTask = firebase.storage().ref().child(onlinePath).putString(file, type);
    } catch(e) {
        if(typeof callbackStateVariable !== "undefined") callbackStateVariable.setString(e.message);
        return;
    }

    let uploadID;
    if(typeof callbackUIDVariable !== 'undefined') {
        uploadID = gdjs.evtTools.firebase.storage.uploads.push(uploadTask); // Only bother pushing if the ID will be stored
        if(typeof callbackUIDVariable !== "undefined") 
            callbackUIDVariable.setNumber(uploadID); 
    }
        
    uploadTask.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        uploadProgress => {if(typeof callbackProgressVariable !== "undefined") gdjs.evtTools.network._objectToVariable(uploadProgress, callbackProgressVariable, ["tasks"])},
        error => {if(typeof callbackStateVariable !== "undefined") callbackStateVariable.setString(error.message)},
        () => {
            if(typeof callbackStateVariable !== 'undefined') callbackStateVariable.setString("ok");
            if(typeof callbackUIDVariable !== 'undefined') {
                console.log(uploadID);
                gdjs.evtTools.firebase.storage.uploads.remove(uploadID); // Free memory
            }
            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                if(typeof callbackStateVariable !== "undefined") callbackStateVariable.setString(downloadURL);
            });
        }
    );
};

/**
 * Generate a download URL for a file.
 * @param {string} filePath - The path in the remote storage bucket to the file to download.
 * @param {gdjs.Variable} [callbackValueVariable] - The variable where to store the result.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store if the operration was successful.
 */
gdjs.evtTools.firebase.storage.getDownloadURL = function(filePath, callbackValueVariable, callbackStateVariable) {
    firebase.storage().ref().child(filePath).getDownloadURL()
      .then(function(downloadURL) {
        if(typeof callbackValueVariable !== "undefined") 
            callbackValueVariable.setString(downloadURL);
        if(typeof callbackStateVariable !== "undefined") 
            callbackStateVariable.setString("ok");
      })
      .catch(function(error) {
        if(typeof callbackStateVariable !== "undefined") 
            callbackStateVariable.setString(error.message);
      });
}

/**
 * Deletes a file on the remote storage bucket.
 * @param {string} filePath - The path in the remote storage bucket to the file to download.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store if the operration was successful.
 */
gdjs.evtTools.firebase.storage.delete = function(filePath, callbackStateVariable) {
    firebase.storage().ref().child(filePath).delete()
      .then(function() {
        if(typeof callbackStateVariable !== "undefined") 
            callbackStateVariable.setString("ok");
      })
      .catch(function(error) {
        if(typeof callbackStateVariable !== "undefined") 
            callbackStateVariable.setString(error.message);
      });
}
