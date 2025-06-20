import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FaChartLine } from 'react-icons/fa';
import { createPortal } from 'react-dom';

export default function SavedRecommendationCard({ recommendation }) {
  const [open, setOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const cardRef = useRef(null);
  const pdfRef = useRef(null);
  const [showPdfCard, setShowPdfCard] = useState(false);
  const { saved_at, status } = recommendation;
  // The actual recommendation data is in recommendation.recommendation
  const rec = recommendation.recommendation || {};
  const date = new Date(saved_at).toLocaleString();

  // PDF Export: Use html2canvas + jsPDF, render PDF card in a portal to <body>
  const handleExportPDF = async () => {
    if (!open) return;
    setPdfLoading(true);
    setShowPdfCard(true);
    // Wait for the PDF card to be rendered in the DOM
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    try {
      const pdfCard = pdfRef.current;
      if (!pdfCard) throw new Error('PDF card not found');
      // Use html2canvas to capture the card as an image
      const canvas = await html2canvas(pdfCard, {
        backgroundColor: '#fff',
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      // Create jsPDF and add the image, splitting across pages if needed
      const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 40; // 20pt margin each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let y = 20;
      let remainingHeight = imgHeight;
      // Calculate the height of the image in PDF units
      const pageImgHeight = pageHeight - 40;
      // If the image fits on one page
      if (imgHeight <= pageImgHeight) {
        pdf.addImage(imgData, 'JPEG', 20, y, imgWidth, imgHeight);
      } else {
        // Split image into multiple pages
        let pageNum = 0;
        while (remainingHeight > 0) {
          const sourceY = (canvas.height * (pageNum * pageImgHeight)) / imgHeight;
          const sourceHeight = (canvas.height * Math.min(pageImgHeight, remainingHeight)) / imgHeight;
          // Create a temporary canvas for the current page
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = (sourceHeight);
          const ctx = pageCanvas.getContext('2d');
          ctx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight,
            0, 0, canvas.width, sourceHeight
          );
          const pageImgData = pageCanvas.toDataURL('image/jpeg', 1.0);
          pdf.addImage(pageImgData, 'JPEG', 20, y, imgWidth, Math.min(pageImgHeight, remainingHeight));
          remainingHeight -= pageImgHeight;
          pageNum++;
          if (remainingHeight > 0) pdf.addPage();
        }
      }
      pdf.save(`FinPilot_Recommendation_${date.replace(/\W+/g, '_')}.pdf`);
    } catch (err) {
      alert('Failed to export PDF: ' + err.message);
    } finally {
      setShowPdfCard(false);
      setPdfLoading(false);
    }
  };

  return (
    <>
      <div className={`rounded-3xl bg-background-glass/90 border-2 border-fuchsia-400/30 shadow-xl backdrop-blur-xl mb-8 transition-all duration-300 ${open ? 'ring-2 ring-fuchsia-400/60 scale-[1.02]' : ''}`}
        style={{ boxShadow: '0 8px 32px 0 #a21caf44, 0 0 0 2px #d946ef33 inset' }}>
        {/* Header */}
        <button
          className="w-full flex items-center justify-between px-8 py-6 cursor-pointer focus:outline-none group"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
        >
          <div className="flex items-center gap-4">
            <span className="text-lg text-fuchsia-200 font-bold">{date}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${status === 'AI generated' ? 'bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white' : 'bg-fuchsia-900/40 text-fuchsia-200'}`}>{status}</span>
          </div>
          <span className={`ml-4 transition-transform duration-300 text-2xl text-fuchsia-300 group-hover:text-fuchsia-400 ${open ? 'rotate-90' : ''}`}>▶</span>
        </button>
        {/* Collapsible Body */}
        <div
          className={`overflow-hidden transition-all duration-500 px-8 ${open ? 'py-6' : 'py-0'} ${open ? 'max-h-[70vh] md:max-h-[60vh]' : 'max-h-0'}`}
          style={{ pointerEvents: open ? 'auto' : 'none' }}
        >
          <div ref={cardRef} className={`h-full ${open ? 'overflow-y-auto custom-scrollbar' : ''}`}
            style={{ maxHeight: open ? '50vh' : undefined }}
          >
            {/* Sections */}
            <div className="space-y-6">
              <SummarySection summary={rec.central_summary} />
              <PortfolioSection portfolio={rec.recommended_portfolio} />
              <MicroInvestSection plan={rec.micro_investment_plan} />
              <GrowthSection growth={rec.growth_simulations} />
              <RiskSection risk={rec.risk_analysis} />
              <TipsSection tips={rec.investment_tips} nudge={rec.nudge} />
            </div>
          </div>
          {/* Actions */}
          <div className="flex gap-4 mt-8">
            <button
              className="px-5 py-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white font-semibold shadow hover:scale-105 transition-all disabled:opacity-60"
              onClick={handleExportPDF}
              disabled={pdfLoading || !open}
            >
              {pdfLoading ? 'Generating PDF...' : 'Export as PDF'}
            </button>
          </div>
          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(120deg, #818cf8 0%, #f472b6 100%);
              border-radius: 6px;
            }
            .custom-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: #818cf8 #232046;
            }
          `}</style>
        </div>
      </div>
      {/* PDF Portal: Only render when exporting */}
      {showPdfCard && typeof window !== 'undefined' && createPortal(
        <div
          ref={pdfRef}
          style={{
            display: 'block',
            position: 'fixed',
            left: 0,
            top: 0,
            width: '700px',
            background: '#fff',
            color: '#232046',
            padding: '32px',
            borderRadius: '32px',
            fontFamily: 'Inter, DM Sans, sans-serif',
            zIndex: 99999,
            maxHeight: 'none',
            overflow: 'visible',
            boxShadow: '0 0 32px #a21caf44',
            border: '4px solid red',
          }}
        >
          {/* PDF Branding/Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <span style={{ fontSize: 36, color: '#a21caf' }}><FaChartLine /></span>
            <span style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(90deg,#38bdf8,#818cf8,#f472b6)', WebkitBackgroundClip: 'text', color: 'transparent' }}>FinPilot X Recommendation</span>
          </div>
          <div style={{ fontSize: 16, color: '#818cf8', marginBottom: 16 }}>Saved on: {date}</div>
          <div style={{ fontSize: 14, color: '#fff', background: '#a21caf', display: 'inline-block', borderRadius: 8, padding: '2px 12px', marginBottom: 16 }}>{status}</div>
          <div style={{ marginBottom: 24 }}>
            <SummarySection summary={rec.central_summary} pdfMode />
            <PortfolioSection portfolio={rec.recommended_portfolio} pdfMode />
            <MicroInvestSection plan={rec.micro_investment_plan} pdfMode />
            <GrowthSection growth={rec.growth_simulations} pdfMode />
            <RiskSection risk={rec.risk_analysis} pdfMode />
            <TipsSection tips={rec.investment_tips} nudge={rec.nudge} pdfMode />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function SummarySection({ summary, pdfMode }) {
  if (!summary) return null;
  return (
    <div>
      <h4 className={`text-xl font-bold mb-2 ${pdfMode ? 'text-blue-300' : 'text-blue-300'}`}>📊 Summary</h4>
      <div className={`rounded-xl bg-background-glass/70 border border-fuchsia-400/10 shadow-inner p-4 text-fuchsia-100 text-base grid grid-cols-1 md:grid-cols-2 gap-2 ${pdfMode ? 'border-fuchsia-400/10' : ''}`}>
        {Object.entries(summary).map(([k, v]) => (
          <div key={k} className="flex justify-between"><span className="font-semibold capitalize">{k.replace(/_/g, ' ')}:</span> <span>{v}</span></div>
        ))}
      </div>
    </div>
  );
}

function PortfolioSection({ portfolio, pdfMode }) {
  if (!portfolio || !portfolio.length) return null;
  return (
    <div>
      <h4 className={`text-xl font-bold mb-2 ${pdfMode ? 'text-fuchsia-300' : 'text-fuchsia-300'}`}>💼 Portfolio</h4>
      <div className={`rounded-xl bg-background-glass/70 border border-fuchsia-400/10 shadow-inner p-4 text-fuchsia-100 text-base flex flex-col gap-4 ${pdfMode ? 'border-fuchsia-400/10' : ''}`}>
        {portfolio.map((fund, i) => (
          <div key={i} className="border-b border-fuchsia-400/10 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
            <div className="flex flex-wrap gap-2 items-center mb-1">
              <span className="font-bold text-pink-300">{fund.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-fuchsia-900/40 text-fuchsia-200">{fund.type}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-200">{fund.allocation}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/40 text-green-200">Risk: {fund.risk_level}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-200">Return: {fund.expected_return}</span>
            </div>
            <div className="text-sm text-fuchsia-100 mb-1">{fund.reasoning || fund.rationale}</div>
            <div className="flex flex-wrap gap-4 text-xs">
              <span>Min: ₹{fund.min_investment}</span>
              <span>Liquidity: {fund.liquidity}</span>
              <span>Real Return: {fund.real_return}</span>
              <span>Inflation Rate: {fund.inflation_rate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MicroInvestSection({ plan, pdfMode }) {
  if (!plan) return null;
  return (
    <div>
      <h4 className={`text-xl font-bold mb-2 ${pdfMode ? 'text-purple-300' : 'text-purple-300'}`}>🪐 Micro-Investment Plan</h4>
      <div className={`rounded-xl bg-background-glass/70 border border-fuchsia-400/10 shadow-inner p-4 text-fuchsia-100 text-base grid grid-cols-1 md:grid-cols-2 gap-2 ${pdfMode ? 'border-fuchsia-400/10' : ''}`}>
        {Object.entries(plan).map(([k, v]) => (
          <div key={k} className="flex justify-between"><span className="font-semibold capitalize">{k.replace(/_/g, ' ')}:</span> <span>{v}</span></div>
        ))}
      </div>
    </div>
  );
}

function GrowthSection({ growth, pdfMode }) {
  if (!growth) return null;
  return (
    <div>
      <h4 className={`text-xl font-bold mb-2 ${pdfMode ? 'text-indigo-300' : 'text-indigo-300'}`}>🌀 Growth Projections</h4>
      <div className={`rounded-xl bg-background-glass/70 border border-fuchsia-400/10 shadow-inner p-4 text-fuchsia-100 text-base grid grid-cols-1 md:grid-cols-2 gap-2 ${pdfMode ? 'border-fuchsia-400/10' : ''}`}>
        {Object.entries(growth).filter(([k]) => k !== 'analysis').map(([k, v]) => (
          <div key={k} className="flex justify-between"><span className="font-semibold capitalize">{k.replace(/_/g, ' ')}:</span> <span>{v}</span></div>
        ))}
        {growth.analysis && (
          <div className="col-span-full mt-2">
            <div className="font-semibold text-indigo-200 mb-1">Scenario Analysis:</div>
            <ul className="list-disc list-inside text-fuchsia-100">
              {Object.entries(growth.analysis).map(([k, v]) => (
                <li key={k}><span className="font-semibold capitalize">{k.replace(/_/g, ' ')}:</span> {v}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function RiskSection({ risk, pdfMode }) {
  if (!risk) return null;
  return (
    <div>
      <h4 className={`text-xl font-bold mb-2 ${pdfMode ? 'text-pink-300' : 'text-pink-300'}`}>⚡ Risk Analysis</h4>
      <div className={`rounded-xl bg-background-glass/70 border border-fuchsia-400/10 shadow-inner p-4 text-fuchsia-100 text-base grid grid-cols-1 md:grid-cols-2 gap-2 ${pdfMode ? 'border-fuchsia-400/10' : ''}`}>
        {Object.entries(risk).filter(([k]) => k !== 'tips').map(([k, v]) => (
          <div key={k} className="flex justify-between"><span className="font-semibold capitalize">{k.replace(/_/g, ' ')}:</span> <span>{v}</span></div>
        ))}
        {risk.tips && (
          <div className="col-span-full mt-2">
            <div className="font-semibold text-pink-200 mb-1">Tips:</div>
            <ul className="list-disc list-inside text-fuchsia-100">
              {risk.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function TipsSection({ tips, nudge, pdfMode }) {
  if ((!tips || !tips.length) && !nudge) return null;
  return (
    <div>
      <h4 className={`text-xl font-bold mb-2 ${pdfMode ? 'text-emerald-300' : 'text-emerald-300'}`}>💡 Tips & Nudges</h4>
      <div className={`rounded-xl bg-background-glass/70 border border-fuchsia-400/10 shadow-inner p-4 text-fuchsia-100 text-base flex flex-col gap-2 ${pdfMode ? 'border-fuchsia-400/10' : ''}`}>
        {tips && tips.length > 0 && (
          <ul className="list-disc list-inside">
            {tips.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        )}
        {nudge && (
          <div className="mt-2"><span className="font-semibold text-emerald-200">Nudge:</span> {nudge}</div>
        )}
      </div>
    </div>
  );
} 