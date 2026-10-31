import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
  MapPin,
  Flame,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InventoryItem } from '../types';

interface DetectedItemCandidate {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  daysUntilExpiry: number;
  estimatedPrice: number;
  emoji: string;
  freshnessStatus: 'fresh' | 'ripe' | 'urgent';
  preservationTip: string;
}

export default function VisionScannerView() {
  const { t, language, addBatchInventoryItems, setActiveTab } = useApp();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [detectedItems, setDetectedItems] = useState<DetectedItemCandidate[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample images for 1-click test
  const sampleImages = [
    {
      id: 'sample_veggies',
      label: t.scanner.sample1,
      // High-quality food photo of fresh vegetables, tomatoes and greens
      url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'sample_dairy',
      label: t.scanner.sample2,
      // Dairy, yogurt, milk and cheese
      url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'sample_fruits',
      label: t.scanner.sample3,
      // Bananas, citrus, apples
      url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&auto=format&fit=crop&q=80',
    },
  ];

  // Start live webcam
  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        language === 'ar'
          ? 'تعذر الوصول إلى الكاميرا. يرجى التأكد من صلاحيات المتصفح أو رفع صورة يدوياً.'
          : language === 'en'
          ? 'Could not access camera. Please check browser permissions or upload an image.'
          : 'Impossible d\'accéder à la caméra. Vérifiez vos autorisations ou importez une photo.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Capture frame from webcam
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      stopCamera();
      analyzeImage(dataUrl);
    }
  };

  // Handle uploaded file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setSelectedImage(dataUrl);
        analyzeImage(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Load sample image
  const handleSelectSample = async (url: string) => {
    setIsAnalyzing(true);
    setSelectedImage(url);
    stopCamera();

    try {
      // Fetch sample and convert to base64 for API
      const resp = await fetch(url);
      const blob = await resp.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        analyzeImage(base64);
      };
      reader.readAsDataURL(blob);
    } catch {
      // Fallback
      analyzeImage(url);
    }
  };

  // Send to server Gemini API
  const analyzeImage = async (base64OrUrl: string) => {
    setIsAnalyzing(true);
    setDetectedItems([]);
    try {
      const res = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64OrUrl,
          mimeType: 'image/jpeg',
          lang: language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDetectedItems(data.items || []);
      } else {
        console.error('Analysis failed');
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save all items to stock
  const handleSaveAllToStock = async () => {
    if (detectedItems.length === 0) return;
    const today = new Date();

    const itemsToSave = detectedItems.map((item) => {
      const expiry = new Date(today);
      expiry.setDate(expiry.getDate() + (item.daysUntilExpiry || 3));
      return {
        name: item.name,
        category: item.category as any,
        quantity: item.quantity,
        unit: item.unit as any,
        location: item.location as any,
        purchaseDate: today.toISOString().split('T')[0],
        expiryDate: expiry.toISOString().split('T')[0],
        notes: item.preservationTip,
        estimatedPrice: item.estimatedPrice,
        imageEmoji: item.emoji || '🥗',
      };
    });

    const count = await addBatchInventoryItems(itemsToSave);
    if (count > 0) {
      setActiveTab('inventory');
    }
  };

  const handleRemoveCandidate = (index: number) => {
    setDetectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Title */}
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Gemini 3.8 Flash Vision</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {t.scanner.title}
        </h2>
        <p className="text-stone-700 text-xs sm:text-sm mt-1 max-w-2xl">
          {t.scanner.subtitle}
        </p>
      </div>

      {/* Main Scanner Card */}
      <div className="rounded-3xl bg-white border border-stone-200/80 shadow-md p-6 sm:p-8 overflow-hidden">
        {/* Live Camera View */}
        {isCameraActive ? (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-[420px] mx-auto flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />

            {/* Target Reticle */}
            <div className="absolute inset-8 border-2 border-dashed border-emerald-400/80 rounded-2xl pointer-events-none flex items-center justify-center">
              <span className="bg-emerald-950/80 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-xs">
                Cadrez vos aliments au centre
              </span>
            </div>

            {/* Camera Controls */}
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 z-10">
              <button
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 border-4 border-white text-white flex items-center justify-center shadow-lg transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Capturer"
              >
                <Camera className="w-8 h-8" />
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-2 rounded-xl bg-stone-900/80 hover:bg-stone-900 text-white text-xs font-bold backdrop-blur-xs cursor-pointer"
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        ) : selectedImage ? (
          /* Preview of Captured or Uploaded Image */
          <div className="relative rounded-2xl overflow-hidden bg-stone-900 aspect-video max-h-[360px] mx-auto flex items-center justify-center group">
            <img
              src={selectedImage}
              alt="Food preview"
              className="w-full h-full object-cover"
            />

            {/* Scanning line animation during analysis */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin mb-3"></div>
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-100">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>{t.scanner.analyzing}</span>
                </div>
                {/* Horizontal laser scan beam */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-bounce"></div>
              </div>
            )}

            {!isAnalyzing && (
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setDetectedItems([]);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
                  Nouvelle photo
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Initial Upload / Camera Prompt Area */
          <div className="space-y-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-3xl p-8 sm:p-12 text-center transition-all bg-[#FBF9F5]/50 hover:bg-emerald-50/30 cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-xs">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-1">
                {t.scanner.dragDrop}
              </h3>
              <p className="text-xs text-stone-600 mb-4">
                JPG, PNG, WebP (Reconnaissance multi-aliments instantanée)
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startCamera();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-800/20 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>{t.scanner.startCamera}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{t.scanner.uploadImage}</span>
                </button>
              </div>
            </div>

            {cameraError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* 1-Click Sample Previews */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3">
                {t.scanner.trySamples}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {sampleImages.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSample(s.url)}
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#FBF9F5] border border-stone-200/80 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-left cursor-pointer group"
                  >
                    <img
                      src={s.url}
                      alt={s.label}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <span className="text-xs font-bold text-stone-900 group-hover:text-emerald-800 block">
                        {s.label}
                      </span>
                      <span className="text-[10px] text-stone-600">
                        Cliquez pour tester l'IA
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Recognition Results */}
        {detectedItems.length > 0 && (
          <div className="mt-8 pt-6 border-t border-stone-200 space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-stone-900 text-base sm:text-lg">
                    {detectedItems.length} {t.scanner.detectedCount}
                  </h3>
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  Vérifiez les denrées détectées avant de les ajouter à votre stock.
                </p>
              </div>

              <button
                onClick={handleSaveAllToStock}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-800/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.scanner.addAllToStock}</span>
              </button>
            </div>

            {/* List of Detected Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {detectedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#FBF9F5] border border-stone-200/90 shadow-2xs flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl p-1 rounded-xl bg-white border border-stone-200 shadow-2xs">
                        {item.emoji || '🥗'}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-stone-900 text-sm">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 mt-0.5">
                          <span>{item.quantity} {item.unit}</span>
                          <span>•</span>
                          <span className="capitalize">{item.location}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveCandidate(idx)}
                      className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                      title="Retirer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-stone-700">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{t.scanner.shelfLife} :</span>
                      <strong className="text-amber-800">
                        {item.daysUntilExpiry} {t.common.daysLeft}
                      </strong>
                    </div>
                    <span className="text-stone-600 font-bold">
                      ~ {item.estimatedPrice.toFixed(2)} €
                    </span>
                  </div>

                  {item.preservationTip && (
                    <div className="mt-2 p-2 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-900 flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item.preservationTip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
