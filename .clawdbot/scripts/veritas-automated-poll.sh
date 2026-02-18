#!/bin/bash
# Veritas Kanban Automated Polling Script
# Polls for tasks assigned to agents and triggers notifications
# Production-ready with error handling, state tracking, and logging

set -euo pipefail

# Configuration
VERITAS_API="${VERITAS_API:-https://veritas-kanban-production.up.railway.app/api}"
AGENT_KEY="${AGENT_KEY:-vk_agent123_TFUKNP}"
LOG_DIR="${HOME}/clawd-dmitry/logs"
LOG_FILE="${LOG_DIR}/veritas-poll.log"
STATE_FILE="${LOG_DIR}/veritas-poll-state.json"
AGENT_NAME="${AGENT_NAME:-remote-openclaw}"  # Can be overridden by environment
POLL_INTERVAL_MINUTES=30
TEST_MODE="${TEST_MODE:-0}"  # Set to 1 to use mock data for testing

# Ensure log directory exists
mkdir -p "${LOG_DIR}"

# Logging functions
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] ${message}" | tee -a "${LOG_FILE}"
}

log_info() { log "INFO" "$@" >&2; }
log_warn() { log "WARN" "$@" >&2; }
log_error() { log "ERROR" "$@" >&2; }
log_debug() { [[ "${DEBUG:-0}" == "1" ]] && log "DEBUG" "$@" >&2; }

# Error handling
trap 'log_error "Script failed at line $LINENO. Exit code: $?"' ERR

# State management functions
init_state() {
    if [[ ! -f "${STATE_FILE}" ]]; then
        log_info "Initializing state file"
        cat > "${STATE_FILE}" << EOF
{
  "lastPoll": null,
  "lastPollTimestamp": 0,
  "notifiedTasks": [],
  "lastError": null,
  "pollCount": 0
}
EOF
    fi
}

get_state() {
    local key="$1"
    if [[ -f "${STATE_FILE}" ]]; then
        jq -r ".${key} // empty" "${STATE_FILE}" 2>/dev/null || echo ""
    fi
}

update_state() {
    local key="$1"
    local value="$2"
    
    if [[ -f "${STATE_FILE}" ]]; then
        # Use jq to update state atomically
        local tmp_file="${STATE_FILE}.tmp"
        jq ".${key} = ${value}" "${STATE_FILE}" > "${tmp_file}" && mv "${tmp_file}" "${STATE_FILE}"
    fi
}

add_notified_task() {
    local task_id="$1"
    local tmp_file="${STATE_FILE}.tmp"
    jq ".notifiedTasks |= (. + [\"${task_id}\"] | unique)" "${STATE_FILE}" > "${tmp_file}" && mv "${tmp_file}" "${STATE_FILE}"
}

is_task_notified() {
    local task_id="$1"
    if [[ -f "${STATE_FILE}" ]]; then
        local notified=$(jq -r ".notifiedTasks | index(\"${task_id}\")" "${STATE_FILE}")
        [[ "${notified}" != "null" ]]
    else
        return 1
    fi
}

# API interaction functions
api_request() {
    local endpoint="$1"
    
    # Use mock data in test mode
    if [[ "${TEST_MODE}" == "1" ]]; then
        log_debug "TEST_MODE: Returning mock data"
        mock_api_response "$endpoint"
        return 0
    fi
    
    local max_retries=3
    local retry=0
    local response
    
    while [[ ${retry} -lt ${max_retries} ]]; do
        response=$(curl -s "${VERITAS_API}${endpoint}" \
            -H "X-API-Key: ${AGENT_KEY}" \
            -H "Content-Type: application/json" \
            --max-time 30 \
            --retry 2 \
            --retry-delay 5 \
            2>&1) || true
        
        # Check if response is valid JSON
        if echo "${response}" | jq empty 2>/dev/null; then
            # Check for authentication errors
            local error_code=$(echo "${response}" | jq -r '.code // empty')
            if [[ "${error_code}" == "AUTH_REQUIRED" ]]; then
                log_warn "API authentication failed. Check API key: ${AGENT_KEY}"
                log_warn "Set TEST_MODE=1 to test without real API access"
                update_state "lastError" "\"Authentication failed\""
                return 1
            fi
            echo "${response}"
            return 0
        fi
        
        retry=$((retry + 1))
        if [[ ${retry} -lt ${max_retries} ]]; then
            log_warn "API request failed (attempt ${retry}/${max_retries}): ${response}"
            sleep 2
        fi
    done
    
    log_error "API request failed after ${max_retries} attempts: ${response}"
    update_state "lastError" "\"$(echo "${response}" | jq -Rs .)\""
    return 1
}

# Mock API for testing (when TEST_MODE=1)
mock_api_response() {
    local endpoint="$1"
    
    if [[ "$endpoint" == "/tasks" ]]; then
        # Return mock tasks
        cat << 'EOF'
[
  {
    "id": "test-task-1",
    "title": "Test task: Review automation setup",
    "description": "Verify the Veritas automation is working correctly",
    "status": "todo",
    "assignee": "dmitry",
    "tags": ["#dmitry", "#test"],
    "createdAt": "2026-02-17T12:00:00Z",
    "updatedAt": "2026-02-17T12:00:00Z"
  },
  {
    "id": "test-task-2",
    "title": "Example: Create documentation",
    "description": "Write documentation for the new feature",
    "status": "todo",
    "assignee": "dmitry",
    "tags": ["#docs"],
    "createdAt": "2026-02-17T11:00:00Z",
    "updatedAt": "2026-02-17T11:00:00Z"
  },
  {
    "id": "task-already-done",
    "title": "Already completed task",
    "description": "This task is done",
    "status": "done",
    "assignee": "dmitry",
    "tags": ["#dmitry"],
    "createdAt": "2026-02-16T12:00:00Z",
    "updatedAt": "2026-02-16T14:00:00Z"
  }
]
EOF
    else
        echo '{"error": "Mock API: endpoint not implemented"}'
    fi
}

