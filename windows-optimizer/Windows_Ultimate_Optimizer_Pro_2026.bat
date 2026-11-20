@echo off
title Windows Ultimate Optimizer Pro 2026
powershell.exe -NoProfile -ExecutionPolicy Bypass -STA -Command "$t=[IO.File]::ReadAllText('%~f0',[Text.Encoding]::UTF8); $i=$t.IndexOf('#PS_'+'START'); $p=Join-Path $env:TEMP 'UOP2026.ps1'; [IO.File]::WriteAllText($p,$t.Substring($i),(New-Object Text.UTF8Encoding $true)); & $p"
exit /b
#PS_START
<#
  Windows Ultimate Optimizer Pro 2026
  Aplikasi optimasi Windows 10/11 (PowerShell + WinForms). Wajib dijalankan sebagai Administrator.
  Jalankan lewat JALANKAN_OPTIMIZER.bat (otomatis meminta hak Administrator).
#>

# ------------------------------------------------------------------ Elevasi
$id = [Security.Principal.WindowsIdentity]::GetCurrent()
$isAdmin = (New-Object Security.Principal.WindowsPrincipal $id).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -STA -File `"$PSCommandPath`""
    exit
}

Add-Type -AssemblyName System.Windows.Forms, System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()
$ErrorActionPreference = 'Continue'

# ------------------------------------------------------------------ State
$script:AppName    = 'Windows Ultimate Optimizer Pro 2026'
$script:Root       = Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'UltimateOptimizerPro'
$script:Steps      = New-Object System.Collections.ArrayList
$script:TotalFreed = [int64]0
$script:Before     = $null
$script:After      = $null
$script:Analysis   = $null
$script:LastReport = $null
$script:Busy       = $false
$script:Cancel     = $false
$script:NeedReboot = $false
$script:LastOk     = $true
$script:Done       = 0
$script:Total      = 1
$script:Stamp      = Get-Date -Format 'yyyyMMdd_HHmmss'
$script:Chk        = [ordered]@{}
$script:y          = 5
New-Item -ItemType Directory -Path $script:Root -Force | Out-Null

# ------------------------------------------------------------------ Util
function DoEv { [System.Windows.Forms.Application]::DoEvents() }

function Fmt-Size([int64]$b) {
    if ($b -ge 1GB) { return ('{0:N2} GB' -f ($b / 1GB)) }
    if ($b -ge 1MB) { return ('{0:N1} MB' -f ($b / 1MB)) }
    if ($b -ge 1KB) { return ('{0:N0} KB' -f ($b / 1KB)) }
    return "$b B"
}

function Log([string]$m, [string]$lvl = 'INFO') {
    $color = switch ($lvl) { 'OK' { 'LimeGreen' } 'WARN' { 'Orange' } 'ERR' { 'Tomato' } 'HEAD' { 'DeepSkyBlue' } default { 'Gainsboro' } }
    $txtLog.SelectionStart = $txtLog.TextLength
    $txtLog.SelectionColor = [System.Drawing.Color]::FromName($color)
    $txtLog.AppendText(("[{0}] {1}`r`n" -f (Get-Date -Format 'HH:mm:ss'), $m))
    $txtLog.ScrollToCaret()
    DoEv
}

function Add-Step($name, $status, $detail) {
    [void]$script:Steps.Add([pscustomobject]@{ Name = $name; Status = $status; Detail = $detail; Time = (Get-Date -Format 'HH:mm:ss') })
}

# Menjalankan program eksternal tanpa membekukan UI
function Run-Proc([string]$file, [string]$arguments, [switch]$Unicode) {
    $out = [IO.Path]::GetTempFileName()
    try {
        $p = Start-Process -FilePath $file -ArgumentList $arguments -WindowStyle Hidden -PassThru -RedirectStandardOutput $out
        $null = $p.Handle
        while (-not $p.HasExited) {
            Start-Sleep -Milliseconds 200
            DoEv
            if ($script:Cancel) { try { $p.Kill() } catch {}; break }
        }
        $p.WaitForExit()
        $enc = if ($Unicode) { 'Unicode' } else { 'Default' }
        $text = Get-Content -LiteralPath $out -Encoding $enc -ErrorAction SilentlyContinue
        return [pscustomobject]@{ Code = $p.ExitCode; Output = $text }
    }
    finally { Remove-Item -LiteralPath $out -Force -ErrorAction SilentlyContinue }
}

function Get-PathSize($path) {
    $s = [int64]0
    Get-ChildItem -Path $path -Force -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object { $s += $_.Length }
    return $s
}

function Clear-Target($path) {
    $before = Get-PathSize $path
    Get-ChildItem -Path $path -Force -ErrorAction SilentlyContinue | ForEach-Object {
        Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
        DoEv
    }
    $after = Get-PathSize $path
    return [math]::Max([int64]0, ($before - $after))
}

