Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$assetRoot = Join-Path $projectRoot 'images\character-sprites'
$walkRoot = Join-Path $assetRoot 'walking'
$portraitRoot = Join-Path $assetRoot 'portraits'
New-Item -ItemType Directory -Force -Path $walkRoot, $portraitRoot | Out-Null

$characterIds = @(
  'dualblade-male', 'dualblade-female', 'monk-male', 'monk-female', 'druid-male', 'druid-female',
  'bard-male', 'bard-female', 'ranger-male', 'ranger-female', 'barbarian-male', 'barbarian-female',
  'cleric-male', 'cleric-female', 'knight-male', 'knight-female', 'rogue-male', 'rogue-female',
  'alchemist-male', 'alchemist-female', 'axe-warrior-male', 'axe-warrior-female', 'blue-mage-male', 'blue-mage-female',
  'blue-warrior-male', 'blue-warrior-female', 'battlemage-male', 'battlemage-female', 'axe-mage-male', 'axe-mage-female'
)

function Get-AlphaBounds([System.Drawing.Bitmap]$bitmap, [System.Drawing.Rectangle]$cell) {
  $left = $cell.Right
  $top = $cell.Bottom
  $right = $cell.Left - 1
  $bottom = $cell.Top - 1
  for ($y = $cell.Top; $y -lt $cell.Bottom; $y++) {
    for ($x = $cell.Left; $x -lt $cell.Right; $x++) {
      if ($bitmap.GetPixel($x, $y).A -gt 20) {
        if ($x -lt $left) { $left = $x }
        if ($x -gt $right) { $right = $x }
        if ($y -lt $top) { $top = $y }
        if ($y -gt $bottom) { $bottom = $y }
      }
    }
  }
  if ($right -lt $left -or $bottom -lt $top) { return $cell }
  return [System.Drawing.Rectangle]::FromLTRB($left, $top, $right + 1, $bottom + 1)
}

function Get-AlphaCount([System.Drawing.Bitmap]$bitmap, [System.Drawing.Rectangle]$cell) {
  $count = 0
  for ($y = $cell.Top; $y -lt $cell.Bottom; $y += 2) {
    for ($x = $cell.Left; $x -lt $cell.Right; $x += 2) {
      if ($bitmap.GetPixel($x, $y).A -gt 20) { $count++ }
    }
  }
  return $count
}

function Get-DensestWindow([System.Drawing.Bitmap]$bitmap, [System.Drawing.Rectangle]$block) {
  $windowWidth = [int][Math]::Round($block.Width * 0.36)
  $best = [System.Drawing.Rectangle]::new($block.Left, $block.Top, $windowWidth, $block.Height)
  $bestCount = -1
  for ($left = $block.Left; $left -le $block.Right - $windowWidth; $left += 4) {
    $candidate = [System.Drawing.Rectangle]::new($left, $block.Top, $windowWidth, $block.Height)
    $count = Get-AlphaCount $bitmap $candidate
    if ($count -gt $bestCount) { $bestCount = $count; $best = $candidate }
  }
  return $best
}

