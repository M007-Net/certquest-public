const BASH_COURSE = [
  {
    "id": "echo",
    "chapter": "First commands",
    "title": "Print a status message",
    "concept": "echo writes its arguments to standard output.",
    "example": "echo 'Backup ready'",
    "task": "Print Lab online.",
    "starter": "# Write your command",
    "hint": "Use echo with a quoted message.",
    "solution": "echo 'Lab online'",
    "cases": [
      {
        "expected": [
          "Lab online"
        ],
        "label": "Lab case 1",
        "setup": ""
      }
    ]
  },
  {
    "id": "navigate",
    "chapter": "First commands",
    "title": "Navigate the lab",
    "concept": "cd changes the working directory. pwd prints its absolute path.",
    "example": "cd /lab\npwd",
    "task": "Enter logs and print the working directory.",
    "starter": "# Change directory, then show it",
    "hint": "Use cd logs followed by pwd.",
    "solution": "cd logs\npwd",
    "cases": [
      {
        "files": {
          "/lab/logs/run.log": "ready\n"
        },
        "expected": [
          "/lab/logs"
        ],
        "label": "Lab case 1",
        "setup": "/lab/logs/run.log\nready\n"
      }
    ]
  },
  {
    "id": "read",
    "chapter": "First commands",
    "title": "Read a file",
    "concept": "cat copies file contents to standard output. Quote filenames that contain spaces.",
    "example": "cat 'daily report.txt'",
    "task": "Print the contents of status.txt.",
    "starter": "# Read status.txt",
    "hint": "Use cat status.txt.",
    "solution": "cat status.txt",
    "cases": [
      {
        "files": {
          "/lab/status.txt": "Ready\n"
        },
        "expected": [
          "Ready"
        ],
        "label": "Lab case 1",
        "setup": "/lab/status.txt\nReady\n"
      },
      {
        "files": {
          "/lab/status.txt": "Offline\n"
        },
        "expected": [
          "Offline"
        ],
        "label": "Lab case 2",
        "setup": "/lab/status.txt\nOffline\n"
      }
    ]
  },
  {
    "id": "variables",
    "chapter": "Script basics",
    "title": "Variables and quoting",
    "concept": "Assign with NAME=value and no spaces around =. Double quotes expand variables and keep a phrase together. Single quotes preserve literal text.",
    "example": "team='night shift'\necho \"Team: $team\"",
    "task": "Set role to lab admin and print Role: lab admin using the variable.",
    "starter": "role=\n# Print the role",
    "hint": "Use role='lab admin' and double quotes around the message.",
    "solution": "role='lab admin'\necho \"Role: $role\"",
    "cases": [
      {
        "expected": [
          "Role: lab admin"
        ],
        "label": "Lab case 1",
        "setup": ""
      }
    ]
  },
  {
    "id": "args",
    "chapter": "Script basics",
    "title": "Read script arguments",
    "concept": "$1 holds the first script argument. Quote it so an argument with spaces stays together. printf substitutes a value for each %s.",
    "example": "printf 'Hello %s\\n' \"$1\"",
    "task": "Print Target: followed by the first script argument.",
    "starter": "# Format the first argument",
    "hint": "Use printf with 'Target: %s\\n' and \"$1\".",
    "solution": "printf 'Target: %s\\n' \"$1\"",
    "cases": [
      {
        "argv": [
          "edge01"
        ],
        "expected": [
          "Target: edge01"
        ],
        "label": "Lab case 1",
        "setup": "Arguments: [\"edge01\"]"
      },
      {
        "argv": [
          "backup server"
        ],
        "expected": [
          "Target: backup server"
        ],
        "label": "Lab case 2",
        "setup": "Arguments: [\"backup server\"]"
      }
    ]
  },
  {
    "id": "grep",
    "chapter": "Pipelines and files",
    "title": "Find log entries",
    "concept": "grep -F searches for literal text and outputs matching lines.",
    "example": "grep -F 'ERROR' events.log",
    "task": "Print every line containing WARN from events.log.",
    "starter": "# Search events.log",
    "hint": "Pass WARN as the pattern after -F.",
    "solution": "grep -F 'WARN' events.log",
    "cases": [
      {
        "files": {
          "/lab/events.log": "INFO start\nWARN disk\nWARN time\n"
        },
        "expected": [
          "WARN disk",
          "WARN time"
        ],
        "label": "Lab case 1",
        "setup": "/lab/events.log\nINFO start\nWARN disk\nWARN time\n"
      },
      {
        "files": {
          "/lab/events.log": "INFO ok\nERROR down\n"
        },
        "expected": [],
        "label": "Lab case 2",
        "setup": "/lab/events.log\nINFO ok\nERROR down\n"
      }
    ]
  },
  {
    "id": "count",
    "chapter": "Pipelines and files",
    "title": "Count with a pipe",
    "concept": "A pipe sends one command’s output to the next command’s input. wc -l counts newline characters.",
    "example": "cat events.log | wc -l",
    "task": "Count the lines containing ERROR in events.log.",
    "starter": "# Filter, then count",
    "hint": "Pipe grep -F output into wc -l.",
    "solution": "grep -F 'ERROR' events.log | wc -l",
    "cases": [
      {
        "files": {
          "/lab/events.log": "INFO start\nERROR disk\nERROR network\n"
        },
        "expected": [
          "2"
        ],
        "label": "Lab case 1",
        "setup": "/lab/events.log\nINFO start\nERROR disk\nERROR network\n"
      },
      {
        "files": {
          "/lab/events.log": "INFO ok\n"
        },
        "expected": [
          "0"
        ],
        "label": "Lab case 2",
        "setup": "/lab/events.log\nINFO ok\n"
      }
    ]
  },
  {
    "id": "unique",
    "chapter": "Pipelines and files",
    "title": "Sort and deduplicate",
    "concept": "sort puts lines in order. uniq removes adjacent repeated lines, so sorting first brings duplicate entries together.",
    "example": "sort hosts.txt | uniq",
    "task": "Print a sorted list of unique host names from hosts.txt.",
    "starter": "# Sort the file and remove repeats",
    "hint": "Use sort hosts.txt | uniq.",
    "solution": "sort hosts.txt | uniq",
    "cases": [
      {
        "files": {
          "/lab/hosts.txt": "web\ndb\nweb\n"
        },
        "expected": [
          "db",
          "web"
        ],
        "label": "Lab case 1",
        "setup": "/lab/hosts.txt\nweb\ndb\nweb\n"
      },
      {
        "files": {
          "/lab/hosts.txt": "dns\napi\ndns\napi\n"
        },
        "expected": [
          "api",
          "dns"
        ],
        "label": "Lab case 2",
        "setup": "/lab/hosts.txt\ndns\napi\ndns\napi\n"
      }
    ]
  },
  {
    "id": "redirect",
    "chapter": "Pipelines and files",
    "title": "Write a report",
    "concept": "Use > to create or replace a file and >> to append. Redirection sends output to the file.",
    "example": "echo 'First line' > report.txt\necho 'Second line' >> report.txt\ncat report.txt",
    "task": "Replace report.txt with Ready, append Verified, then read it back.",
    "starter": "# Write, append, then read",
    "hint": "Use > first and >> second.",
    "solution": "echo Ready > report.txt\necho Verified >> report.txt\ncat report.txt",
    "cases": [
      {
        "files": {
          "/lab/report.txt": "Old report\n"
        },
        "verifyFile": "/lab/report.txt",
        "expectedFile": "Ready\nVerified\n",
        "expected": [
          "Ready",
          "Verified"
        ],
        "label": "Lab case 1",
        "setup": "/lab/report.txt\nOld report\n"
      }
    ]
  },
  {
    "id": "branch",
    "chapter": "Automation",
    "title": "Check for a file",
    "concept": "The test [ -f FILE ] succeeds if the file exists. if selects a branch based on that result.",
    "example": "if [ -f backup.tar ]; then\n  echo Found\nelse\n  echo Missing\nfi",
    "task": "Use $1 as the path. Print Found when it exists and Missing when it does not.",
    "starter": "if [ -f \"$1\" ]; then\n  # Handle an existing file\nelse\n  # Handle a missing file\nfi",
    "hint": "Put one echo in each branch.",
    "solution": "if [ -f \"$1\" ]; then\n  echo Found\nelse\n  echo Missing\nfi",
    "cases": [
      {
        "argv": [
          "live.txt"
        ],
        "files": {
          "/lab/live.txt": "ok\n"
        },
        "expected": [
          "Found"
        ],
        "label": "Lab case 1",
        "setup": "Arguments: [\"live.txt\"]\n/lab/live.txt\nok\n"
      },
      {
        "argv": [
          "missing.txt"
        ],
        "expected": [
          "Missing"
        ],
        "label": "Lab case 2",
        "setup": "Arguments: [\"missing.txt\"]"
      }
    ]
  },
  {
    "id": "loop",
    "chapter": "Automation",
    "title": "Loop over targets",
    "concept": "for repeats a block for each word in its list. Quote the loop variable when you use it.",
    "example": "for host in web db; do\n  echo \"Checking $host\"\ndone",
    "task": "Print Checking followed by each of the two script arguments, in order.",
    "starter": "for host in \"$1\" \"$2\"; do\n  # Print each host\ndone",
    "hint": "Use echo \"Checking $host\" inside the loop.",
    "solution": "for host in \"$1\" \"$2\"; do\n  echo \"Checking $host\"\ndone",
    "cases": [
      {
        "argv": [
          "web",
          "db"
        ],
        "expected": [
          "Checking web",
          "Checking db"
        ],
        "label": "Lab case 1",
        "setup": "Arguments: [\"web\",\"db\"]"
      },
      {
        "argv": [
          "edge 01",
          "dns"
        ],
        "expected": [
          "Checking edge 01",
          "Checking dns"
        ],
        "label": "Lab case 2",
        "setup": "Arguments: [\"edge 01\",\"dns\"]"
      }
    ]
  },
  {
    "id": "audit",
    "chapter": "Capstone",
    "title": "Build an incident report",
    "concept": "Combine file checks, positional arguments, filtering, pipelines, and redirection to make a repeatable report.",
    "example": "grep -F 'WARN' events.log | sort | uniq > report.txt",
    "task": "If $1 exists, save its unique, sorted ERROR lines to report.txt and print the report. Otherwise print Log missing.",
    "starter": "# Check $1, then build the report",
    "hint": "Check [ -f \"$1\" ]. Pipe grep through sort and uniq before redirecting.",
    "solution": "if [ -f \"$1\" ]; then\n  grep -F 'ERROR' \"$1\" | sort | uniq > report.txt\n  cat report.txt\nelse\n  echo 'Log missing'\nfi",
    "cases": [
      {
        "argv": [
          "events.log"
        ],
        "files": {
          "/lab/events.log": "ERROR web\nINFO ok\nERROR db\nERROR web\n"
        },
        "verifyFile": "/lab/report.txt",
        "expectedFile": "ERROR db\nERROR web\n",
        "expected": [
          "ERROR db",
          "ERROR web"
        ],
        "label": "Lab case 1",
        "setup": "Arguments: [\"events.log\"]\n/lab/events.log\nERROR web\nINFO ok\nERROR db\nERROR web\n"
      },
      {
        "argv": [
          "missing.log"
        ],
        "expected": [
          "Log missing"
        ],
        "label": "Lab case 2",
        "setup": "Arguments: [\"missing.log\"]"
      },
      {
        "argv": [
          "events.log"
        ],
        "files": {
          "/lab/events.log": "INFO ok\n"
        },
        "verifyFile": "/lab/report.txt",
        "expectedFile": "",
        "expected": [],
        "label": "Lab case 3",
        "setup": "Arguments: [\"events.log\"]\n/lab/events.log\nINFO ok\n"
      }
    ]
  }
];
