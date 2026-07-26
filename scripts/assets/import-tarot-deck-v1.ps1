param(
    [Parameter(Mandatory = $true)]
    [string]$ZipPath,

    [switch]$Push
)

$ErrorActionPreference = 'Stop'

$Branch = 'asset/04-full-tarot-deck-v1'
$RepoRoot = (git rev-parse --show-toplevel).Trim()
if (-not $RepoRoot) {
    throw 'Bu komut bir Git repository içinde çalıştırılmalıdır.'
}

Set-Location $RepoRoot

if (-not (Test-Path -LiteralPath $ZipPath)) {
    throw "ZIP bulunamadı: $ZipPath"
}

$ManifestPath = Join-Path $RepoRoot 'assets/tarot/deck-v1/source-manifest.json'
if (-not (Test-Path -LiteralPath $ManifestPath)) {
    throw "Manifest bulunamadı: $ManifestPath"
}

$workingTree = git status --porcelain
if ($workingTree) {
    throw 'Çalışma ağacı temiz değil. Önce mevcut değişiklikleri commit edin veya saklayın.'
}

git fetch origin $Branch
if ($LASTEXITCODE -ne 0) {
    throw "Branch fetch edilemedi: $Branch"
}

git switch $Branch
if ($LASTEXITCODE -ne 0) {
    git switch --track "origin/$Branch"
}
if ($LASTEXITCODE -ne 0) {
    throw "Branch açılamadı: $Branch"
}

$Target = Join-Path $RepoRoot 'assets/tarot/deck-v1/source'
if (Test-Path -LiteralPath $Target) {
    Remove-Item -LiteralPath $Target -Recurse -Force
}
New-Item -ItemType Directory -Path $Target -Force | Out-Null

Expand-Archive -LiteralPath $ZipPath -DestinationPath $Target -Force

$manifest = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json
$pngFiles = @(Get-ChildItem -LiteralPath $Target -Recurse -File -Filter '*.png')

if ($pngFiles.Count -ne 79) {
    throw "Beklenen PNG sayısı 79, bulunan: $($pngFiles.Count)"
}

$failures = @()
foreach ($item in $manifest.items) {
    $file = Join-Path $Target $item.path
    if (-not (Test-Path -LiteralPath $file)) {
        $failures += "Eksik: $($item.path)"
        continue
    }

    $actual = (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actual -ne $item.sha256.ToLowerInvariant()) {
        $failures += "Checksum uyuşmuyor: $($item.path)"
    }
}

if ($failures.Count -gt 0) {
    $failures | ForEach-Object { Write-Error $_ }
    throw "Asset doğrulaması başarısız: $($failures.Count) hata"
}

Write-Host '79/79 PNG doğrulandı.' -ForegroundColor Green

git add assets/tarot/deck-v1/source
if ($LASTEXITCODE -ne 0) {
    throw 'git add başarısız.'
}

git commit -m 'assets: add complete 78-card tarot deck source PNGs'
if ($LASTEXITCODE -ne 0) {
    throw 'git commit başarısız.'
}

if ($Push) {
    git push origin $Branch
    if ($LASTEXITCODE -ne 0) {
        throw 'git push başarısız.'
    }
    Write-Host "Push tamamlandı: origin/$Branch" -ForegroundColor Green
} else {
    Write-Host 'Commit oluşturuldu. Push için komutu -Push ile tekrar çalıştırın veya git push yapın.' -ForegroundColor Yellow
}
