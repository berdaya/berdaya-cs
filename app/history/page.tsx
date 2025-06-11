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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const router = useRouter();

  useEffect(() => {
    // Check system theme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mediaQuery.matches ? 'dark' : 'light');

    // Listen for theme changes
    const handleThemeChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleThemeChange);
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

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
      <div className={`min-h-screen p-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <h1 className={`text-3xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Chat History</h1>
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
    <div className={`min-h-screen p-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <h1 className={`text-3xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Chat History</h1>
        
        {error && (
          <div className={`border-l-4 p-4 mb-8 rounded-r-lg ${
            theme === 'dark' 
              ? 'bg-red-900/50 border-red-500 text-red-200' 
              : 'bg-red-50 border-red-500 text-red-900'
          }`} role="alert">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Threads List */}
          <div className={`rounded-lg shadow p-6 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Conversations</h2>
            {threads.length === 0 ? (
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>No conversations found</p>
            ) : (
              <div className="space-y-2">
                {threads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => fetchThreadMessages(thread.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors cursor-pointer ${
                      selectedThread === thread.id
                        ? theme === 'dark'
                          ? 'bg-blue-900/50 text-blue-300'
                          : 'bg-blue-50 text-blue-700'
                        : theme === 'dark'
                          ? 'hover:bg-gray-700 text-gray-200'
                          : 'hover:bg-gray-50 text-gray-900'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {thread.customer.name}
                      </span>
                    </div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
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
          <div className={`md:col-span-2 rounded-lg shadow p-6 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Messages</h2>
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
                  className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Export to JSON
                </button>
              )}
            </div>
            {selectedThread ? (
              messages.length === 0 ? (
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>No messages in this conversation</p>
              ) : (
                <div className="space-y-4">
                  {[...messages].reverse().map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.role === 'assistant'
                          ? theme === 'dark'
                            ? 'bg-blue-900/50'
                            : 'bg-blue-50'
                          : theme === 'dark'
                            ? 'bg-gray-700'
                            : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {message.role === 'assistant' ? 'Assistant' : 'User'}
                        </span>
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className={`whitespace-pre-wrap ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Select a conversation to view messages</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}