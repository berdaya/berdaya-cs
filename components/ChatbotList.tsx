import { Plus } from 'lucide-react';
import ChatbotCard from './ChatbotCard';

type Chatbot = {
  id: string;
  name: string;
  instructions: string;
  createdAt: string;
  vectorStoreId?: string;
  file_ids?: string[];
};

type ChatbotListProps = {
  chatbots: Chatbot[];
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  className?: string;
};

export default function ChatbotList({ chatbots, onDelete, onCreateNew, className }: ChatbotListProps) {
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Your Chatbots</h2>
        <button 
          onClick={onCreateNew}
          className="bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Chatbot
        </button>
      </div>
      
      {chatbots.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-lg text-center border border-gray-200">
          <p className="text-gray-600">You haven&apos;t created any chatbots yet.</p>
          <button 
            onClick={onCreateNew}
            className="mt-4 bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors flex items-center mx-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Chatbot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chatbots.map(chatbot => (
            <ChatbotCard
              key={chatbot.id}
              chatbot={chatbot}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
} 