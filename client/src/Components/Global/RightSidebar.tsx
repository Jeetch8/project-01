import SearchInput from './RightSidebarComp/SearchInput';
import WhatsHappeninigCard from './RightSidebarComp/WhatsHappeninigCard';
import WhoToFollowCard from './RightSidebarComp/WhoToFollowCard';

export default function RightSidebar() {
  return (
    <div className="w-full bg-black max-w-[400px] xl:px-6 px-4 hidden lg:block sticky top-0 h-fit pt-2">
      <SearchInput />
      <WhatsHappeninigCard />
      <WhoToFollowCard />
    </div>
  );
}
