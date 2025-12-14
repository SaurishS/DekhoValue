"use client";

import { useState } from "react";
import { Upload, Camera, FileVideo, CheckCircle, AlertCircle, Loader2, Zap, Shield, Armchair, Tv, Lamp, Box, Download, X, Star } from "lucide-react";
import { AnalysisResult } from "./types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- MOCK DATA FOR DEMO MODE ---
const DEMO_RESULT: AnalysisResult = {
  items: [
    { name: "Sony Bravia 55\" 4K TV", category: "Electronics", condition: "Used - Good", estimated_price_inr: 65000, risk_factor: "Medium" },
    { name: "Leather Sectional Sofa (3-Piece)", category: "Furniture", condition: "Used - Very Good", estimated_price_inr: 85000, risk_factor: "Low" },
    { name: "MacBook Pro M2 (14-inch)", category: "Electronics", condition: "Used - Excellent", estimated_price_inr: 140000, risk_factor: "High" },
    { name: "Persian Wool Rug (8x10)", category: "Decor", condition: "Used - Good", estimated_price_inr: 25000, risk_factor: "Medium" },
    { name: "Dining Table (Teak Wood)", category: "Furniture", condition: "Used - Good", estimated_price_inr: 45000, risk_factor: "Low" }
  ],
  total_value: 360000,
  recommended_coverage: 400000
};

// --- REALISTIC INSURERS ---
const INSURERS = [
  { name: "Acko General Insurance", logo: "🚀", annualRate: 0.0035, rating: 4.8, features: ["Zero Depreciation", "Instant Claims"], url: "https://www.acko.com/" },
  { name: "Digit Insurance", logo: "🦄", annualRate: 0.0030, rating: 4.7, features: ["Smartphone Enabled", "Theft Cover"], url: "https://www.godigit.com/home-insurance" },
  { name: "ICICI Lombard", logo: "🏦", annualRate: 0.0045, rating: 4.5, features: ["Trusted Brand", "Global Coverage"], url: "https://www.icicilombard.com/home-insurance" },
];

// --- HELPER FUNCTION FOR INDIAN CURRENCY FORMAT ---
const formatIndianCurrency = (num: number): string => {
  if (num >= 10000000) { // Crores
    return (num / 10000000).toFixed(1) + ' Cr';
  } else if (num >= 100000) { // Lakhs
    return (num / 100000).toFixed(1) + ' L';
  } else if (num >= 1000) { // Thousands
    return num.toLocaleString('en-IN');
  }
  return num.toLocaleString('en-IN');
};

