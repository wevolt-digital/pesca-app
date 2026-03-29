'use client';

import FishCard from '@/components/FishCard';
import SectionHeader from '@/components/SectionHeader';
import { catches } from '@/constants/mockData';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-background md:pt-20">
      <div className="sticky top-0 bg-[#091628] z-10 md:hidden">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <SectionHeader
            title="Feed"
            subtitle="Acompanhe as pescarias da comunidade"
            icon={Zap}
            dark
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {catches.map((catchData, index) => (
          <motion.div
            key={catchData.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <FishCard catchData={catchData} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
