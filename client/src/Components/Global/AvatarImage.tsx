import { cn } from '@/utils/helpers';
import { memo } from 'react';

const AvatarImage = memo(
  ({
    url,
    diameter,
    className,
    fallback,
  }: {
    url: string;
    diameter: string;
    className?: string;
    fallback?: string;
  }) => {
    return (
      <div
        className={cn(className)}
        role="avatar"
        style={{
          width: diameter,
          height: diameter,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          overflow: 'hidden',
          borderRadius: '100%',
          backgroundImage:
            `url(${url})` ??
            fallback ??
            'https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small_2x/user-profile-icon-free-vector.jpg',
        }}
      ></div>
    );
  }
);

export default AvatarImage;
