import SearchInput from "./RightSidebarComp/SearchInput";
import WhatsHappeninigCard from "./RightSidebarComp/WhatsHappeninigCard";
import WhoToFollowCard from "./RightSidebarComp/WhoToFollowCard";

export default function RightSidebar() {
  return (
    <div className="w-full bg-black max-w-[400px] xl:px-6 pt-1 px-4 hidden lg:block">
      <SearchInput />
      <WhatsHappeninigCard />
      <WhoToFollowCard />
    </div>
  );
}
