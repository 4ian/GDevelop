param(
  [string]$ComfyBase = "D:\comfyui_data",
  [int]$Parallel = 96,
  [int]$ChunkMB = 16
)

$ErrorActionPreference = "Stop"

$items = @(
  @{
    Url = "https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/resolve/main/split_files/vae/wan2.2_vae.safetensors"
    Dest = Join-Path $ComfyBase "models\vae\wan2.2_vae.safetensors"
    Size = [int64]1409400960
  },
  @{
    Url = "https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors"
    Dest = Join-Path $ComfyBase "models\text_encoders\umt5_xxl_fp8_e4m3fn_scaled.safetensors"
    Size = [int64]6735906897
  },
  @{
    Url = "https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/resolve/main/split_files/diffusion_models/wan2.2_ti2v_5B_fp16.safetensors"
    Dest = Join-Path $ComfyBase "models\diffusion_models\wan2.2_ti2v_5B_fp16.safetensors"
    Size = [int64]9999658848
  }
)

function Get-ChunkPath([string]$PartsDir, [int]$Index) {
  Join-Path $PartsDir ("part-{0:D5}.bin" -f $Index)
}

function Get-ChunkLength([object]$Chunk) {
  [int64]($Chunk.End - $Chunk.Start + 1)
}

function Get-DownloadedBytes([array]$Chunks, [string]$PartsDir) {
  $total = [int64]0
  foreach ($chunk in $Chunks) {
    $path = Get-ChunkPath $PartsDir $chunk.Index
    if (Test-Path -LiteralPath $path) {
      $length = (Get-Item -LiteralPath $path).Length
      $expected = Get-ChunkLength $chunk
      $total += [Math]::Min([int64]$length, [int64]$expected)
    }
  }
  $total
}

function Join-Chunks([array]$Chunks, [string]$PartsDir, [string]$Destination, [int64]$ExpectedSize) {
  $tmp = "$Destination.tmp"
  Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
  $out = [System.IO.File]::Open($tmp, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::Write, [System.IO.FileShare]::None)
  try {
    $buffer = New-Object byte[] (4MB)
    foreach ($chunk in $Chunks) {
      $path = Get-ChunkPath $PartsDir $chunk.Index
      $input = [System.IO.File]::OpenRead($path)
      try {
        while (($read = $input.Read($buffer, 0, $buffer.Length)) -gt 0) {
          $out.Write($buffer, 0, $read)
        }
      } finally {
        $input.Dispose()
      }
    }
  } finally {
    $out.Dispose()
  }

  $actual = (Get-Item -LiteralPath $tmp).Length
  if ($actual -ne $ExpectedSize) {
    throw "Joined file size mismatch for $Destination`: $actual != $ExpectedSize"
  }
  Move-Item -LiteralPath $tmp -Destination $Destination -Force
}

function Invoke-RangedDownload([hashtable]$Item) {
  $dest = [string]$Item.Dest
  $size = [int64]$Item.Size
  $url = [string]$Item.Url
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $dest) | Out-Null

  if ((Test-Path -LiteralPath $dest) -and (Get-Item -LiteralPath $dest).Length -eq $size) {
    Write-Host "already complete: $dest"
    return
  }

  $chunkSize = [int64]$ChunkMB * 1024 * 1024
  $partsDir = "$dest.parts"
  $logsDir = Join-Path $partsDir "logs"
  New-Item -ItemType Directory -Force -Path $partsDir, $logsDir | Out-Null

  $chunks = @()
  $index = 0
  for ($start = [int64]0; $start -lt $size; $start += $chunkSize) {
    $end = [Math]::Min($start + $chunkSize - 1, $size - 1)
    $chunks += [pscustomobject]@{ Index = $index; Start = [int64]$start; End = [int64]$end; Attempts = 0 }
    $index += 1
  }

  Write-Host "downloading ranged: $dest ($([Math]::Round($size / 1GB, 2)) GB, $($chunks.Count) chunks)"
  $running = @{}
  $lastReport = Get-Date

  while ($true) {
    foreach ($key in @($running.Keys)) {
      $entry = $running[$key]
      if ($entry.Process.HasExited) {
        $exitCode = $entry.Process.ExitCode
        $entry.Process.Dispose()
        $running.Remove($key)
        $partPath = Get-ChunkPath $partsDir $entry.Chunk.Index
        $expected = Get-ChunkLength $entry.Chunk
        $actual = if (Test-Path -LiteralPath $partPath) { (Get-Item -LiteralPath $partPath).Length } else { 0 }
        if ($actual -eq $expected) {
          continue
        }
        if ($exitCode -ne 0 -or $actual -ne $expected) {
          Remove-Item -LiteralPath $partPath -Force -ErrorAction SilentlyContinue
          $entry.Chunk.Attempts += 1
          if ($entry.Chunk.Attempts -gt 10) {
            throw "Chunk $($entry.Chunk.Index) failed too many times for $dest"
          }
        }
      }
    }

    $complete = $true
    foreach ($chunk in $chunks) {
      $partPath = Get-ChunkPath $partsDir $chunk.Index
      $expected = Get-ChunkLength $chunk
      if (!(Test-Path -LiteralPath $partPath) -or (Get-Item -LiteralPath $partPath).Length -ne $expected) {
        $complete = $false
        if ($running.Count -lt $Parallel -and !$running.ContainsKey($chunk.Index)) {
          $range = "$($chunk.Start)-$($chunk.End)"
          $stdout = Join-Path $logsDir ("part-{0:D5}.out.log" -f $chunk.Index)
          $stderr = Join-Path $logsDir ("part-{0:D5}.err.log" -f $chunk.Index)
          $partPath = Get-ChunkPath $partsDir $chunk.Index
          $args = @("-L", "--fail", "--retry", "6", "--retry-delay", "2", "--range", $range, "--output", $partPath, $url)
          $process = Start-Process -FilePath "curl.exe" -ArgumentList $args -WindowStyle Hidden -PassThru -RedirectStandardOutput $stdout -RedirectStandardError $stderr
          $running[$chunk.Index] = [pscustomobject]@{ Process = $process; Chunk = $chunk }
        }
      }
      if ($running.Count -ge $Parallel) {
        break
      }
    }

    $now = Get-Date
    if (($now - $lastReport).TotalSeconds -ge 15) {
      $downloaded = Get-DownloadedBytes $chunks $partsDir
      $percent = [Math]::Round(($downloaded / $size) * 100, 2)
      Write-Host ("progress: {0}% {1:n2}/{2:n2} GB, running {3}" -f $percent, ($downloaded / 1GB), ($size / 1GB), $running.Count)
      $lastReport = $now
    }

    if ($complete -and $running.Count -eq 0) {
      break
    }
    Start-Sleep -Milliseconds 500
  }

  Write-Host "joining chunks: $dest"
  Join-Chunks $chunks $partsDir $dest $size
  Remove-Item -LiteralPath $partsDir -Recurse -Force
  Write-Host "installed: $dest"
}

foreach ($item in $items) {
  Invoke-RangedDownload $item
}
