/* src/components/pages/JuzViewer.tsx */
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// ---- LOCAL WORKER (must be in public/) ----
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.394/build/pdf.worker.min.js';
interface JuzViewerProps {
  folderName: string;
  title: string;
  totalPages?: number;
  onBack?: () => void;
}

interface PageData {
  filename: string;
  pageNumber: number;
}

/* ------------------------------------------------------------------ */
const JuzViewer: React.FC<JuzViewerProps> = ({
  folderName,
  title,
  totalPages: propTotalPages,
  onBack,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState<PageData[]>([]);
  const [totalPages, setTotalPages] = useState(propTotalPages || 40);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [rendering, setRendering] = useState(false);

  /* --------------------- Load index.json → fallback --------------------- */
  useEffect(() => {
    loadJuzPages();
  }, [folderName]);

  const loadJuzPages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/data/Juz_Split_Output/${folderName}/index.json`);
      if (res.ok) {
        const data = await res.json();
        const list = data.pages || [];
        if (list.length) {
          setPages(list);
          setTotalPages(list.length);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('index.json failed → fallback', e);
    }
    generateFallbackPages();
  };

  const generateFallbackPages = () => {
    const max = propTotalPages || 40;
    const juzMatch = folderName.match(/Juz_(\d+)_/);
    const juzNum = juzMatch ? parseInt(juzMatch[1], 10) : 1;

    const startPages = [
      6, 41, 75, 109, 143, 177, 211, 245, 279, 313,
      345, 379, 413, 447, 481, 515, 549, 583, 617, 651,
      683, 717, 751, 787, 819, 853, 887, 923, 959, 997,
    ];
    const start = startPages[juzNum - 1] ?? 6;

    const list: PageData[] = [];
    for (let i = 1; i <= max; i++) {
      const global = String(start + i - 1).padStart(4, '0');
      const filename = `Page_${global}_Juz_${String(juzNum).padStart(
        2,
        '0'
      )}_P_${String(i).padStart(2, '0')}.pdf`;
      list.push({ filename, pageNumber: i });
    }

    setPages(list);
    setTotalPages(list.length);
    setLoading(false);
  };

  /* -------------------------- Navigation -------------------------- */
  const goPrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const goNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentPage, totalPages]);

  /* -------------------------- Load PDF -------------------------- */
  const currentFilename = pages[currentPage - 1]?.filename ?? '';
  const pdfUrl = currentFilename
    ? `/data/Juz_Split_Output/${folderName}/${currentFilename}`
    : '';

  useEffect(() => {
    if (!pdfUrl) return;

    let cancelled = false;

    const load = async () => {
      try {
        setRendering(true);
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const doc = await loadingTask.promise;
        if (cancelled) return;
        setPdfDoc(doc);
        setError(null);
      } catch (err: any) {
        if (!cancelled) {
          console.error('PDF load error:', err);
          setError('PDF لوڈ نہیں ہو سکا');
        }
      } finally {
        if (!cancelled) setRendering(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  /* -------------------------- Render Page -------------------------- */
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        setRendering(true);
        const page = await pdfDoc.getPage(1); // each file = 1 page
        const viewport = page.getViewport({ scale: 1.5 }); // adjust scale

        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error('Render error:', err);
      } finally {
        setRendering(false);
      }
    };

    renderPage();
  }, [pdfDoc]);

  /* -------------------------- UI -------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600" dir="rtl">
            جوز کے صفحات لوڈ ہو رہے ہیں...
          </p>
        </div>
      </div>
    );
  }

  if (error || !pdfUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2" dir="rtl">
            {error || 'صفحہ نہیں ملا'}
          </p>
          <button
            onClick={loadJuzPages}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            دوبارہ کوشش کریں
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ---------- Header ---------- */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-2 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {onBack && (
            <motion.button
              onClick={onBack}
              className="flex items-center text-green-600 hover:text-green-800 text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft size={18} className="ml-1" />
              <span className="font-medium">واپس</span>
            </motion.button>
          )}

          <div className="flex-1 text-center px-2">
            <h1 className="text-base font-semibold text-gray-900 truncate" dir="rtl">
              {title}
            </h1>
            <p className="text-xs text-gray-600" dir="rtl">
              صفحہ {currentPage} از {totalPages}
            </p>
          </div>

          <div className="w-16" />
        </div>
      </header>

      {/* ---------- Canvas Viewer ---------- */}
      <section className="flex-1 flex flex-col p-2">
        <div className="flex-1 bg-white rounded-lg shadow-sm overflow-auto">
          {rendering && (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto mx-auto block"
            style={{ display: rendering ? 'none' : 'block' }}
          />
        </div>

        {/* ---------- Navigation ---------- */}
        <nav className="bg-white border-t border-gray-200 px-2 py-3 mt-2 sticky bottom-0">
          <div className="max-w-md mx-auto flex items-center justify-between gap-2">
            <motion.button
              onClick={goPrev}
              disabled={currentPage === 1}
              className={`flex flex-col items-center px-4 py-3 rounded-xl w-1/3 font-bold text-base transition-colors
                ${currentPage === 1
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-green-700 bg-green-100 hover:bg-green-200'}
              `}
            >
              <ChevronLeft size={22} className="mb-1" />
              <span>پچھلا</span>
            </motion.button>

            <div className="text-center font-bold text-gray-700" dir="rtl">
              {currentPage} / {totalPages}
            </div>

            <motion.button
              onClick={goNext}
              disabled={currentPage === totalPages}
              className={`flex flex-col items-center px-4 py-3 rounded-xl w-1/3 font-bold text-base transition-colors
                ${currentPage === totalPages
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-green-700 bg-green-100 hover:bg-green-200'}
              `}
            >
              <ChevronRight size={22} className="mb-1" />
              <span>اگلا</span>
            </motion.button>
          </div>
        </nav>
      </section>
    </div>
  );
};

export default JuzViewer;