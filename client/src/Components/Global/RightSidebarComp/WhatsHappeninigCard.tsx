// import TrendingPostCard from './TrendingPostCard';
// import TrendingPostCardSkeleton from '@/Components/Skeletons/TrendingPostCardSkeleton';
// import { AcceptedMethods, FetchStates, useFetch } from '@/hooks/useFetch';
// import { IPost } from '@/types/interfaces';
// import { base_url } from '@/utils/base_url';
// import { useEffect } from 'react';

// export default function WhatsHappeninigCard() {
//   const { fetchState, dataRef, doFetch } = useFetch<{ posts: IPost[] }>({
//     url: `${base_url}/post/trending-post`,
//     method: AcceptedMethods.GET,
//     onSuccess(data) {
//       console.log(data);
//     },
//   });

//   useEffect(() => {
//     doFetch();
//   }, [doFetch]);

//   return (
//     <div className="text-white rounded-xl py-4 mt-4 border-[1px] border-zinc-700">
//       <h2 className="text-[21px] font-bold mb-3 px-5">Trending Post</h2>
//       {fetchState === FetchStates.LOADING ? (
//         <>
//           <TrendingPostCardSkeleton />
//           <TrendingPostCardSkeleton />
//           <TrendingPostCardSkeleton />
//         </>
//       ) : (
//         dataRef.current?.posts.map((post) => (
//           <TrendingPostCard key={post.id} post={post} />
//         ))
//       )}
//     </div>
//   );
// }
