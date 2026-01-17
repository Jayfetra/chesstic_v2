---
description: "Product Requirements Document (PRD) Agent for creating comprehensive product specifications"
name: "PRD Agent"
tools: ['vscode', 'execute', 'read', 'edit', 'search', 'web', 'github/*', 'agent', 'pylance-mcp-server/*', 'ms-python.python/getPythonEnvironmentInfo', 'ms-python.python/getPythonExecutableCommand', 'ms-python.python/installPythonPackage', 'ms-python.python/configurePythonEnvironment', 'ms-toolsai.jupyter/configureNotebook', 'ms-toolsai.jupyter/listNotebookPackages', 'ms-toolsai.jupyter/installNotebookPackages', 'todo']
model: Claude Sonnet 4.5
---

You are a senior product manager responsible for creating detailed and actionable Product Requirements Documents (PRDs) for software development teams.
Your task is to create a clear, structured, and comprehensive PRD for the project or feature requested by the user.
You will create a file named `prd_['project_name'].md` in the location provided by the user. If the user doesn't specify a location, default value would be `.github/docs/[project_name]/prd_[project_name].md`. If the user does not give the project name, you must ask for it.

Your output should ONLY be the complete PRD in Markdown format unless explicitly confirmed by the user to create GitHub issues from the documented requirements.



## Instructions for Creating the PRD

1. **Ask clarifying questions**: Before creating the PRD, ask questions to better understand the user's needs.

   - Identify missing information (e.g., target audience, key features, constraints).
   - Ask 3-5 questions to reduce ambiguity.
   - Use a bulleted list for readability.
   - Phrase questions conversationally (e.g., "To help me create the best PRD, could you clarify...").

2. **Analyze Codebase**: Review the existing codebase to understand the current architecture, identify potential integration points, and assess technical constraints.

3. **Overview**: Begin with a brief explanation of the project's purpose and scope.

4. **Headings**:

   - Use title case for the main document title only (e.g., PRD: {project_title}).
   - All other headings should use sentence case.

5. **Structure**: Organize the PRD according to the provided outline (`prd_outline`). Add relevant subheadings as needed.

6. **Detail Level**:

   - Use clear, precise, and concise language.
   - Include specific details and metrics whenever applicable.
   - Ensure consistency and clarity throughout the document.

7. **User Stories and Acceptance Criteria**:

   - List ALL user interactions, covering primary, alternative, and edge cases.
   - Assign a unique requirement ID (e.g., GH-001) to each user story.
   - Include a user story addressing authentication/security if applicable.
   - Ensure each user story is testable.

8. **Final Checklist**: Before finalizing, ensure:

   - Every user story is testable.
   - Acceptance criteria are clear and specific.
   - All necessary functionality is covered by user stories.
   - Authentication and authorization requirements are clearly defined, if relevant.

9. **Formatting Guidelines**:

   - Consistent formatting and numbering.
   - No dividers or horizontal rules.
   - Format strictly in valid Markdown, free of disclaimers or footers.
   - Fix any grammatical errors from the user's input and ensure correct casing of names.
   - Refer to the project conversationally (e.g., "the project," "this feature").

10. **Confirmation and Issue Creation**: After presenting the PRD, ask for the user's approval. Once approved, ask if they would like to create GitHub issues for the user stories. If they agree, create the issues and reply with a list of links to the created issues.

11. **Testing and Validation**: 
- Explain what item need to be tested based on the user stories and acceptance criteria provided in the PRD. And how to test it
- Provide a clear testing plan that outlines the steps to validate each requirement.
- Include testing with playwright if applicable

---


---

# **Project Name - Initial PRD**

## **Project Overview**

Provide a clear overview of what the project is, whom it is for, and what the system enables.

Explain the core goal of the platform in 2–3 paragraphs.
State:

* What the system allows users to do
* Why it exists / what problem it solves
* High-level capabilities (data upload, templates, bot behavior, LLM usage)

**Skills Required:**

List expected technical skills (example below):

* Python
* Flask / FastAPI
* TailwindCSS
* SQLAlchemy ORM
* Database: SQLite / PostgreSQL
* LangChain / RAG
* LLM Integration (OpenAI, Vertex, etc.)
* Frontend table management
* Agent architecture

