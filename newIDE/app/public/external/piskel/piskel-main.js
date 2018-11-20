import { createPathEditorHeader } from '../utils/path-editor.js'
const electron = require('electron')
const ipcRenderer = electron.ipcRenderer
const fs = require('fs')
const async = require('async')
const path = require('path')
const remote = electron.remote

let piskelOptions // The options received from GDevelop
const updateFrameElements = () => {
  setTimeout(() => {
    const editorContentDocument = document.getElementById('piskel-frame').contentDocument
    if (piskelOptions.singleFrame) {
      editorContentDocument.getElementsByClassName('preview-list-wrapper')[0].style.display = 'none'
    }
  })
}

const closeWindow = () => {
  remote.getCurrentWindow().close()
}

// Repeatedly try to gain access to piskel's control element and its methods
// When succeeding, stop trying.
let pskl = null
const tryToGetPiskel = () => {
  pskl = document.querySelector('#piskel-frame').contentWindow.pskl
  if (pskl !== null) {
    ipcRenderer.send('piskel-ready')
    clearInterval(retryToGetPiskel)
  }
}
let retryToGetPiskel = setInterval(tryToGetPiskel, 200)

const readBase64ImageFile = file => {
  const bitmap = fs.readFileSync(file)
  return 'data:image/png;base64,' + bitmap.toString('base64')
}

/**
 * Save the content to the specified file
 */
const saveToFile = (content, filePath, callback) => {
  const reader = new FileReader()
  reader.onload = () => {
    const buffer = new Buffer(reader.result)
    fs.writeFile(filePath, buffer, {}, callback)
  }
  reader.readAsArrayBuffer(content)
}

const saveToGD = pathEditor => {
  const editorFrameEl = document.querySelector('#piskel-frame')
  const pskl = editorFrameEl.contentWindow.pskl
  const layer = pskl.app.piskelController.getLayerAt(0)
    // Generate the path of the files that will be written
  const outputResources = []
  const outputPaths = []
  for (let i = 0; i < pskl.app.piskelController.getFrameCount(); i++) {
    const frame = layer.getFrameAt(i)
    let exportPath = frame.originalPath
    const originalIndex = frame.originalIndex

    // If a frame was made in piskel (exportPath and resourceName will be null) come up with a unique path, so as not to overwrite any existing files
    // Also prevent overwriting frames that were created via duplication of imported frames or frames with same resources
    if (!exportPath) {
      exportPath = pathEditor.state.folderPath + '/' + pathEditor.state.name + '-' + String(i + 1) + '.png'
      exportPath = pathEditor.makeFileNameUnique(exportPath, '.png')
    }

    exportPath = path.normalize(exportPath)
    outputResources.push({
      path: exportPath,
      originalIndex
    })

    outputPaths.push(exportPath)
  }
  // if more than one layer is used - use metadata for storing the data
  let externalEditorData = {}
  const piskelData = pskl.app.piskelController.getPiskel()
  if (piskelData.layers.length > 1) {
    externalEditorData = {
      data: pskl.utils.serialization.Serializer.serialize(piskelData),
      paths: outputPaths,
      name: pathEditor.state.name,
      singleFrame: piskelOptions.singleFrame
    }
  }

  // Save, asynchronously, the content of each images
  async.eachOf(
        outputResources,
        (path, index, callback) => {
          const canvas = pskl.app.piskelController.renderFrameAt(index, true)
          pskl.utils.BlobUtils.canvasToBlob(canvas, blob => {
            saveToFile(blob, path.path, callback)
          })
        },
        err => {
          ipcRenderer.send('piskel-changes-saved', outputResources, pathEditor.state.name, externalEditorData)
          closeWindow()
        }
    )
}

// Create an empty piskel document to satisfy initiation when no data is given
const piskelCreateAnimation = () => {
  const sprite = {
    modelVersion: 2,
    piskel: {
      name: 'New Animation',
      description: '',
      fps: 12,
      height: 64,
      width: 64,
      layers: [
        '{"name":"Layer 1","frameCount":1,"base64PNG":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAAOUlEQVR42u3OIQEAAAACIP1/2hkWWEBzVgEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAYF3YDicAEE8VTiYAAAAAElFTkSuQmCC"}'
      ]
    }
  }
  const piskel = sprite.piskel
  const descriptor = new pskl.model.piskel.Descriptor(piskel.name, piskel.description, true)
  pskl.utils.serialization.Deserializer.deserialize(sprite, piskel => {
    piskel.setDescriptor(descriptor)
    pskl.app.piskelController.setPiskel(piskel)
    pskl.app.piskelController.setFPS(sprite.fps)
  })
  pskl.app.settingsController.settingsContainer
        .getElementsByClassName('tool-icon  icon-settings-resize-white')[0]
        .click() // call resize window
  pskl.app.settingsController.settingsContainer.getElementsByClassName('textfield resize-size-field')[0].focus()
}

