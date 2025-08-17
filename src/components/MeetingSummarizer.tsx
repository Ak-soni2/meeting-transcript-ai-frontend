import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Brain, Mail, Sparkles, FileText, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { createMeeting, generateSummary, shareMeetingSummary, uploadPdf } from "../services/api";
import React from "react";

const MeetingSummarizer = () => {
  const [transcript, setTranscript] = useState("");
  const [customPrompt, setCustomPrompt] = useState("Summarize this meeting in clear, actionable bullet points. Include key decisions, action items, and next steps.");
  const [summary, setSummary] = useState("");
  const [recipients, setRecipients] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentMeetingId, setCurrentMeetingId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file only.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a PDF file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadStatus('uploading');
    setIsProcessingFile(true);

    try {
      console.log('📄 Starting PDF upload:', file.name);
      const response = await uploadPdf(file);
      
      console.log('✅ PDF upload successful:', response);
      
      // Set the transcript from the uploaded PDF
      setTranscript(response.meeting.transcript);
      setCurrentMeetingId(response.meeting.id);
      
      setUploadStatus('success');
      
      toast({
        title: "PDF uploaded successfully!",
        description: `Extracted ${response.extractedTextLength} characters from ${response.numPages} pages.`,
      });

      // Auto-generate summary after successful upload
      if (response.meeting.id) {
        await handleGenerateSummary(response.meeting.id);
      }

    } catch (error) {
      console.error('❌ PDF upload failed:', error);
      setUploadStatus('error');
      
      toast({
        title: "PDF upload failed",
        description: error instanceof Error ? error.message : "Failed to process PDF",
        variant: "destructive",
      });
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleGenerateSummary = async (meetingId?: string) => {
    if (!transcript.trim()) {
      toast({
        title: "Missing transcript",
        description: "Please enter a meeting transcript to summarize.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      let targetMeetingId = meetingId;

      // If no meeting ID provided, create a new meeting first
      if (!targetMeetingId) {
        const meeting = await createMeeting({
          title: "Meeting Summary",
          transcript: transcript,
          customPrompt: customPrompt,
          date: new Date(),
          participants: [],
          status: 'pending'
        });

        targetMeetingId = meeting._id;
        setCurrentMeetingId(meeting._id);
      }

      // Then generate the summary
      const updatedMeeting = await generateSummary(targetMeetingId, customPrompt);

      if (updatedMeeting.summary) {
        setSummary(updatedMeeting.summary);
        toast({
          title: "Summary generated",
          description: "Meeting summary has been generated successfully.",
        });
      } else {
        throw new Error('No summary generated');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Error",
        description: "Failed to generate meeting summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!summary.trim()) {
      toast({
        title: "No summary to send",
        description: "Please generate a summary first.",
        variant: "destructive",
      });
      return;
    }

    if (!recipients.trim() || !currentMeetingId) {
      toast({
        title: "Missing recipients",
        description: "Please enter at least one email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const emailList = recipients.split(',').map(email => email.trim());
      await shareMeetingSummary(currentMeetingId, emailList);

      toast({
        title: "Summary shared!",
        description: `Meeting summary shared with ${emailList.length} recipient(s).`,
      });
    } catch (error) {
      console.error('Error sharing summary:', error);
      toast({
        title: "Error",
        description: "Failed to share the summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleTextFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setTranscript(result);
      }
    };
    reader.readAsText(file);
  };

  const getUploadStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Upload className="h-4 w-4" />;
    }
  };

  const getUploadStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Processing PDF...';
      case 'success':
        return 'PDF processed successfully!';
      case 'error':
        return 'PDF processing failed';
      default:
        return 'Upload PDF';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold gradient-text">
              AI Meeting Summarizer
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Transform your meeting transcripts into clear, actionable summaries with AI-powered intelligence.
            Share professional summaries with your team in seconds.
          </p>
        </div>

        {/* PDF Upload Section */}
        <Card className="surface-elevated">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <CardTitle>Upload PDF Document</CardTitle>
            </div>
            <CardDescription>
              Upload a PDF document to automatically extract text and generate summaries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="pdf-upload"
                disabled={isProcessingFile}
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  {getUploadStatusIcon()}
                  <span className="text-sm text-gray-600">
                    {getUploadStatusText()}
                  </span>
                  {uploadStatus === 'idle' && (
                    <>
                      <span className="text-xs text-gray-500">
                        Click to select or drag and drop
                      </span>
                      <span className="text-xs text-gray-400">
                        Supports PDF files up to 10MB
                      </span>
                    </>
                  )}
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Transcript Input */}
        <Card className="surface-elevated">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Meeting Transcript</CardTitle>
            </div>
            <CardDescription>
              Paste your meeting transcript below or upload a text file. The AI will analyze and summarize the key points.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Manual Text Input */}
            <Textarea
              placeholder="Paste your meeting transcript here... 

Example:
[10:00] John: Welcome everyone to today's quarterly review. Let's start with the budget update.
[10:02] Sarah: The Q3 numbers are looking strong. We're 15% ahead of projections.
[10:05] Mike: Great news! What about the new product launch timeline?
..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="min-h-[200px] resize-none bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
            />

            {/* Text File Upload Section */}
            {/* <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Or Upload Text File</label>
              <input
                type="file"
                accept=".txt,.doc,.docx"
                onChange={handleTextFileUpload}
                className="block w-full text-sm text-muted-foreground
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-primary/10 file:text-primary
          hover:file:bg-primary/20
        "
              />
            </div> */}

            <div className="text-sm text-muted-foreground">
              {transcript.length} characters
            </div>
          </CardContent>
        </Card>

        {/* Custom Prompt */}
        <Card className="surface-elevated">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Custom Instructions</CardTitle>
            </div>
            <CardDescription>
              Customize how the AI summarizes your meeting. Be specific about what you need.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter your custom instructions..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[100px] bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
            />
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => handleGenerateSummary()}
            disabled={isGenerating || !transcript.trim()}
            className="px-8 py-3 text-base"
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                Generating Summary...
              </>
            ) : (
              <>
                <Brain className="h-5 w-5" />
                Generate AI Summary
              </>
            )}
          </Button>
        </div>

        {/* Summary Output */}
        {summary && (
          <Card className="surface-elevated">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Generated Summary</CardTitle>
              </div>
              <CardDescription>
                Review and edit your summary below. You can modify any part before sharing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="min-h-[300px] bg-background/50 border-border/50 focus:border-primary/50 transition-colors font-mono text-sm"
              />
            </CardContent>
          </Card>
        )}

        {/* Email Sharing */}
        {summary && (
          <Card className="surface-elevated">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle>Share Summary</CardTitle>
              </div>
              <CardDescription>
                Send the summary to meeting participants and stakeholders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Recipient Email Addresses
                </label>
                <Input
                  placeholder="john@company.com, sarah@company.com, team@company.com"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                />
                <div className="mt-1 text-sm text-muted-foreground">
                  Separate multiple emails with commas
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleSendEmail}
                disabled={isSending || !summary.trim() || !recipients.trim()}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                    Sending Summary...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Share via Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Backend Notice */}
        <Card className="surface border-warning/20 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Brain className="h-5 w-8 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">AI Integration Ready</h3>
                <p className="text-muted-foreground text-sm">
                  The application is now fully integrated with Google Gemini AI for intelligent meeting summarization.
                  Upload PDFs or paste transcripts to get started!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MeetingSummarizer;