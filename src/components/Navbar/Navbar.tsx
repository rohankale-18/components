import React from 'react';
import { useTheme } from '@/context/theme-context';

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="flex justify-between items-center p-4 bg-primary-light dark:bg-primary-dark text-white">
      <h1 className="text-lg font-bold">My App</h1>
      <button
        onClick={toggleTheme}
        className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
      >
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
      </button>
    </nav>
  );
};

export default Navbar;