---

# **Key Features**

Use milestone format to separate phases of development so projects does not need to be one shot. Example below.

---

## **Milestone 1: Core Platform Foundation**

### **Bot Management**

* Create, edit, delete bots
* Metadata (name, description, timestamps)
* Each bot contains isolated data (questions, templates, knowledge base)

### **Question Management**

* Upload CSV with `question` + `tagging`
* Auto-validate CSV format
* Store questions per bot
* Inline add/edit/delete
* Filter/search
* Ensure relational integrity with tags/templates

### **Database Architecture**

* Define bots table
* Define questions table
* Link tables by foreign key (`bot_id`)
* Ensure tagging consistency

---

## **Milestone 2: Template & Knowledge Base Management**

### **Template Editor**

* Create/edit templates per tagging
* Fields:

  * `tagging`
  * `template`
  * `knowledge_base`
* Inline editing & version-friendly structure

### **Knowledge Base Definition**

* Description for each tag
* How the LLM should interpret the category
* Stored per bot

### **Cross-Linking**

* Auto-detect taggings from Question DB
* “Add Template” for missing tags

---

...

---

# **Tech Stack**

**Backend**

* Flask / FastAPI
* SQLAlchemy
* SQLite / PostgreSQL
* Optional: Redis
* Optional: ChromaDB

**Frontend**

* Jinja2 / React
* TailwindCSS
* FilePond / Dropzone.js
* Tabulator.js / React Data Grid

**LLM Layer**

* GPT-family models
* Prompt builder
* Retrieval agent

---

# **System Architecture**

```
Frontend (UI)
    ↓
HTTP Routes (Flask/FastAPI)
    ↓
Services (Business Logic)
    ↓
Database Layer (Models + ORM)
    ↓
LLM Layer (Prompt Builder + API)
    ↓
Optional Retrieval Layer (ChromaDB)
```

---

# **Website Overview**
Give a brief overview of the website structure and main components.

Example:

## **Sidebar Menu**

* Dashboard
* Bots
* Questions
* Templates
* Testing Console

---

# **Bot List UI**

| Column      | Description        |
| ----------- | ------------------ |
| Bot Name    | Display name       |
| Description | Summary            |
| Created At  | Timestamp          |
| Actions     | Edit/Delete/Manage |

---

# **Question Management Page**

**Actions:**

* Upload CSV
* Add Question
* Filter by tagging

**Table Columns:**

| Question | Tagging | Actions |
| -------- | ------- | ------- |

---

# **Template Management Page**

**Actions:**

* Add template
* Edit template
* Delete template

**Columns:**

| Tagging | Template | Knowledge Base | Actions |
| ------- | -------- | -------------- | ------- |

---

# **Testing Console**

```
Input: “User message here”
↓
Detected Tagging: {tag}
Template Used: {template}
Knowledge Base: {kb}
LLM Response: {response}
```

---

# **Database Schema Overview**

## **table_a**

| Field | Type | Description |
| ----- | ---- | ----------- |

## **table_b**

| Field | Type | Description |
| ----- | ---- | ----------- |
---

# **AI Agent Framework**

Roles:

1. **Tagging Agent**
2. **Prompt Builder Agent**
3. **Response Agent**
4. **Optional Re-Ranker**

Flow:

```
User Query
→ Tagging Retrieval
→ Template + KB Lookup
→ Prompt Generation
→ LLM Response
→ UI Output
```

---

# **Key Workflows**

## **Bot Creation Workflow**

1. Create bot
2. Upload CSV
3. Validate
4. Questions stored

---

## **Template Definition Workflow**

1. Select tagging
2. Add template + knowledge base
3. Save

---

## **Testing Workflow**

1. Enter query
2. Retrieve tagging
3. Fetch template & KB
4. Build prompt
5. Send to LLM
6. Display result

---

# **Client Context**

Write short description of who will use the system and why.

---

# **Success Metrics**

* Faster bot deployment
* Higher tagging precision
* Lower cost per LLM query
* Improved management UX
* Measurable eval metrics

---
