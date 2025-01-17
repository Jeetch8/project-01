import { FaUsers, FaInfoCircle, FaGavel, FaTrash } from 'react-icons/fa';
import { Link, NavLink, useParams } from 'react-router-dom';

const AdminNavigation = () => {
  const { id } = useParams();
  const navItems = [
    {
      name: 'Community info',
      icon: FaInfoCircle,
      path: 'edit_community_info',
      description: 'Edit community details and settings',
    },
    {
      name: 'Members',
      icon: FaUsers,
      path: 'members',
      description: 'Manage community members and roles',
    },
    {
      name: 'Rules',
      icon: FaGavel,
      path: 'rules',
      description: 'Set and manage community rules',
    },
    {
      name: 'Delete Community',
      icon: FaTrash,
      path: 'delete',
      description: 'Permanently delete this community',
    },
  ];

  return (
    <nav className="mt-4">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={`/communities/${id}/admin/settings/${item.path}`}
          className={({ isActive }) =>
            `flex items-center p-4 hover:bg-zinc-800 ${
              isActive ? 'bg-zinc-800' : ''
            }`
          }
        >
          <item.icon className="w-6 h-6 mr-4" />
          <div>
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-sm text-gray-400">{item.description}</p>
          </div>
        </NavLink>
      ))}
    </nav>
  );
};

export default AdminNavigation;
