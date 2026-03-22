'use client';

import Image from 'next/image';
import UserAvatar from '@/components/UserAvatar';
import StatsCard from '@/components/StatsCard';
import SectionHeader from '@/components/SectionHeader';
import FishCard from '@/components/FishCard';
import { currentUser, userStats, catches } from '@/constants/mockData';
import { User, Trophy, Fish, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const userCatches = catches.filter((c) => c.user.id === currentUser.id);

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background md:pt-20">
      <div className="sticky top-0 bg-white border-b border-border z-10 shadow-sm md:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <SectionHeader
            title="Perfil"
            subtitle={currentUser.name}
            icon={User}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-md p-6 space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <UserAvatar user={currentUser} size="xl" showRing />
              <div>
                <h2 className="text-2xl font-bold text-foreground">{currentUser.name}</h2>
                <p className="text-sm text-muted-foreground">@{currentUser.username}</p>
                {currentUser.bio && (
                  <p className="text-sm text-foreground mt-2">{currentUser.bio}</p>
                )}
              </div>
            </div>
            <Button className="bg-primary text-white rounded-xl">Editar Perfil</Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <StatsCard
            title="Pescas"
            value={userStats.totalCatches}
            icon={Fish}
            gradient="water"
          />
          <StatsCard
            title="Espécies"
            value={userStats.totalSpecies}
            icon={Zap}
            gradient="sunset"
          />
          <StatsCard
            title="Peso Total"
            value={`${userStats.totalWeight} kg`}
            icon={Trophy}
            gradient="teal"
          />
          <StatsCard
            title="Locais"
            value={currentUser.totalSpots}
            icon={User}
            gradient="water"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-md p-6 space-y-4"
        >
          <h3 className="font-bold text-lg text-foreground">Maior Captura</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{userStats.biggestCatch.species}</span>
              <span className="font-bold text-lg text-primary">{userStats.biggestCatch.weight} kg</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(userStats.biggestCatch.date).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SectionHeader
            title="Minhas Pescas"
            subtitle={`${userCatches.length} registros`}
          />
        </motion.div>

        <div className="space-y-4">
          {userCatches.map((catchData, index) => (
            <motion.div
              key={catchData.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <FishCard catchData={catchData} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