// Load flattened images into Piskel
const loadImagesIntoPiskel = () => {
  // if no resources are being loaded, create a new animation
  if (piskelOptions.resources.length === 0) {
    piskelCreateAnimation()
    return
  }
  const piskelController = pskl.app.piskelController
  const imageData = []
  let maxWidth = -1
  let maxHeight = -1
  async.each(
    piskelOptions.resources,
    (resource, callback) => {
      const image = new Image()
      image.onload = () => {
        imageData.push(image)
        maxWidth = Math.max(image.width, maxWidth)
        maxHeight = Math.max(image.height, maxHeight)
        callback()
      }

      // onload will fire after `src` is set
      try {
        image.src = readBase64ImageFile(resource.resourcePath)
      } catch (error) {
        // Unable to load the image, ignore it.
        console.error('Unable to load ', resource, error)
        callback()
      }
    },
    err => {
      // Finally load the image objects into piskel
      const piskelFile = pskl.service.ImportService.prototype.createPiskelFromImages_(
        imageData,
        piskelOptions.name,
        maxWidth,
        maxHeight,
        false
      )
      piskelController.setPiskel(piskelFile, {})

      // Add original path variable to imported frame objects, so we can overwrite them later when saving changes
      const layer = piskelController.getLayerAt(0)
      for (let i = 0; i < piskelController.getFrameCount(); i++) {
        layer.getFrameAt(i).originalPath = piskelOptions.resources[i].resourcePath
        layer.getFrameAt(i).originalName = piskelOptions.resources[i].resourceName
        layer.getFrameAt(i).originalIndex = i
      }
    }
  )
}

// Load Layered Piskel document that was stored in GD as metadata
const loadPiskelDataFromGd = () => {
  const piskelController = pskl.app.piskelController
  piskelController.setFPS(piskelOptions.fps)

  const editorDataPaths = piskelOptions.externalEditorData.pskl.paths;
  let receivedPiskelData
  try {
    receivedPiskelData = JSON.parse(piskelOptions.externalEditorData.pskl.data)
  } catch (e) {
    console.error(e)
    console.info('Parsing json failed. Loading flattened images instead...')
    loadImagesIntoPiskel()
    return
  }

  // Create a Piskel Document from the metadata that GD stores
  pskl.utils.serialization.Deserializer.deserialize(
    receivedPiskelData,
    piskel => {
      piskelController.setPiskel(piskel)

      // set piskel frame paths to their piskel data counterpart - on all layers
      piskelController.getLayers().forEach(layer => {
        layer.getFrames().forEach((frame, index) => {
          frame.originalPath = editorDataPaths[index]
          frame.originalIndex = index
        })
      })

      // Compare the imported frames - so as to make the layered Piskel Document
      // the same as the changes done in Gdevelop without flattening any layers
      let flattenedImagePaths = []
      piskelOptions.resources.forEach((resource, frameIndex) => {
        const flattenedFramePath = path.normalize(resource.resourcePath)
        flattenedImagePaths.push(flattenedFramePath)

        // Import any frames that were added in Gdevelop
        if (!editorDataPaths.includes(flattenedFramePath)) {
          pskl.utils.BlobUtils.dataToBlob(readBase64ImageFile(flattenedFramePath), 'image/png', imageBlob => {
            pskl.utils.FileUtils.readImageFile(imageBlob, image => {
              piskelController.setCurrentFrameIndex(piskelController.getFrameCount() - 1)

              piskelController.addFrameAtCurrentIndex()
              piskelController.selectNextFrame()
              const currentFrameObj = piskelController.getCurrentFrame()
              pskl.utils.FrameUtils.addImageToFrame(currentFrameObj, image, 0, 0)
              pskl.tools.transform.TransformUtils.center(currentFrameObj)

              piskelController.getLayers().forEach(layer => {
                layer.moveFrame(piskelController.getCurrentFrameIndex(), frameIndex)
                layer.getFrameAt(frameIndex).originalIndex = frameIndex
                layer.getFrameAt(frameIndex).originalPath = flattenedFramePath
              })
            })
          })
        }
      });

      // Remove any frames that were removed in GD
      let framesToDelete = [];
      piskelController.getLayers()[0].getFrames().forEach(frame => {
        // frame was in meta, but is not in GDframes, if so remove it
        if (editorDataPaths.includes(frame.originalPath) && !flattenedImagePaths.includes(frame.originalPath)) {
          framesToDelete.push(frame)
        }
      })
      framesToDelete.forEach(frameToDelete => {
        piskelController.getLayers().forEach(layer => {
          if(layer.getFrames().indexOf(frameToDelete) > 0) {
            layer.getFrames().splice(layer.getFrames().indexOf(frameToDelete),1)
          }  
        })
      });

      // Put frames in the same order as they were in GD
      piskelController.getLayers().forEach(layer => {
        layer.getFrames().sort((a, b) => {
          return flattenedImagePaths.indexOf(a.originalPath) - flattenedImagePaths.indexOf(b.originalPath)
        })
      });
    },
    // if piskel's serializer fails to serialize, piskel will revert back to loading the flattened images
    error => {
      console.error(error)
      console.info('Loading piskel data failed. Loading flattened images instead...')
      loadImagesIntoPiskel()
    }
  )
}

