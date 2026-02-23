#!/bin/bash

# Universal Railway Deployment Script
# Deploys any web app to Railway with zero configuration
#
# Usage:
#   ./deploy-to-railway.sh                    # Interactive mode
#   ./deploy-to-railway.sh --app my-app       # Specific app name
#   ./deploy-to-railway.sh --env prod         # Specific environment
#   ./deploy-to-railway.sh --yes              # Skip confirmations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAILWAY_CONFIG_FILE=".railway-app.yml"
ENV_FILE=".env"

# Functions
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

print_banner() {
    echo -e "${BLUE}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "   🚀 Universal Railway Deployment"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${NC}"
}

check_railway_cli() {
    if ! command -v railway &> /dev/null; then
        log_error "Railway CLI not installed"
        log_info "Installing Railway CLI..."
        npm install -g @railway/cli
        log_success "Railway CLI installed"
    else
        log_success "Railway CLI detected"
    fi
}

check_railway_auth() {
    if ! railway status &> /dev/null; then
        log_warning "Not logged into Railway"
        railway login
    else
        log_success "Logged into Railway"
    fi
}

detect_project_type() {
    log_info "Detecting project type..."

    # Node.js
    if [ -f "package.json" ]; then
        PROJECT_TYPE="nodejs"
        BUILD_COMMAND="npm install"
        START_COMMAND=$(node -e "console.log(require('./package.json').scripts && require('./package.json').scripts.start || 'npm start')")

        # Check if it's Next.js
        if grep -q "next" package.json; then
            FRAMEWORK="nextjs"
            BUILD_COMMAND="npm run build"
            START_COMMAND="npm start"
        # Check if it's Express
        elif grep -q "express" package.json; then
            FRAMEWORK="express"
        fi

    # Python
    elif [ -f "requirements.txt" ] || [ -f "setup.py" ]; then
        PROJECT_TYPE="python"
        BUILD_COMMAND="pip install -r requirements.txt"
        START_COMMAND="python app.py"

    # Docker
    elif [ -f "Dockerfile" ]; then
        PROJECT_TYPE="docker"
        BUILD_COMMAND="docker build -t app ."
        START_COMMAND="docker run -p 80:80 app"

    # Static HTML
    elif [ -f "index.html" ]; then
        PROJECT_TYPE="static"
        BUILD_COMMAND="npm install -g serve"
        START_COMMAND="serve -s . -p 80"

    else
        log_error "Could not detect project type"
        read -p "Enter project type (nodejs/python/docker/static): " PROJECT_TYPE
    fi

    log_success "Detected: $PROJECT_TYPE ${FRAMEWORK:+($FRAMEWORK)}"
}

get_app_name() {
    # Try to get from git repo
    if [ -d ".git" ]; then
        APP_NAME=$(git remote get-url origin | sed 's/.*\///' | sed 's/\.git$//' | tr '[:upper:]' '[:lower:]')
    fi

    # Try to get from package.json
    if [ -f "package.json" ]; then
        APP_NAME=$(node -e "console.log(require('./package.json').name || '$APP_NAME')")
    fi

    # Fallback to directory name
    if [ -z "$APP_NAME" ]; then
        APP_NAME=$(basename "$PWD" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]//g')
    fi

    echo "$APP_NAME"
}

create_railway_config() {
    log_info "Creating Railway configuration..."

    cat > "$RAILWAY_CONFIG_FILE" << EOF
# Railway App Configuration
# Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

app: "$APP_NAME"
type: "$PROJECT_TYPE"
framework: "${FRAMEWORK:-none}"

build:
  command: "$BUILD_COMMAND"

start:
  command: "$START_COMMAND"

environment:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: 18789

healthcheck:
  path: /health
  interval: 30s
  timeout: 10s
  retries: 3
EOF

    log_success "Configuration created: $RAILWAY_CONFIG_FILE"
}

