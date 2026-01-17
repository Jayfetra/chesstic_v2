# Chess Analytics Website - Copilot Instructions

## Project Overview
Flask-based chess analytics website that pulls data from Chess.com API. Users enter their Chess.com username and date period to analyze their game statistics.

## Your roles
- Every project can be found in `.github/docs/[project_name]/`
- If you do some bugfix, write the summary and fix docum it into `.github/docs/[project_name]/bug_fixes.md`.
- When working on milestone, write the progress to `.github/docs/[project_name]/milestone_progress.md`.
- Write every changes summary and line changes to `.github/docs/[project_name]/documentation.md`.
- Read the progress documentation from `.github/docs/[project_name]/milestone_progress.md` first to understand context (if any).
- All product requirements documents are stored in `.github/docs/[project_name]/prd_[project_name].md`.


## Technology Stack
- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript (vanilla)
- **API Integration**: Chess.com Public API
- **Package Manager**: uv (Python 3.12)
- **Testing**: Playwright for E2E testing
- **AI Agents**: GitHub Copilot with custom agent configurations


## Github Repository & Upload rule
- Repo address: https://github.com/Jayfetra/chesstic_v2
- Default branch: **main** (use this for all development)
- No need to push the issue, you can always commit and push the file into github repo
- Secrets will be saved in .env on local machine, do not push .env to github


## Project Structure
- `app/` - Flask application code
  - `routes/` - API and view routes
  - `services/` - Business logic and Chess.com API integration
  - `models/` - Data models
  - `utils/` - Helper functions
- `static/` - CSS, JavaScript, images
- `templates/` - HTML templates
- `tests/` - Test files including Playwright tests
- `.github/agents/` - AI agent configurations
- `.github/docs/[project_name]` - project folders
- `.github/docs/[project_name] - prd_[project_name].md` created from prd-agent.md
- `.github/docs/[project_name]/milestone_progress.md` and per-milestone progress files
- `.github/docs/[project_name]/bug_fixes.md/` - bug_fixes.md created from bugfixes done
- `.github/docs/[project_name]/documentation.md` - documentation of all changes made


## Development Guidelines

### Code Style
- Follow PEP 8 for Python code
- Use type hints where appropriate
- Write docstrings for all functions and classes
- Use meaningful variable and function names

### Flask Best Practices
- Use blueprints for route organization
- Implement proper error handling
- Use environment variables for configuration
- Follow RESTful API design principles

### Frontend Guidelines
- Responsive design (mobile-first approach)
- Modern CSS (Flexbox/Grid)
- Vanilla JavaScript (no frameworks)
- Accessible UI components

### API Integration
- Implement rate limiting for Chess.com API calls
- Cache responses appropriately
- Handle API errors gracefully
- Validate user inputs

### Testing
- Write unit tests for services and utilities
- Use Playwright for end-to-end testing
- Test error scenarios and edge cases

## AI Agent Usage
This project uses three specialized AI agents:

1. **PRD Agent** - Creates product requirements documents
2. **Engineer Agent** - Implements features and fixes
3. **Playwright Tester Agent** - Writes and maintains E2E tests

Refer to agent configuration files in `.github/agents/` for specific agent capabilities.

## Security Considerations
- Never commit API keys or secrets
- Validate and sanitize all user inputs
- Implement CSRF protection
- Use secure session management

## Package Management
- Use `uv` for all Python dependency management
- Install dependencies: `uv sync`
- Add new packages: `uv add <package-name>`
- Remove packages: `uv remove <package-name>`
- Run Python scripts: `uv run <script.py>`
- Project uses Python 3.12

## Development Workflow
1. Create feature branch from main
2. Install dependencies with `uv sync`
3. Implement changes with appropriate tests
4. Run tests locally before committing
5. Use AI agents for assistance as needed
6. Submit PR with clear description