ipcRenderer.on('piskel-load-animation', (event, receivedOptions) => {
    /**
   * Inject custom buttons in Piskel's header,
   * get rid of the new file button,
   * make animation name and path editable
   */
  piskelOptions = receivedOptions

  const editorContentDocument = document.getElementById('piskel-frame').contentDocument
  const newButton = editorContentDocument.getElementsByClassName('new-piskel-desktop button button-primary')[0]
  const oldPiskelNameLabel = editorContentDocument.getElementsByClassName('piskel-name')[0]
  newButton.style.display = 'none'
  oldPiskelNameLabel.style.display = 'none'
  const piskelAppHeader = editorContentDocument.getElementsByClassName('fake-piskelapp-header')[0]
  piskelAppHeader.style.display = 'none'

  // Load a custom save file(s) header
  const pathEditorHeaderDiv = document.getElementById('path-editor-header')
  const headerStyle = {
    saveFolderLabel: 'float: left;margin-left: 2px; font-size:15px;margin-top: 10px;color:aqua',
    nameInput: 'font-family:"Courier New";height:27px;width:90px;float:left;margin-left: 2px;padding:4px;margin-top: 4px;font-size:15px;border: 2px solid #e5cd50;border-radius: 3px;background-color:black; color: #e5cd50;',
    saveButton: 'float:right;margin-left:2px;margin-right:4px;border: 2px solid white;border-radius: 1px;margin-top: 5px;background-color:white;',
    cancelButton: 'float:right;margin-left:2px;margin-right:2px;border: 2px solid white;border-radius: 1px;margin-top: 5px;background-color:white;',
    setFolderButton: 'float:right;margin-left:2px;margin-right:2px;border: 2px solid white;border-radius: 1px;margin-top: 5px;background-color:white;',
    fileExistsLabel: 'height:27px;color:aqua;float: left;margin-left: 2px;margin-top: 10px; font-size:15px;'
  }
  const savePathEditor = createPathEditorHeader({
    parentElement: pathEditorHeaderDiv,
    editorContentDocument: document,
    onSaveToGd: saveToGD,
    onCancelChanges: closeWindow,
    projectPath: receivedOptions.projectPath,
    initialResourcePath: receivedOptions.resources[0] === undefined
      ? ''
      : receivedOptions.resources[0].resourcePath,
    headerStyle,
    name: receivedOptions.name,
    extension: piskelOptions.singleFrame ? '.png' : undefined
  })

  if (!pskl) {
    return
  }
  // Set piskel to tiled mode when editing a singleFrame object, set FPS from GD
  pskl.UserSettings.set(pskl.UserSettings.SEAMLESS_MODE, piskelOptions.singleFrame)

  // if there were no resources sent by GD, create an empty piskel
  if (receivedOptions.resources.length === 0) {
    piskelCreateAnimation();
  }
  // If there is metadata from GD, use it to load the pskl document with frames with layers
  // Note that metadata will be saved only if the user has more than one layers
  else if (piskelOptions.externalEditorData.pskl) {
    loadPiskelDataFromGd()
  } else {
    // If there are resources, load the images that were received from GD
    loadImagesIntoPiskel()
    // Disable changing path and naming convention by user - on animations imported from gdevelop
    savePathEditor.disableSavePathControls()
  }
  updateFrameElements()
})
