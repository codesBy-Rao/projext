import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="h-screen w-64 bg-gray-800 text-gray-100 flex flex-col">
      <div className="p-6 text-2xl font-bold text-gradient gradient-accent">
        🐞 CodeBugX
      </div>
      <nav className="flex-1">
        <ul className="space-y-4 p-4">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/code-submission"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              Code Submission
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              Analytics
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              History
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;