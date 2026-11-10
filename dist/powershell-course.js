const POWERSHELL_COURSE = [
  {
    "id": "first-command",
    "chapter": "Shell basics",
    "title": "Your first command",
    "concept": "Cmdlets usually follow Verb-Noun. Write-Output sends a value to PowerShell’s success stream. Single quotes keep text literal.",
    "example": "Write-Output 'Backup ready'",
    "task": "Send the exact string Inventory online to the success stream.",
    "starter": "# Write your first command",
    "hint": "Use Write-Output with a single-quoted argument.",
    "solution": "Write-Output 'Inventory online'",
    "cases": [
      {
        "label": "Startup message",
        "setup": "",
        "expected": [
          "Inventory online"
        ]
      }
    ]
  },
  {
    "id": "discover",
    "chapter": "Shell basics",
    "title": "Discover a command",
    "concept": "Get-Command finds commands by name. Its result is an object. Use .Name to read the command name, or Get-Help Get-Command -Examples in your terminal to explore usage.",
    "example": "(Get-Command -Name 'Get-Date').Name",
    "task": "Look up the command named by $CommandName and emit only its Name.",
    "starter": "# $CommandName is provided by each check",
    "hint": "Put Get-Command in parentheses before accessing .Name.",
    "solution": "(Get-Command -Name $CommandName).Name",
    "cases": [
      {
        "label": "Read a file",
        "setup": "$CommandName = 'Get-Content'",
        "expected": [
          "Get-Content"
        ]
      },
      {
        "label": "List commands",
        "setup": "$CommandName = 'Get-Command'",
        "expected": [
          "Get-Command"
        ]
      }
    ]
  },
  {
    "id": "variables",
    "chapter": "Shell basics",
    "title": "Variables and strings",
    "concept": "Variables start with $. A double-quoted string expands simple variable references. Use $() inside double quotes to evaluate an expression.",
    "example": "$Name = 'edge01'\n\"Host $Name has $((2 + 1)) alerts\"",
    "task": "Emit a line such as Host edge01 has 3 alerts using the supplied $Name and $Alerts.",
    "starter": "# Build a double-quoted message",
    "hint": "Write the variables directly inside double quotes.",
    "solution": "\"Host $Name has $Alerts alerts\"",
    "cases": [
      {
        "label": "First host",
        "setup": "$Name = 'edge01'; $Alerts = 3",
        "expected": [
          "Host edge01 has 3 alerts"
        ]
      },
      {
        "label": "Quiet host",
        "setup": "$Name = 'lab02'; $Alerts = 0",
        "expected": [
          "Host lab02 has 0 alerts"
        ]
      }
    ]
  },
  {
    "id": "arrays",
    "chapter": "Script logic",
    "title": "Arrays and indexing",
    "concept": "An array groups values in order. Index 0 selects the first item. The Count property gives the number of items.",
    "example": "$Servers = @('edge01', 'edge02')\n$Servers[0]\n$Servers.Count",
    "task": "Emit the first server name followed by the count as a number, on separate expressions.",
    "starter": "# $Servers is provided",
    "hint": "Use $Servers[0] and $Servers.Count.",
    "solution": "$Servers[0]\n$Servers.Count",
    "cases": [
      {
        "label": "Two servers",
        "setup": "$Servers = @('web01','db01')",
        "expected": [
          "web01",
          2
        ]
      },
      {
        "label": "One server",
        "setup": "$Servers = @('dns01')",
        "expected": [
          "dns01",
          1
        ]
      }
    ]
  },
  {
    "id": "branching",
    "chapter": "Script logic",
    "title": "Decisions with if",
    "concept": "PowerShell comparison operators include -ge (greater than or equal), -lt (less than), and -eq (equal). An if statement runs one branch based on a condition.",
    "example": "if ($Latency -ge 100) {\n    'Slow'\n} else {\n    'OK'\n}",
    "task": "Emit Critical when $FreeGB is below 10. Emit Healthy otherwise.",
    "starter": "if (# add a condition\n) {\n    # low space\n} else {\n    # enough space\n}",
    "hint": "Use -lt. Exactly 10 GB should take the else branch.",
    "solution": "if ($FreeGB -lt 10) {\n    'Critical'\n} else {\n    'Healthy'\n}",
    "cases": [
      {
        "label": "Low disk",
        "setup": "$FreeGB = 9",
        "expected": [
          "Critical"
        ]
      },
      {
        "label": "Threshold",
        "setup": "$FreeGB = 10",
        "expected": [
          "Healthy"
        ]
      },
      {
        "label": "Ample space",
        "setup": "$FreeGB = 50",
        "expected": [
          "Healthy"
        ]
      }
    ]
  },
  {
    "id": "foreach",
    "chapter": "Script logic",
    "title": "Process a list",
    "concept": "A foreach statement assigns each item in a collection to a loop variable. An expression inside the loop can emit one result per item.",
    "example": "foreach ($Port in @(22, 443)) {\n    \"Port $Port\"\n}",
    "task": "For each name in $Servers, emit a line in the form Checking web01. Preserve input order. An empty list should emit nothing.",
    "starter": "foreach ($Server in $Servers) {\n    # add one message per server\n}",
    "hint": "Interpolate $Server in a double-quoted string inside the loop.",
    "solution": "foreach ($Server in $Servers) {\n    \"Checking $Server\"\n}",
    "cases": [
      {
        "label": "Two servers",
        "setup": "$Servers = @('web01','db01')",
        "expected": [
          "Checking web01",
          "Checking db01"
        ]
      },
      {
        "label": "Empty list",
        "setup": "$Servers = @()",
        "expected": []
      }
    ]
  },
  {
    "id": "objects",
    "chapter": "Object pipelines",
    "title": "Build a record",
    "concept": "A hashtable stores values under keys. Casting a hashtable literal to [pscustomobject] creates a record that other commands can inspect, filter, or export by property.",
    "example": "[pscustomobject]@{\n    Computer = 'edge01'\n    Online = $true\n}",
    "task": "Emit one object with properties Name and Open populated from $Name and $Open.",
    "starter": "[pscustomobject]@{\n    # add properties\n}",
    "hint": "Use Name = $Name and Open = $Open on separate lines.",
    "solution": "[pscustomobject]@{\n    Name = $Name\n    Open = $Open\n}",
    "cases": [
      {
        "label": "Open",
        "setup": "$Name = 'https'; $Open = $true",
        "expected": [
          {
            "Name": "https",
            "Open": true
          }
        ]
      },
      {
        "label": "Closed",
        "setup": "$Name = 'ssh'; $Open = $false",
        "expected": [
          {
            "Name": "ssh",
            "Open": false
          }
        ]
      }
    ]
  },
  {
    "id": "filter",
    "chapter": "Object pipelines",
    "title": "Filter the pipeline",
    "concept": "A pipeline passes objects between commands. Where-Object keeps items whose condition is true. Inside its script block, $_ means the current item.",
    "example": "$Tickets | Where-Object { $_.Priority -eq 'High' }",
    "task": "From $Services emit just the names of stopped services in their original order. The Status field is a string.",
    "starter": "$Services | Where-Object {\n    # check status here\n} | Select-Object -ExpandProperty Name",
    "hint": "Compare $_.Status to 'Stopped' with -eq.",
    "solution": "$Services | Where-Object { $_.Status -eq 'Stopped' } |\n    Select-Object -ExpandProperty Name",
    "cases": [
      {
        "label": "Mixed services",
        "setup": "$Services = @([pscustomobject]@{Name='Print';Status='Stopped'}, [pscustomobject]@{Name='DNS';Status='Running'}, [pscustomobject]@{Name='Time';Status='Stopped'})",
        "expected": [
          "Print",
          "Time"
        ]
      },
      {
        "label": "All running",
        "setup": "$Services = @([pscustomobject]@{Name='Print';Status='Running'})",
        "expected": []
      }
    ]
  },
  {
    "id": "sort",
    "chapter": "Object pipelines",
    "title": "Sort and select",
    "concept": "Sort-Object orders objects by a property. Select-Object -First limits the result count, and -ExpandProperty emits the property values themselves.",
    "example": "$Tickets | Sort-Object -Property Age -Descending |\n    Select-Object -First 1 -ExpandProperty Id",
    "task": "Emit the name of the disk with the lowest FreeGB in $Disks.",
    "starter": "# Sort numerically by FreeGB, then select the first Name",
    "hint": "Sort-Object sorts ascending by default. Select-Object can take both -First and -ExpandProperty.",
    "solution": "$Disks | Sort-Object -Property FreeGB |\n    Select-Object -First 1 -ExpandProperty Name",
    "cases": [
      {
        "label": "Three disks",
        "setup": "$Disks = @([pscustomobject]@{Name='C';FreeGB=30}, [pscustomobject]@{Name='D';FreeGB=6}, [pscustomobject]@{Name='E';FreeGB=12})",
        "expected": [
          "D"
        ]
      },
      {
        "label": "Different order",
        "setup": "$Disks = @([pscustomobject]@{Name='D';FreeGB=12}, [pscustomobject]@{Name='E';FreeGB=4})",
        "expected": [
          "E"
        ]
      }
    ]
  },
  {
    "id": "functions",
    "chapter": "Reusable scripts",
    "title": "Functions with parameters",
    "concept": "A function gives a reusable name to a block of code. A param block declares inputs, and [int] describes a whole-number parameter. Bare expressions can emit values to the success stream.",
    "example": "function Get-Total {\n    param([int]$Count, [int]$Price)\n    $Count * $Price\n}\nGet-Total -Count 2 -Price 5",
    "task": "Define Get-FreePercent with -Free and -Total integer parameters. Emit the percent free as a number. The checks call your function with different arguments.",
    "starter": "function Get-FreePercent {\n    param([int]$Free, [int]$Total)\n    # calculate the percentage\n}",
    "hint": "Divide $Free by $Total and multiply by 100. You can assume Total is positive.",
    "solution": "function Get-FreePercent {\n    param([int]$Free, [int]$Total)\n    ($Free / $Total) * 100\n}",
    "cases": [
      {
        "label": "Quarter free",
        "setup": "",
        "expected": [
          25
        ],
        "invoke": "Get-FreePercent -Free 10 -Total 40"
      },
      {
        "label": "Fractional percent",
        "setup": "",
        "expected": [
          12.5
        ],
        "invoke": "Get-FreePercent -Free 1 -Total 8"
      },
      {
        "label": "Empty disk",
        "setup": "",
        "expected": [
          100
        ],
        "invoke": "Get-FreePercent -Free 24 -Total 24"
      }
    ]
  },
  {
    "id": "script-parameters",
    "chapter": "Reusable scripts",
    "title": "Write a parameterized script",
    "concept": "Save PowerShell code in a .ps1 file. Start the script with param(...) to accept named inputs. In a terminal, run a script in the current directory with .\\Name.ps1 and pass its parameters by name.",
    "example": "param([string]$HostName)\n\"Checking $HostName\"\n\n# At the prompt after saving as Check-Host.ps1:\n# .\\Check-Host.ps1 -HostName 'edge01'",
    "task": "Write a script with a string parameter ComputerName and an integer parameter Port. Emit a line in the form Checking web01 on port 443.",
    "starter": "param(\n    # declare your parameters here\n)\n# emit the status message",
    "hint": "Separate the two parameter declarations with a comma. Keep param at the beginning of the script.",
    "solution": "param([string]$ComputerName, [int]$Port)\n\"Checking $ComputerName on port $Port\"",
    "cases": [
      {
        "label": "Web endpoint",
        "setup": "",
        "args": "-ComputerName 'web01' -Port 443",
        "expected": [
          "Checking web01 on port 443"
        ]
      },
      {
        "label": "DNS endpoint",
        "setup": "",
        "args": "-ComputerName 'dns01' -Port 53",
        "expected": [
          "Checking dns01 on port 53"
        ]
      }
    ]
  },
  {
    "id": "errors",
    "chapter": "Reusable scripts",
    "title": "Handle failures",
    "concept": "try/catch handles terminating errors. A cmdlet can often turn a non-terminating error into a terminating one with -ErrorAction Stop. Keep catch output specific enough for the caller to act on.",
    "example": "try {\n    Get-Content -LiteralPath $Path -ErrorAction Stop\n} catch {\n    'File unavailable'\n}",
    "task": "Read $Path. Emit its contents if it exists, or Log unavailable if the read fails.",
    "starter": "try {\n    # read the file and make failures catchable\n} catch {\n    # emit the fallback message\n}",
    "hint": "Use Get-Content -LiteralPath $Path -ErrorAction Stop inside try.",
    "solution": "try {\n    Get-Content -LiteralPath $Path -ErrorAction Stop\n} catch {\n    'Log unavailable'\n}",
    "cases": [
      {
        "label": "Present log",
        "setup": "$Path = Join-Path $LabPath 'run.log'; Set-Content -LiteralPath $Path -Value 'Backup verified'",
        "expected": [
          "Backup verified"
        ]
      },
      {
        "label": "Missing log",
        "setup": "$Path = Join-Path $LabPath 'missing.log'",
        "expected": [
          "Log unavailable"
        ]
      }
    ]
  },
  {
    "id": "csv",
    "chapter": "Reusable scripts",
    "title": "Import and export CSV",
    "concept": "Import-Csv turns rows into objects whose fields start as strings. Export-Csv writes objects as a table. Use [int] before a numeric comparison to make the intended comparison explicit.",
    "example": "Import-Csv -LiteralPath $InputPath |\n    Where-Object { [int]$_.Retries -gt 0 } |\n    Export-Csv -LiteralPath $OutputPath -NoTypeInformation",
    "task": "Read $InputPath, keep rows with FreeGB below 10, and export the matching rows to $OutputPath. Preserve the Name and FreeGB columns.",
    "starter": "# Build the import, filter, export pipeline",
    "hint": "Cast $_.FreeGB to [int] before comparing it to 10.",
    "solution": "Import-Csv -LiteralPath $InputPath |\n    Where-Object { [int]$_.FreeGB -lt 10 } |\n    Export-Csv -LiteralPath $OutputPath -NoTypeInformation",
    "cases": [
      {
        "label": "Mixed disks",
        "setup": "$InputPath = Join-Path $LabPath 'in.csv'; $OutputPath = Join-Path $LabPath 'out.csv'; Set-Content -LiteralPath $InputPath -Value @('Name,FreeGB','lab01,2','lab02,10','lab03,9')",
        "expected": [
          {
            "Name": "lab01",
            "FreeGB": "2"
          },
          {
            "Name": "lab03",
            "FreeGB": "9"
          }
        ],
        "invoke": "Import-Csv -LiteralPath $OutputPath -ErrorAction Stop"
      },
      {
        "label": "Second inventory",
        "setup": "$InputPath = Join-Path $LabPath 'in.csv'; $OutputPath = Join-Path $LabPath 'out.csv'; Set-Content -LiteralPath $InputPath -Value @('Name,FreeGB','prod01,80','prod02,7')",
        "expected": [
          {
            "Name": "prod02",
            "FreeGB": "7"
          }
        ],
        "invoke": "Import-Csv -LiteralPath $OutputPath -ErrorAction Stop"
      }
    ]
  },
  {
    "id": "audit",
    "chapter": "Capstone",
    "title": "Build a disk audit",
    "concept": "Combine functions, parameter binding, CSV import, numeric filtering, sorting, and error handling. Keep the function output structured so the next admin can pipe it to another command.",
    "example": "Get-DiskAlert -Path './inventory.csv' -MinimumFreeGB 10 |\n    Select-Object -ExpandProperty Name",
    "task": "Build Get-DiskAlert. It must accept -Path and -MinimumFreeGB, return Name and integer FreeGB for disks below the threshold sorted lowest first, and emit Inventory unavailable if reading the file fails.",
    "starter": "function Get-DiskAlert {\n    param([string]$Path, [int]$MinimumFreeGB)\n    # import, filter, sort and emit records\n}",
    "hint": "Use try/catch around Import-Csv with -ErrorAction Stop. Convert FreeGB to a number when building output objects, then sort those objects.",
    "solution": "function Get-DiskAlert {\n    param([string]$Path, [int]$MinimumFreeGB)\n    try {\n        Import-Csv -LiteralPath $Path -ErrorAction Stop |\n            Where-Object { [int]$_.FreeGB -lt $MinimumFreeGB } |\n            ForEach-Object {\n                [pscustomobject]@{ Name = $_.Name; FreeGB = [int]$_.FreeGB }\n            } | Sort-Object -Property FreeGB\n    } catch {\n        'Inventory unavailable'\n    }\n}",
    "cases": [
      {
        "label": "Sort and exclude threshold",
        "setup": "$InputPath = Join-Path $LabPath 'disks.csv'; Set-Content -LiteralPath $InputPath -Value @('Name,FreeGB','a,12','b,2','c,20')",
        "expected": [
          {
            "Name": "b",
            "FreeGB": 2
          },
          {
            "Name": "a",
            "FreeGB": 12
          }
        ],
        "invoke": "Get-DiskAlert -Path $InputPath -MinimumFreeGB 20"
      },
      {
        "label": "Different threshold",
        "setup": "$InputPath = Join-Path $LabPath 'disks.csv'; Set-Content -LiteralPath $InputPath -Value @('Name,FreeGB','x,7','y,9')",
        "expected": [],
        "invoke": "Get-DiskAlert -Path $InputPath -MinimumFreeGB 7"
      },
      {
        "label": "Missing file",
        "setup": "$InputPath = Join-Path $LabPath 'missing.csv'",
        "expected": [
          "Inventory unavailable"
        ],
        "invoke": "Get-DiskAlert -Path $InputPath -MinimumFreeGB 10"
      }
    ]
  }
];