function Get-SpriteGroups([System.Drawing.Bitmap]$bitmap, [System.Drawing.Rectangle]$rowBand) {
  $runs = [System.Collections.Generic.List[object]]::new()
  $runStart = -1
  $scanTop = $rowBand.Top + [int][Math]::Round($rowBand.Height * 0.35)
  $scanBottom = $rowBand.Bottom - [int][Math]::Round($rowBand.Height * 0.05)
  for ($x = 0; $x -lt $bitmap.Width; $x++) {
    $alphaCount = 0
    for ($y = $scanTop; $y -lt $scanBottom; $y++) {
      if ($bitmap.GetPixel($x, $y).A -gt 20) { $alphaCount++ }
    }
    $occupied = $alphaCount -ge 8
    if ($occupied -and $runStart -lt 0) { $runStart = $x }
    if (-not $occupied -and $runStart -ge 0) {
      $runs.Add([System.Drawing.Rectangle]::FromLTRB($runStart, $rowBand.Top, $x, $rowBand.Bottom))
      $runStart = -1
    }
  }
  if ($runStart -ge 0) { $runs.Add([System.Drawing.Rectangle]::FromLTRB($runStart, $rowBand.Top, $bitmap.Width, $rowBand.Bottom)) }

  $groups = [System.Collections.Generic.List[object]]::new()
  foreach ($run in $runs) {
    if ($groups.Count -gt 0 -and $run.Left - $groups[$groups.Count - 1].Right -le 5) {
      $previous = $groups[$groups.Count - 1]
      $groups[$groups.Count - 1] = [System.Drawing.Rectangle]::FromLTRB($previous.Left, $rowBand.Top, $run.Right, $rowBand.Bottom)
    } else { $groups.Add($run) }
  }
  while ($groups.Count -gt 12) {
    $bestIndex = 0
    $bestGap = [int]::MaxValue
    for ($index = 0; $index -lt $groups.Count - 1; $index++) {
      $gap = $groups[$index + 1].Left - $groups[$index].Right
      if ($gap -lt $bestGap) { $bestGap = $gap; $bestIndex = $index }
    }
    $left = $groups[$bestIndex]
    $right = $groups[$bestIndex + 1]
    $groups[$bestIndex] = [System.Drawing.Rectangle]::FromLTRB($left.Left, $rowBand.Top, $right.Right, $rowBand.Bottom)
    $groups.RemoveAt($bestIndex + 1)
  }
  if ($groups.Count -ne 12) {
    $groups.Clear()
    for ($index = 0; $index -lt 12; $index++) {
      $groups.Add([System.Drawing.Rectangle]::FromLTRB(
        [int][Math]::Round($index * $bitmap.Width / 12), $rowBand.Top,
        [int][Math]::Round(($index + 1) * $bitmap.Width / 12), $rowBand.Bottom
      ))
    }
    return $groups
  }

  $cells = [System.Collections.Generic.List[object]]::new()
  for ($index = 0; $index -lt 12; $index++) {
    $center = ($groups[$index].Left + $groups[$index].Right) / 2
    $left = if ($index -eq 0) { 0 } else { [int][Math]::Round((($groups[$index - 1].Left + $groups[$index - 1].Right) / 2 + $center) / 2) }
    $right = if ($index -eq 11) { $bitmap.Width } else { [int][Math]::Round(($center + ($groups[$index + 1].Left + $groups[$index + 1].Right) / 2) / 2) }
    $cells.Add([System.Drawing.Rectangle]::FromLTRB($left, $rowBand.Top, $right, $rowBand.Bottom))
  }
  return $cells
}

function Draw-FittedSprite(
  [System.Drawing.Graphics]$graphics,
  [System.Drawing.Bitmap]$source,
  [System.Drawing.Rectangle]$sourceBounds,
  [System.Drawing.Rectangle]$destinationCell,
  [bool]$flip = $false
) {
  $padding = 2
  $availableWidth = $destinationCell.Width - ($padding * 2)
  $availableHeight = $destinationCell.Height - ($padding * 2)
  $scale = [Math]::Min($availableWidth / $sourceBounds.Width, $availableHeight / $sourceBounds.Height)
  $drawWidth = [Math]::Max(1, [int][Math]::Round($sourceBounds.Width * $scale))
  $drawHeight = [Math]::Max(1, [int][Math]::Round($sourceBounds.Height * $scale))
  $drawX = $destinationCell.X + [int][Math]::Floor(($destinationCell.Width - $drawWidth) / 2)
  $drawY = $destinationCell.Bottom - $padding - $drawHeight
  $destination = [System.Drawing.Rectangle]::new($drawX, $drawY, $drawWidth, $drawHeight)

  if (-not $flip) {
    $graphics.DrawImage($source, $destination, $sourceBounds, [System.Drawing.GraphicsUnit]::Pixel)
    return
  }

  $state = $graphics.Save()
  $graphics.TranslateTransform($destination.Right, 0)
  $graphics.ScaleTransform(-1, 1)
  $flippedDestination = [System.Drawing.Rectangle]::new(0, $destination.Y, $destination.Width, $destination.Height)
  $graphics.DrawImage($source, $flippedDestination, $sourceBounds, [System.Drawing.GraphicsUnit]::Pixel)
  $graphics.Restore($state)
}