# ------------------------------------------------------------------ 36 lokasi sampah
function Get-JunkList {
    $L = $env:LOCALAPPDATA; $A = $env:APPDATA; $W = $env:WINDIR; $P = $env:ProgramData
    $items = @(
        @('Temp pengguna', "$env:TEMP\*"),
        @('Temp Windows', "$W\Temp\*"),
        @('Prefetch', "$W\Prefetch\*"),
        @('Cache internet (INetCache)', "$L\Microsoft\Windows\INetCache\*"),
        @('Thumbnail cache', "$L\Microsoft\Windows\Explorer\thumbcache_*.db"),
        @('Icon cache', "$L\Microsoft\Windows\Explorer\iconcache_*.db"),
        @('Laporan error (pengguna)', "$L\Microsoft\Windows\WER\*"),
        @('Laporan error - arsip', "$P\Microsoft\Windows\WER\ReportArchive\*"),
        @('Laporan error - antrean', "$P\Microsoft\Windows\WER\ReportQueue\*"),
        @('Crash dumps pengguna', "$L\CrashDumps\*"),
        @('Minidump', "$W\Minidump\*"),
        @('MEMORY.DMP', "$W\MEMORY.DMP"),
        @('Log CBS', "$W\Logs\CBS\*.log"),
        @('Log Windows Update', "$W\Logs\WindowsUpdate\*"),
        @('Diagnostik ETL', "$P\Microsoft\Diagnosis\ETLLogs\*"),
        @('Delivery Optimization', "$W\ServiceProfiles\NetworkService\AppData\Local\Microsoft\Windows\DeliveryOptimization\Cache\*"),
        @('DirectX shader cache', "$L\D3DSCache\*"),
        @('NVIDIA DXCache', "$L\NVIDIA\DXCache\*"),
        @('NVIDIA GLCache', "$L\NVIDIA\GLCache\*"),
        @('AMD DxCache', "$L\AMD\DxCache\*"),
        @('Chrome cache', "$L\Google\Chrome\User Data\*\Cache\Cache_Data\*"),
        @('Chrome code cache', "$L\Google\Chrome\User Data\*\Code Cache\*"),
        @('Chrome GPU cache', "$L\Google\Chrome\User Data\*\GPUCache\*"),
        @('Edge cache', "$L\Microsoft\Edge\User Data\*\Cache\Cache_Data\*"),
        @('Edge code cache', "$L\Microsoft\Edge\User Data\*\Code Cache\*"),
        @('Edge GPU cache', "$L\Microsoft\Edge\User Data\*\GPUCache\*"),
        @('Firefox cache', "$L\Mozilla\Firefox\Profiles\*\cache2\*"),
        @('Brave cache', "$L\BraveSoftware\Brave-Browser\User Data\*\Cache\Cache_Data\*"),
        @('Discord cache', "$A\discord\Cache\*"),
        @('Spotify cache', "$L\Spotify\Storage\*"),
        @('Microsoft Teams cache', "$A\Microsoft\Teams\Cache\*"),
        @('Office file cache', "$L\Microsoft\Office\16.0\OfficeFileCache\*"),
        @('VS Code cache', "$A\Code\Cache\*"),
        @('VS Code cached data', "$A\Code\CachedData\*"),
        @('pip cache', "$L\pip\Cache\*"),
        @('npm cache', "$L\npm-cache\*"),
        @('Antrean laporan error (sistem)', "$W\System32\config\systemprofile\AppData\Local\Microsoft\Windows\WER\*")
    )
    foreach ($i in $items) { [pscustomobject]@{ N = $i[0]; P = $i[1] } }
}

# ------------------------------------------------------------------ Analisis
function Test-PendingReboot {
    foreach ($k in @('HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Component Based Servicing\RebootPending',
                     'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update\RebootRequired')) {
        if (Test-Path $k) { return $true }
    }
    $v = Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager' -Name PendingFileRenameOperations -ErrorAction SilentlyContinue
    return [bool]$v
}

