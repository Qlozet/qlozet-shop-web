'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { 
  Sparkles, 
  Coins, 
  Upload, 
  Play, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Image as ImageIcon,
  Scan,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

function FittingRoomContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, demoLogin, jobs, addJob, deductTokens } = useApp();

  // Selected Garment for Try-on (passed from URL query params)
  const queryImg = searchParams.get('tryOnImg') || '';
  const queryTitle = searchParams.get('title') || '';

  // Fit Room Modes: 'body' (measurements) or 'outfit' (dress try-on)
  const [activeTab, setActiveTab] = useState<'body' | 'outfit'>(queryImg ? 'outfit' : 'body');

  // STEP 1: Body Predictor States
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [sideImage, setSideImage] = useState<string | null>(null);
  const [isDemoModel, setIsDemoModel] = useState(false);
  const [bodyError, setBodyError] = useState('');

  // STEP 2: Outfit Try-on States
  const [garmentImage, setGarmentImage] = useState<string>(queryImg || '/image/bespoke-kaftan-brown-1.png');
  const [garmentTitle, setGarmentTitle] = useState<string>(queryTitle || 'Chocolate Silk Kaftan');
  const [userPrompt, setUserPrompt] = useState('Make it an elegant and modern tailored fit for a summer wedding');
  const [outfitError, setOutfitError] = useState('');

  // Populate garment if it changes in URL query
  useEffect(() => {
    if (queryImg) {
      setGarmentImage(queryImg);
      setGarmentTitle(queryTitle || 'Custom Clothing');
      setActiveTab('outfit');
    }
  }, [queryImg, queryTitle]);

  // Load Preset Demo Models for fast evaluation!
  const handleLoadDemoModel = (gender: 'male' | 'female') => {
    setIsDemoModel(true);
    if (gender === 'female') {
      setFrontImage('/image/slim-girl-1.jpg');
      setSideImage('/image/slim-girl-2.jpg');
    } else {
      setFrontImage('/image/slim-man.jpg');
      setSideImage('/image/slim-man-2.jpg');
    }
  };

  // Submit Body Measurements Prediction (costs 20 tokens)
  const handleRunPrediction = (e: React.FormEvent) => {
    e.preventDefault();
    setBodyError('');

    if (!user) {
      setBodyError('Please sign in or use the demo login bypass to run prediction.');
      return;
    }

    if (!frontImage || !sideImage) {
      setBodyError('Please upload both Front and Side body profile photos.');
      return;
    }

    // Deduct tokens
    const success = deductTokens(20);
    if (!success) {
      setBodyError('Insufficient wallet tokens. Please fund your wallet!');
      return;
    }

    // Add task to job queue
    addJob({
      type: 'prediction',
      payload: { frontImage, sideImage }
    });

    confetti({
      particleCount: 50,
      spread: 40,
      colors: ['#D4AF37', '#FF2E63', '#FFFFFF']
    });
  };

  // Submit Outfit Try-on (costs 30 tokens)
  const handleGenerateOutfit = (e: React.FormEvent) => {
    e.preventDefault();
    setOutfitError('');

    if (!user) {
      setOutfitError('Please sign in or use the demo login bypass to generate outfits.');
      return;
    }

    if (!garmentImage) {
      setOutfitError('Please select a clothing garment first.');
      return;
    }

    const success = deductTokens(30);
    if (!success) {
      setOutfitError('Insufficient wallet tokens. Please fund your wallet!');
      return;
    }

    addJob({
      type: 'outfit',
      payload: { garmentImage, prompt: userPrompt }
    });

    confetti({
      particleCount: 50,
      spread: 40,
      colors: ['#D4AF37', '#FF2E63', '#FFFFFF']
    });
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-10 py-4 lg:py-8">
      
      {/* 1. HEADER DETAILS & WALLET */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-extrabold text-[#FF2E63] uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
            <Sparkles size={14} />
            Qlozet AI Virtual Try-On Studio
          </span>
          <h1 className="text-2xl lg:text-3xl font-extrabold uppercase font-display tracking-tight text-[#1A1A1A] leading-tight">
            Fitting room
          </h1>
        </div>

        {/* Token Wallet Widget */}
        {user ? (
          <div className="glass-panel border border-[#D4AF37]/20 p-4 flex items-center gap-4 bg-[#D4AF37]/5 rounded-2xl">
            <span className="w-10 h-10 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
              <Coins size={20} />
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#9A95B6] uppercase tracking-wider">Try-On Wallet Credits</span>
              <span className="text-xl font-black text-white">{user.tokenBalance} Tokens</span>
            </div>
            <button 
              onClick={() => useApp().addTokens(100)}
              className="btn-primary text-[10px]" 
              style={{ padding: '6px 14px' }}
            >
              + Add
            </button>
          </div>
        ) : (
          <button 
            onClick={demoLogin}
            className="btn-primary flex items-center gap-2"
          >
            <UserCheck size={16} />
            <span>Demo Login Bypass</span>
          </button>
        )}
      </div>

      {/* 2. MAIN LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* A. WORKSPACE COLUMN (Left 2 columns) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Tab Navigation Mode */}
          <div className="bg-white/5 rounded-full p-1 border border-white/10 flex gap-1.5 w-fit">
            <button 
              onClick={() => setActiveTab('body')}
              className={`py-2 px-5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === 'body' ? 'bg-[#4A2306] text-white shadow-md' : 'text-[#9A95B6] hover:text-white'}`}
            >
              <Scan size={14} />
              <span>Body measurements predict</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('outfit')}
              className={`py-2 px-5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === 'outfit' ? 'bg-[#4A2306] text-white shadow-md' : 'text-[#9A95B6] hover:text-white'}`}
            >
              <Sparkles size={14} />
              <span>AI Outfit Try-on</span>
            </button>
          </div>

          {/* ================= MODE 1: BODY MEASUREMENTS PREDICT ================= */}
          {activeTab === 'body' && (
            <form onSubmit={handleRunPrediction} className="glass-panel border border-white/5 p-6 flex flex-col gap-6 animate-fade-in">
              
              <div className="flex flex-col gap-1.5">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Predict Body Dimensions</h2>
                <p className="text-xs text-[#9A95B6] leading-relaxed">
                  Upload Front and Side body profile images. Our AI models will parse your silhouette outlines and calculate measurements instantly. <span className="text-[#D4AF37] font-semibold">Cost: 20 tokens</span>.
                </p>
              </div>

              {bodyError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{bodyError}</span>
                </div>
              )}

              {/* Quick load presets */}
              <div className="flex flex-wrap items-center gap-3 py-3 border-y border-white/5">
                <span className="text-[10px] font-bold text-[#9A95B6] uppercase tracking-widest">Fast Demo presets:</span>
                <button 
                  type="button" 
                  onClick={() => handleLoadDemoModel('female')}
                  className="py-1 px-3 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white hover:bg-white/10 transition-all font-semibold"
                >
                  ♀ Load Female Demo Model
                </button>
                <button 
                  type="button" 
                  onClick={() => handleLoadDemoModel('male')}
                  className="py-1 px-3 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white hover:bg-white/10 transition-all font-semibold"
                >
                  ♂ Load Male Demo Model
                </button>
              </div>

              {/* Upload grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Front Image upload */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-[10px] font-bold text-[#9A95B6] uppercase tracking-widest">1. Front Silhouette Photo</span>
                  {frontImage ? (
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center group">
                      <Image src={frontImage} alt="Front body silhouette" fill style={{ objectFit: 'cover' }} />
                      <button 
                        type="button" 
                        onClick={() => { setFrontImage(null); setIsDemoModel(false); }}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black text-white p-2 rounded-lg text-xs"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-[3/4] border-2 border-dashed border-white/10 rounded-2xl hover:border-white/25 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors" onClick={() => handleLoadDemoModel('female')}>
                      <Upload className="text-[#5D5975] mb-4" size={32} />
                      <span className="text-xs text-white font-bold">Select Front Profile photo</span>
                      <span className="text-[9px] text-[#5D5975] mt-1 max-w-[150px]">Click here to load preset demo model photos instantly.</span>
                    </div>
                  )}
                </div>

                {/* Side Image upload */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-[10px] font-bold text-[#9A95B6] uppercase tracking-widest">2. Side Silhouette Photo</span>
                  {sideImage ? (
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center group">
                      <Image src={sideImage} alt="Side body silhouette" fill style={{ objectFit: 'cover' }} />
                      <button 
                        type="button" 
                        onClick={() => { setSideImage(null); setIsDemoModel(false); }}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black text-white p-2 rounded-lg text-xs"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-[3/4] border-2 border-dashed border-white/10 rounded-2xl hover:border-white/25 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors" onClick={() => handleLoadDemoModel('female')}>
                      <Upload className="text-[#5D5975] mb-4" size={32} />
                      <span className="text-xs text-white font-bold">Select Side Profile photo</span>
                      <span className="text-[9px] text-[#5D5975] mt-1 max-w-[150px]">Click here to load preset demo model photos instantly.</span>
                    </div>
                  )}
                </div>

              </div>

              <button
                type="submit"
                className="w-full bg-[#4A2306] hover:bg-[#612F08] text-white font-bold py-4 rounded-2xl shadow-lg mt-4 flex items-center justify-center gap-2 uppercase tracking-widest text-xs transition-all duration-300"
              >
                <Play size={14} />
                <span>Run Body measurements predict (20 Credits)</span>
              </button>

            </form>
          )}

          {/* ================= MODE 2: AI OUTFIT TRY-ON ================= */}
          {activeTab === 'outfit' && (
            <form onSubmit={handleGenerateOutfit} className="glass-panel border border-white/5 p-6 flex flex-col gap-6 animate-fade-in">
              
              <div className="flex flex-col gap-1.5">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Virtual Outfit Try-On Render</h2>
                <p className="text-xs text-[#9A95B6] leading-relaxed">
                  Project reference clothing designs onto your tailored body outline with custom prompts. Renders high-fidelity fashion mock outputs. <span className="text-[#D4AF37] font-semibold">Cost: 30 tokens</span>.
                </p>
              </div>

              {outfitError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{outfitError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Selected Garment block */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-[10px] font-bold text-[#9A95B6] uppercase tracking-widest">Garment Target</span>
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                    <Image src={garmentImage} alt="Selected Garment" fill style={{ objectFit: 'cover' }} />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2.5 text-[9px] font-bold text-white truncate text-center uppercase tracking-wider">
                      {garmentTitle}
                    </div>
                  </div>
                </div>

                {/* Prompts and parameters inputs (Right 2 columns) */}
                <div className="md:col-span-2 flex flex-col gap-5 justify-between">
                  
                  {/* Prompt Textarea */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-[#9A95B6] uppercase tracking-widest">Styling & fit instructions</label>
                    <textarea 
                      rows={4}
                      placeholder="e.g. Make it a tailored modern fit..."
                      className="w-full bg-[#121118] text-xs resize-none"
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      required
                    />
                    <span className="text-[9px] text-[#5D5975] leading-normal italic">
                      Tip: Describe fabrics, fit adjustments (tight at waist, loose at arms), or specific aesthetics like corporate, traditional lace, or agbada textures.
                    </span>
                  </div>

                  {/* Settings info */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-3 text-[10px] text-[#9A95B6] leading-relaxed">
                    <ImageIcon className="text-[#FF2E63] flex-shrink-0 mt-0.5" size={14} />
                    <div>
                      <span className="text-white font-semibold">Ready to generate:</span> This utilizes your active measurement settings profile loaded in the backend catalog to structure the silhouette calculations.
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#4A2306] hover:bg-[#612F08] text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-xs transition-all duration-300"
                  >
                    <Play size={14} />
                    <span>Generate Bespoke Render (30 Credits)</span>
                  </button>

                </div>

              </div>

            </form>
          )}

        </div>

        {/* B. ACTIVE QUEUE JOBS LIST (Right 1 column) */}
        <aside className="flex flex-col gap-6 w-full">
          
          <div className="glass-panel border border-white/10 p-5 flex flex-col gap-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} className="text-[#FF2E63]" />
              <span>AI Job status queue</span>
            </h3>

            {jobs.length > 0 ? (
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[450px] pr-1">
                {jobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-3 animate-fade-in"
                  >
                    {/* Status header */}
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-[#D4AF37]">Type: {job.type}</span>
                      
                      <span className={`px-2 py-0.5 rounded border ${
                        job.status === 'completed' ? 'text-green-400 bg-green-500/10 border-green-500/20' : 
                        job.status === 'processing' ? 'text-[#FF2E63] bg-[#FF2E63]/10 border-[#FF2E63]/20 animate-pulse' : 
                        'text-[#9A95B6] bg-white/5 border-white/10 animate-pulse'
                      }`}>
                        {job.status}
                      </span>
                    </div>

                    {/* Job results/renders details */}
                    {job.status === 'completed' && job.result && (
                      <div className="mt-1 animate-slide-up">
                        {job.type === 'prediction' ? (
                          /* Calculators table */
                          <div className="flex flex-col gap-2 p-3 bg-black/45 rounded-lg border border-white/5 text-[10px] text-[#9A95B6]">
                            <div className="flex justify-between border-b border-white/5 pb-1">
                              <span className="font-bold text-white flex items-center gap-1">
                                <CheckCircle2 size={10} className="text-green-400" /> Height:
                              </span>
                              <span className="text-white font-bold">{JSON.parse(job.result).height}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-1">
                              <span className="font-bold text-white flex items-center gap-1">
                                <CheckCircle2 size={10} className="text-green-400" /> Bust:
                              </span>
                              <span className="text-white font-bold">{JSON.parse(job.result).bust}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-1">
                              <span className="font-bold text-white flex items-center gap-1">
                                <CheckCircle2 size={10} className="text-green-400" /> Waist:
                              </span>
                              <span className="text-white font-bold">{JSON.parse(job.result).waist}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-bold text-white flex items-center gap-1">
                                <CheckCircle2 size={10} className="text-green-400" /> Hips:
                              </span>
                              <span className="text-white font-bold">{JSON.parse(job.result).hips}</span>
                            </div>
                          </div>
                        ) : (
                          /* Generated Image */
                          <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border border-white/10 bg-white/5 shadow-md">
                            <Image src={job.result} alt="Generated Outfit render" fill style={{ objectFit: 'cover' }} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pending/Processing visual loaders */}
                    {(job.status === 'pending' || job.status === 'processing') && (
                      <div className="flex flex-col gap-2 py-2">
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-[#FF2E63] rounded-full animate-pulse" style={{ width: job.status === 'processing' ? '65%' : '15%' }} />
                        </div>
                        <span className="text-[9px] text-[#5D5975]">
                          {job.status === 'processing' ? 'Calculating fit contours on GPUs...' : 'Queued in NestJS Predict gateway...'}
                        </span>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 flex flex-col items-center justify-center gap-3">
                <Activity size={24} className="text-[#5D5975]" />
                <span className="text-xs font-bold text-white">No active fitting jobs</span>
                <span className="text-[10px] text-[#5D5975] leading-normal max-w-[180px]">
                  Submit silhouette profiles or request visual agbada tries to start GPU rendering queues.
                </span>
              </div>
            )}

            <p className="text-[10px] text-[#5D5975] leading-normal italic pt-4 border-t border-white/5">
              Prediction results are stored to your active size settings so you can reuse them during shopping!
            </p>
          </div>

        </aside>

      </div>

    </div>
  );
}

export default function FittingRoomPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
      </div>
    }>
      <FittingRoomContent />
    </Suspense>
  );
}
