"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

type Message = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

type Thread = {
  id: string;
  openaiId: string;
  createdAt: string;
  messageCount: number;
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
};

export default function HistoryPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      
      if (isAuthenticated !== 'true') {
        router.push('/');
        return false;
      }
      return true;
    };

    if (checkAuth()) {
      fetchThreads();
    }
  }, [router]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/threads');
      if (!response.ok) {
        throw new Error('Failed to fetch threads');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch threads');
      }
      setThreads(data.threads || []);
    } catch (err) {
      console.error('Error fetching threads:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch threads');
      setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchThreadMessages = async (threadId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/threads/${threadId}/messages`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch messages');
      }
      setMessages(data.messages || []);
      setSelectedThread(threadId);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !threads.length) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Chat History</h1>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Chat History</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-900 p-4 mb-8 rounded-r-lg" role="alert">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Threads List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Conversations</h2>
            {threads.length === 0 ? (
              <p className="text-gray-500">No conversations found</p>
            ) : (
              <div className="space-y-2">
                {threads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => fetchThreadMessages(thread.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors cursor-pointer ${
                      selectedThread === thread.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {thread.customer.name}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {thread.customer.email && (
                        <div>Email: {thread.customer.email}</div>
                      )}
                      {thread.customer.phone && (
                        <div>Phone: {thread.customer.phone}</div>
                      )}
                      <div>Created: {new Date(thread.createdAt).toLocaleString()}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
              {selectedThread && messages.length > 0 && (
                <button
                  onClick={() => {
                    const exportData = {
                      threadId: selectedThread,
                      messages: [...messages].reverse(),
                      customer: threads.find(t => t.id === selectedThread)?.customer
                    };
                    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `conversation-${selectedThread}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Export to JSON
                </button>
              )}
            </div>
            {selectedThread ? (
              messages.length === 0 ? (
                <p className="text-gray-500">No messages in this conversation</p>
              ) : (
                <div className="space-y-4">
                  {[...messages].reverse().map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.role === 'assistant'
                          ? 'bg-blue-50'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">
                          {message.role === 'assistant' ? 'Assistant' : 'User'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-gray-700 whitespace-pre-wrap">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <p className="text-gray-500">Select a conversation to view messages</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}