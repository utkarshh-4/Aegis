

export default function ReportView() {
  return (
    <div className="max-w-screen-xl mx-auto space-y-6 p-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h1 className="text-xl font-bold text-textMain">Security Diagnosis Report</h1>
        <button 
          onClick={() => window.open('http://localhost:4000/api/report?download=true', '_blank')}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:opacity-90"
        >
          Download PDF
        </button>
      </div>
      <div className="bg-surface border border-border p-8 min-h-[600px] shadow-sm">
        <iframe 
          src="http://localhost:4000/api/report" 
          className="w-full h-[600px] border-none"
          title="Diagnosis Report"
          sandbox="allow-same-origin allow-scripts"
        />
        <div className="text-center text-textMuted mt-12">
          <p>If the preview is unavailable, please use the Download button.</p>
        </div>
      </div>
    </div>
  );
}
