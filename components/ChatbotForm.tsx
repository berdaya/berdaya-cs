import { useState, useRef } from 'react';
import { ArrowLeft, Info, Upload, Loader2 } from 'lucide-react';

type ChatbotFormData = {
  name: string;
  instructions: string;
  model: string;
  tools: string[];
  temperature: number;
  top_p: number;
  response_format: { type: string };
  file: File | null;
  openai_api_key: string;
};

type ChatbotFormProps = {
  onSubmit: (formData: ChatbotFormData) => Promise<void>;
  onCancel: () => void;
  isUploading: boolean;
};

export default function ChatbotForm({ onSubmit, onCancel, isUploading }: ChatbotFormProps) {
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [model, setModel] = useState('gpt-4-turbo-preview');
  const [tools, setTools] = useState<string[]>(['retrieval']);
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(1);
  const [responseFormat] = useState({ type: 'text' });
  const [file, setFile] = useState<File | null>(null);
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const allowedExtensions = ['.txt', '.pdf', '.doc', '.docx'];
      
      if (allowedTypes.includes(selectedFile.type) || allowedExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext))) {
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      instructions,
      model,
      tools,
      temperature,
      top_p: topP,
      response_format: responseFormat,
      file,
      openai_api_key: openaiApiKey,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center mb-6">
        <button
          onClick={onCancel}
          className="mr-4 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900">
          Create New Chatbot
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-100 p-4 rounded-lg mb-6 text-sm border border-gray-200">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-gray-900 mr-2 mt-0.5" />
            <p className="text-gray-900">
              Fill out this form to configure your chatbot. You&apos;ll need an OpenAI API key and a prompt that defines how your chatbot should behave.
            </p>
          </div>
        </div>
        
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">API Configuration</h3>
          
          <div className="mb-4">
            <label htmlFor="openaiApiKey" className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI API Key *
            </label>
            <input
              type="password"
              id="openaiApiKey"
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-colors"
              placeholder="sk-..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Your API key will be stored securely and used only for this chatbot. Get your API key from{' '}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-900 hover:text-gray-700"
              >
                OpenAI Platform
              </a>
            </p>
          </div>
        </div>
        
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Basic Information</h3>
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Chatbot Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-colors"
              placeholder="My Awesome Chatbot"
              required
            />
          </div>
          
          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
              Instructions *
            </label>
            <div className="mb-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setInstructions(`You are a helpful customer service chatbot. Your goal is to assist customers with their questions about our products and services. Always be polite, professional, and empathetic. If you don't know the answer to a question, acknowledge that and offer to connect the customer with a human agent.`)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-900 px-2 py-1 rounded transition-colors"
              >
                Basic Customer Service
              </button>
              <button
                type="button"
                onClick={() => setInstructions(`You are a friendly and knowledgeable customer service chatbot. Your primary goal is to help customers with product inquiries, order status, and general support. Always maintain a positive tone and provide clear, concise information. If a customer seems frustrated, acknowledge their feelings and offer appropriate solutions.`)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-900 px-2 py-1 rounded transition-colors"
              >
                Product Support
              </button>
            </div>
            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-colors"
              rows={6}
              required
              placeholder="You are a helpful customer service chatbot for [company name]. Your goal is to assist customers with their questions about our products and services..."
            />
          </div>
        </div>
        
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Chatbot Configuration</h3>
          
          <div className="mb-4">
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              Model *
            </label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-colors"
              required
            >
              <optgroup label="GPT-4 Models">
                <option value="gpt-4-turbo-preview">GPT-4 Turbo (Latest)</option>
                <option value="gpt-4-1106-preview">GPT-4 Turbo (November 2023)</option>
                <option value="gpt-4-vision-preview">GPT-4 Vision</option>
              </optgroup>
              <optgroup label="GPT-3.5 Models">
                <option value="gpt-3.5-turbo-0125">GPT-3.5 Turbo (Latest)</option>
                <option value="gpt-3.5-turbo-1106">GPT-3.5 Turbo (November 2023)</option>
              </optgroup>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="tools" className="block text-sm font-medium text-gray-700 mb-1">
              Tools
            </label>
            <select
              id="tools"
              value={tools}
              onChange={(e) => setTools(e.target.value.split(','))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-colors"
              multiple
            >
              <option value="retrieval">Retrieval</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
              Temperature: {temperature}
            </label>
            <input
              type="range"
              id="temperature"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              min={0}
              max={2}
              step={0.1}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 (More Focused)</span>
              <span>2 (More Creative)</span>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="topP" className="block text-sm font-medium text-gray-700 mb-1">
              Top P: {topP}
            </label>
            <input
              type="range"
              id="topP"
              value={topP}
              onChange={(e) => setTopP(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              min={0}
              max={1}
              step={0.1}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 (More Focused)</span>
              <span>1 (More Diverse)</span>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
            Knowledge Files (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-md px-6 pt-5 pb-6">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file" className="relative cursor-pointer bg-white rounded-md font-medium text-gray-900 hover:text-gray-800 focus-within:outline-none">
                  <span>Upload a file</span>
                  <input
                    id="file"
                    name="file"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="sr-only"
                    accept=".txt,.pdf,.doc,.docx"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                Supported formats: TXT, PDF, DOC, DOCX (up to 10MB)
              </p>
              {file && (
                <p className="text-sm text-gray-900">
                  Selected: {file.name}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={isUploading}
            className="flex-1 bg-gray-900 text-white py-3 px-4 rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors flex items-center justify-center"
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Processing...
              </>
            ) : 'Create Chatbot'}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-900 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
} 