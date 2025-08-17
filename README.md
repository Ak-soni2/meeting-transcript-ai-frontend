# AI Meeting Summarizer

## Live Demo
**URL**: https://meeting-transcript-ai-frontend.vercel.app/

## Project Overview
AI Meeting Summarizer is a modern web application that transforms meeting transcripts into concise, actionable summaries using artificial intelligence. Users can upload PDF transcripts or paste text directly, and receive AI-generated summaries that can be easily shared via email.

## Features
- 📝 PDF transcript upload and processing
- 🤖 AI-powered meeting summarization
- 📧 Email sharing functionality
- ✨ Customizable AI prompts
- 🎨 Modern, responsive UI
- 🌙 Dark/Light mode support

## Tech Stack
### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Form Handling**: React Hook Form
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Validation**: Zod

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB
- **AI Integration**: Google Gemini AI
- **Email Service**: Nodemailer
- **File Processing**: pdf-parse

## Development Process
1. **Planning & Design**
   - Requirements analysis
   - UI/UX design using shadcn/ui components
   - API endpoint planning

2. **Implementation**
   - Frontend setup with Vite and TypeScript
   - Backend API development
   - AI integration with Google Gemini
   - PDF processing implementation
   - Email service integration

3. **Testing & Optimization**
   - Component testing
   - API endpoint testing
   - Performance optimization
   - Error handling improvements

## Setup & Installation
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

## Environment Variables
Create a `.env` file in the frontend directory:
```properties
VITE_API_URL=https://meeting-transcript-ai-backend.onrender.com/api
```

## Deployment
- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render
- **Database**: MongoDB Atlas

## Future Improvements
- Real-time collaboration features
- Advanced PDF parsing capabilities
- Multiple language support
- Meeting analytics dashboard
- Custom AI model fine-tuning

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

