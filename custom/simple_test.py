#!/usr/bin/env python3
import json
import sys
import os

# This is a simple test script that always outputs a valid JSON response

result = {
    "test": "success",
    "message": "Simple test script executed successfully",
    "environment": {
        "python_version": sys.version,
        "cwd": os.getcwd(),
        "script_path": os.path.abspath(__file__)
    }
}

# Output as JSON to stdout
print(json.dumps(result)) 