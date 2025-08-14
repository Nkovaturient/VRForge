'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🎲</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">VRForge</h1>
          </div>
          
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
