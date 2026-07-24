param(
  [string]$Output = (Join-Path (Split-Path $PSScriptRoot -Parent) '..\busplanner-qa-assessment.zip')
)

$projectRoot = Split-Path $PSScriptRoot -Parent
$staging = Join-Path ([System.IO.Path]::GetTempPath()) "busplanner-qa-assessment-$([guid]::NewGuid())"
$excludedDirectories = @('node_modules', 'test-results', 'playwright-report', 'blob-report', '.git')
$excludedFiles = @('.env')

try {
  New-Item -ItemType Directory -Path $staging | Out-Null

  Get-ChildItem -Path $projectRoot -Recurse -File |
    Where-Object {
      $relative = $_.FullName.Substring($projectRoot.Length + 1)
      $parts = $relative -split '[\\/]'
      -not ($parts | Where-Object { $excludedDirectories -contains $_ }) -and
      -not ($excludedFiles -contains $_.Name) -and
      $_.Extension -ne '.zip'
    } |
    ForEach-Object {
      $relative = $_.FullName.Substring($projectRoot.Length + 1)
      $destination = Join-Path $staging $relative
      New-Item -ItemType Directory -Force -Path (Split-Path $destination -Parent) | Out-Null
      Copy-Item $_.FullName $destination
    }

  if (Test-Path $Output) { Remove-Item $Output -Force }
  Compress-Archive -Path (Join-Path $staging '*') -DestinationPath $Output
  Write-Host "Created submission: $Output"
}
finally {
  if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
}
