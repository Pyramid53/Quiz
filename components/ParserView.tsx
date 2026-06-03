
import React, { useState, useRef } from 'react';
import { extractQuestionsFromFiles, FileData } from '../services/aiService';
import { Question } from '../types';

interface ParserViewProps {
  onGenerate: (text: string) => void;
  onQuestionsFound: (questions: Question[]) => void;
}

const ParserView: React.FC<ParserViewProps> = ({ onGenerate, onQuestionsFound }) => {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileCount, setFileCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFileAsBase64 = (file: File): Promise<FileData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        data: reader.result as string,
        mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg')
      });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsAnalyzing(true);
    setFileCount(files.length);
    
    try {
      // Fix: Added explicit (file: File) type to the map callback to prevent 'unknown' error
      const filePromises = Array.from(files).map((file: File) => readFileAsBase64(file));
      const base64Files = await Promise.all(filePromises);
      
      const questions = await extractQuestionsFromFiles(base64Files);
      
      if (questions.length > 0) {
        onQuestionsFound(questions);
      } else {
        alert("We could not extract any questions from the selected files. Please ensure the text is clear.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while processing the files. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setFileCount(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border-t-8 border-indigo-700 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Quiz Generator 2.0</h1>
        <p className="text-gray-600">Upload images or PDFs of exam sheets, or paste text to convert it into an interactive quiz.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Text Input Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 flex flex-col">
          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
            <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs">1</span>
            Manual Text Input
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your questions here... "
            className="w-full flex-1 min-h-[250px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-left text-sm"
            dir="ltr"
          />
          <button
            onClick={() => onGenerate(text)}
            disabled={!text.trim() || isAnalyzing}
            className="mt-4 w-full bg-indigo-700 text-white font-bold py-3 rounded-lg hover:bg-indigo-800 disabled:opacity-50 transition-all shadow-sm"
          >
            Convert Text to Quiz
          </button>
        </div>

        {/* AI File Upload Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 flex flex-col">
          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
            <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs">2</span>
            Smart File Analysis (PDF / Images)
          </label>
          
          <div 
            onClick={() => !isAnalyzing && fileInputRef.current?.click()}
            className={`flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 cursor-pointer transition-all ${isAnalyzing ? 'bg-gray-50 border-indigo-300' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'}`}
          >
            {isAnalyzing ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto mb-4"></div>
                <p className="text-indigo-700 font-semibold animate-pulse">Analyzing {fileCount} AI files...</p>
                <p className="text-gray-400 text-xs mt-2">This may take a few seconds</p>
              </div>
            ) : (
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-gray-600 font-medium">Click to choose one or more images</p>
                <p className="text-gray-400 text-xs mt-1">You can also choose PDF files</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,application/pdf" 
              multiple
              onChange={handleFileUpload}
              disabled={isAnalyzing}
            />
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700 leading-relaxed text-left">
            <strong>Tip:</strong> You can now select multiple images at once or a multi-page PDF document, and all questions will be combined into a single quiz.
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-3 text-left">How does multi-file analysis work?</h3>
        <p className="text-gray-600 text-sm leading-relaxed text-left">
          The Artificial Intelligence (Gemini 3) reads all uploaded files simultaneously, aggregates the questions, options, and sample answers with high accuracy, and then constructs your interactive quiz model.
        </p>
      </div>
    </div>
  );
};

export default ParserView;
