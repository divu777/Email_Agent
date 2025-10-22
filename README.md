# Email AI Agent

An intelligent email management system that automates email responses and generates context-aware communications through an interactive AI-powered chat interface.

## Overview

Email AI Agent uses Google OAuth to access your emails and leverages advanced AI to help you manage your inbox efficiently. Chat with the agent to read emails, generate replies, and send messages autonomously — all based on natural language queries.

## Features

- **Google OAuth Integration** - Secure authentication to access and manage your Gmail
- **Interactive Chat Interface** - Talk to the AI agent using natural language to handle emails
- **Autonomous Email Management** - Agent can read emails, generate replies, and send messages on your behalf
- **RAG Pipeline** - Semantic search across your emails using Qdrant vector database
- **Conversational Memory** - Persistent context using Mem0 and Neo4j for better responses
- **File Upload Support** - Upload documents to provide additional context for email generation
- **Real-time Updates** - WebSocket integration for live notifications and updates

## Tech Stack

**Frontend:**
- React
- Tailwind CSS + Framer Motion
- React Toastify
- WebSocket

**Backend:**
- Node.js
- LangChain & LangGraph (Agentic workflows)
- Prisma + PostgreSQL
- Redis (Caching)
- Qdrant (Vector database - self-hosted)
- Neo4j (Graph database for memory)
- Mem0 (Memory management)

**Infrastructure:**
- Docker (Containerization)
- CI/CD Pipelines
- AWS S3 (File storage with presigned URLs)
- DigitalOcean (Deployment)

## How It Works

1. **Authentication** - Connect your Google account via OAuth
2. **Email Sync** - Agent fetches and displays your emails in the dashboard
3. **Chat with Agent** - Ask the agent to:
   - Read specific emails based on your query
   - Generate replies to email threads
   - Compose new emails
   - Send emails on your behalf
4. **Context-Aware Responses** - Upload files or let the agent use RAG to pull relevant context from your email history
5. **Memory** - Agent remembers conversation context using Mem0 and Neo4j for more relevant responses

## Key Highlights

- **Agentic Architecture** - Built with LangChain and LangGraph for tool execution and autonomous workflows
- **Self-hosted Vector DB** - Uses Qdrant for semantic search without external dependencies
- **Smart Caching** - Redis reduces API latency by 40%
- **Secure File Handling** - AWS S3 presigned URLs with dynamic lifecycle management
- **Real-time Performance** - WebSocket integration for instant updates

## Setup
```bash
# Clone the repository
git clone https://github.com/divu777/Email_Agent.git
cd Email_Agent

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Google OAuth credentials, database URLs, API keys, etc.

# Run with Docker
docker-compose up
```

## Environment Variables
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DATABASE_URL=your_postgres_url
REDIS_URL=your_redis_url
QDRANT_URL=your_qdrant_url
NEO4J_URI=your_neo4j_uri
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
OPENAI_API_KEY=your_openai_key
FRONTEND_URL=your_frontend
```

## Architecture

The system uses a multi-layered architecture:

- **Frontend** - React-based dashboard for email management
- **Backend API** - Node.js server handling OAuth, email operations, and AI workflows
- **Agent Layer** - LangChain/LangGraph orchestrating tool execution
- **Storage Layer** - PostgreSQL (structured data), Redis (cache), Qdrant (vectors), Neo4j (memory graph)
- **File Storage** - AWS S3 with presigned URLs

## Use Cases

- **Email Triage** - Quickly read and summarize important emails
- **Smart Replies** - Generate context-aware responses based on conversation history
- **Batch Processing** - Handle multiple emails with similar context
- **Custom Context** - Upload documents to provide additional context for email generation
- **Automated Workflows** - Set up rules for common email scenarios

## Future Enhancements

- [ ] Email templates and snippets
- [ ] Scheduled email sending
- [ ] Multi-account support
- [ ] Advanced filtering and search
- [ ] Email analytics and insights

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning or building your own tools.

---

Built with curiosity and too much coffee ☕
