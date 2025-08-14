'use client';

import { useReadContract } from 'wagmi';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config';
import { 
  FileText, 
  Code, 
  Shield, 
  Zap, 
  Clock, 
  Wallet,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function ContractInfo() {
  // Contract read functions
  const { data: randomness } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'randomness',
  });

  const { data: requestId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'requestId',
  });

  const { data: subscriptionId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'subscriptionId',
  });

  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  const { data: randomnessSender } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'randomnessSender',
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Contract Information</h2>
        <p className="text-gray-600">
          Learn about the MockRandomnessReceiver smart contract and its capabilities
        </p>
      </div>

      {/* Contract Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Contract Overview</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-blue-700">Contract Address</p>
            <p className="font-mono text-blue-900 break-all">
              {CONTRACT_ADDRESS === '0x...' ? 'Not deployed yet' : CONTRACT_ADDRESS}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700">Get your <b>RandomnessSender</b> Address based on your deployed contract network here.</p><br/>
            <a href='https://docs.randa.mu/networks/randomness/' className="text-emerald-900"> Official Randamu Docs</a>
          </div>
        </div>
      </div>

      {/* Current State */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Code className="w-5 h-5" />
          <span>Current Contract State</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Randomness</span>
            </div>
            <p className="text-lg font-mono text-gray-900">
              {randomness ? 'Available' : 'None'}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Request ID</span>
            </div>
            <p className="text-lg font-mono text-gray-900">
              {requestId ? requestId.toString() : 'None'}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Wallet className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Subscription ID</span>
            </div>
            <p className="text-lg font-mono text-gray-900">
              {subscriptionId ? subscriptionId.toString().slice(0, 10) + '...' : 'None'}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Owner</span>
            </div>
            <p className="text-sm font-mono text-gray-900">
              {owner ? `${owner.toString().slice(0, 6)}...${owner.toString().slice(-4)}` : 'None'}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Randomness Sender Proxy Contract <i className="text-xs text-gray-500">(Base Sepolia Network, in my case)</i></span>
            </div>
            <p className="text-sm font-mono text-gray-900">
              {randomnessSender ? `${randomnessSender.toString().slice(0, 6)}...${randomnessSender.toString().slice(-4)}` : 'None'}
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Contract Features</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 text-lg">Direct Funding</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Pay per randomness request</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>No subscription required</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Immediate execution</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 text-lg">Subscription Model</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Pre-funded subscription</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Cost-effective for multiple requests</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Shared across multiple contracts</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Info className="w-5 h-5" />
          <span>How It Works</span>
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Request Randomness</h4>
              <p className="text-gray-600">
                Call either <code className="bg-gray-100 px-1 rounded">rollDiceWithDirectFunding</code> or 
                <code className="bg-gray-100 px-1 rounded">rollDiceWithSubscription</code> to request randomness.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Oracle Processing</h4>
              <p className="text-gray-600">
                The dcipher threshold network processes your request and generates cryptographically secure randomness.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Callback Execution</h4>
              <p className="text-gray-600">
                The oracle calls <code className="bg-gray-100 px-1 rounded">receiveRandomness</code> with the generated value.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              4
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Randomness Available</h4>
              <p className="text-gray-600">
                The randomness is stored and can be accessed via the <code className="bg-gray-100 px-1 rounded">randomness</code> variable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
