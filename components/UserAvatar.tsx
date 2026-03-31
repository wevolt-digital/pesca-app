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

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-xl',
};

export default function UserAvatar({ user, size = 'md', showRing = false, className }: UserAvatarProps) {
  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden flex-shrink-0',
        sizeClasses[size],
        showRing && 'ring-2 ring-secondary ring-offset-2',
        className
      )}
    >
      {user.avatar ? (
        <Image
          src={user.avatar}
          alt={user.name}
          fill
          className="object-cover"
        />
      ) : (
        <div className={cn('w-full h-full bg-primary/15 flex items-center justify-center', textSizeClasses[size])}>
          <span className="font-semibold text-primary">{initials}</span>
        </div>
      )}
    </div>
  );
}
