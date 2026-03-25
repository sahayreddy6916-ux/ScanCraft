import React from 'react';
import { motion } from 'motion/react';
import { QrCode, Barcode } from 'lucide-react';

const FloatingObject = ({ delay, duration, left, size, type }: { delay: number, duration: number, left: string, size: number, type: 'qr' | 'barcode', key?: React.Key }) => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0, rotate: 0 }}
      animate={{ 
        y: ['0vh', '110vh'], 
        opacity: [0, 0.15, 0.15, 0],
        rotate: [0, 360]
      }}
      transition={{ 
        duration: duration, 
        repeat: Infinity, 
        delay: delay,
        ease: "linear"
      }}
      className="absolute text-white pointer-events-none"
      style={{ left, top: -100 }}
    >
      {type === 'qr' ? <QrCode size={size} /> : <Barcode size={size} />}
    </motion.div>
  );
};

export default function BackgroundAnimation() {
  const objects = [
    { delay: 0, duration: 20, left: '10%', size: 120, type: 'qr' as const },
    { delay: 5, duration: 25, left: '30%', size: 180, type: 'barcode' as const },
    { delay: 2, duration: 18, left: '50%', size: 100, type: 'qr' as const },
    { delay: 8, duration: 30, left: '70%', size: 220, type: 'barcode' as const },
    { delay: 12, duration: 22, left: '85%', size: 140, type: 'qr' as const },
    { delay: 4, duration: 28, left: '15%', size: 160, type: 'barcode' as const },
    { delay: 15, duration: 24, left: '45%', size: 130, type: 'qr' as const },
    { delay: 7, duration: 35, left: '75%', size: 200, type: 'barcode' as const },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {objects.map((obj, i) => (
        <FloatingObject 
          key={i} 
          delay={obj.delay} 
          duration={obj.duration} 
          left={obj.left} 
          size={obj.size} 
          type={obj.type} 
        />
      ))}
      
      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#121212] via-transparent to-[#121212] opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-transparent to-[#121212] opacity-60" />
    </div>
  );
}
