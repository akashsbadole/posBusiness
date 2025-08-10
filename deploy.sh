#!/bin/bash

# Indian Restaurant POS System - Deployment Script
# This script automates the deployment process for the POS system

set -e  # Exit on any error

echo "🚀 Starting deployment of Indian Restaurant POS System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "npm $(npm --version) is installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Dependencies installed successfully"
    else
        print_warning "node_modules directory already exists"
        read -p "Do you want to reinstall dependencies? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf node_modules
            npm install
            print_success "Dependencies reinstalled successfully"
        else
            print_success "Using existing dependencies"
        fi
    fi
}

# Setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            print_success "Environment file created from .env.example"
        else
            cat > .env.local << EOF
# Database Configuration
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

# Application Configuration
NODE_ENV="development"
PORT="3000"
EOF
            print_success "Environment file created with default values"
        fi
    else
        print_warning ".env.local file already exists"
    fi
}

# Database setup
setup_database() {
    print_status "Setting up database..."
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npm run db:generate
    
    # Push database schema
    print_status "Pushing database schema..."
    npm run db:push
    
    # Seed database
    print_status "Seeding database with sample data..."
    npm run db:seed
    
    print_success "Database setup completed"
}

# Build the application
build_application() {
    print_status "Building application..."
    
    npm run build
    
    print_success "Application built successfully"
}

# Start the application
start_application() {
    print_status "Starting application..."
    
    if [ "$1" = "dev" ]; then
        print_status "Starting in development mode..."
        npm run dev
    else
        print_status "Starting in production mode..."
        npm start
    fi
}

# Main deployment function
deploy() {
    echo "================================================"
    echo "  Indian Restaurant POS System - Deployment    "
    echo "================================================"
    echo
    
    # Parse command line arguments
    MODE="dev"
    SKIP_DEPS=false
    SKIP_DB=false
    SKIP_BUILD=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --prod)
                MODE="prod"
                shift
                ;;
            --skip-deps)
                SKIP_DEPS=true
                shift
                ;;
            --skip-db)
                SKIP_DB=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --prod          Deploy in production mode"
                echo "  --skip-deps     Skip dependency installation"
                echo "  --skip-db       Skip database setup"
                echo "  --skip-build    Skip application build"
                echo "  --help, -h      Show this help message"
                echo ""
                echo "Examples:"
                echo "  $0              Deploy in development mode"
                echo "  $0 --prod       Deploy in production mode"
                echo "  $0 --skip-deps  Deploy without installing dependencies"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run deployment steps
    check_nodejs
    check_npm
    
    if [ "$SKIP_DEPS" = false ]; then
        install_dependencies
    fi
    
    setup_environment
    
    if [ "$SKIP_DB" = false ]; then
        setup_database
    fi
    
    if [ "$MODE" = "prod" ] && [ "$SKIP_BUILD" = false ]; then
        build_application
    fi
    
    echo
    echo "================================================"
    print_success "Deployment completed successfully!"
    echo "================================================"
    echo
    
    if [ "$MODE" = "prod" ]; then
        echo "🚀 Production deployment ready!"
        echo "📱 Application URL: http://localhost:3000"
        echo "🗄 Database: SQLite (prod.db)"
        echo ""
        echo "To start the production server:"
        echo "  npm start"
    else
        echo "🚀 Development deployment ready!"
        echo "📱 Application URL: http://localhost:3000"
        echo "🗄 Database: SQLite (dev.db)"
        echo "📊 Database Studio: http://localhost:5555 (run: npx prisma studio)"
        echo ""
        echo "To start the development server:"
        echo "  npm run dev"
    fi
    
    echo ""
    echo "📚 For more information, see FEATURES_AND_DEPLOYMENT.md"
    echo "🔧 For troubleshooting, check the logs and documentation"
}

# Run deployment with all arguments
deploy "$@"