# Python Integration for n8n

This directory contains scripts for integrating Python functionality with n8n workflows.

## Files

- `test_python.py`: A sample Python script that processes input data and returns results.
- `run_python_script.sh`: A shell wrapper script that executes Python scripts and handles JSON I/O.

## Usage

1. The workflow should be located in the `/workflows` directory
2. The Python scripts are integrated into the Docker container in two ways:
   - Mounted as a volume via Docker Compose: `./custom:/usr/local/n8n/custom`
   - Copied into the Docker image at build time: `/usr/local/n8n/custom/`
3. Use the Execute Command node in n8n to run the script. To handle potential path differences, use one of these approaches:
   ```
   # For scripts mounted as a volume:
   /bin/bash ./custom/run_python_script.sh test_python.py
   
   # For scripts in the built image:
   /usr/local/n8n/custom/run_python_script.sh test_python.py
   ```
4. Pass JSON data to the script using:
   ```
   =JSON.stringify($json)
   ```
5. Parse the output using a Code node with JSON.parse(items[0].json.stdout)

## Docker Compose Setup

To properly mount the scripts directory, ensure your docker-compose.yml includes:

```yaml
services:
  n8n:
    image: n8n-based
    volumes:
      - n8n_data:/home/node/.n8n
      - ./custom:/usr/local/n8n/custom  # Mount the scripts directory
```

## Troubleshooting

If you encounter the error `Command failed: /usr/local/n8n/custom/run_python_script.sh test_python.py /bin/sh: /usr/local/n8n/custom/run_python_script.sh: not found`, try:

1. Make sure your scripts have execute permissions: `chmod +x custom/*.sh custom/*.py`
2. Check if the scripts are properly mounted in the container
3. Try using the alternate path with `/bin/bash ./custom/run_python_script.sh test_python.py`
4. Use the "Check Directories" node in the simple workflow to verify paths

## Extending

To create additional Python scripts:

1. Add your new script to the `custom` directory
2. Make sure it can handle JSON input from stdin and output results to stdout as JSON
3. Use the shell wrapper to execute it from n8n

## Docker Integration

The Dockerfile has been updated to:
1. Include Python and necessary dependencies
2. Copy the scripts to `/usr/local/n8n/custom/` in the Docker image
3. Make the scripts executable 