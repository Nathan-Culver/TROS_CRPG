$projectRoot = Split-Path -Parent $PSScriptRoot
$builder = Join-Path $PSScriptRoot 'build_character_sprites_v2.py'
$bundledPython = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
$pythonCommand = Get-Command python -ErrorAction SilentlyContinue

if (Test-Path -LiteralPath $bundledPython) {
  $python = $bundledPython
} elseif ($pythonCommand) {
  $python = $pythonCommand.Source
} else {
  throw 'Python with Pillow and NumPy is required to rebuild the character sprite assets.'
}

Push-Location $projectRoot
try {
  & $python $builder
  if ($LASTEXITCODE -ne 0) {
    throw "Character sprite build failed with exit code $LASTEXITCODE."
  }
} finally {
  Pop-Location
}
