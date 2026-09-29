import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';

export default function ReportView({ isGeneratingReport = false }: { isGeneratingReport?: boolean }) {
  const [reportVersion, setReportVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (isGeneratingReport) {
      setLoadingStep(0);
      const interval = setInterval(() => {
        setLoadingStep(prev => prev + 1);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isGeneratingReport]);

  const messages = ['Preparing assessment findings...', 'Compiling evidence...', 'Preparing report preview...', 'Report ready.'];
  
  if (isGeneratingReport) {
    const progress = Math.min((loadingStep + 1) * 35, 100);
    const messageIndex = Math.min(loadingStep, messages.length - 1);
    
    return (
      <div className="max-w-screen-xl mx-auto space-y-6 p-6 flex flex-col items-center justify-center min-h-[600px]">
        <div className="border border-border bg-surface p-8 rounded shadow-sm flex flex-col items-center w-full max-w-md">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-6" />
          <h2 className="text-sm font-bold text-textMain tracking-widest uppercase mb-4">Generating Report</h2>
          <p className="text-xs text-textMuted font-medium uppercase tracking-wider mb-8 transition-opacity duration-300 h-4 flex items-center justify-center">
            {messages[messageIndex]}
          </p>
          <div className="w-full bg-background h-1.5 rounded-full overflow-hidden mb-3 border border-border">
            <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="text-[9px] text-textMuted uppercase font-bold tracking-widest">Please wait</span>
        </div>
      </div>
    );
  }

  const refreshPreview = () => {
    setIsLoading(true);
    setHasError(false);
    setReportVersion(prev => prev + 1);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="max-w-screen-xl mx-auto space-y-6 p-6">
      <div className="flex justify-between items-end border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-textMain uppercase tracking-wider mb-1">Security Assessment Report</h1>
          <div className="flex flex-col text-xs text-textMuted font-medium uppercase tracking-wider">
            <span>Synthetic Local Security Lab</span>
            <span>Target: http://localhost:3000</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={refreshPreview}
            className="flex items-center space-x-2 px-4 py-2 border border-border text-textMuted hover:text-textMain hover:bg-background text-sm font-bold uppercase tracking-wider rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Preview</span>
          </button>
          <button 
            onClick={() => window.location.href = 'http://localhost:4000/api/report/pdf'}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white text-sm font-bold uppercase tracking-wider rounded hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
      
      <div className="bg-surface border border-border min-h-[800px] shadow-sm relative flex flex-col rounded overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface z-10">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <span className="text-textMuted font-medium tracking-wider uppercase text-sm">Generating report preview...</span>
          </div>
        )}
        
        {hasError && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface z-10 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-lg font-bold text-textMain mb-2">Report preview unavailable</h2>
            <p className="text-textMuted mb-6 text-sm">The report engine could not generate the preview.</p>
            <button 
              onClick={refreshPreview}
              className="px-6 py-2 border border-border text-textMain text-sm font-bold uppercase tracking-wider rounded hover:bg-background transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        <iframe 
          key={reportVersion}
          src={`http://localhost:4000/api/report?v=${reportVersion}`}
          className={`w-full h-[800px] border-none ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          title="Diagnosis Report"
          sandbox="allow-same-origin"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>
    </div>
  );
}
