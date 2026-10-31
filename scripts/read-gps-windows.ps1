param([ValidatePattern('^COM[1-9][0-9]{0,2}$')][string]$Port)
$ErrorActionPreference='Stop'
$gpsPort=New-Object System.IO.Ports.SerialPort $Port,9600,'None',8,'One'
$gpsPort.ReadTimeout=800
$elapsed=[Diagnostics.Stopwatch]::StartNew()
try {
  $gpsPort.Open()
  while($elapsed.Elapsed.TotalSeconds -lt 12){
    try {$line=$gpsPort.ReadLine(); if($line -match '^\$[A-Z]{2}(RMC|GGA),'){[Console]::Out.WriteLine($line.Trim());[Console]::Out.Flush()}}catch [System.TimeoutException]{}
  }
} finally {if($gpsPort.IsOpen){$gpsPort.Close()};$gpsPort.Dispose()}
