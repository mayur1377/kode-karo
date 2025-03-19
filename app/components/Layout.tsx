import React from 'react';
import Header from './Header';
import { SiteFooter } from './SiteFooter';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      {children}
      <SiteFooter />
    </div>
  );
};

export default Layout; 