export default function Home() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!videoFile && !isDemoMode) return;

    setIsAnalyzing(true);
    setError(null);

    // --- DEMO MODE LOGIC ---
    if (isDemoMode) {
      setTimeout(() => {
        setResult(DEMO_RESULT);
        setIsAnalyzing(false);
      }, 2000); // Fake 2s delay
      return;
    }

    const formData = new FormData();
    if (videoFile) {
        formData.append("video", videoFile);
    }

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadQuote = () => {
    if (!result) return;

    const doc = new jsPDF();

    // Header
    doc.setFillColor(37, 99, 235); // Blue color
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("DekhoValue", 14, 25);
    doc.setFontSize(10);
    doc.text("Instant Insurance Quote", 14, 32);

    // Summary Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 55);
    doc.text(`Quote Reference: #DV-${Math.floor(Math.random() * 10000)}`, 14, 62);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Coverage Summary", 14, 75);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Total Asset Value: Rs. ${result.total_value.toLocaleString('en-IN')}`, 14, 85);
    doc.text(`Recommended Coverage: Rs. ${result.recommended_coverage.toLocaleString('en-IN')}`, 14, 92);
    
    // Table
    const tableColumn = ["Item Name", "Category", "Condition", "Est. Price (INR)", "Risk"];
    const tableRows = result.items.map(item => [
      item.name,
      item.category,
      item.condition,
      item.estimated_price_inr.toLocaleString('en-IN'),
      item.risk_factor
    ]);

    autoTable(doc, {
      startY: 110,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Disclaimer: This is an AI-generated estimate. Final premium subject to verification.", 14, finalY + 20);

    doc.save("DekhoValue_Quote.pdf");
  };

  const getIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("electronic")) return <Tv className="w-5 h-5 text-blue-500" />;
    if (cat.includes("furniture")) return <Armchair className="w-5 h-5 text-amber-600" />;
    if (cat.includes("lighting") || cat.includes("decor")) return <Lamp className="w-5 h-5 text-yellow-500" />;
    return <Box className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20 relative">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
                <Camera className="w-6 h-6" /> DekhoValue
            </h1>
            <p className="text-xs text-blue-100 opacity-90">Just Dekho and Value</p>
          </div>
          
          {/* Demo Toggle */}
          <button 
            onClick={() => setIsDemoMode(!isDemoMode)}
            disabled={result !== null}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${isDemoMode ? 'bg-yellow-400 text-yellow-900' : 'bg-blue-800 text-blue-300'} ${result !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isDemoMode ? "DEMO MODE ON" : "LIVE MODE"}
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* Intro / Upload Section */}
        {!result && !isAnalyzing && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-5">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
              <Zap className="w-10 h-10" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900">Instant Insurance Quote</h2>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                Scan your room. Our AI identifies assets, checks real-time market prices, and calculates your premium.
                </p>
            </div>

            <label className="w-full group">
              <input
                type="file"
                accept="video/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-full bg-blue-600 group-hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-3 shadow-blue-200 shadow-lg">
                <Camera className="w-6 h-6" />
                {videoFile ? "Retake Video" : "Start Video Scan"}
              </div>
            </label>

            {/* Hint for Laptop Users */}
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                (Recommended: 10-15s) • Works best on Mobile
            </p>

            {/* Analyze Button */}
            {(videoFile || isDemoMode) && (
              <div className="w-full animate-in fade-in slide-in-from-bottom-2 pt-2">
                {videoFile && (
                    <div className="text-xs text-gray-500 mb-3 flex items-center justify-center gap-2 bg-gray-50 py-2 rounded-lg border border-gray-100">
                        <FileVideo className="w-3 h-3" /> {videoFile.name}
                    </div>
                )}
                <button
                  onClick={handleAnalyze}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-green-100 transform active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  {isDemoMode ? "Generate Demo Quote" : "Analyze & Get Quote"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="fixed inset-0 bg-white/95 z-50 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full"></div>
                <Loader2 className="w-20 h-20 text-blue-600 animate-spin relative z-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mt-8">Analyzing Room...</h3>
            <div className="space-y-1 mt-4 text-gray-500 text-sm">
                <p>Identifying electronics & furniture...</p>
                <p>Checking live market prices...</p>
                <p>Calculating risk assessment...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
                <p className="font-bold">Scan Failed</p>
                <p className="text-sm mt-1 opacity-90">{error}</p>
                <button onClick={() => setError(null)} className="text-xs font-bold uppercase tracking-wide mt-3 hover:underline">Try Again</button>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Total Coverage Card */}
            <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800 text-white p-8 rounded-3xl shadow-2xl shadow-blue-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Shield className="w-32 h-32" />
              </div>
              
              <div className="relative z-10">
                <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-2">Recommended Coverage</p>
                <div className="text-5xl font-extrabold tracking-tight">₹{formatIndianCurrency(result.recommended_coverage)}</div>
                
                <div className="mt-8 grid grid-cols-2 gap-8 border-t border-blue-700/50 pt-6">
                    <div>
                        <p className="text-blue-300 text-xs mb-1">Total Assets</p>
                        <p className="font-bold text-lg">₹{formatIndianCurrency(result.total_value)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-blue-300 text-xs mb-1">Monthly Premium</p>
                        <p className="font-bold text-xl text-green-300">₹{((result.total_value * 0.0035) / 12).toFixed(0)}</p>
                    </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={handleDownloadQuote}
                    className="bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                    <Download className="w-4 h-4" /> Download Quote
                </button>
                <button 
                    onClick={() => setShowBuyModal(true)}
                    className="bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm shadow-md hover:bg-blue-700"
                >
                    Buy Policy
                </button>
            </div>

            {/* Asset List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Identified Assets</h3>
                <span className="text-xs bg-gray-900 text-white px-2.5 py-1 rounded-full font-medium">{result.items.length}</span>
              </div>
              <ul className="divide-y divide-gray-100">
                {result.items.map((item, idx) => (
                  <li key={idx} className="p-5 flex gap-4">
                    <div className="mt-1 p-2 bg-gray-50 rounded-lg h-fit">
                        {getIcon(item.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900 text-sm leading-tight">{item.name}</h4>
                        <p className="font-bold text-gray-900 text-sm whitespace-nowrap">₹{formatIndianCurrency(item.estimated_price_inr)}</p>
                      </div>
                      
                      <div className="mt-1.5 flex justify-between items-end">
                        <div className="text-xs text-gray-500 space-y-0.5">
                            <p>{item.category}</p>
                            <p className="text-gray-400">{item.condition}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${ 
                            item.risk_factor === 'High' ? 'bg-red-50 text-red-600' : 
                            item.risk_factor === 'Medium' ? 'bg-orange-50 text-orange-600' : 
                            'bg-green-50 text-green-600'
                        }`}>
                            {item.risk_factor} Risk
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <button 
                onClick={() => {setResult(null); setVideoFile(null); setShowBuyModal(false);}} 
                className="w-full bg-blue-50 text-blue-700 py-3 rounded-xl font-semibold text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
            >
                <Camera className="w-4 h-4"/> Start New Scan
            </button>

          </div>
        )}
      </main>

      {/* --- BUY POLICY MODAL --- */}
      {showBuyModal && result && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
                <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg">Select Insurer</h3>
                    <button onClick={() => setShowBuyModal(false)} className="hover:bg-blue-700 p-1 rounded-full"><X className="w-5 h-5"/></button>
                </div>
                <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
                    {INSURERS.map((insurer, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-xl p-4 hover:border-blue-500 transition-all cursor-pointer shadow-sm">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{insurer.logo}</span>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{insurer.name}</h4>
                                        <div className="flex items-center gap-1 text-xs text-yellow-600 font-medium">
                                            <Star className="w-3 h-3 fill-current" /> {insurer.rating}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Premium</p>
                                    <p className="font-bold text-lg text-blue-600">₹{((result.total_value * insurer.annualRate) / 12).toFixed(0)}<span className="text-xs text-gray-400">/mo</span></p>
                                </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {insurer.features.map((feat, i) => (
                                    <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{feat}</span>
                                ))}
                            </div>
                            <button 
                                onClick={() => window.open(insurer.url, '_blank')}
                                className="w-full mt-3 bg-gray-900 text-white py-2 rounded-lg text-sm font-semibold hover:bg-black"
                            >
                                Buy Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
