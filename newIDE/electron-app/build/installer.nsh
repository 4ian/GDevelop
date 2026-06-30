; Auto-included by electron-builder (build/installer.nsh).
; Adds/removes the install dir in the current user's PATH so the GDevelop CLI
; works from any shell. SetEnvironmentVariable(..., 'User') updates HKCU and
; broadcasts WM_SETTINGCHANGE, so no admin rights and no logoff are needed.

!macro customInstall
  Push $9
  FileOpen $9 "$PLUGINSDIR\gd-add-to-path.ps1" w
  FileWrite $9 "$$dir = '$INSTDIR'$\r$\n"
  FileWrite $9 "$$path = [Environment]::GetEnvironmentVariable('Path', 'User')$\r$\n"
  FileWrite $9 "if ([string]::IsNullOrEmpty($$path)) {$\r$\n"
  FileWrite $9 "  [Environment]::SetEnvironmentVariable('Path', $$dir, 'User')$\r$\n"
  FileWrite $9 "} elseif (($$path -split ';') -notcontains $$dir) {$\r$\n"
  FileWrite $9 "  [Environment]::SetEnvironmentVariable('Path', ($$path.TrimEnd(';') + ';' + $$dir), 'User')$\r$\n"
  FileWrite $9 "}$\r$\n"
  FileClose $9
  nsExec::Exec 'powershell -NoProfile -ExecutionPolicy Bypass -File "$PLUGINSDIR\gd-add-to-path.ps1"'
  Pop $9
  Pop $9
!macroend

!macro customUnInstall
  Push $9
  FileOpen $9 "$PLUGINSDIR\gd-remove-from-path.ps1" w
  FileWrite $9 "$$dir = '$INSTDIR'$\r$\n"
  FileWrite $9 "$$path = [Environment]::GetEnvironmentVariable('Path', 'User')$\r$\n"
  FileWrite $9 "if (-not [string]::IsNullOrEmpty($$path)) {$\r$\n"
  FileWrite $9 "  $$parts = $$path -split ';' | Where-Object { $$_ -ne $$dir -and $$_ -ne '' }$\r$\n"
  FileWrite $9 "  [Environment]::SetEnvironmentVariable('Path', ($$parts -join ';'), 'User')$\r$\n"
  FileWrite $9 "}$\r$\n"
  FileClose $9
  nsExec::Exec 'powershell -NoProfile -ExecutionPolicy Bypass -File "$PLUGINSDIR\gd-remove-from-path.ps1"'
  Pop $9
  Pop $9
!macroend
