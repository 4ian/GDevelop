# Scripts files for Game Develop

* **ReleaseProcedure.bat**: this script compiles, generate documentation (see **GenerateAllDocs.bat**) and package Game Develop for Windows in an installer and an archive. 
* **ReleaseProcedure.sh**: compiles and package GD for Ubuntu (see *Binaries/Packaging*).
* **CopyWindowsToLinuxReleaseFiles.sh**: Copy all files in *Binaries/Output/Release_Windows* to *Binaries/Output/Release_Linux*. Call it after any change in *Binaries/Output/Release_Windows*.
* **GenerateAllDocs.bat**: Call doxygen and yuidoc to generate all the documentations into *docs* folder.