# Site Scraper Workflow

This workflow scrapes a website and generates a CSV report containing page titles, meta descriptions, headings, and other information.

## Prerequisites

The script requires the following Python packages:
- requests
- beautifulsoup4

## Installation

If running in a Docker container, you'll need to install these packages inside the container:

```bash
docker exec -it n8n /bin/bash
pip install requests beautifulsoup4
```

Or, if you're running n8n directly:

```bash
pip install requests beautifulsoup4
```

## Usage

1. Go to the n8n workflows list
2. Find and open the "Site Scrape" workflow
3. Click "Execute Workflow" to start
4. Enter a URL in the form field (e.g., https://example.com)
5. Click "Submit"
6. Wait for the scraping to complete
7. The workflow will output a CSV file with the scraped data

## Limitations

- The script is set to scrape a maximum of 100 pages per website to prevent excessive runtime
- The script only follows links within the same domain
- Some content types and common non-content pages (shopping cart, search, etc.) are automatically excluded

## Troubleshooting

If you encounter errors:

- Make sure the required Python packages are installed
- Verify the URL is valid and accessible
- Check that the website allows scraping (some sites block automated access)
- Look at the workflow execution logs for detailed error messages 