param(
  [Parameter(Mandatory=$true)][string]$InputPptx,
  [Parameter(Mandatory=$true)][string]$OutputDirectory
)
$ErrorActionPreference='Stop'
$inputFile=(Resolve-Path -LiteralPath $InputPptx).Path
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$targetDirectory=(Resolve-Path -LiteralPath $OutputDirectory).Path
$pptApplication=New-Object -ComObject PowerPoint.Application
$deck=$null
try {
  $deck=$pptApplication.Presentations.Open($inputFile,-1,0,0)
  for($index=1;$index -le $deck.Slides.Count;$index++) {
    $target=Join-Path $targetDirectory ('slide-{0:D2}.png' -f $index)
    $deck.Slides.Item($index).Export($target,'PNG',1280,720)
  }
} finally {
  if($null -ne $deck){$deck.Close()}
  # Do not quit a shared PowerPoint application with user documents open.
}
