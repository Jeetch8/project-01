import NewsCard from './NewsCard';

export default function WhatsHappeninigCard() {
  return (
    <div className="text-white rounded-xl py-4 mt-4 border-[1px] border-zinc-700">
      <h2 className="text-[21px] font-bold mb-3 px-5">What's happening</h2>
      <NewsCard />
      <NewsCard />
    </div>
  );
}
