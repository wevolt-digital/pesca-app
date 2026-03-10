import Image from 'next/image';
import { User } from '@/types';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showRing?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export default function UserAvatar({ user, size = 'md', showRing = false, className }: UserAvatarProps) {
  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden',
        sizeClasses[size],
        showRing && 'ring-2 ring-secondary ring-offset-2',
        className
      )}
    >
      <Image
        src={user.avatar}
        alt={user.name}
        fill
        className="object-cover"
      />
    </div>
  );
}
