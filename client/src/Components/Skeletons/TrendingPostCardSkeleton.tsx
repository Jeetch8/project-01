import LoadingSkeleton from 'react-loading-skeleton';

export default function TrendingPostCardSkeleton() {
  return (
    <div className="flex justify-between py-3 px-5">
      {/* Left side text skeleton */}
      <div>
        <h3 className="mb-1">
          <LoadingSkeleton width={180} height={20} />
        </h3>
        <p className="mb-1">
          <LoadingSkeleton width={100} height={16} />
        </p>
        <p>
          <LoadingSkeleton width={160} height={16} />
        </p>
      </div>
      {/* Right side image skeleton */}
      <div>
        <LoadingSkeleton width={80} height={65} borderRadius={12} />
      </div>
    </div>
  );
}
