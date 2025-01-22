import { useGlobalContext } from '@/context/GlobalContext';
import SearchInput from './RightSidebarComp/SearchInput';
// import WhatsHappeninigCard from './RightSidebarComp/WhatsHappeninigCard';
import WhoToFollowCard from './RightSidebarComp/WhoToFollowCard';

export default function RightSidebar() {
  const { user } = useGlobalContext();
  return (
    <div className="w-full bg-black min-w-[400px] xl:px-6 px-4 hidden xl:block sticky top-0 h-fit pt-2">
      <SearchInput />
      {/* <WhatsHappeninigCard /> */}
      {user && <WhoToFollowCard />}
    </div>
  );
}