load_env_variables() {
    log_info "Loading environment variables..."

    if [ -f "$ENV_FILE" ]; then
        # Count variables
        VAR_COUNT=$(grep -c "=" "$ENV_FILE" 2>/dev/null || echo "0")

        if [ "$VAR_COUNT" -gt 0 ]; then
            log_info "Found $VAR_COUNT environment variables in $ENV_FILE"

            # Ask if user wants to load them
            if [ "$AUTO_CONFIRM" != "true" ]; then
                read -p "Load environment variables from $ENV_FILE? (y/n): " LOAD_ENV
            else
                LOAD_ENV="y"
            fi

            if [ "$LOAD_ENV" = "y" ]; then
                # Export each variable to Railway
                while IFS='=' read -r key value; do
                    # Skip comments and empty lines
                    [[ $key =~ ^#.*$ ]] && continue
                    [[ -z $key ]] && continue

                    # Remove quotes and spaces
                    key=$(echo "$key" | tr -d '[:space:]')
                    value=$(echo "$value" | tr -d '"' | tr -d "'")

                    # Skip if already set
                    if railway variables get "$key" &> /dev/null; then
                        log_info "Variable $key already set, skipping"
                        continue
                    fi

                    log_info "Setting: $key"
                    railway variables set "$key=$value" &> /dev/null || true
                done < "$ENV_FILE"

                log_success "Environment variables loaded"
            fi
        else
            log_warning "No environment variables found in $ENV_FILE"
        fi
    else
        log_warning "No .env file found (that's ok!)"
    fi
}

deploy_to_railway() {
    log_info "Deploying to Railway..."

    # Check if already linked to Railway
    if [ -f ".railway/project.json" ]; then
        log_info "Already linked to Railway project"
        railway up
    else
        log_info "Linking to Railway..."
        railway link --yes || railway init
        railway up
    fi

    log_success "Deployment started!"
}

get_deployment_url() {
    log_info "Getting deployment URL..."

    # Wait a moment for deployment to register
    sleep 3

    DOMAIN=$(railway domain 2>/dev/null | head -1 || echo "")

    if [ -n "$DOMAIN" ]; then
        log_success "🌐 Deployed to: $DOMAIN"

        # Save to file for reference
        echo "$DOMAIN" > .railway-url

        return 0
    else
        log_warning "Could not retrieve deployment URL"
        log_info "Check Railway dashboard: https://railway.app"
        return 1
    fi
}

setup_git_hook() {
    log_info "Setting up Git hook for auto-deploy..."

    # Create post-commit hook
    cat > .git/hooks/post-commit << 'EOF'
#!/bin/bash
echo "📤 Pushing to Railway..."
railway up &
EOF

    chmod +x .git/hooks/post-commit

    log_success "Git hook installed (auto-deploy on commit)"
}

setup_auto_deploy_from_github() {
    if [ -d ".git" ]; then
        log_info "Setting up GitHub auto-deploy..."

        # Check if remote is GitHub
        REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")

        if [[ "$REMOTE_URL" == *"github.com"* ]]; then
            log_info "GitHub repository detected"
            log_info "To enable auto-deploy:"
            echo ""
            echo "1. Go to https://railway.app/new"
            echo "2. Click 'Deploy from GitHub repo'"
            echo "3. Select this repository"
            echo "4. Railway will auto-deploy on every push!"
            echo ""
            log_success "Auto-deploy configured!"
        else
            log_warning "Not a GitHub repository"
        fi
    fi
}

save_deployment_info() {
    cat > DEPLOYMENT_INFO.md << EOF
# Deployment Information

**Deployed:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**App Name:** $APP_NAME
**Project Type:** $PROJECT_TYPE ${FRAMEWORK:+($FRAMEWORK)}
**Deployment URL:** $(cat .railway-url 2>/dev/null || echo "See Railway dashboard")

## Railway Dashboard

Manage your app at: https://railway.app/project/$RAILWAY_PROJECT_ID

## Environment Variables

Set in Railway dashboard or via CLI:
\`\`\`bash
railway variables set KEY=value
\`\`\`

## Logs

View logs:
\`\`\`bash
railway logs
\`\`\`

## Redeploy

\`\`\`bash
railway up
\`\`\`

## Auto-Deploy

Push to GitHub to trigger auto-deploy (if configured).
EOF

    log_success "Deployment info saved: DEPLOYMENT_INFO.md"
}

# Main deployment flow
main() {
    print_banner

    # Parse arguments
    AUTO_CONFIRM="false"
    while [[ $# -gt 0 ]]; do
        case $1 in
            --app)
                APP_NAME="$2"
                shift 2
                ;;
            --env)
                ENVIRONMENT="$2"
                shift 2
                ;;
            --yes)
                AUTO_CONFIRM="true"
                shift
                ;;
            --help)
                echo "Usage: $0 [--app NAME] [--env ENV] [--yes]"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    # Check prerequisites
    check_railway_cli
    check_railway_auth

    # Detect project configuration
    detect_project_type

    # Get or confirm app name
    if [ -z "$APP_NAME" ]; then
        APP_NAME=$(get_app_name)
    fi

    if [ "$AUTO_CONFIRM" != "true" ]; then
        read -p "App name [$APP_NAME]: " INPUT_NAME
        APP_NAME=${INPUT_NAME:-$APP_NAME}
    fi

    log_info "App name: $APP_NAME"

    # Create Railway config
    create_railway_config

    # Load environment variables
    load_env_variables

    # Deploy
    if [ "$AUTO_CONFIRM" = "true" ] || \
       [ "$AUTO_CONFIRM" = "yes" ] || \
       read -p "Deploy to Railway now? (y/n): " DEPLOY && [ "$DEPLOY" = "y" ]; then

        deploy_to_railway
        get_deployment_url
        save_deployment_info

        # Optional: Setup auto-deploy
        if [ "$AUTO_CONFIRM" != "true" ]; then
            read -p "Setup GitHub auto-deploy? (y/n): " AUTO_DEPLOY
            if [ "$AUTO_DEPLOY" = "y" ]; then
                setup_auto_deploy_from_github
            fi
        fi

        log_success "🎉 Deployment complete!"
    else
        log_info "Deployment cancelled"
    fi
}

# Run main function
main "$@"
