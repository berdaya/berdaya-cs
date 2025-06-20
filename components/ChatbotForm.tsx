import { useState, useRef } from 'react';
import { ArrowLeft, Info, Upload, Loader2, X } from 'lucide-react';

type ChatbotFormData = {
  name: string;
  instructions: string;
  model: string;
  tools: string[];
  temperature: number;
  top_p: number;
  response_format: { type: string };
  files: File[];
};

type ChatbotFormProps = {
  onSubmit: (formData: ChatbotFormData) => Promise<void>;
  onCancel: () => void;
  isUploading: boolean;
};

const AI_MODELS = [
  { id: 'gpt-4o-mini', name: 'GPT-4o-mini (Default)' },
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K' },
];

export default function ChatbotForm({ onSubmit, onCancel, isUploading }: ChatbotFormProps) {
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [tools, setTools] = useState<string[]>(['retrieval']);
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(1);
  const [responseFormat] = useState({ type: 'text' });
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => 
        file.name.toLowerCase().endsWith('.txt')
      );

      setFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
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
      files,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-6">
        <button
          onClick={onCancel}
          className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Create New Chatbot
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6 text-sm border border-gray-200 dark:border-gray-600">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-gray-900 dark:text-gray-200 mr-2 mt-0.5" />
            <p className="text-gray-900 dark:text-gray-200">
              Fill out this form to configure your chatbot. You&apos;ll need a prompt that defines how your chatbot should behave.
            </p>
          </div>
        </div>
        
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Basic Information</h3>
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Chatbot Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-gray-500 dark:focus:ring-gray-400 dark:focus:border-gray-400 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="My Awesome Chatbot"
              required
            />
          </div>
          
          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Instructions *
            </label>
            <div className="mb-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setInstructions(`You are a helpful customer service chatbot. Your goal is to assist customers with their questions about our products and services. Always be polite, professional, and empathetic. If you don't know the answer to a question, acknowledge that and offer to connect the customer with a human agent.`)}
                className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-200 px-2 py-1 rounded transition-colors"
              >
                Basic Customer Service
              </button>
              <button
                type="button"
                onClick={() => setInstructions(`You are a friendly and knowledgeable customer service chatbot. Your primary goal is to help customers with product inquiries, order status, and general support. Always maintain a positive tone and provide clear, concise information. If a customer seems frustrated, acknowledge their feelings and offer appropriate solutions.`)}
                className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-200 px-2 py-1 rounded transition-colors"
              >
                Product Support
              </button>
            </div>
            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-gray-500 dark:focus:ring-gray-400 dark:focus:border-gray-400 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              rows={6}
              required
              placeholder="You are a helpful customer service chatbot for [company name]. Your goal is to assist customers with their questions about our products and services..."
            />
          </div>
        </div>
        
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Chatbot Configuration</h3>
          
          <div className="mb-4">
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              AI Model
            </label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-gray-500 dark:focus:ring-gray-400 dark:focus:border-gray-400 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {AI_MODELS.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              View model pricing at{' '}
              <a 
                href="https://platform.openai.com/docs/pricing" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-900 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-400"
              >
                OpenAI Platform
              </a>
            </p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="tools" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tools
            </label>
            <select
              id="tools"
              value={tools}
              onChange={(e) => setTools(e.target.value.split(','))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-gray-500 dark:focus:ring-gray-400 dark:focus:border-gray-400 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              multiple
            >
              <option value="retrieval">Retrieval</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Temperature: {temperature}
            </label>
            <input
              type="range"
              id="temperature"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              min={0}
              max={2}
              step={0.1}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0 (More Focused)</span>
              <span>2 (More Creative)</span>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="topP" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Top P: {topP}
            </label>
            <input
              type="range"
              id="topP"
              value={topP}
              onChange={(e) => setTopP(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              min={0}
              max={1}
              step={0.1}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0 (More Focused)</span>
              <span>1 (More Diverse)</span>
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="files" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Knowledge Files (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md px-6 pt-5 pb-6">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                <label htmlFor="files" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-gray-900 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-300 focus-within:outline-none">
                  <span>Upload files</span>
                  <input
                    id="files"
                    name="files"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="sr-only"
                    accept=".txt"
                    multiple
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Only .txt files are supported (up to 10MB each)
              </p>
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <span className="text-sm text-gray-900 dark:text-gray-200 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isUploading}
            className="flex-1 bg-gray-900 dark:bg-gray-700 text-white py-3 px-4 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 disabled:bg-gray-400 dark:disabled:bg-gray-500 transition-colors flex items-center justify-center"
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
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 py-3 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
} 