import React from 'react';
import { X, ShieldOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface BlockMessageProps {
  onClose: () => void;
  email: string;
}

const BlockMessage: React.FC<BlockMessageProps> = ({ onClose, email }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-center"
        dir="rtl"
      >
        <ShieldOff size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">آپ کا اکاؤنٹ بلاک کر دیا گیا ہے۔</h2>
        <p className="text-gray-600 mb-6">
          معذرت، انتظامیہ کی طرف سے غیر منصفانہ سرگرمی کی وجہ سے آپ کا اکاؤنٹ معطل کر دیا گیا ہے۔
        </p>

        <h3 className="font-semibold text-gray-700 mb-2">اکاؤنٹ اَن بلاک کروانے کے لیے:</h3>
        <a 
          href={`mailto:${email}`}
          className="text-lg font-bold text-blue-600 hover:underline break-all"
        >
          {email}
        </a>
        <p className="text-xs text-gray-500 mt-1">براہ کرم اپنا یوزر آئی ڈی (UID) شامل کریں۔</p>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
        >
          <X size={20} className="ml-2" />
          بند کریں
        </button>
      </motion.div>
    </motion.div>
  );
};

export default BlockMessage;