#!/bin/bash

# Color codes for output
RED='\e[31m'
GREEN='\e[32m'
YELLOW='\e[33m'
BLUE='\e[34m'
NC='\e[0m' # No Color

VERSION_INPUT=$1
PROJECT_DIR=$2

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Determining GdUnit4 Version${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}Version Input:${NC} ${VERSION_INPUT}"
echo -e "${YELLOW}Project Directory:${NC} ${PROJECT_DIR}"
echo ""

# Change to project directory
cd "${PROJECT_DIR}"

# Function to extract version from plugin.cfg
extract_version_from_plugin() {
    local plugin_file=$1
    if [[ -f "${plugin_file}" ]]; then
        version=$(grep -oP '^version="\K[^"]+' "${plugin_file}")
        if [[ -n "${version}" ]]; then
            # Add 'v' prefix if not present
            if [[ ! "${version}" =~ ^v ]]; then
                version="v${version}"
            fi
            echo "${version}"
            return 0
        fi
    fi
    return 1
}

# Determine GdUnit4 version based on input
if [[ "${VERSION_INPUT}" == "installed" ]]; then
    echo -e "${YELLOW}Checking installed GdUnit4 plugin version...${NC}"
    
    if [[ -f ./addons/gdUnit4/plugin.cfg ]]; then
        gdunit_version=$(extract_version_from_plugin "./addons/gdUnit4/plugin.cfg")
        
        if [[ -n "${gdunit_version}" ]]; then
            echo -e "${GREEN}✓ Found installed GdUnit4 version: ${gdunit_version}${NC}"
            echo "${gdunit_version}"
            exit 0
        else
            echo -e "${RED}✗ Error: Could not extract version from ./addons/gdUnit4/plugin.cfg${NC}"
            exit 1
        fi
    else
        echo -e "${RED}✗ Error: GdUnit4 plugin not found at ./addons/gdUnit4/plugin.cfg${NC}"
        echo -e "${YELLOW}Make sure the plugin is installed before using version='installed'${NC}"
        exit 1
    fi

elif [[ "${VERSION_INPUT}" == "latest" ]]; then
    echo -e "${YELLOW}Resolving 'latest' GdUnit4 version from GitHub...${NC}"
    
    gdunit_version=$(git ls-remote --refs --tags https://github.com/MikeSchulze/gdUnit4 v* | sort -t '/' -k 3 -V | tail -n 1 | cut -d '/' -f 3)
    
    if [[ -n "${gdunit_version}" ]]; then
        echo -e "${GREEN}✓ Resolved latest version: ${gdunit_version}${NC}"
        echo "${gdunit_version}"
        exit 0
    else
        echo -e "${RED}✗ Error: Could not resolve latest version from GitHub${NC}"
        exit 1
    fi

else
    # Custom branch/tag specified
    echo -e "${YELLOW}Fetching GdUnit4 version from branch/tag '${VERSION_INPUT}'...${NC}"
    
    # First, check if the branch/tag exists
    echo -e "${BLUE}Verifying branch/tag exists on GitHub...${NC}"
    
    # Check if it's a tag
    if git ls-remote --tags https://github.com/MikeSchulze/gdUnit4 | grep -q "refs/tags/${VERSION_INPUT}$"; then
        echo -e "${GREEN}✓ Tag '${VERSION_INPUT}' found${NC}"
    # Check if it's a branch
    elif git ls-remote --heads https://github.com/MikeSchulze/gdUnit4 | grep -q "refs/heads/${VERSION_INPUT}$"; then
        echo -e "${GREEN}✓ Branch '${VERSION_INPUT}' found${NC}"
    else
        echo -e "${RED}✗ Error: Branch/tag '${VERSION_INPUT}' does not exist on GitHub${NC}"
        echo -e "${YELLOW}Please verify that the branch/tag exists at: https://github.com/MikeSchulze/gdUnit4${NC}"
        echo ""
        echo -e "${BLUE}Available recent tags:${NC}"
        git ls-remote --tags https://github.com/MikeSchulze/gdUnit4 | grep -oP 'refs/tags/\K.*' | grep -v '\^{}' | sort -V | tail -n 10
        exit 1
    fi
    
    # Clone the specific branch to get the plugin.cfg
    echo -e "${BLUE}Cloning repository...${NC}"
    CLONE_DIR="./.gdunit4-version-${VERSION_INPUT}"
    
    if git clone --quiet --depth 1 --branch "${VERSION_INPUT}" --single-branch https://github.com/MikeSchulze/gdUnit4 "${CLONE_DIR}" 2>/dev/null; then
        
        gdunit_version=$(extract_version_from_plugin "${CLONE_DIR}/addons/gdUnit4/plugin.cfg")
        
        if [[ -n "${gdunit_version}" ]]; then
            echo -e "${GREEN}✓ Found GdUnit4 version from branch '${VERSION_INPUT}': ${gdunit_version}${NC}"
            echo -e "${BLUE}Repository cloned to: ${CLONE_DIR}${NC}"
            echo "${gdunit_version}"
            exit 0
        else
            echo -e "${RED}✗ Error: Could not extract version from plugin.cfg in branch '${VERSION_INPUT}'${NC}"
            rm -rf "${CLONE_DIR}"
            exit 1
        fi
    else
        echo -e "${RED}✗ Error: Could not clone branch/tag '${VERSION_INPUT}' from GitHub${NC}"
        echo -e "${YELLOW}Please verify that the branch/tag exists at: https://github.com/MikeSchulze/gdUnit4${NC}"
        rm -rf "${CLONE_DIR}" 2>/dev/null
        exit 1
    fi
fi
