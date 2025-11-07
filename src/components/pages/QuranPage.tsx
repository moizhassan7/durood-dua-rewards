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
  const [selectedJuz, setSelectedJuz] = useState<JuzData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');





  const renderJuzList = () => (
    <div className="space-y-4">
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="جوز تلاش کریں..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          dir="rtl"
        />
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      {juzDataArray.length > 0 ? (
        <div className="space-y-3">
          {juzDataArray
            .filter((juz: JuzData) =>
              juz.name_arabic.toLowerCase().includes(searchTerm.toLowerCase()) ||
              juz.name_english.toLowerCase().includes(searchTerm.toLowerCase()) ||
              juz.range.toLowerCase().includes(searchTerm.toLowerCase()) ||
              juz.number.toString().includes(searchTerm)
            )
            .map((juz: JuzData) => (
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
        title="قرآن"
        user={user}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
        showBackButton={false}
      />
      <div className="flex-grow pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto">
          {renderJuzList()}
        </div>
      </div>
      <BottomNav currentPage="quran" setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default QuranPage;