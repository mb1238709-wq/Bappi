import React, { useState } from 'react';
import { Wand2, Download, Zap, RefreshCw, AlertCircle, Info, Sparkles, Image as ImageIcon } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { Button } from './components/Button';
import { editImageWithGemini } from './services/geminiService';
import { AppStatus, ImageState } from './types';

const INITIAL_IMAGE_STATE: ImageState = {
  file: null,
  previewUrl: null,
  base64Data: null,
  mimeType: '',
};

export default function App() {
  const [originalImage, setOriginalImage] = useState<ImageState>(INITIAL_IMAGE_STATE);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!originalImage.base64Data || !prompt.trim()) return;

    setStatus(AppStatus.LOADING);
    setErrorMsg(null);
    setGeneratedImageUrl(null);

    try {
      const resultDataUrl = await editImageWithGemini(
        originalImage.base64Data,
        originalImage.mimeType,
        prompt
      );
      setGeneratedImageUrl(resultDataUrl);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong while generating the image.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleDownload = () => {
    if (generatedImageUrl) {
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = `nano-banana-edit-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-10 border-b border-gray-800 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-gray-900 p-3 rounded-2xl border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              <Zap className="w-8 h-8 text-yellow-500" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                Nano Banana <span className="text-yellow-500">Studio</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500 text-black uppercase tracking-wider">
                  Beta
                </span>
                <p className="text-gray-400 text-sm font-medium">Powered by Gemini 2.5 Flash Image</p>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-400 bg-gray-900/80 px-4 py-2 rounded-full border border-gray-800 shadow-sm">
            <Info className="w-4 h-4 text-yellow-500" />
            <span>Upload an image, describe edits, see magic happen.</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Input & Controls */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Step 1: Upload */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-yellow-500 text-black font-bold text-sm shadow-[0_0_10px_rgba(234,179,8,0.4)]">1</span>
              Upload Source Image
            </h2>
            <ImageUploader 
              imageState={originalImage} 
              onImageChange={setOriginalImage} 
              onClear={() => {
                setOriginalImage(INITIAL_IMAGE_STATE);
                setGeneratedImageUrl(null);
                setStatus(AppStatus.IDLE);
                setErrorMsg(null);
              }}
            />
          </section>

          {/* Step 2: Prompt */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-yellow-500 text-black font-bold text-sm shadow-[0_0_10px_rgba(234,179,8,0.4)]">2</span>
              Describe Desired Changes
            </h2>
            <div className="relative group">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Examples:&#10;- Turn this into a cyberpunk city&#10;- Add a cute cat to the sofa&#10;- Make it look like a Van Gogh painting"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 h-40 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none shadow-inner text-base leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-gray-500 bg-gray-950/80 px-2 py-1 rounded border border-gray-800">
                <Sparkles className="w-3 h-3 text-yellow-500" />
                Gemini 2.5
              </div>
            </div>
            
            <div className="pt-2">
              <Button 
                onClick={handleGenerate} 
                disabled={!originalImage.file || !prompt.trim()}
                isLoading={status === AppStatus.LOADING}
                className="w-full text-lg py-4 shadow-lg hover:shadow-yellow-500/20"
                icon={<Wand2 className="w-5 h-5" />}
              >
                {status === AppStatus.LOADING ? 'Processing Edit...' : 'Generate Edit'}
              </Button>
            </div>

            {errorMsg && (
              <div className="bg-red-950/30 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-start gap-3 text-sm animate-fade-in shadow-lg">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Result */}
        <div className="lg:col-span-7 space-y-4 flex flex-col">
           <h2 className="text-lg font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-yellow-500 text-black font-bold text-sm shadow-[0_0_10px_rgba(234,179,8,0.4)]">3</span>
              Result
            </h2>
          
          <div className="flex-1 w-full min-h-[400px] lg:min-h-[500px] bg-gray-900 rounded-2xl border-2 border-gray-800 overflow-hidden relative flex items-center justify-center group shadow-2xl">
            
            {/* IDLE State: Placeholder */}
            {status === AppStatus.IDLE && !generatedImageUrl && (
              <div className="text-center text-gray-600 p-8 flex flex-col items-center max-w-sm">
                <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
                  <Wand2 className="w-10 h-10 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Ready to Create</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Upload an image and describe your edits to see the AI generation appear here.
                </p>
              </div>
            )}

            {/* LOADING State: Show Original with Scanning Effect */}
            {status === AppStatus.LOADING && (
              <>
                {/* Background: Original Image (blurred/darkened) */}
                {originalImage.previewUrl && (
                  <img 
                    src={originalImage.previewUrl} 
                    alt="Processing Context" 
                    className="absolute inset-0 w-full h-full object-contain opacity-50 blur-[2px]"
                  />
                )}
                
                {/* Scanning Overlay */}
                <div className="absolute inset-0 z-10 bg-black/40">
                  <div className="w-full h-1 bg-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.8)] animate-scan drop-shadow-2xl"></div>
                </div>

                {/* Central Loader */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                  <div className="bg-black/80 backdrop-blur-md p-6 rounded-2xl border border-gray-700 shadow-2xl flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-gray-700 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-yellow-400 font-bold tracking-wider animate-pulse text-sm">PROCESSING</p>
                    <p className="text-gray-400 text-xs mt-2">Gemini is editing pixels...</p>
                  </div>
                </div>
              </>
            )}

            {/* SUCCESS State: Generated Image */}
            {generatedImageUrl && status !== AppStatus.LOADING && (
              <div className="relative w-full h-full flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                <img 
                  src={generatedImageUrl} 
                  alt="Generated Result" 
                  className="w-full h-full object-contain max-h-[70vh]" 
                />
                
                <div className="absolute top-4 left-4 flex gap-2">
                   <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold border border-yellow-400 shadow-xl flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI EDITED
                   </div>
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <Button 
                    onClick={handleDownload}
                    variant="primary"
                    className="shadow-2xl hover:scale-105 active:scale-95"
                    icon={<Download className="w-4 h-4" />}
                  >
                    Download Image
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Success footer */}
          {status === AppStatus.SUCCESS && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-between items-center animate-fade-in shadow-md">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="bg-green-500/20 p-1.5 rounded-full text-green-400 border border-green-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Image generation complete!</span>
              </div>
              <button 
                onClick={() => setStatus(AppStatus.IDLE)} 
                className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-2 hover:bg-gray-800 px-3 py-1.5 rounded-lg"
              >
                <RefreshCw className="w-3 h-3" />
                Start Over
              </button>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}