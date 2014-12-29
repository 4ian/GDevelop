echo "Copying SFML files to " %1 "..."
xcopy "%2"\*.dll "%1"\*.dll /D /Y /Q
xcopy "%2"\*.a "%1"\*.a /D /Y /Q