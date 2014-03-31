@echo off > %TEMP%\#
setLocal EnableDelayedExpansion

echo --Copying files to SDK
call copyFilesToSDK.bat > logs/copyFilesToSDKLog.txt 2> logs/copyFilesToSDKLogErrors.txt
echo --Generating docs
call GenerateAllDocs.bat
