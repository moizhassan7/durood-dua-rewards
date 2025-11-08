import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, Loader2 } from 'lucide-react';

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

const JuzViewer: React.FC<JuzViewerProps> = ({ 
  folderName, 
  title, 
  totalPages: propTotalPages,
  onBack 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState<PageData[]>([]);
  const [totalPages, setTotalPages] = useState(propTotalPages || 40);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJuzPages();
  }, [folderName]);

  /**
   * Loads the list of PDF pages for the current Juz
   * First tries to load from index.json, falls back to pattern-based generation
   */
  const loadJuzPages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to load index.json first
      const indexResponse = await fetch(`/data/Juz_Split_Output/${folderName}/index.json`);
      
      if (indexResponse.ok) {
        const indexData = await indexResponse.json();
        const pageList = indexData.pages || [];
        
        if (pageList.length > 0) {
          setPages(pageList);
          setTotalPages(pageList.length);
          setLoading(false);
          return;
        }
      }
      
      // Fallback: Generate pages based on pattern
      generateFallbackPages();
      
    } catch (err) {
      console.warn('Could not load index.json, using fallback pattern:', err);
      generateFallbackPages();
    }
  };

  /**
   * Generates a fallback list of pages based on common naming patterns
   * This ensures the viewer works even without index.json files
   */
  const generateFallbackPages = () => {
    const fallbackPages: PageData[] = [];
    const maxPages = propTotalPages || 40; // Default to 40 pages if not specified
    
    // Extract Juz number from folder name (e.g., "Juz_01_Alif-laam-meem" -> 1)
    const juzNumberMatch = folderName.match(/Juz_(\d+)_/);
    const juzNumber = juzNumberMatch ? parseInt(juzNumberMatch[1], 10) : 1;
    
    // Calculate starting page number for this Juz
    // Juz 1 starts from page 6, Juz 2 from page 41, etc.
    const startingPages = [6, 41, 75, 109, 143, 177, 211, 245, 279, 313, 345, 379, 413, 447, 481, 515, 549, 583, 617, 651, 683, 717, 751, 787, 819, 853, 887, 923, 959, 997];
    const startingPageNumber = startingPages[juzNumber - 1] || 6;
    
    for (let i = 1; i <= maxPages; i++) {
      const pageNumberInFilename = String(startingPageNumber + i - 1).padStart(4, '0');
      const filename = `Page_${pageNumberInFilename}_Juz_${String(juzNumber).padStart(2, '0')}_P_${String(i).padStart(2, '0')}.pdf`;
      
      fallbackPages.push({
        filename,
        pageNumber: i
      });
    }
    
    setPages(fallbackPages);
    setTotalPages(fallbackPages.length);
    setLoading(false);
  };

  /**
   * Navigates to the next page
   */
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  /**
   * Navigates to the previous page
   */
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  /**
   * Handles keyboard navigation
   */
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPreviousPage();
      } else if (event.key === 'ArrowRight') {
        goToNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, totalPages]);

  /**
   * Gets the current page filename
   */
  const getCurrentPageFilename = () => {
    if (pages.length === 0) return '';
    return pages[currentPage - 1]?.filename || '';
  };

  /**
   * Gets the PDF URL for the current page
   */
  const getCurrentPageUrl = () => {
    const filename = getCurrentPageFilename();
    return `/data/Juz_Split_Output/${folderName}/${filename}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600" dir="rtl">جوز کے صفحات لوڈ ہو رہے ہیں...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4" dir="rtl">صفحات لوڈ نہیں ہو سکے</p>
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-2 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {onBack && (
            <motion.button
              onClick={onBack}
              className="flex items-center text-green-600 hover:text-green-800 transition-colors text-sm"
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
          
          <div className="w-16"></div> {/* Spacer for balance */}
        </div>
      </div>

      {/* PDF Viewer - fixed, no scroll, responsive */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 bg-white mx-2 my-2 rounded-lg shadow-sm overflow-auto">
          <iframe
            src={getCurrentPageUrl()}
            className="w-full h-full border-0 min-h-[60vh]"
            title={`${title} - Page ${currentPage}`}
            onError={() => setError('PDF لوڈ نہیں ہو سکا')}
            style={{
              minHeight: '60vh',
              width: '100%',
              border: 0,
              display: 'block',
              background: '#fff',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
            }}
            scrolling="auto"
            allowFullScreen
          />
        </div>

        {/* Navigation Controls - sticky for mobile, larger tap targets */}
        <div className="bg-white border-t border-gray-200 px-2 py-3 sticky bottom-0 z-20">
          <div className="max-w-md mx-auto flex items-center justify-between gap-2">
            <motion.button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl transition-colors text-base font-bold w-1/3
                ${currentPage === 1
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-green-700 bg-green-100 hover:bg-green-200 hover:text-green-900'}
              `}
              whileHover={currentPage !== 1 ? { scale: 1.07 } : {}}
              whileTap={currentPage !== 1 ? { scale: 0.97 } : {}}
            >
              <ChevronLeft size={22} className="mb-1" />
              <span>پچھلا</span>
            </motion.button>

            {/* Page Indicator */}
            <div className="flex flex-col items-center w-1/3">
              <span className="text-base text-gray-700 font-bold" dir="rtl">
                {currentPage} / {totalPages}
              </span>
            </div>

            <motion.button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl transition-colors text-base font-bold w-1/3
                ${currentPage === totalPages
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-green-700 bg-green-100 hover:bg-green-200 hover:text-green-900'}
              `}
              whileHover={currentPage !== totalPages ? { scale: 1.07 } : {}}
              whileTap={currentPage !== totalPages ? { scale: 0.97 } : {}}
            >
              <ChevronRight size={22} className="mb-1" />
              <span>اگلا</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JuzViewer;