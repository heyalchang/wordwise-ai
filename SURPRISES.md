# Surprises and Discoveries

## Project Setup Discoveries

### Vite Template Behavior
**Expected**: Vite would create project files in the current directory
**Discovered**: `npm create vite@latest wordwise-ai` creates a subdirectory with the project name, requiring file restructuring

**Learning**: When using Vite templates, either navigate to the created directory or plan for file reorganization

### ESLint Configuration in Vite 6
**Expected**: Traditional .eslintrc.js configuration file
**Discovered**: Vite 6 uses newer eslint.config.js format with TypeScript ESLint integration already configured

**Learning**: Modern Vite templates come with more sophisticated ESLint setup, just needed Prettier integration

### Tailwind CSS v4 Behavior
**Expected**: Standard Tailwind v3 configuration patterns
**Discovered**: Project installed Tailwind CSS v4.1.10 which may have different configuration requirements

**Learning**: Need to verify Tailwind v4 compatibility with our build setup as we proceed