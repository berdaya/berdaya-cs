"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
  thread_id: string;
}

interface Thread {
  id: string;
  openaiId: string;
  assistantId: string;
  created_at: string;
  updated_at: string;
  assistant: {
    id: string;
    name: string;
  };
}

interface Assistant {
  id: string;
  name: string;
  instructions: string;
  model: string;
  created_at: string;
}

export default function History() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if access is already granted
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated !== 'true') {
      router.push('/');
      return;
    }

    // Fetch data
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      // Fetch assistants
      const assistantsResponse = await fetch('/api/assistant');
      if (assistantsResponse.ok) {
        const assistantsData = await assistantsResponse.json();
        setAssistants(assistantsData.data || []);
      } else {
        console.warn('Failed to fetch assistants');
        setAssistants([]);
      }

      // Fetch threads
      const threadsResponse = await fetch('/api/thread');
      if (threadsResponse.ok) {
        const threadsData = await threadsResponse.json();
        setThreads(threadsData.data || []);
      } else {
        console.warn('Failed to fetch threads');
        setThreads([]);
      }

      // Fetch messages for each thread
      const allMessages: Message[] = [];
      for (const thread of threads) {
        const messagesResponse = await fetch(`/api/thread/${thread.id}/messages`);
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          allMessages.push(...(messagesData.data || []));
        }
      }
      setMessages(allMessages);

      setError(''); // Clear any existing errors
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty states for all data
      setAssistants([]);
      setThreads([]);
      setMessages([]);
      setError('Failed to load data. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Chat History</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            {error}
          </div>
        )}

        {/* Assistants Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Assistants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assistants.map((assistant) => (
              <div key={assistant.id} className="border rounded-md p-4">
                <h3 className="font-medium">{assistant.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{assistant.model}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Created: {new Date(assistant.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Threads Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Conversation Threads</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assistant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {threads.map((thread) => (
                  <tr key={thread.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assistants.find(a => a.id === thread.assistantId)?.name || 'Unknown Assistant'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(thread.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(thread.updated_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {messages.filter(m => m.thread_id === thread.id).length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Messages Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Messages</h2>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-medium ${message.role === 'user' ? 'text-blue-600' : 'text-green-600'}`}>
                    {message.role === 'user' ? 'User' : 'Assistant'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(message.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-900">{message.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}