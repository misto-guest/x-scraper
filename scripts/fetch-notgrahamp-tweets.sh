#!/bin/bash
#
# fetch-notgrahamp-tweets.sh
# Fetches latest tweets from @notgrahamp using GhostFetch
# This script is idempotent - can run multiple times safely
#

set -euo pipefail

# Configuration
USERNAME="notgrahamp"
BASE_DIR="/Users/northsea/clawd-dmitry"
SCRIPT_DIR="${BASE_DIR}/scripts"
DATA_DIR="${BASE_DIR}/data/notgrahamp-tweets"
DIGEST_DIR="${BASE_DIR}/data/notgrahamp-daily-digest"
LOG_DIR="${BASE_DIR}/logs"
LOG_FILE="${LOG_DIR}/notgrahamp-fetch.log"

# Ensure directories exist
mkdir -p "${DATA_DIR}" "${DIGEST_DIR}" "${LOG_DIR}"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "${LOG_FILE}"
}

# Error handling
error_exit() {
    log "ERROR: $*"
    exit 1
}

# Check if Python script exists
PYTHON_SCRIPT="${SCRIPT_DIR}/fetch-notgrahamp-tweets.py"
if [[ ! -f "${PYTHON_SCRIPT}" ]]; then
    error_exit "Python script not found at ${PYTHON_SCRIPT}"
fi

# Main execution
log "=== Starting tweet fetch for @${USERNAME} ==="

# Run the Python fetcher
if python3 "${PYTHON_SCRIPT}"; then
    log "Tweet fetch completed successfully"
    exit 0
else
    error_exit "Tweet fetch failed with exit code $?"
fi
