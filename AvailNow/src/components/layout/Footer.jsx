import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 p-4 text-center text-sm text-gray-500">
      <p>© {new Date().getFullYear()} AvailNow. All rights reserved.</p>
    </footer>
  );
};

export default Footer
