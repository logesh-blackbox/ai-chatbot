#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
YELLOW='\033[1;33m'

echo "🔍 Verifying AI Chatbot Setup..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local file not found${NC}"
    echo "Please create .env.local from .env.example and set your environment variables"
    exit 1
fi

# Check if POSTGRES_URL is set
if ! grep -q "POSTGRES_URL=" .env.local; then
    echo -e "${RED}❌ POSTGRES_URL not found in .env.local${NC}"
    echo "Please set your POSTGRES_URL in .env.local"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
pnpm install

# Run database migrations
echo -e "${YELLOW}🔄 Running database migrations...${NC}"
pnpm db:migrate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database migrations completed successfully${NC}"
else
    echo -e "${RED}❌ Database migrations failed${NC}"
    echo "Please check your POSTGRES_URL and try again"
    exit 1
fi

echo -e "${GREEN}✅ Setup verification completed${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Run 'pnpm dev' to start the development server"
echo "2. Visit http://localhost:3000"
echo "3. Try registering a new user"
