import { Code, Trash2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

type FileInfo = {
  id: string;
  filename: string;
  status: string;
};

type ChatbotCardProps = {
  chatbot: {
    id: string;
    name: string;
    instructions: string;
    createdAt: string;
    vectorStoreId?: string;
    file_ids?: string[];
    files?: FileInfo[];
  };
  onDelete: (id: string) => void;
};

export default function ChatbotCard({ chatbot, onDelete }: ChatbotCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow transition-shadow">
      <div className="p-5">
        <h3 className="text-lg font-bold mb-2 text-gray-900">{chatbot.name}</h3>
        <p className="text-sm text-gray-600 mb-3 truncate">{chatbot.instructions || 'No instructions specified'}</p>
        <p className="text-xs text-gray-500 mb-4">
          Created: {chatbot.createdAt ? new Date(chatbot.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'Date not available'}
        </p>
        
        {chatbot.vectorStoreId && (
          <div className="mb-4">
            <div 
              className="flex items-center text-sm text-gray-600 mb-2 cursor-pointer hover:text-gray-900"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <FileText className="h-4 w-4 mr-1" />
              <span>Knowledge Base</span>
              {chatbot.files && chatbot.files.length > 0 && (
                <span className="ml-2 text-xs text-gray-500">
                  ({chatbot.files.length} file{chatbot.files.length !== 1 ? 's' : ''})
                </span>
              )}
              {chatbot.files && chatbot.files.length > 0 && (
                <span className="ml-auto">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              )}
            </div>
            {isExpanded && chatbot.files && chatbot.files.length > 0 && (
              <div className="text-xs text-gray-500 pl-5">
                <ul className="list-disc list-inside space-y-1">
                  {chatbot.files.map(file => (
                    <li key={file.id} className="text-gray-600">
                      {file.filename} ({file.status})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(!chatbot.files || chatbot.files.length === 0) && (
              <div className="text-xs text-gray-500 pl-5">
                No files attached
              </div>
            )}
          </div>
        )}
        
        <div className="flex space-x-2">
          <button
            onClick={() => onDelete(chatbot.id)}
            className="flex-1 bg-gray-200 text-gray-900 text-sm py-2 px-3 rounded hover:bg-gray-300 transition-colors flex items-center justify-center"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </button>
        </div>
      </div>
      <div className="bg-gray-100 p-4 border-t border-gray-200">
        <details className="text-sm">
          <summary className="cursor-pointer font-medium flex items-center text-gray-900">
            <Code className="h-4 w-4 mr-1" />
            Embed Code
          </summary>
          <div className="mt-2 p-2 bg-gray-200 rounded text-xs break-all relative">
            <code className="text-gray-900">
              {`<script src="${window.location.origin}/embed.js" data-chatbot-id="${chatbot.id}" data-host-url="${window.location.origin}"></script>`}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `<script src="${window.location.origin}/embed.js" data-chatbot-id="${chatbot.id}" data-host-url="${window.location.origin}"></script>`
                );
                alert('Embed code copied to clipboard!');
              }}
              className="mt-2 text-xs bg-gray-900 text-white py-1 px-2 rounded hover:bg-gray-800 transition-colors"
            >
              Copy to Clipboard
            </button>
          </div>
        </details>
      </div>
    </div>
  );
} 