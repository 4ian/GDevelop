# Scripts documentation for GDevelop

-   **ReleaseProcedure.bat**: this script compiles, generates documentation (see **GenerateAllDocs.bat**) and packages GDevelop for Windows in an installer and an archive.
-   **ReleaseProcedure.sh**: compiles and packages GD for Ubuntu (see _Binaries/Packaging_).
-   **CopyWindowsToLinuxReleaseFiles.sh**: Copies all files in _Binaries/Output/Release_Windows_ to _Binaries/Output/Release_Linux_. Call it after any change in _Binaries/Output/Release_Windows_.
-   **GenerateAllDocs.[bat|sh]**: Calls doxygen to generate all documentation into _docs_ folder.
-   **ExtractTranslations.[bat|sh]**: Creates the _source.pot_ file containing the strings to be translated using [Crowdin](https://crowdin.com/project/gdevelop).
-   **build-third-party-asars.py**: Cross-platform Python helper that builds `image-extender.asar`, `ai-game-workbench.storage-open.asar`, and `gorest-spritesheet.asar` from the `thirdParties` submodules. Run it from the repository root with `python scripts/build-third-party-asars.py`.
-   **ThirdPartySubmodules.md**: Documents how to initialize, update, modify, and commit the `thirdParties` git submodules.
-   **ImageExtenderElectronSteps.md**: Documents how to refresh `thirdParties/image-extender` and rebuild the Electron ASAR artifact without starting a localhost server.
-   **AiGameWorkbenchElectronSteps.md**: Documents how to refresh `thirdParties/ai_game_workbench` and rebuild the Electron ASAR artifact without starting a localhost server.
-   **GorestSpritesheetElectronSteps.md**: Documents how to refresh `thirdParties/gorest-2d-animation-spritesheet-generator` and rebuild the Electron ASAR artifact without starting a localhost server.
