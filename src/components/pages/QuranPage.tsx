import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserData } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';
import JuzViewer from './JuzViewer';
import quranArabic from '../../data/quran.json';
import quranUrdu from '../../data/ur.json';
import chapterNames from '../../data/chaptersName.json';
import juzDataArray from '../../data/juzData.json';
import { ChevronRight, ChevronLeft, Search, BookOpen } from 'lucide-react';

interface QuranPageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

interface Verse {
  chapter: number;
  verse: number;
  text: string;
}

interface ChapterName {
  number: number;
  name_urdu: string;
}

interface JuzData {
  number: number;
  name_arabic: string;
  name_english: string;
  range: string;
  folder: string;
  pages: number;
}

const QuranPage: React.FC<QuranPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [activeChapter, setActiveChapter] = useState<number | null>(null);
  const [selectedJuz, setSelectedJuz] = useState<JuzData | null>(null);
  const [arabicVerses, setArabicVerses] = useState<Verse[]>([]);
  const [urduVerses, setUrduVerses] = useState<Verse[]>([]);
  const [activeChapterName, setActiveChapterName] = useState<string>('قرآن');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChapters, setFilteredChapters] = useState<ChapterName[]>(chapterNames.surahs);
  const [viewMode, setViewMode] = useState<'surahs' | 'juz'>('surahs');

  useEffect(() => {
    if (activeChapter) {
      setArabicVerses(quranArabic[activeChapter] || []);
      setUrduVerses(quranUrdu[activeChapter] || []);
      const chapter = chapterNames.surahs.find(c => c.number === activeChapter);
      setActiveChapterName(chapter ? chapter.name_urdu : 'قرآن');
    } else {
      setActiveChapterName('قرآن');
      setFilteredChapters(
        chapterNames.surahs.filter(c => 
          c.name_urdu.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [activeChapter, searchTerm]);

  const renderModeToggle = () => (
    <div className="flex bg-white rounded-lg p-1 mb-6 shadow-sm border border-gray-200">
      <button
        onClick={() => setViewMode('surahs')}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
          viewMode === 'surahs'
            ? 'bg-green-600 text-white'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        dir="rtl"
      >
        سورتیں
      </button>
      <button
        onClick={() => setViewMode('juz')}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
          viewMode === 'juz'
            ? 'bg-green-600 text-white'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        dir="rtl"
      >
        جوز
      </button>
    </div>
  );

  const renderChapters = () => (
    <div className="space-y-4">
      {renderModeToggle()}
      
      <div className="relative mb-6">
        <input
          type="text"
          placeholder={viewMode === 'surahs' ? "سورۃ تلاش کریں..." : "جوز تلاش کریں..."}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          dir="rtl"
        />
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      {viewMode === 'surahs' ? (
        filteredChapters.length > 0 ? (
          <div className="space-y-3">
            {filteredChapters.map((chapter: ChapterName) => (
              <motion.button
                key={chapter.number}
                onClick={() => setActiveChapter(chapter.number)}
                className="w-full flex items-center justify-between p-4 rounded-lg transition-colors bg-white hover:bg-gray-100 shadow-sm border border-gray-200"
                dir="rtl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold ml-2 text-green-600">{chapter.number}</span>
                  <span className="font-medium text-gray-900">{chapter.name_urdu}</span>
                </div>
                <ChevronRight size={20} className="text-gray-500" />
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500" dir="rtl">
            <p>کوئی سورۃ نہیں ملی۔</p>
          </div>
        )
      ) : (
        juzDataArray.length > 0 ? (
          <div className="space-y-3">
            {juzDataArray.map((juz: JuzData) => (
              <motion.button
                key={juz.number}
                onClick={() => setSelectedJuz(juz)}
                className="w-full flex items-center justify-between p-4 rounded-lg transition-colors bg-white hover:bg-gray-100 shadow-sm border border-gray-200"
                dir="rtl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-green-600">{juz.number}</span>
                    <span className="text-xs text-gray-500">{juz.pages} صفحات</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-gray-900 text-lg">{juz.name_arabic}</span>
                    <span className="text-sm text-gray-600">{juz.name_english}</span>
                    <span className="text-xs text-gray-500 mt-1">{juz.range}</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-500" />
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500" dir="rtl">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p>کوئی جوز نہیں ملا۔</p>
          </div>
        )
      )}
    </div>
  );

  const renderVerses = () => (
    <div>
      <motion.button
        onClick={() => setActiveChapter(null)}
        className="flex items-center text-green-600 hover:text-green-800 mb-6"
        dir="rtl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <ChevronLeft size={20} className="ml-2" />
        <span className="font-medium">واپس</span>
      </motion.button>

      {arabicVerses.length > 0 ? (
        <div className="space-y-6">
          {arabicVerses.map((arabicVerse, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
              dir="rtl"
            >
              <div className="font-quran text-right text-2xl leading-loose mb-2 text-gray-900">
                <span className="text-sm font-bold text-green-600 ml-2">{arabicVerse.verse}.</span>
                {arabicVerse.text}
              </div>
              <p className="font-light text-gray-600 text-sm italic mt-2" dir="rtl">
                {urduVerses[index]?.text}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500" dir="rtl">
          <p>اس سورۃ میں کوئی آیت دستیاب نہیں ہے۔</p>
        </div>
      )}
    </div>
  );

  // If a Juz is selected, show the JuzViewer
  if (selectedJuz) {
    return (
      <JuzViewer
        folderName={selectedJuz.folder}
        title={`جوز ${selectedJuz.number}: ${selectedJuz.name_arabic}`}
        totalPages={selectedJuz.pages}
        onBack={() => setSelectedJuz(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav
        title={activeChapterName}
        user={user}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
        showBackButton={activeChapter !== null}
        backAction={() => setActiveChapter(null)}
      />
      <div className="flex-grow pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto">
          {activeChapter ? renderVerses() : renderChapters()}
        </div>
      </div>
      <BottomNav currentPage="quran" setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default QuranPage;