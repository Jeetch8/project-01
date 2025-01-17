import { FaRegUser } from 'react-icons/fa';
import { PiHeartBreak } from 'react-icons/pi';
import { GoKey } from 'react-icons/go';
import { Link, Outlet } from 'react-router-dom';
import { HiChevronRight } from 'react-icons/hi';

const Index = () => {
  const accountItems = [
    {
      icon: <FaRegUser size={16} className="text-2xl" />,
      title: 'Account Information',
      description:
        'See your account information like your phone number and email address',
      path: 'account_info',
    },
    {
      icon: <GoKey size={17} className="text-2xl" />,
      title: 'Change your password',
      description: 'Change your password at any time',
      path: 'change_password',
    },
    {
      icon: <PiHeartBreak size={22} className="text-2xl" />,
      title: 'Deactivate your account',
      description: 'Find out how you can deactivate your account',
      path: 'deactivate_account',
    },
  ];

  return (
    <div className="text-white">
      <div className="px-4 py-4 mb-3">
        <h1 className="text-2xl font-bold">Your Account</h1>
      </div>
      <div>
        <p className="text-gray-400 px-4 text-sm mb-5">
          See information about your account, learn about your account
          deactivation options
        </p>
        <div className="space-y-4">
          {accountItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="flex items-center justify-between p-4 hover:bg-neutral-800 transition-colors duration-200"
            >
              <div className="flex items-center space-x-6">
                <div className="text-neutral-400">{item.icon}</div>
                <div>
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              </div>
              <HiChevronRight size={20} className="text-gray-400" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
