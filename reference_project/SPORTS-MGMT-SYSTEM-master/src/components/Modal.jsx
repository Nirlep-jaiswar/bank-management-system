import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay">
        <motion.div 
          className="modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
        >
          <div className="modal-header">
            <h3>{title}</h3>
            <button onClick={onClose} className="close-btn"><X size={20} /></button>
          </div>
          <div className="modal-body">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
