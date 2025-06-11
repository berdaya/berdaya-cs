"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ChatbotList from '@/components/ChatbotList';
import ChatbotForm from '@/components/ChatbotForm';

type Chatbot = {
  id: string;
  name: string;
  instructions: string;
  model: string;
  tools: string[];
  temperature: number;
  top_p: number;
  response_format: { type: string };
  file_ids: string[];
  createdAt: string;
  openai_api_key: string;
};

export default function Playground() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const loadChatbots = useCallback(async () => {
    try {
      const response = await fetch('/api/assistant');
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API returned non-JSON response:', contentType);
        setChatbots([]);
        setError('');
        return;
      }

      const data = await response.json();
      console.log('Received chatbot data:', data.data);
      
      if (response.ok) {
        setChatbots(data.data || []);
        setError('');
      } else {
        console.warn('API returned error:', data);
        setChatbots([]);
        setError('');
      }
    } catch (err: unknown) {
      console.error('Error loading assistants:', err);
      setChatbots([]);
      setError('');
    }
  }, []);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated !== 'true') {
      router.push('/');
      return;
    }
    
    loadChatbots();
  }, [router, loadChatbots]);
  
  const handleDeleteChatbot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assistant?')) {
      return;
    }
    
    setError('');
    
    try {
      const response = await fetch(`/api/assistant?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete assistant');
      }
      
      await loadChatbots();
      toast.success('Assistant deleted successfully');
      
    } catch (err: unknown) {
      console.error('Error deleting assistant:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast.error(errorMessage);
      setError(`Failed to delete assistant: ${errorMessage}`);
    }
  };

  const handleSubmit = async (formData: any) => {
    setIsUploading(true);
    setError('');

    try {
      let fileId = '';

      if (formData.file) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.file);
        uploadFormData.append('openai_api_key', formData.openai_api_key);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload file');
        }

        const uploadData = await uploadResponse.json();
        fileId = uploadData.file_id;
      }

      const assistantData = {
        name: formData.name,
        instructions: formData.instructions,
        model: formData.model,
        tools: formData.tools,
        temperature: formData.temperature,
        top_p: formData.top_p,
        response_format: formData.response_format,
        file_ids: fileId ? [fileId] : [],
        openai_api_key: formData.openai_api_key,
      };

      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assistantData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create assistant');
      }
      
      toast.success('Assistant created successfully');
      loadChatbots();
      setIsCreating(false);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Chatbot Playground</h1>
      
      {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-900 p-4 mb-8 rounded-r-lg" role="alert">
            <p className="font-medium">{error}</p>
        </div>
      )}
      
      {!isCreating ? (
          <ChatbotList
            chatbots={chatbots}
            onDelete={handleDeleteChatbot}
            onCreateNew={() => setIsCreating(true)}
          />
        ) : (
          <ChatbotForm
            onSubmit={handleSubmit}
            onCancel={() => setIsCreating(false)}
            isUploading={isUploading}
          />
                  )}
                </div>
    </div>
  );
}