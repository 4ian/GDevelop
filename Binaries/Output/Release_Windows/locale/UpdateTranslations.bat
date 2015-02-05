@echo off
::Execute this script to update the translations (.mo files)
::using the .po files that you downloaded.
for /D %%i in (*.*) do  (
	if exist %%i/GD.po (
		msgcat %%i/GD.po  | msgfmt -o %%i/GD.mo -
	)
)