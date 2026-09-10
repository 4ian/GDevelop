; Auto-included by electron-builder (build/installer.nsh).
; Adds/removes the install dir in the current user's PATH so the GDevelop CLI
; works from any shell, without admin rights or a logoff.

!macro customInstall
  InitPluginsDir
  Push $9
  ; $INSTDIR may contain an apostrophe (e.g. username "O'Brien") that would break a
  ; PowerShell single-quoted string, so pass it via a data file instead of inlining it.
  FileOpen $9 "$PLUGINSDIR\gd-install-dir.txt" w
  FileWrite $9 "$INSTDIR"
  FileClose $9
  FileOpen $9 "$PLUGINSDIR\gd-add-to-path.ps1" w
  FileWrite $9 "$$dataFile = Join-Path $$PSScriptRoot 'gd-install-dir.txt'$\r$\n"
  FileWrite $9 "$$dir = (Get-Content -LiteralPath $$dataFile -Raw).Trim()$\r$\n"
  ; [Environment]::SetEnvironmentVariable rewrites Path as REG_SZ, corrupting REG_EXPAND_SZ
  ; entries like "%USERPROFILE%\bin"; read/write the raw registry value to keep its type.
  FileWrite $9 "$$envKey = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey('Environment', $$true)$\r$\n"
  FileWrite $9 "if (-not $$envKey) { $$envKey = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey('Environment') }$\r$\n"
  FileWrite $9 "$$path = [string]$$envKey.GetValue('Path', '', [Microsoft.Win32.RegistryValueOptions]::DoNotExpandEnvironmentNames)$\r$\n"
  FileWrite $9 "$$parts = @($$path -split ';' | Where-Object { $$_ -ne '' })$\r$\n"
  FileWrite $9 "if ($$parts -notcontains $$dir) { $$envKey.SetValue('Path', (($$parts + $$dir) -join ';'), [Microsoft.Win32.RegistryValueKind]::ExpandString) }$\r$\n"
  FileWrite $9 "$$envKey.Close()$\r$\n"
  ; A raw registry write doesn't notify running processes, so broadcast WM_SETTINGCHANGE.
  FileWrite $9 "Add-Type -Namespace GDevelopCli -Name NativeMethods -MemberDefinition '[DllImport($\"user32.dll$\", SetLastError = true, CharSet = CharSet.Auto)] public static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint Msg, UIntPtr wParam, string lParam, uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);'$\r$\n"
  FileWrite $9 "$$HWND_BROADCAST = [IntPtr]0xffff$\r$\n"
  FileWrite $9 "$$WM_SETTINGCHANGE = 0x1A$\r$\n"
  FileWrite $9 "$$SMTO_ABORTIFHUNG = 0x2$\r$\n"
  FileWrite $9 "$$broadcastTimeoutMs = 5000$\r$\n"
  FileWrite $9 "$$broadcastResult = [UIntPtr]::Zero$\r$\n"
  FileWrite $9 "[GDevelopCli.NativeMethods]::SendMessageTimeout($$HWND_BROADCAST, $$WM_SETTINGCHANGE, [UIntPtr]::Zero, 'Environment', $$SMTO_ABORTIFHUNG, $$broadcastTimeoutMs, [ref]$$broadcastResult) | Out-Null$\r$\n"
  FileClose $9
  nsExec::Exec 'powershell -NoProfile -ExecutionPolicy Bypass -File "$PLUGINSDIR\gd-add-to-path.ps1"'
  Pop $9
  Pop $9
!macroend

!macro customUnInstall
  InitPluginsDir
  Push $9
  FileOpen $9 "$PLUGINSDIR\gd-install-dir.txt" w
  FileWrite $9 "$INSTDIR"
  FileClose $9
  FileOpen $9 "$PLUGINSDIR\gd-remove-from-path.ps1" w
  FileWrite $9 "$$dataFile = Join-Path $$PSScriptRoot 'gd-install-dir.txt'$\r$\n"
  FileWrite $9 "$$dir = (Get-Content -LiteralPath $$dataFile -Raw).Trim()$\r$\n"
  FileWrite $9 "$$envKey = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey('Environment', $$true)$\r$\n"
  FileWrite $9 "if ($$envKey) {$\r$\n"
  FileWrite $9 "  $$path = [string]$$envKey.GetValue('Path', '', [Microsoft.Win32.RegistryValueOptions]::DoNotExpandEnvironmentNames)$\r$\n"
  FileWrite $9 "  $$parts = @($$path -split ';' | Where-Object { $$_ -ne $$dir -and $$_ -ne '' })$\r$\n"
  FileWrite $9 "  $$envKey.SetValue('Path', ($$parts -join ';'), [Microsoft.Win32.RegistryValueKind]::ExpandString)$\r$\n"
  FileWrite $9 "  $$envKey.Close()$\r$\n"
  FileWrite $9 "}$\r$\n"
  FileWrite $9 "Add-Type -Namespace GDevelopCli -Name NativeMethods -MemberDefinition '[DllImport($\"user32.dll$\", SetLastError = true, CharSet = CharSet.Auto)] public static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint Msg, UIntPtr wParam, string lParam, uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);'$\r$\n"
  FileWrite $9 "$$HWND_BROADCAST = [IntPtr]0xffff$\r$\n"
  FileWrite $9 "$$WM_SETTINGCHANGE = 0x1A$\r$\n"
  FileWrite $9 "$$SMTO_ABORTIFHUNG = 0x2$\r$\n"
  FileWrite $9 "$$broadcastTimeoutMs = 5000$\r$\n"
  FileWrite $9 "$$broadcastResult = [UIntPtr]::Zero$\r$\n"
  FileWrite $9 "[GDevelopCli.NativeMethods]::SendMessageTimeout($$HWND_BROADCAST, $$WM_SETTINGCHANGE, [UIntPtr]::Zero, 'Environment', $$SMTO_ABORTIFHUNG, $$broadcastTimeoutMs, [ref]$$broadcastResult) | Out-Null$\r$\n"
  FileClose $9
  nsExec::Exec 'powershell -NoProfile -ExecutionPolicy Bypass -File "$PLUGINSDIR\gd-remove-from-path.ps1"'
  Pop $9
  Pop $9
!macroend
