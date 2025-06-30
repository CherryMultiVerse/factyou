import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Image, Loader2, AlertCircle, CheckCircle, X, Zap, Camera } from 'lucide-react';
import { InputProcessor } from '../services/inputProcessor';
import { InputDetectionResult } from '../types';

interface UnifiedInputProps {
  onSubmit: (claim: string, inputType?: string, metadata?: any) => void;
  isLoading: boolean;
}

const UnifiedInput: React.FC<UnifiedInputProps> = ({ onSubmit, isLoading }) => {
  const [input, setInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<InputDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentExample, setCurrentExample] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || detectionResult) && !isLoading && !processing) {
      const finalContent = detectionResult?.content || input.trim();
      onSubmit(finalContent, detectionResult?.type, detectionResult?.metadata);
    }
  };

  const processInput = useCallback(async (inputValue: string | File) => {
    setProcessing(true);
    setError(null);
    setDetectionResult(null);

    try {
      const result = await InputProcessor.processInput(inputValue);
      setDetectionResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Processing failed';
      setError(errorMessage);
      setDetectionResult(null);
    } finally {
      setProcessing(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    setError(null);
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    if (value.trim()) {
      // Set new timeout for processing
      debounceTimeoutRef.current = setTimeout(() => {
        processInput(value.trim());
      }, 1000);
    } else {
      setDetectionResult(null);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, etc.)');
      return;
    }
    
    // Clear text input when processing image
    setInput('');
    await processInput(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const clearInput = () => {
    setInput('');
    setDetectionResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Clear any pending timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  };

  const getStatusIcon = () => {
    if (processing) return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />;
    if (error) return <AlertCircle className="w-4 h-4 text-red-400" />;
    if (detectionResult) return <CheckCircle className="w-4 h-4 text-green-400" />;
    return null;
  };

  const getStatusText = () => {
    if (processing) return 'Processing...';
    if (error) return error;
    if (detectionResult) return InputProcessor.getInputTypeDescription(detectionResult);
    return null;
  };

  // Test cases for demo
  const exampleClaims = [
    "Vaccines contain microchips",
    "The Earth is flat",
    "Coffee is good for your health",
    "AI will destroy all jobs"
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExample(prev => (prev + 1) % exampleClaims.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleExampleClick = (example: string) => {
    setInput(example);
    // Clear any existing timeout and detection result when setting example
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    setDetectionResult(null);
    setError(null);
    
    // Process the example after a short delay
    debounceTimeoutRef.current = setTimeout(() => {
      processInput(example);
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Hero Section */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-hero text-white mb-4 sm:mb-6">
          Cut through the <span className="text-gradient">BS</span>
        </h2>
        <p className="text-subtitle text-gray-400 max-w-2xl mx-auto mb-6 sm:mb-8">
          AI-powered fact-checking across the political spectrum. 
          Submit text, links, or upload screenshots—we'll handle the rest.
        </p>
      </div>

      {/* Main Input Form - MOBILE OPTIMIZED */}
      <form onSubmit={handleSubmit} className="mb-6 sm:mb-8">
        <div 
          className={`relative transition-all duration-300 ${
            dragActive ? 'scale-[1.02]' : ''
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {/* Input Container - FIXED MOBILE LAYOUT */}
          <div className="relative">
            <textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Paste a claim, link, or upload a screenshot to fact-check..."
              rows={4}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 pr-4 sm:pr-40 input-field rounded-2xl text-white placeholder-gray-500 resize-none text-base sm:text-lg leading-relaxed"
              disabled={isLoading || processing}
              style={{ fontSize: '16px' }} // Prevent zoom on iOS
            />
            
            {/* Action Buttons Container - MOBILE RESPONSIVE */}
            <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0 sm:absolute sm:right-3 sm:top-3">
              {/* Mobile: Full width buttons */}
              <div className="flex gap-2 sm:hidden">
                {/* Clear Button */}
                {(input || detectionResult) && (
                  <button
                    type="button"
                    onClick={clearInput}
                    className="flex-1 p-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex items-center justify-center space-x-2"
                    title="Clear input"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm">Clear</span>
                  </button>
                )}
                
                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={processing}
                  className="flex-1 p-3 rounded-lg text-gray-400 hover:text-white transition-colors hover:bg-white/5 disabled:opacity-50 flex items-center justify-center space-x-2"
                  title="Upload screenshot"
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-sm">Upload</span>
                </button>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={(!input.trim() && !detectionResult) || isLoading || processing}
                  className="flex-1 px-4 py-3 cta-button rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  <span>Analyze</span>
                </button>
              </div>

              {/* Desktop: Compact buttons */}
              <div className="hidden sm:flex sm:items-start sm:space-x-2">
                {/* Clear Button */}
                {(input || detectionResult) && (
                  <button
                    type="button"
                    onClick={clearInput}
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex-shrink-0"
                    title="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={processing}
                  className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors hover:bg-white/5 disabled:opacity-50 flex-shrink-0"
                  title="Upload screenshot"
                >
                  <Upload className="w-4 h-4" />
                </button>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={(!input.trim() && !detectionResult) || isLoading || processing}
                  className="px-6 py-2 cta-button rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 flex-shrink-0 min-w-[100px] justify-center"
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Analyze</span>
                  <span className="sm:hidden">Go</span>
                </button>
              </div>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          
          {/* Drag Overlay */}
          {dragActive && (
            <div className="absolute inset-0 bg-black/80 border-2 border-dashed border-blue-500/50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Image className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-blue-400 font-medium text-lg">Drop your screenshot here</p>
                <p className="text-gray-400 text-sm mt-1">We'll extract the text automatically</p>
              </div>
            </div>
          )}
        </div>

        {/* Status Display */}
        {(processing || error || detectionResult) && (
          <div className="mt-4">
            <div className={`status-indicator ${
              error ? 'error' : processing ? 'processing' : 'success'
            }`}>
              {getStatusIcon()}
              <span>{getStatusText()}</span>
            </div>
          </div>
        )}
      </form>

      {/* Dynamic Example - MOBILE OPTIMIZED */}
      <div className="text-center">
        <button
          onClick={() => handleExampleClick(exampleClaims[currentExample])}
          disabled={isLoading || processing}
          className="inline-flex items-center space-x-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50 group"
        >
          <span>Try:</span>
          <span className="text-gradient font-medium group-hover:opacity-80 transition-opacity">
            "{exampleClaims[currentExample]}"
          </span>
        </button>
      </div>

      {/* Mobile OCR Instructions */}
      <div className="mt-6 sm:hidden">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Camera className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 font-medium text-sm">Screenshot Fact-Checking</span>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed">
            Upload screenshots of social media posts, news headlines, or any text you want fact-checked. 
            Our OCR technology will extract the text automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedInput;