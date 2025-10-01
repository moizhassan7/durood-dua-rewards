import React from 'react';
import { X, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnnouncementData } from '../../types';

interface AnnouncementModalProps {
  announcement: AnnouncementData;
  onClose: () => void;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ announcement, onClose }) => {
  if (!announcement || (!announcement.title && !announcement.message && !announcement.imageUrl)) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[100]"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50, opacity: 0 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden relative"
        dir="rtl"
      >
        <button
          onClick={onClose}
          className="absolute top-3 left-3 p-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6 pt-4 text-center">
          <Volume2 size={32} className="text-green-600 mx-auto mb-3" />
          
          {announcement.imageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
              <img 
                src={announcement.imageUrl} 
                alt={announcement.title || "Announcement Image"} 
                className="w-full h-auto object-cover" 
              />
            </div>
          )}

          <h2 className="text-xl font-bold text-gray-900 mb-2">{announcement.title}</h2>
          <p className="text-gray-700 text-sm mb-4">{announcement.message}</p>

          <button
            onClick={onClose}
            className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            ٹھیک ہے (سمجھ آ گیا)
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnnouncementModal;