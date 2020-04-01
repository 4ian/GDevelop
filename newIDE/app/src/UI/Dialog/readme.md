`cannotBeDismissed` is a prop which when passed through a Dialog, will do the following depending on its value:

1. True -> The Dialog will not close when clicked out of its scope(backdropClick)
2. False -> The Dialog will close when clicked out of its scope

#### Selector Dialog

A dialog that shows multiple options, from which the user has to select one. In this type of dialog, the user does not have a chance of losing his changes when the dialog closes if clicked outside, hence `cannotBeDismissed` = false.

#### Info Dialog

A dialog which displays some text, and whose purpose is to inform the user about something, these dialog could be closed when clicked outside, hence `cannotBeDismissed`=false.

#### Editor Dialog

A dialog that has some text input. In this type of dialog, the user has a chance of losing his changes when the dialog closes if clicked outside, hence `cannotBeDismissed` = true.

| Dialog Name                      | `cannotBeDismissed` value | Explaination                                 |
| -------------------------------- | ------------------------- | -------------------------------------------- |
| AboutDialog                      | false                     | Info Dialog                                  |
| BehaviorMethodSelectorDialog     | false                     | Selector Dialog                              |
| BroweserPreviewErrorDialog       | false                     | Info Dialog                                  |
| BrowserIntroDialog               | false                     | Info Dialog                                  |
| BrowserPreviewLinkDialog         | true                      | Info Dialog, but shows important information |
| BuildsDialog                     | false                     | Info Dialog                                  |
| ChangeLogDialog                  | false                     | Info Dialog                                  |
| CreateAccountDialog              | true                      | Editor Dialog                                |
| CreateProjectDialog              | false                     | Selector Dialog                              |
| DownloadSaveAsDialog             | false                     | Info Dialog                                  |
| EditTagsDialog                   | true                      | Editor Dialog                                |
| EffectsListDialog                | true                      | Editor Dialog                                |
| EventsBasedBehaviorDialog        | true                      | Editor Dialog                                |
| EventsContextAnalyzerDialog      | false                     | Info Dialog                                  |
| EventsFunctionExtractorDialog    | true                      | Editor Dialog                                |
| EventTextDialog                  | true                      | Editor dialog                                |
| ExportDialog                     | false                     | Selector Dialog                              |
| ExpressionParametersEditorDialog | true                      | Editor Dialog                                |
| ExtensionFunctionSelectorDialog  | false                     | Selector Dialog                              |
| ExtensionInstallDialog           | false                     | Info Dialog                                  |
| ExtensionsSearchDialog           | true                      | Editor Dialog                                |
| GoogleDriveSaveAsDialog          | true                      | Info Dialog, but shows important information |
| InstructionEditorDialog          | true                      | Editor Dialog                                |
| LanguageDialog                   | false                     | Selector Dialog                              |
| LayerRemoveDialog                | false                     | Selector Dialog                              |
| LayoutChooserDialog              | false                     | Selector Dialog                              |
| LocalNetworkPreviewDialog        | true                      | Info Dialog, but shows important information |
| LoginDialog                      | true                      | Editor Dialog                                |
| NewBehaviorDialog                | false                     | Selector Dialog                              |
| NewInstructionEditorDialog       | true                      | Editor Dialog                                |
| NewObjectDialog                  | false                     | Selector Dialog                              |
| ObjectEditorDialog               | true                      | Editor Dialog                                |
| ObjectGroupEditorDialog          | true                      | Editor Dialog                                |
| OpenConfirmDialog                | false                     | Selector Dialog                              |
| OpenFromStorageProviderDialog    | false                     | Selector Dialog                              |
| OptionsEditorDialog              | true                      | Editor Dialog                                |
| PlatformSpecificAssestsDialog    | true                      | Editor Dialog                                |
| PreferencesDialog                | true                      | Editor Dialog                                |
| ProfileDialog                    | false                     | Info Dialog                                  |
| ProjectPropertiesDialog          | true                      | Editor Dialog                                |
| SaveToStorageProvdierDialog      | true                      | Info Dialog, but shows important information |
| ScenePropertiesDialog            | true                      | Editor Dialog                                |
| SetupGridDialog                  | true                      | Editor Dialog                                |
| SubscriptionDialog               | true                      | Info Dialog, but shows important information |
| SubscriptionPendingDialog        | true                      | Info Dialog, but shows important information |
| VariableEditorDialog             | true                      | Editor Dialog                                |

Some extra Dialogs, when searched for the string -> '<Dialog'
Dialog Name | `cannotBeDismissed` value | Explaination
-- | -- | --
AnimationPreview | false | Info Dialog
BrowserResourceSources | false | Selector Dialog
CollisionMaskEditor | true | Editor Dialog
ForgetPassword(Login Dialog) | true | Editor Dialog
HelpFinder | false | Info Dialog
InstructionEditor(Events Sheet) | true | Editor Dialog
PointsEditor | true | Editor Dialog
SubscriptionChecker | false | Info Dialog
[Stories](https://github.com/4ian/GDevelop/blob/41550ee10f56374dc82432ade5ceead348f82010/newIDE/app/src/stories/index.js#L541) | `undefined` | These are storybook stories, nothing linked to a dialog