$frameWidth = 48
$frameHeight = 64
for ($rosterRow = 0; $rosterRow -lt 5; $rosterRow++) {
  $sourcePath = Join-Path $assetRoot "walking-row-$($rosterRow + 1).png"
  $source = [System.Drawing.Bitmap]::new($sourcePath)
  $sourceDirectionCount = if ($rosterRow -eq 2) { 3 } else { 4 }
  $directionRows = if ($rosterRow -eq 2) { @(0, 1, 1, 2) } else { @(0, 1, 2, 3) }

  for ($column = 0; $column -lt 6; $column++) {
    $id = $characterIds[$rosterRow * 6 + $column]
    $sheet = [System.Drawing.Bitmap]::new($frameWidth * 3, $frameHeight * 4, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($sheet)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver

    for ($direction = 0; $direction -lt 4; $direction++) {
      $sourceRow = $directionRows[$direction]
      $rowTop = [int][Math]::Round($sourceRow * $source.Height / $sourceDirectionCount)
      $rowBottom = [int][Math]::Round(($sourceRow + 1) * $source.Height / $sourceDirectionCount)
      for ($frame = 0; $frame -lt 3; $frame++) {
        # The generated pair's second pose can place long weapons across the
        # neighboring cell. Reuse the complete first pose and add a one-pixel
        # contact/bob frame so every class keeps an intact silhouette.
        $blockLeft = [int][Math]::Round($column * $source.Width / 6)
        $blockRight = [int][Math]::Round(($column + 1) * $source.Width / 6)
        $sourceCell = Get-DensestWindow $source ([System.Drawing.Rectangle]::FromLTRB($blockLeft, $rowTop, $blockRight, $rowBottom))
        $bounds = Get-AlphaBounds $source $sourceCell
        $bob = if ($frame -eq 1) { 1 } else { 0 }
        $destination = [System.Drawing.Rectangle]::new($frame * $frameWidth, $direction * $frameHeight + $bob, $frameWidth, $frameHeight - $bob)
        $flip = $rosterRow -eq 2 -and $direction -eq 2
        Draw-FittedSprite $graphics $source $bounds $destination $flip
      }
    }

    $graphics.Dispose()
    $sheet.Save((Join-Path $walkRoot "$id.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $sheet.Dispose()
  }
  $source.Dispose()
}

$portraitSource = [System.Drawing.Bitmap]::new((Join-Path $assetRoot 'character-portraits.png'))
$portraitYCuts = @(0, 245, 470, 675, 850, 1024)
for ($index = 0; $index -lt $characterIds.Count; $index++) {
  $row = [Math]::Floor($index / 6)
  $column = $index % 6
  $cell = [System.Drawing.Rectangle]::FromLTRB(
    [int][Math]::Round($column * $portraitSource.Width / 6),
    $portraitYCuts[$row],
    [int][Math]::Round(($column + 1) * $portraitSource.Width / 6),
    $portraitYCuts[$row + 1]
  )
  $bounds = Get-AlphaBounds $portraitSource $cell
  $portrait = [System.Drawing.Bitmap]::new(192, 192, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($portrait)
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  Draw-FittedSprite $graphics $portraitSource $bounds ([System.Drawing.Rectangle]::new(0, 0, 192, 192)) $false
  $graphics.Dispose()
  $portrait.Save((Join-Path $portraitRoot "$($characterIds[$index]).png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $portrait.Dispose()
}
$portraitSource.Dispose()

# Package a collision-safe walking sheet from each cleaned character portrait.
# The three frames use a subtle one-pixel contact/bob/contact cycle; horizontal
# rows mirror cleanly so left and right can never be accidentally swapped.
foreach ($id in $characterIds) {
  $portrait = [System.Drawing.Bitmap]::new((Join-Path $portraitRoot "$id.png"))
  $portraitBounds = Get-AlphaBounds $portrait ([System.Drawing.Rectangle]::new(0, 0, $portrait.Width, $portrait.Height))
  $sheet = [System.Drawing.Bitmap]::new($frameWidth * 3, $frameHeight * 4, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($sheet)
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  for ($direction = 0; $direction -lt 4; $direction++) {
    for ($frame = 0; $frame -lt 3; $frame++) {
      $bob = if ($frame -eq 1) { 1 } else { 0 }
      $destination = [System.Drawing.Rectangle]::new($frame * $frameWidth, $direction * $frameHeight + $bob, $frameWidth, $frameHeight - $bob)
      $flip = $direction -eq 1
      Draw-FittedSprite $graphics $portrait $portraitBounds $destination $flip
    }
  }
  $graphics.Dispose()
  $sheet.Save((Join-Path $walkRoot "$id.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $sheet.Dispose()
  $portrait.Dispose()
}

Write-Output "Built $($characterIds.Count) walking sheets and $($characterIds.Count) portraits."
