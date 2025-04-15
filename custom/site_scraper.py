#!/usr/bin/env python3

# Import basic modules first to ensure error handling works
import json
import sys
import os
import tempfile
import time

# Then try to import other dependencies
try:
    import requests
    from bs4 import BeautifulSoup
    import csv
    from urllib.parse import urlparse, urljoin
    import re
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.common.by import By
    from selenium.common.exceptions import WebDriverException
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
except ImportError as e:
    print(json.dumps({
        "error": f"Missing dependency: {str(e)}. Please install with 'pip install requests beautifulsoup4 selenium webdriver-manager'."
    }))
    sys.exit(1)

EXCLUDED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf', 'docx', 'xlsx', 'zip', 'rar']

def normalize_url(url):
    return url.lower()

def get_domain(url):
    parsed_url = urlparse(url)
    domain = '{uri.scheme}://{uri.netloc}'.format(uri=parsed_url)
    return domain

def sanitise_url(url):
    if not re.match(r'http(s?)://', url):
        url = 'http://' + url
    return normalize_url(url)

def is_pagination_link(link):
    pagination_patterns = [
        r'\?page=', r'\?p=', r'\?pg=', r'\?pagenumber=', r'\?start=', r'\?offset=',
        r'/page/', r'/p/', r'/pages/', r'#page='
    ]
    pattern = '|'.join(pagination_patterns)
    return re.search(pattern, link) is not None

def setup_selenium_driver():
    try:
        # Set up Chrome options for headless browsing
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
        
        # For Alpine Linux, use installed ChromeDriver
        chrome_path = os.environ.get('CHROME_BIN', '/usr/bin/chromium-browser')
        chromedriver_path = os.environ.get('CHROMEDRIVER_PATH', '/usr/bin/chromedriver')
        
        chrome_options.binary_location = chrome_path
        
        # Initialize the driver - handle both older and newer Selenium versions
        try:
            # Newer Selenium versions
            service = Service(executable_path=chromedriver_path)
            driver = webdriver.Chrome(service=service, options=chrome_options)
        except TypeError:
            # Older Selenium versions
            driver = webdriver.Chrome(executable_path=chromedriver_path, options=chrome_options)
            
        driver.set_page_load_timeout(30)
        return driver
    except Exception as e:
        print(json.dumps({"debug": f"Failed to set up Selenium driver: {str(e)}"}), file=sys.stderr)
        raise

def scrape_page(url, domain, driver):
    try:
        print(json.dumps({"debug": f"Starting to load {url} with Selenium"}), file=sys.stderr)
        
        # Navigate to the page
        driver.get(url)
        
        # Wait for the page to load completely
        wait = WebDriverWait(driver, 10)
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        
        # Additional wait for JavaScript content to render
        time.sleep(3)
        
        # Get the page source after JavaScript has rendered
        page_source = driver.page_source
        status_code = 200  # Selenium doesn't provide status codes, assume 200 if page loads
        
        print(json.dumps({"debug": f"Successfully loaded {url} with Selenium"}), file=sys.stderr)
    except WebDriverException as e:
        print(json.dumps({"debug": f"Selenium error for {url}: {str(e)}"}), file=sys.stderr)
        return None, []
    except Exception as e:
        print(json.dumps({"debug": f"Error fetching {url}: {str(e)}"}), file=sys.stderr)
        return None, []

    # Parse the rendered HTML with BeautifulSoup
    soup = BeautifulSoup(page_source, 'html.parser')

    page_data = {'URL': url, 'Status code': status_code}

    for h_tag in ['H1', 'H2']:
        tags = [tag.text.strip() for tag in soup.find_all(h_tag.lower())]
        for i, tag_text in enumerate(tags, 1):
            page_data[f'{h_tag} - {i}'] = tag_text

    page_data.update({
        'Title': soup.title.string.strip() if soup.title else '',
        'META Description': soup.find('meta', {'name': 'description'})['content'].strip() if soup.find('meta', {'name': 'description'}) else ''
    })

    links = []
    # Get all links from the rendered page
    for a in soup.find_all('a', href=True):
        href = a['href']
        # Skip empty, javascript: and mailto: links
        if not href or href.startswith('javascript:') or href.startswith('mailto:') or href.startswith('#'):
            continue
            
        link = normalize_url(urljoin(url, href))
        if (get_domain(link) == domain and
            not any(ext in link for ext in EXCLUDED_EXTENSIONS) and
            not any(pattern in link for pattern in ['cart', 'search', 'terms-of-service']) and
            '#' not in link):
            links.append(link)

    print(json.dumps({"debug": f"Scraped {url} with Selenium: found {len(links)} links"}), file=sys.stderr)
    return page_data, links