function Get-SystemAnalysis([switch]$Quick) {
    $rows = New-Object System.Collections.ArrayList
    $issues = New-Object System.Collections.ArrayList
    $score = 100
    $addRow = { param($l, $v) [void]$rows.Add([pscustomobject]@{ Label = $l; Value = "$v" }) }

    $os  = Get-CimInstance Win32_OperatingSystem
    $cs  = Get-CimInstance Win32_ComputerSystem
    $cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
    $load = [math]::Round((Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average, 0)

    & $addRow 'Komputer' "$($cs.Name) ($($cs.Manufacturer) $($cs.Model))"
    & $addRow 'Windows' "$($os.Caption) - versi $($os.Version) (build $($os.BuildNumber))"
    & $addRow 'CPU' "$($cpu.Name.Trim()) - $($cpu.NumberOfCores) core / $($cpu.NumberOfLogicalProcessors) thread"
    & $addRow 'Beban CPU' "$load %"
    if ($load -ge 85) { $score -= 10; [void]$issues.Add("Beban CPU tinggi ($load %)") }

    $ramT = [math]::Round($os.TotalVisibleMemorySize / 1MB, 1)
    $ramF = [math]::Round($os.FreePhysicalMemory / 1MB, 1)
    $ramP = [math]::Round(100 * (1 - $os.FreePhysicalMemory / $os.TotalVisibleMemorySize), 0)
    & $addRow 'RAM' "$ramT GB total, $ramF GB bebas ($ramP % terpakai)"
    if ($ramP -ge 85) { $score -= 10; [void]$issues.Add("Pemakaian RAM tinggi ($ramP %)") }
    if ($ramT -lt 4)  { $score -= 5;  [void]$issues.Add('RAM kurang dari 4 GB') }

    $up = (Get-Date) - $os.LastBootUpTime
    & $addRow 'Uptime' ('{0} hari {1} jam' -f $up.Days, $up.Hours)
    if ($up.Days -ge 14) { $score -= 5; [void]$issues.Add("Belum restart selama $($up.Days) hari") }

    foreach ($d in (Get-CimInstance Win32_LogicalDisk -Filter 'DriveType=3')) {
        if ($d.Size) {
            $fp = [math]::Round(100 * $d.FreeSpace / $d.Size, 0)
            & $addRow "Disk $($d.DeviceID)" "$(Fmt-Size ([int64]$d.Size)) total, $(Fmt-Size ([int64]$d.FreeSpace)) bebas ($fp %)"
            if ($fp -lt 10) { $score -= 15; [void]$issues.Add("Disk $($d.DeviceID) hampir penuh ($fp % bebas)") }
            elseif ($fp -lt 20) { $score -= 7; [void]$issues.Add("Ruang disk $($d.DeviceID) menipis ($fp % bebas)") }
        }
    }

    try {
        foreach ($p in (Get-PhysicalDisk -ErrorAction Stop)) {
            & $addRow 'Drive fisik' "$($p.FriendlyName) - $($p.MediaType) - kesehatan: $($p.HealthStatus)"
            if ($p.HealthStatus -ne 'Healthy') { $score -= 25; [void]$issues.Add("Drive $($p.FriendlyName) berstatus $($p.HealthStatus)") }
        }
    } catch {}

    try {
        $mp = Get-MpComputerStatus -ErrorAction Stop
        & $addRow 'Windows Defender' ("Real-time: {0}; definisi terakhir: {1}" -f $mp.RealTimeProtectionEnabled, $mp.AntivirusSignatureLastUpdated.ToString('yyyy-MM-dd'))
        if (-not $mp.RealTimeProtectionEnabled) { $score -= 15; [void]$issues.Add('Perlindungan real-time Defender nonaktif') }
        if (((Get-Date) - $mp.AntivirusSignatureLastUpdated).Days -gt 7) { $score -= 5; [void]$issues.Add('Definisi antivirus lebih dari 7 hari') }
    } catch { & $addRow 'Windows Defender' 'Tidak terdeteksi / dikelola antivirus lain' }

    $pend = Test-PendingReboot
    & $addRow 'Menunggu restart' $(if ($pend) { 'Ya' } else { 'Tidak' })
    if ($pend) { $score -= 5; [void]$issues.Add('Ada pembaruan/perubahan yang menunggu restart') }

    $su = @(Get-CimInstance Win32_StartupCommand -ErrorAction SilentlyContinue).Count
    & $addRow 'Program startup' "$su item"
    if ($su -gt 20) { $score -= 5; [void]$issues.Add("Program startup banyak ($su item)") }

    if (-not $Quick) {
        $junk = [int64]0
        foreach ($j in (Get-JunkList)) { $junk += Get-PathSize $j.P; DoEv }
        & $addRow 'Estimasi file sampah' (Fmt-Size $junk)
        if ($junk -gt 2GB) { $score -= 5; [void]$issues.Add("File sampah besar ($(Fmt-Size $junk))") }

        $r = Run-Proc 'dism.exe' '/Online /Cleanup-Image /CheckHealth'
        $txt = ($r.Output -join ' ')
        if ($r.Code -ne 0 -or $txt -match 'repairable') {
            $score -= 15; [void]$issues.Add('DISM CheckHealth: komponen Windows perlu diperbaiki')
            & $addRow 'Kesehatan komponen Windows' 'Perlu perbaikan (jalankan DISM/SFC)'
        } else { & $addRow 'Kesehatan komponen Windows' 'Tidak ada kerusakan terdeteksi (DISM CheckHealth)' }
    }

    return [pscustomobject]@{ Rows = $rows; Issues = $issues; Score = [math]::Max(0, $score); Time = Get-Date }
}

function Score-Text($s) {
    if ($s -ge 85) { return 'Baik' }
    if ($s -ge 65) { return 'Cukup' }
    return 'Perlu perhatian'
}

function Show-Analysis($a) {
    Log '=== HASIL ANALISIS ===' 'HEAD'
    foreach ($r in $a.Rows) { Log ("{0,-28}: {1}" -f $r.Label, $r.Value) }
    if ($a.Issues.Count -gt 0) { Log 'Temuan:' 'WARN'; foreach ($i in $a.Issues) { Log "  - $i" 'WARN' } }
    else { Log 'Tidak ada masalah berarti ditemukan.' 'OK' }
    Update-Score $a.Score
}

function Update-Score($s) {
    $lblScore.Text = "Skor kesehatan: $s / 100 ($(Score-Text $s))"
    $lblScore.ForeColor = if ($s -ge 85) { [System.Drawing.Color]::LimeGreen } elseif ($s -ge 65) { [System.Drawing.Color]::Orange } else { [System.Drawing.Color]::Tomato }
}

# ------------------------------------------------------------------ Task pembersihan khusus
function Clear-WUCache {
    $was = @()
    foreach ($s in 'wuauserv', 'bits', 'dosvc') {
        $o = Get-Service $s -ErrorAction SilentlyContinue
        if ($o -and $o.Status -eq 'Running') { $was += $s; Stop-Service $s -Force -ErrorAction SilentlyContinue }
    }
    Start-Sleep 2
    $f = Clear-Target "$env:WINDIR\SoftwareDistribution\Download\*"
    foreach ($s in $was) { Start-Service $s -ErrorAction SilentlyContinue }
    return $f
}

function Clear-Recycle {
    $b = [int64]0
    foreach ($d in (Get-CimInstance Win32_LogicalDisk -Filter 'DriveType=3')) {
        $rb = $d.DeviceID + '\$Recycle.Bin'
        if (Test-Path -LiteralPath $rb) { $b += Get-PathSize ($rb + '\*') }
    }
    Clear-RecycleBin -Force -ErrorAction SilentlyContinue
    return $b
}

# ------------------------------------------------------------------ Runner langkah
function Do-Step([string]$name, [scriptblock]$body) {
    if ($script:Cancel) { return }
    Log ">> $name" 'HEAD'
    $script:LastOk = $true
    try {
        $d = [string](& $body | Select-Object -Last 1)
        if ($d -like 'PERINGATAN:*') { Log "   $d" 'WARN'; Add-Step $name 'Peringatan' $d }
        else { Log "   selesai: $d" 'OK'; Add-Step $name 'Berhasil' $d }
    }
    catch {
        $script:LastOk = $false
        Log "   gagal: $($_.Exception.Message)" 'ERR'
        Add-Step $name 'Gagal' $_.Exception.Message
    }
    $script:Done++
    $progress.Value = [math]::Min(100, [int](100 * $script:Done / [math]::Max(1, $script:Total)))
    DoEv
}

# ------------------------------------------------------------------ Laporan HTML
function New-Report {
    $dir = Join-Path $script:Root 'Reports'
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    $file = Join-Path $dir ("Laporan_" + $script:Stamp + '.html')
    $e = { param($s) [System.Net.WebUtility]::HtmlEncode([string]$s) }

    $stepRows = ''
    foreach ($s in $script:Steps) {
        $cls = switch ($s.Status) { 'Berhasil' { 'ok' } 'Gagal' { 'err' } default { 'warn' } }
        $stepRows += "<tr><td>$(& $e $s.Time)</td><td>$(& $e $s.Name)</td><td class='$cls'>$(& $e $s.Status)</td><td>$(& $e $s.Detail)</td></tr>`n"
    }
    $sysRows = ''
    $src = if ($script:After) { $script:After } else { $script:Before }
    if ($src) { foreach ($r in $src.Rows) { $sysRows += "<tr><td>$(& $e $r.Label)</td><td>$(& $e $r.Value)</td></tr>`n" } }
    $issueHtml = ''
    if ($src -and $src.Issues.Count -gt 0) { foreach ($i in $src.Issues) { $issueHtml += "<li>$(& $e $i)</li>" } } else { $issueHtml = '<li>Tidak ada temuan.</li>' }
    $sb = if ($script:Before) { $script:Before.Score } else { '-' }
    $sa = if ($script:After) { $script:After.Score } else { '-' }
    $freed = Fmt-Size $script:TotalFreed
    $reboot = if ($script:NeedReboot) { '<p class="warn">Disarankan restart komputer agar semua perubahan (Winsock/jaringan) berlaku.</p>' } else { '' }
    $os = Get-CimInstance Win32_OperatingSystem

    $html = @"
<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Laporan Optimasi - $($script:AppName)</title>
<style>
body{font-family:Segoe UI,Arial,sans-serif;background:#14161c;color:#e6e8ee;margin:0;padding:32px}
.wrap{max-width:980px;margin:auto}h1{margin:0 0 4px}h2{margin-top:32px;color:#5cc8ff}
.muted{color:#9aa3b5}.cards{display:flex;gap:16px;flex-wrap:wrap;margin:20px 0}
.card{background:#1e222b;border-radius:10px;padding:16px 22px;min-width:180px}
.card b{display:block;font-size:28px;margin-top:4px}
table{width:100%;border-collapse:collapse;background:#1e222b;border-radius:10px;overflow:hidden}
td,th{padding:9px 12px;text-align:left;border-bottom:1px solid #2a2f3a;vertical-align:top;font-size:14px}
th{background:#262b36}.ok{color:#4cd37b}.err{color:#ff6b6b}.warn{color:#ffb347}
</style></head><body><div class="wrap">
<h1>$($script:AppName)</h1>
<div class="muted">Laporan hasil optimasi - $(Get-Date -Format 'dd MMMM yyyy HH:mm') - $($env:COMPUTERNAME) - $(& $e $os.Caption)</div>
<div class="cards">
<div class="card">Skor sebelum<b>$sb</b></div>
<div class="card">Skor sesudah<b>$sa</b></div>
<div class="card">Ruang dibebaskan<b>$freed</b></div>
<div class="card">Langkah dijalankan<b>$($script:Steps.Count)</b></div>
</div>
$reboot
<h2>Langkah optimasi</h2>
<table><tr><th>Waktu</th><th>Langkah</th><th>Status</th><th>Detail</th></tr>
$stepRows</table>
<h2>Kondisi sistem (setelah optimasi)</h2>
<table><tr><th>Item</th><th>Nilai</th></tr>
$sysRows</table>
<h2>Temuan</h2><ul>$issueHtml</ul>
<p class="muted">Restore Point dan backup Registry (jika dipilih) tersimpan di: $(& $e $script:Root)</p>
</div></body></html>
"@
    Set-Content -LiteralPath $file -Value $html -Encoding UTF8
    $script:LastReport = $file
    return $file
}

# ------------------------------------------------------------------ Proses optimasi utama
function Start-Optimization {
    $sel = @{}
    foreach ($k in $script:Chk.Keys) { $sel[$k] = $script:Chk[$k].Checked }
    $count = @($sel.Values | Where-Object { $_ }).Count
    if ($count -eq 0) {
        [void][System.Windows.Forms.MessageBox]::Show('Pilih minimal satu opsi.', $script:AppName)
        return
    }
    $ans = [System.Windows.Forms.MessageBox]::Show(
        "Optimasi akan dijalankan ($count opsi). Proses perbaikan (DISM/SFC) dan optimasi disk bisa memakan waktu lama.`n`nSimpan pekerjaan Anda lebih dulu. Lanjutkan?",
        $script:AppName, 'YesNo', 'Question')
    if ($ans -ne 'Yes') { return }

    Set-Busy $true
    $script:Cancel = $false
    $script:Steps.Clear()
    $script:TotalFreed = [int64]0
    $script:NeedReboot = $false
    $script:Before = $null; $script:After = $null
    $script:Stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    $script:Done = 0
    $script:Total = $count + 3
    $progress.Value = 0

    try {
        Log '=== MULAI OPTIMASI ===' 'HEAD'
        $safetyFail = $false

        if ($sel.Restore) {
            Do-Step 'Membuat Restore Point' {
                $key = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\SystemRestore'
                $old = (Get-ItemProperty $key -Name SystemRestorePointCreationFrequency -ErrorAction SilentlyContinue).SystemRestorePointCreationFrequency
                Set-ItemProperty $key -Name SystemRestorePointCreationFrequency -Value 0 -Type DWord -ErrorAction SilentlyContinue
                try {
                    Enable-ComputerRestore -Drive "$env:SystemDrive\" -ErrorAction SilentlyContinue
                    Checkpoint-Computer -Description ("UltimateOptimizerPro " + (Get-Date -Format 'yyyy-MM-dd HH:mm')) -RestorePointType MODIFY_SETTINGS -ErrorAction Stop
                    'Restore Point berhasil dibuat'
                }
                finally {
                    if ($null -ne $old) { Set-ItemProperty $key -Name SystemRestorePointCreationFrequency -Value $old -Type DWord -ErrorAction SilentlyContinue }
                    else { Remove-ItemProperty $key -Name SystemRestorePointCreationFrequency -ErrorAction SilentlyContinue }
                }
            }
            if (-not $script:LastOk) { $safetyFail = $true }
        }

        if ($sel.RegBackup) {
            Do-Step 'Backup Registry' {
                $dir = Join-Path $script:Root ('Backup\Registry_' + $script:Stamp)
                New-Item -ItemType Directory -Path $dir -Force | Out-Null
                $map = @(@('HKCU', 'HKCU.reg'), @('HKLM\SOFTWARE', 'HKLM_SOFTWARE.reg'), @('HKLM\SYSTEM', 'HKLM_SYSTEM.reg'))
                $okc = 0
                foreach ($m in $map) {
                    $target = Join-Path $dir $m[1]
                    [void](Run-Proc 'reg.exe' ("export `"{0}`" `"{1}`" /y" -f $m[0], $target))
                    if (Test-Path -LiteralPath $target) { $okc++ }
                }
                if ($okc -eq 0) { throw 'Tidak ada file backup yang terbentuk' }
                "$okc dari 3 cabang Registry disimpan di $dir"
            }
            if (-not $script:LastOk) { $safetyFail = $true }
        }

        if ($safetyFail) {
            $r = [System.Windows.Forms.MessageBox]::Show('Langkah pengaman (Restore Point / backup Registry) gagal. Lanjutkan tanpa pengaman?', $script:AppName, 'YesNo', 'Warning')
            if ($r -ne 'Yes') { Log 'Optimasi dibatalkan oleh pengguna.' 'WARN'; return }
        }

        Do-Step 'Analisis kondisi awal' { $script:Before = Get-SystemAnalysis -Quick; "Skor awal $($script:Before.Score) / 100" }
        Update-Score $script:Before.Score

        if ($sel.Junk) {
            Do-Step 'Membersihkan file sampah (36 lokasi)' {
                $tot = [int64]0; $list = @(Get-JunkList)
                foreach ($j in $list) {
                    $f = Clear-Target $j.P
                    if ($f -gt 0) { Log ("   {0}: {1}" -f $j.N, (Fmt-Size $f)); $tot += $f }
                    if ($script:Cancel) { break }
                }
                $script:TotalFreed += $tot
                "Dibersihkan $(Fmt-Size $tot) dari $($list.Count) lokasi"
            }
        }

        if ($sel.WU) {
            Do-Step 'Membersihkan cache Windows Update' {
                $f = Clear-WUCache; $script:TotalFreed += $f; "Dibersihkan $(Fmt-Size $f)"
            }
        }

        if ($sel.Defender) {
            Do-Step 'Membersihkan cache Defender' {
                $f = [int64]0
                $d = "$env:ProgramData\Microsoft\Windows Defender"
                foreach ($p in @("$d\Scans\History\*", "$d\Scans\mpcache*", "$d\Support\*")) { $f += Clear-Target $p }
                $script:TotalFreed += $f
                if ($f -eq 0) { 'PERINGATAN: tidak ada yang terhapus (Tamper Protection mungkin aktif atau cache sudah kosong)' }
                else { "Dibersihkan $(Fmt-Size $f)" }
            }
        }

        if ($sel.Store) {
            Do-Step 'Membersihkan cache Microsoft Store' {
                $pk = "$env:LOCALAPPDATA\Packages\Microsoft.WindowsStore_8wekyb3d8bbwe"
                $f = (Clear-Target "$pk\LocalCache\*") + (Clear-Target "$pk\AC\INetCache\*")
                $script:TotalFreed += $f
                "Dibersihkan $(Fmt-Size $f)"
            }
        }

        if ($sel.Recycle) {
            Do-Step 'Mengosongkan Recycle Bin' { $f = Clear-Recycle; $script:TotalFreed += $f; "Dikosongkan $(Fmt-Size $f)" }
        }

        if ($sel.EventLog) {
            Do-Step 'Membersihkan Event Log' {
                $dirLog = "$env:WINDIR\System32\winevt\Logs"
                $before = Get-PathSize "$dirLog\*"
                $n = 0; $i = 0
                foreach ($l in @(& wevtutil.exe el)) {
                    $i++
                    if ($l -eq 'Security') { continue }
                    & wevtutil.exe cl "$l" 2>$null
                    if ($LASTEXITCODE -eq 0) { $n++ }
                    if ($i % 15 -eq 0) { DoEv }
                }
                $freed = [math]::Max([int64]0, $before - (Get-PathSize "$dirLog\*"))
                $script:TotalFreed += $freed
                "$n log dibersihkan (log Security dilewati), $(Fmt-Size $freed) dibebaskan"
            }
        }

        if ($sel.NetBasic) {
            Do-Step 'Optimasi jaringan (DNS, Winsock, ARP, NetBIOS)' {
                foreach ($c in @(@('ipconfig.exe', '/flushdns'), @('netsh.exe', 'winsock reset'),
                                 @('netsh.exe', 'int tcp set global autotuninglevel=normal'),
                                 @('arp.exe', '-d *'), @('nbtstat.exe', '-R'))) { [void](Run-Proc $c[0] $c[1]) }
                $script:NeedReboot = $true
                'Cache DNS/ARP/NetBIOS dibersihkan, Winsock direset (perlu restart)'
            }
        }

        if ($sel.NetIP) {
            Do-Step 'Reset TCP/IP' {
                $r = Run-Proc 'netsh.exe' 'int ip reset'
                $script:NeedReboot = $true
                "Reset TCP/IP selesai (kode $($r.Code)), perlu restart"
            }
        }

        if ($sel.DnsSet) {
            Do-Step 'Mengatur DNS Cloudflare' {
                $n = 0
                foreach ($a in @(Get-NetAdapter | Where-Object Status -eq 'Up')) {
                    Set-DnsClientServerAddress -InterfaceIndex $a.ifIndex -ServerAddresses '1.1.1.1', '1.0.0.1'; $n++
                }
                "DNS 1.1.1.1 / 1.0.0.1 diterapkan pada $n adapter"
            }
        }

        if ($sel.Disk) {
            Do-Step 'Optimasi SSD/HDD' {
                $msg = @()
                $vols = @(Get-Volume | Where-Object { $_.DriveLetter -and $_.DriveType -eq 'Fixed' -and $_.FileSystem -in 'NTFS', 'ReFS' })
                foreach ($v in $vols) {
                    $media = 'Unknown'
                    try { $media = [string](Get-Partition -DriveLetter $v.DriveLetter | Get-Disk | Get-PhysicalDisk | Select-Object -First 1).MediaType } catch {}
                    Log "   Drive $($v.DriveLetter): tipe $media"
                    if ($media -eq 'SSD') {
                        $t = (& fsutil.exe behavior query DisableDeleteNotify) -join ' '
                        if ($t -match 'NTFS DisableDeleteNotify\s*=\s*1') { & fsutil.exe behavior set DisableDeleteNotify 0 | Out-Null; Log '   TRIM diaktifkan' 'OK' }
                    }
                    $r = Run-Proc 'defrag.exe' "$($v.DriveLetter): /O"
                    $msg += "$($v.DriveLetter): $media (kode $($r.Code))"
                    if ($script:Cancel) { break }
                }
                if ($msg.Count -eq 0) { 'PERINGATAN: tidak ada volume yang bisa dioptimasi' } else { $msg -join '; ' }
            }
        }

        if ($sel.DISM) {
            Do-Step 'Perbaikan DISM (RestoreHealth) - mohon tunggu' {
                $r = Run-Proc 'dism.exe' '/Online /Cleanup-Image /RestoreHealth'
                if ($r.Code -ne 0) { throw "DISM berakhir dengan kode $($r.Code). Pastikan komputer online. $((($r.Output | Select-Object -Last 3) -join ' '))" }
                'DISM RestoreHealth selesai tanpa kesalahan'
            }
        }

        if ($sel.SFC) {
            Do-Step 'Perbaikan SFC (/scannow) - mohon tunggu' {
                $r = Run-Proc 'sfc.exe' '/scannow' -Unicode
                if ($r.Code -ne 0) { "PERINGATAN: SFC berakhir dengan kode $($r.Code) (cek C:\Windows\Logs\CBS\CBS.log)" }
                else { 'SFC selesai (kode 0)' }
            }
        }

        if ($sel.CHKDSK) {
            Do-Step 'CHKDSK (pemindaian online)' {
                $r = Run-Proc 'chkdsk.exe' "$env:SystemDrive /scan"
                switch ($r.Code) {
                    0 { 'Tidak ada kesalahan sistem berkas' }
                    1 { 'Kesalahan ditemukan dan diperbaiki' }
                    default { "PERINGATAN: CHKDSK kode $($r.Code). Jadwalkan 'chkdsk $env:SystemDrive /f' lalu restart bila masalah berlanjut" }
                }
            }
        }

        Do-Step 'Analisis kondisi akhir' { $script:After = Get-SystemAnalysis -Quick; "Skor akhir $($script:After.Score) / 100" }
        if ($script:After) { Update-Score $script:After.Score }

        Do-Step 'Membuat laporan HTML' { $f = New-Report; "Laporan: $f" }
        # Laporan dibuat sebelum langkah dirinya tercatat; buat ulang agar lengkap
        try { [void](New-Report) } catch {}

        $progress.Value = 100
        Log '=== SELESAI ===' 'HEAD'
        Log ("Total ruang dibebaskan: {0}" -f (Fmt-Size $script:TotalFreed)) 'OK'
    }
    finally { Set-Busy $false }

    if ($script:LastReport -and (Test-Path $script:LastReport)) { Start-Process $script:LastReport }
    if ($script:NeedReboot) {
        $r = [System.Windows.Forms.MessageBox]::Show('Disarankan restart agar perubahan jaringan berlaku. Restart sekarang (dalam 15 detik)?', $script:AppName, 'YesNo', 'Question')
        if ($r -eq 'Yes') { Start-Process shutdown.exe -ArgumentList '/r /t 15' -WindowStyle Hidden }
    }
}

# ------------------------------------------------------------------ UI
$bg = [System.Drawing.Color]::FromArgb(24, 26, 33)
$panel = [System.Drawing.Color]::FromArgb(32, 35, 44)

$form = New-Object System.Windows.Forms.Form
$form.Text = $script:AppName
$form.ClientSize = New-Object System.Drawing.Size(1080, 720)
$form.MinimumSize = New-Object System.Drawing.Size(900, 600)
$form.StartPosition = 'CenterScreen'
$form.BackColor = $bg
$form.ForeColor = [System.Drawing.Color]::White
$form.Font = New-Object System.Drawing.Font('Segoe UI', 9)

$lblTitle = New-Object System.Windows.Forms.Label
$lblTitle.Text = 'Windows Ultimate Optimizer Pro 2026'
$lblTitle.Font = New-Object System.Drawing.Font('Segoe UI Semibold', 18)
$lblTitle.AutoSize = $true
$lblTitle.Location = New-Object System.Drawing.Point(14, 10)
$form.Controls.Add($lblTitle)

$lblScore = New-Object System.Windows.Forms.Label
$lblScore.Text = 'Skor kesehatan: belum dianalisis'
$lblScore.Font = New-Object System.Drawing.Font('Segoe UI Semibold', 12)
$lblScore.AutoSize = $false
$lblScore.TextAlign = 'MiddleRight'
$lblScore.Size = New-Object System.Drawing.Size(420, 30)
$lblScore.Location = New-Object System.Drawing.Point(650, 18)
$lblScore.Anchor = 'Top, Right'
$form.Controls.Add($lblScore)

$pnlOpts = New-Object System.Windows.Forms.Panel
$pnlOpts.Location = New-Object System.Drawing.Point(10, 60)
$pnlOpts.Size = New-Object System.Drawing.Size(410, 560)
$pnlOpts.BackColor = $panel
$pnlOpts.AutoScroll = $true
$pnlOpts.Anchor = 'Top, Left, Bottom'
$form.Controls.Add($pnlOpts)

function Add-Section([string]$t) {
    $l = New-Object System.Windows.Forms.Label
    $l.Text = $t.ToUpper()
    $l.ForeColor = [System.Drawing.Color]::DeepSkyBlue
    $l.Font = New-Object System.Drawing.Font('Segoe UI Semibold', 9)
    $l.AutoSize = $true
    $l.Location = New-Object System.Drawing.Point(8, ($script:y + 4))
    $pnlOpts.Controls.Add($l)
    $script:y += 28
}
function Add-Opt([string]$key, [string]$text, [bool]$def) {
    $c = New-Object System.Windows.Forms.CheckBox
    $c.Text = $text
    $c.Checked = $def
    $c.Size = New-Object System.Drawing.Size(380, 22)
    $c.Location = New-Object System.Drawing.Point(16, $script:y)
    $pnlOpts.Controls.Add($c)
    $script:Chk[$key] = $c
    $script:y += 25
}

Add-Section 'Pengaman'
Add-Opt 'Restore'   'Buat Restore Point sebelum optimasi' $true
Add-Opt 'RegBackup' 'Backup Registry otomatis' $true
Add-Section 'Pembersihan'
Add-Opt 'Junk'     'File sampah (36 lokasi)' $true
Add-Opt 'WU'       'Cache Windows Update' $true
Add-Opt 'Defender' 'Cache Windows Defender' $true
Add-Opt 'Store'    'Cache Microsoft Store' $true
Add-Opt 'Recycle'  'Kosongkan Recycle Bin' $true
Add-Opt 'EventLog' 'Event Log (log Security dilewati)' $true
Add-Section 'Optimasi'
Add-Opt 'Disk'     'Optimasi SSD (TRIM) / HDD (defrag)' $true
Add-Opt 'NetBasic' 'Jaringan: flush DNS, reset Winsock, ARP' $true
Add-Opt 'NetIP'    'Reset TCP/IP (IP statis kembali ke DHCP!)' $false
Add-Opt 'DnsSet'   'Ganti DNS ke Cloudflare 1.1.1.1' $false
Add-Section 'Perbaikan Windows (lama)'
Add-Opt 'DISM'     'DISM RestoreHealth (butuh internet)' $true
Add-Opt 'SFC'      'SFC /scannow' $true
Add-Opt 'CHKDSK'   'CHKDSK pemindaian online drive sistem' $true

$txtLog = New-Object System.Windows.Forms.RichTextBox
$txtLog.Location = New-Object System.Drawing.Point(430, 60)
$txtLog.Size = New-Object System.Drawing.Size(640, 560)
$txtLog.Anchor = 'Top, Left, Right, Bottom'
$txtLog.ReadOnly = $true
$txtLog.BackColor = [System.Drawing.Color]::FromArgb(14, 15, 20)
$txtLog.ForeColor = [System.Drawing.Color]::Gainsboro
$txtLog.BorderStyle = 'None'
$txtLog.Font = New-Object System.Drawing.Font('Consolas', 9.5)
$form.Controls.Add($txtLog)

$progress = New-Object System.Windows.Forms.ProgressBar
$progress.Location = New-Object System.Drawing.Point(10, 632)
$progress.Size = New-Object System.Drawing.Size(1060, 14)
$progress.Anchor = 'Left, Right, Bottom'
$form.Controls.Add($progress)

function New-Btn([string]$text, [int]$x, [int]$w, [System.Drawing.Color]$color) {
    $b = New-Object System.Windows.Forms.Button
    $b.Text = $text
    $b.Location = New-Object System.Drawing.Point($x, 662)
    $b.Size = New-Object System.Drawing.Size($w, 40)
    $b.FlatStyle = 'Flat'
    $b.FlatAppearance.BorderSize = 0
    $b.BackColor = $color
    $b.ForeColor = [System.Drawing.Color]::White
    $b.Font = New-Object System.Drawing.Font('Segoe UI Semibold', 10)
    $b.Anchor = 'Left, Bottom'
    $form.Controls.Add($b)
    return $b
}
$btnAnalyze = New-Btn 'Analisis Komputer' 10 170 ([System.Drawing.Color]::FromArgb(45, 110, 220))
$btnStart   = New-Btn 'Mulai Optimasi' 190 170 ([System.Drawing.Color]::FromArgb(30, 150, 90))
$btnCancel  = New-Btn 'Batalkan' 370 110 ([System.Drawing.Color]::FromArgb(190, 70, 60))
$btnReport  = New-Btn 'Buka Laporan' 490 140 ([System.Drawing.Color]::FromArgb(90, 90, 110))
$btnAll     = New-Btn 'Pilih Semua' 640 120 ([System.Drawing.Color]::FromArgb(60, 64, 78))
$btnNone    = New-Btn 'Kosongkan' 770 120 ([System.Drawing.Color]::FromArgb(60, 64, 78))
$btnCancel.Enabled = $false
$btnReport.Enabled = $false

function Set-Busy([bool]$b) {
    $script:Busy = $b
    $btnAnalyze.Enabled = -not $b
    $btnStart.Enabled = -not $b
    $btnCancel.Enabled = $b
    $btnReport.Enabled = (-not $b) -and ($null -ne $script:LastReport)
    $btnAll.Enabled = -not $b
    $btnNone.Enabled = -not $b
    $pnlOpts.Enabled = -not $b
    DoEv
}

$btnAnalyze.Add_Click({
    Set-Busy $true
    $script:Cancel = $false
    try {
        Log 'Menganalisis komputer (beberapa menit, termasuk DISM CheckHealth)...' 'HEAD'
        $script:Analysis = Get-SystemAnalysis
        Show-Analysis $script:Analysis
    }
    catch { Log "Analisis gagal: $($_.Exception.Message)" 'ERR' }
    finally { Set-Busy $false }
})
$btnStart.Add_Click({ Start-Optimization })
$btnCancel.Add_Click({ $script:Cancel = $true; Log 'Pembatalan diminta, menunggu langkah saat ini berhenti...' 'WARN' })
$btnReport.Add_Click({ if ($script:LastReport -and (Test-Path $script:LastReport)) { Start-Process $script:LastReport } })
$btnAll.Add_Click({ foreach ($c in $script:Chk.Values) { $c.Checked = $true } })
$btnNone.Add_Click({ foreach ($c in $script:Chk.Values) { $c.Checked = $false } })

$form.Add_FormClosing({
    param($s, $e)
    if ($script:Busy) {
        $r = [System.Windows.Forms.MessageBox]::Show('Proses sedang berjalan. Tutup aplikasi?', $script:AppName, 'YesNo', 'Warning')
        if ($r -ne 'Yes') { $e.Cancel = $true } else { $script:Cancel = $true }
    }
})

$form.Add_Shown({
    Log "$($script:AppName) siap. Berjalan sebagai Administrator." 'HEAD'
    Log "Restore Point, backup Registry, dan laporan disimpan di: $($script:Root)"
    Log "Klik 'Analisis Komputer' untuk memeriksa kondisi, atau 'Mulai Optimasi' untuk menjalankan opsi terpilih."
})

[void]$form.ShowDialog()
