FROM n8nio/n8n

# Switch to root to install packages
USER root

# Install Python and required build tools
RUN apk add --no-cache \
    python3 \
    py3-pip \
    py3-virtualenv \
    ffmpeg \
    build-base \
    python3-dev \
    libffi-dev \
    openssl-dev \
    cargo \
    portaudio-dev \
    musl-dev \
    g++ \
    pkgconfig \
    llvm15 \
    llvm15-dev \
    # Add Chrome dependencies
    chromium \
    chromium-chromedriver \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    ttf-liberation

# Create virtual environment
RUN python3 -m venv /opt/venv

# Activate virtual environment and install packages
ENV PATH="/opt/venv/bin:$PATH"
ENV LLVM_CONFIG="/usr/bin/llvm15-config"

# Set environment variables for Chrome
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

# Install packages in the right order to handle dependencies
RUN /opt/venv/bin/pip install --no-cache-dir --upgrade pip setuptools wheel && \
    /opt/venv/bin/pip install --no-cache-dir numpy && \
    /opt/venv/bin/pip install --no-cache-dir scipy && \
    /opt/venv/bin/pip install --no-cache-dir scikit-learn && \
    /opt/venv/bin/pip install --no-cache-dir soundfile audioread && \
    /opt/venv/bin/pip install --no-cache-dir librosa && \
    /opt/venv/bin/pip install --no-cache-dir requests beautifulsoup4 selenium webdriver-manager

# Create directory for custom scripts
RUN mkdir -p /usr/local/n8n/custom

# Copy custom scripts
COPY custom/*.py /usr/local/n8n/custom/

# Make scripts executable
RUN chmod +x /usr/local/n8n/custom/*.py

# Switch back to node user
USER node