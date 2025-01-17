import { FaInfoCircle, FaUsers, FaCalendarAlt, FaGavel } from 'react-icons/fa';
import { MdPublic, MdLock } from 'react-icons/md';
import { format } from 'date-fns';
import { ICommunity } from '@/utils/interfaces';

const CommunityAboutTab = ({ community }: { community: ICommunity }) => {
  return (
    <div className="bg-zinc-900 rounded-lg p-4 mt-4">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FaInfoCircle className="mr-2" /> Community Info
      </h2>
      <div className="flex items-start mb-4">
        <img
          src={community.banner_img}
          alt={`${community.title} logo`}
          className="w-16 h-16 rounded-full mr-4"
        />
        <div>
          <p className="text-gray-300 mb-2">{community.description}</p>
          <div className="flex items-center text-gray-400 text-sm">
            {community.membership_type === 'PUBLIC' ? (
              <MdPublic className="mr-1" />
            ) : (
              <MdLock className="mr-1" />
            )}
            <span className="capitalize">
              {community.membership_type.toLowerCase()} Community
            </span>
          </div>
          <div className="flex items-center text-gray-400 text-sm mt-1">
            <FaCalendarAlt className="mr-1" />
            <span>
              Created on{' '}
              {format(new Date(community.created_on), 'MMMM d, yyyy')}
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-700 pt-4 mt-4">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <FaGavel className="mr-2" /> Rules
        </h3>
        <ol className="list-decimal list-inside">
          {community.rules.split('===').map((rule: string, index: number) => (
            <li key={index} className="mb-2">
              {rule.trim()}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default CommunityAboutTab;
