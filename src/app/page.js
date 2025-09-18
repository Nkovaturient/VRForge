'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import RandomnessDemo from '../components/RandomnessDemo';
import ContractInfo from '../components/ContractInfo';
import Header from '../components/Header';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('demo');
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Randomness Solidity
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A demonstration interface for the MockRandomnessReceiver smart contract. 
            Experience verifiable randomness from the dcipher threshold network.
          </p>
        </div>

        {/* Connection Status */}
        {!isConnected ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 mb-6">
                Connect your wallet to start exploring the randomness functionality
              </p>
              <span className="flex justify-center">
              <ConnectButton />
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-lg shadow-md p-1">
                <button
                  onClick={() => setActiveTab('demo')}
                  className={`px-6 py-3 rounded-md font-medium transition-colors ${
                    activeTab === 'demo'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Live Demo
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-6 py-3 rounded-md font-medium transition-colors ${
                    activeTab === 'info'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Contract Info
                </button>
                <button
                  onClick={() => router.push('/ranime')}
                  className={`px-6 py-3 rounded-md font-medium transition-colors ${
                    activeTab === 'anime'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Vibe your Anime Char
                </button>
                <button
                  onClick={() => router.push('/splitbills')}
                  className={`px-6 py-3 rounded-md font-medium transition-colors ${
                    activeTab === 'split'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Let&apos;s Split the bill!
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              {activeTab === 'demo' ? (
                <RandomnessDemo />
              ) : (
                <ContractInfo />
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            Built with ❤️ using randomness-solidity
          </p>
          <div className="flex justify-center space-x-6 mt-4">
            <a 
              href="https://github.com/randa-mu/randomness-solidity" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a 
              href="https://docs.randa.mu/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
