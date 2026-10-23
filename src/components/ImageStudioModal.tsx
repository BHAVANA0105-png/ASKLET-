import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Image as ImageIcon, 
  Upload, 
  Wand2, 
  Download, 
  Share2, 
  RefreshCw, 
  Layers, 
  Check, 
  AlertCircle,
  Camera,
  Scissors
} from 'lucide-react';

interface ImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToChat?: (imageUrl: string, promptText: string) => void;
  initialPrompt?: string;
  initialImage?: string;
}

export const ImageStudioModal: React.FC<ImageStudioModalProps> = ({
  isOpen,
  onClose,
  onInsertToChat,
  initialPrompt = '',
  initialImage
}) => {
  const [mode, setMode] = useState<'generate' | 'edit'>(initialImage ? 'edit' : 'generate');
  const [prompt, setPrompt] = useState(initialPrompt);
  const [editInstruction, setEditInstruction] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [sourceImage, setSourceImage] = useState<string | null>(initialImage || null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Image must be under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSourceImage(event.target?.result as string);
      setMode('edit');
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio: aspectRatio
        })
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setResultImage(data.imageUrl);
      } else {
        setError(data.error || 'Failed to generate image. Please try another prompt.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while generating image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceImage || !editInstruction.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/image/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: sourceImage,
          instruction: editInstruction.trim()
        })
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setResultImage(data.imageUrl);
      } else {
        setError(data.error || 'Failed to apply image edits.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while editing image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = `asklet_image_${Date.now()}.png`;
    a.click();
  };

  const handleCopyLink = () => {
    if (!resultImage) return;
    navigator.clipboard.writeText(resultImage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertToActiveChat = () => {
    if (!resultImage) return;
    const desc = mode === 'generate' ? prompt : editInstruction;
    onInsertToChat?.(resultImage, desc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#242424] rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#333333] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center font-bold shadow-sm">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                Asklet Image Studio
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#181818] border border-[#333333] text-white">
                  Multimodal
                </span>
              </h2>
              <p className="text-xs text-[#A3A3A3]">
                Generate diagrams, concept art, and edit existing visuals with natural language
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-[#A3A3A3] hover:text-white hover:bg-[#181818] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-[#333333] flex items-center gap-2">
          <button
            onClick={() => setMode('generate')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'generate'
                ? 'bg-white text-black shadow-xs'
                : 'bg-[#181818] border border-[#333333] text-[#A3A3A3] hover:text-white hover:bg-[#2f2f2f]'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Generate from Text</span>
          </button>

          <button
            onClick={() => setMode('edit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'edit'
                ? 'bg-white text-black shadow-xs'
                : 'bg-[#181818] border border-[#333333] text-[#A3A3A3] hover:text-white hover:bg-[#2f2f2f]'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Edit or Restyle Image</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">

          {error && (
            <div className="p-3 rounded-2xl bg-[#181818] border border-[#444444] flex items-start gap-2.5 text-xs text-white">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-white" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode 1: Text to Image */}
          {mode === 'generate' && (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Describe the image or diagram to create
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A clear scientific diagram of human cellular respiration with labeled mitochondria, high detail..."
                  className="w-full p-3 text-xs sm:text-sm rounded-2xl bg-[#181818] border border-[#333333] text-white placeholder:text-[#A3A3A3] focus:outline-none focus:border-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '1:1', label: 'Square (1:1)' },
                    { id: '16:9', label: 'Landscape (16:9)' },
                    { id: '9:16', label: 'Portrait (9:16)' },
                  ].map((ratio) => (
                    <button
                      type="button"
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id as any)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        aspectRatio === ratio.id
                          ? 'border-white bg-white text-black'
                          : 'border-[#333333] bg-[#181818] text-[#A3A3A3] hover:text-white hover:bg-[#2f2f2f]'
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-[#A3A3A3]">Quick Prompts:</span>
                {[
                  'Neuron synapse with neurotransmitters',
                  'Supply and Demand equilibrium graph',
                  'Solar eclipse orbital geometry',
                  'Futuristic minimalist library campus'
                ].map((sample) => (
                  <button
                    type="button"
                    key={sample}
                    onClick={() => setPrompt(sample)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-[#181818] border border-[#333333] text-white hover:bg-[#2f2f2f] cursor-pointer"
                  >
                    {sample}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="w-full py-3 rounded-2xl bg-white hover:bg-[#eaeaea] disabled:opacity-30 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Rendering Visual with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Visual</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Mode 2: Edit Existing Image */}
          {mode === 'edit' && (
            <form onSubmit={handleEdit} className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />

              {/* Source image preview or upload box */}
              {sourceImage ? (
                <div className="relative rounded-2xl overflow-hidden border border-[#333333] bg-[#181818] max-h-56 flex items-center justify-center group">
                  <img src={sourceImage} alt="Source" className="max-h-56 object-contain" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#eaeaea] cursor-pointer"
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setSourceImage(null)}
                      className="px-3 py-1.5 rounded-xl bg-[#242424] border border-[#333333] text-white font-bold text-xs hover:bg-[#2f2f2f] cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 rounded-2xl border-2 border-dashed border-[#333333] hover:border-white cursor-pointer flex flex-col items-center justify-center text-center space-y-2 bg-[#181818] transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#242424] border border-[#333333] text-white flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Upload an image or screenshot to edit
                    </p>
                    <p className="text-[11px] text-[#A3A3A3]">
                      PNG, JPG, WebP up to 8MB
                    </p>
                  </div>
                </div>
              )}

              {sourceImage && (
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    What changes or edits would you like?
                  </label>
                  <input
                    type="text"
                    value={editInstruction}
                    onChange={(e) => setEditInstruction(e.target.value)}
                    placeholder="e.g. Turn into an architectural blueprint, remove the background, add lighting..."
                    className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-2xl bg-[#181818] border border-[#333333] text-white placeholder:text-[#A3A3A3] focus:outline-none focus:border-white"
                    required
                  />

                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] font-bold text-[#A3A3A3]">Presets:</span>
                    {[
                      'Convert to hand-drawn sketch',
                      'High-contrast scientific diagram',
                      'Remove background noise',
                      'Watercolor illustration style'
                    ].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setEditInstruction(preset)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#181818] border border-[#333333] text-white hover:bg-[#2f2f2f] cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !editInstruction.trim()}
                    className="mt-4 w-full py-3 rounded-2xl bg-white hover:bg-[#eaeaea] disabled:opacity-30 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Applying Edits...</span>
                      </>
                    ) : (
                      <>
                        <Scissors className="w-4 h-4" />
                        <span>Apply Image Edit</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Generated Result Preview */}
          {resultImage && (
            <div className="pt-4 border-t border-[#333333] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Generated Output
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-[#181818] border border-[#333333] hover:bg-[#2f2f2f] text-xs font-semibold text-white cursor-pointer"
                    title="Download PNG"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={handleInsertToActiveChat}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white hover:bg-[#eaeaea] text-xs font-bold text-black shadow-xs cursor-pointer"
                  >
                    <span>Insert into Chat</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border border-[#333333] bg-[#090909] flex items-center justify-center max-h-80 shadow-inner">
                <img src={resultImage} alt="Generated output" className="max-h-80 w-auto object-contain" />
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#333333] flex items-center justify-between bg-[#242424] text-xs text-[#A3A3A3]">
          <span>Powered by Gemini Multimodal Vision API</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#181818] border border-[#333333] hover:bg-[#2f2f2f] text-white font-bold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