update_task_status() {
    local task_id="$1"
    local new_status="$2"
    
    # Skip in test mode
    if [[ "${TEST_MODE}" == "1" ]]; then
        log_info "TEST_MODE: Would update task ${task_id} to status: ${new_status}"
        return 0
    fi
    
    log_info "Updating task ${task_id} to status: ${new_status}"
    
    local response=$(curl -s -X PUT "${VERITAS_API}/tasks/${task_id}" \
        -H "X-API-Key: ${AGENT_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"status\":\"${new_status}\"}" \
        --max-time 30 \
        2>&1) || true
    
    if echo "${response}" | jq empty 2>/dev/null; then
        log_info "Task ${task_id} updated successfully"
        return 0
    else
        log_warn "Failed to update task ${task_id}: ${response}"
        return 1
    fi
}

# Task processing functions
extract_agent_tasks() {
    local tasks_json="$1"
    local agent="$2"
    
    # Find tasks assigned to this agent (by tag or name)
    local result
    result=$(echo "${tasks_json}" | jq "
        [.[] | select(
            .assignee == \"${agent}\" or 
            (.tags[]? // \"\") == \"#${agent}\" or
            (.title | contains(\"${agent}\"))
        )]
    " 2>/dev/null) || result="[]"
    
    # Return result (empty array if no tasks)
    echo "${result}"
}

process_tasks() {
    local tasks_json="$1"
    
    if [[ "${tasks_json}" == "[]" ]] || [[ -z "${tasks_json}" ]]; then
        log_info "No tasks assigned to ${AGENT_NAME}"
        return 0
    fi
    
    local task_count=$(echo "${tasks_json}" | jq 'length' 2>/dev/null || echo "0")
    log_info "Found ${task_count} task(s) assigned to ${AGENT_NAME}"
    
    # Process each task
    while IFS= read -r task; do
        local task_id=$(echo "${task}" | jq -r '.id')
        local task_title=$(echo "${task}" | jq -r '.title')
        local task_status=$(echo "${task}" | jq -r '.status')
        local task_desc=$(echo "${task}" | jq -r '.description // "No description"')
        
        log_debug "Processing task: ${task_id} - ${task_title}"
        
        # Skip if already notified about this task
        if is_task_notified "${task_id}"; then
            log_debug "Task ${task_id} already notified, skipping"
            continue
        fi
        
        # Only notify about todo tasks
        if [[ "${task_status}" == "todo" ]]; then
            log_info "🎯 NEW TASK: ${task_title}"
            log_info "   ID: ${task_id}"
            log_info "   Description: ${task_desc}"
            
            # Mark as notified
            add_notified_task "${task_id}"
            
            # Output notification for Dmitry (will be captured by heartbeat)
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "🎯 NEW VERITAS TASK ASSIGNED TO YOU"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "Title: ${task_title}"
            echo "ID: ${task_id}"
            echo "Status: ${task_status}"
            echo "Description: ${task_desc}"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            
            # Optionally auto-update to in-progress
            # update_task_status "${task_id}" "in-progress"
        fi
    done < <(echo "${tasks_json}" | jq -c '.[]')
}

# Main polling function
poll_veritas() {
    log_info "Starting Veritas Kanban poll for ${AGENT_NAME}"
    
    # Check if we should poll (rate limiting)
    local last_poll=$(get_state "lastPollTimestamp")
    local current_time=$(date +%s)
    local interval_seconds=$((POLL_INTERVAL_MINUTES * 60))
    
    if [[ "${last_poll}" -gt 0 ]]; then
        local time_since_poll=$((current_time - last_poll))
        if [[ ${time_since_poll} -lt ${interval_seconds} ]]; then
            local remaining=$((interval_seconds - time_since_poll))
            log_debug "Skipping poll (${remaining}s remaining until next poll)"
            return 0
        fi
    fi
    
    # Fetch all tasks
    log_info "Fetching tasks from ${VERITAS_API}"
    local tasks_json
    tasks_json=$(api_request "/tasks")
    
    if [[ -z "${tasks_json}" ]] || [[ "${tasks_json}" == "null" ]]; then
        log_error "Failed to fetch tasks from API"
        return 1
    fi
    
    # Get tasks for this agent
    local agent_tasks
    agent_tasks=$(extract_agent_tasks "${tasks_json}" "${AGENT_NAME}")
    
    # Process tasks
    process_tasks "${agent_tasks}"
    
    # Update state
    local current_datetime=$(date -Iseconds)
    update_state "lastPoll" "\"${current_datetime}\""
    update_state "lastPollTimestamp" "${current_time}"
    update_state "pollCount" "((.pollCount // 0) + 1)"
    update_state "lastError" "null"
    
    log_info "Poll completed successfully"
}

# Main execution
main() {
    init_state
    
    log_info "=========================================="
    log_info "Veritas Automated Poll - ${AGENT_NAME}"
    log_info "=========================================="
    
    if poll_veritas; then
        log_info "✅ Poll completed successfully"
        exit 0
    else
        log_error "❌ Poll failed"
        exit 1
    fi
}

# Run main function
main "$@"
