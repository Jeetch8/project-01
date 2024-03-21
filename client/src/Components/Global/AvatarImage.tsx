import { cn } from '@/utils/helpers';
import { memo } from 'react';
import AvatarTemplate from '@/assets/AvatarTemplate.png';

const AvatarImage = memo(
  ({
    url,
    diameter,
    className,
    fallback,
  }: {
    url?: string;
    diameter: string;
    className?: string;
    fallback?: string;
  }) => {
    const toShowrl = fallback ?? AvatarTemplate;
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
          backgroundImage: `url(${url}), url(${toShowrl})`,
        }}
      ></div>
    );
  }
);

export default AvatarImage;
