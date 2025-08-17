// services/api.ts

const API_BASE_URL = process.env.VITE_API_URL;

export interface Meeting {
  _id: string;
  title: string;
  transcript: string;
  summary?: string;
  actionItems?: string;
  customPrompt?: string;
  date: Date;
  participants: string[];
  status: 'pending' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMeetingData {
  title: string;
  transcript: string;
  customPrompt?: string;
  date?: Date;
  participants?: string[];
  status?: string;
}

export interface PdfUploadResponse {
  message: string;
  meeting: {
    id: string;
    title: string;
    transcript: string;
    status: string;
  };
  extractedTextLength: number;
  numPages: number;
}

// Utility: handle fetch errors
const handleError = async (response: Response) => {
  let message = 'Request failed';
  try {
    const error = await response.json();
    message = error.message || error.error || message;
  } catch {
    message = response.statusText || message;
  }
  throw new Error(message);
};

// Create a new meeting
export const createMeeting = async (data: CreateMeetingData): Promise<Meeting> => {
  const response = await fetch(`${API_BASE_URL}/meetings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) return handleError(response);
  return response.json();
};

// Get all meetings
export const getMeetings = async (): Promise<Meeting[]> => {
  const response = await fetch(`${API_BASE_URL}/meetings`);
  if (!response.ok) return handleError(response);
  return response.json();
};

// Get a specific meeting
export const getMeeting = async (id: string): Promise<Meeting> => {
  const response = await fetch(`${API_BASE_URL}/meetings/${id}`);
  if (!response.ok) return handleError(response);
  return response.json();
};

// Update a meeting
export const updateMeeting = async (id: string, data: Partial<CreateMeetingData>): Promise<Meeting> => {
  const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) return handleError(response);
  return response.json();
};

// Delete a meeting
export const deleteMeeting = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) return handleError(response);
};

// Generate summary for a meeting
export const generateSummary = async (id: string, customPrompt?: string): Promise<Meeting> => {
  const response = await fetch(`${API_BASE_URL}/meetings/${id}/summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ customPrompt }),
  });

  if (!response.ok) return handleError(response);
  return response.json();
};

// Share meeting summary via email
export const shareMeetingSummary = async (id: string, recipients: string[]): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/meetings/${id}/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recipients }),
  });

  if (!response.ok) return handleError(response);
};

// Upload PDF and create meeting
export const uploadPdf = async (file: File): Promise<PdfUploadResponse> => {
  const formData = new FormData();
  formData.append('pdf', file);

  const response = await fetch(`${API_BASE_URL}/meetings/upload-pdf`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) return handleError(response);
  return response.json();
};
