import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen ">

      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="container mx-auto px-6 py-4 text-center text-gray-400">
          <p>Datos proporcionados por Spotify • Actualizado en tiempo real</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;