
import React, { useState } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import GeneratedImage from './components/GeneratedImage';
import LoadingOverlay from './components/LoadingOverlay';
import { generateTryOnImage, GeneratedImageResult } from './services/geminiService';
import ArrowRightIcon from './components/icons/ArrowRightIcon';

const App: React.FC = () => {
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [clothingFile, setClothingFile] = useState<File | null>(null);
  const [generatedResult, setGeneratedResult] = useState<GeneratedImageResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!personFile || !clothingFile) return;

    setIsLoading(true);
    setError(null);
    setGeneratedResult(null);

    try {
      const result = await generateTryOnImage(personFile, clothingFile);
      setGeneratedResult(result);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('发生未知错误。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 font-sans text-slate-800">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl mx-auto space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <ImageUploader title="1. 上传您的照片" onFileSelect={setPersonFile} />
            <ImageUploader title="2. 上传服装照片" onFileSelect={setClothingFile} />
          </div>

          <div className="text-center">
            <button
              onClick={handleGenerate}
              disabled={!personFile || !clothingFile || isLoading}
              className="w-full md:w-auto inline-flex items-center justify-center px-12 py-4 text-lg font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out shadow-lg hover:shadow-indigo-300 transform hover:-translate-y-1"
            >
              {isLoading ? '正在生成中...' : '一键生成'}
              {!isLoading && <ArrowRightIcon className="w-6 h-6 ml-3" />}
            </button>
          </div>

          {error && (
            <div className="w-full max-w-2xl mx-auto mt-4 p-4 text-red-800 bg-red-100 border-l-4 border-red-500 rounded-r-lg">
                <p className="font-bold">发生错误</p>
                <p>{error}</p>
            </div>
          )}

          {generatedResult && <GeneratedImage imageUrl={generatedResult.imageUrl ?? null} text={generatedResult.text ?? null} />}
        </div>
      </main>
      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
};

export default App;
