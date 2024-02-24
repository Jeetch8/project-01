import SearchInput from "./RightSidebar/SearchInput";
import WhatsHappeninigCard from "./RightSidebar/WhatsHappeninigCard";
import WhoToFollowCard from "./RightSidebar/WhoToFollowCard";

export default function RightSidebar() {
  return (
    <div className="w-full bg-black max-w-[400px] xl:px-6 pt-1 px-4 hidden lg:block">
      <SearchInput />
      <WhatsHappeninigCard />
      <WhoToFollowCard />
    </div>
  );
}