def main(input_url):
    try:
        start_url = sanitise_url(input_url)
    except ValueError as e:
        return {"error": str(e)}

    # Initialize the Selenium driver
    try:
        driver = setup_selenium_driver()
    except Exception as e:
        return {"error": f"Failed to initialize Selenium: {str(e)}"}

    try:
        domain = get_domain(start_url)
        visited_urls = set()
        to_visit_urls = {start_url}
        all_headers = set(['URL', 'Title', 'META Description', 'Status code'])
        all_rows = []
        retry_urls = []
        
        # Limit the number of pages to scrape to avoid excessive runtime
        max_pages = 100
        pages_scraped = 0

        def getData():
            nonlocal pages_scraped
            while to_visit_urls and pages_scraped < max_pages:
                current_url = to_visit_urls.pop()
                visited_urls.add(current_url)
                
                if is_pagination_link(current_url):
                    continue
                    
                page_data, links = scrape_page(current_url, domain, driver)
                
                if page_data:
                    all_headers.update(page_data.keys())
                    if page_data['Status code'] == 429:
                        retry_urls.append(current_url)
                    else:
                        all_rows.append(page_data)
                        pages_scraped += 1
                
                for link in links:
                    if link not in visited_urls and link not in to_visit_urls:
                        to_visit_urls.add(link)

        try:
            print(json.dumps({"debug": f"Starting scrape of {start_url}"}), file=sys.stderr)
            getData()
            
            if retry_urls and pages_scraped < max_pages:
                print(json.dumps({"debug": f"Retrying {len(retry_urls)} URLs"}), file=sys.stderr)
                for retry_url in retry_urls:
                    to_visit_urls.add(retry_url)
                getData()

            # Create a temporary file for the CSV output
            temp_dir = tempfile.gettempdir()
            sanitised_url = re.sub(r'[\\/:*?"<>|\s]', '_', start_url)
            filename = os.path.join(temp_dir, f"{sanitised_url}_scraped_results.csv")
            
            column_order = ['Status code', 'URL', 'Title', 'META Description'] + \
                sorted([col for col in all_headers if col not in {'URL', 'Title', 'META Description', 'Status code'}],
                    key=lambda x: (x.split('-')[0], int(x.split('-')[1])) if '-' in x and x.split('-')[0].startswith('H') else (x, 0))

            with open(filename, mode='w', newline='', encoding='utf-8') as file:
                writer = csv.DictWriter(file, fieldnames=column_order)
                writer.writeheader()
                for row in all_rows:
                    writer.writerow(row)
            
            return {
                "success": True,
                "message": f"Scraped {len(all_rows)} pages from {start_url}",
                "csv_file_path": filename,
                "url": start_url
            }
        finally:
            # Always close the driver to free resources
            driver.quit()
    except Exception as e:
        # Make sure to close the driver if there's an error
        try:
            if 'driver' in locals():
                driver.quit()
        except:
            pass
        return {
            "error": f"An error occurred during scraping: {str(e)}",
            "url": start_url
        }

if __name__ == "__main__":
    # Check if URL is provided as argument
    if len(sys.argv) > 1:
        url = sys.argv[1]
        result = main(url)
        print(json.dumps(result))
    else:
        print(json.dumps({"error": "No URL provided"})) 