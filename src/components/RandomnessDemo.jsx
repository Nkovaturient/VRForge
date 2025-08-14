'use client';

import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config';
import { ethers } from 'ethers';
import { Randomness } from 'randomness-js';
import { 
  Dice1, 
  Dice2Icon,
  Dices,
  Zap, 
  Clock, 
  Wallet, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function RandomnessDemo() {
  // Contract read functions
  const { data: randomness, refetch: refetchRandomness } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'randomness',
  });

  const { data: requestId, refetch: refetchRequestId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'requestId',
  });

  const { data: subscriptionId, refetch: refetchSubscriptionId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'subscriptionId',
  });

  const { data: owner, refetch: refetchOwner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  // Write functions
  const { writeContract: writeDirectFunding, data: directFundingHash, isPending: isDirectFundingPending } = useWriteContract();
  const { writeContract: writeSubscription, data: subscriptionHash, isPending: isSubscriptionPending } = useWriteContract();
  // Transaction receipts
  const { isLoading: isDirectFundingLoading, isSuccess: isDirectFundingSuccess } = useWaitForTransactionReceipt({
    hash: directFundingHash,
  });

  const { isLoading: isSubscriptionLoading, isSuccess: isSubscriptionSuccess } = useWaitForTransactionReceipt({
    hash: subscriptionHash,
  });
  const [isRequestPending, setIsRequestPending] = useState(false);

  // Check if request is pending
  const { data: isInFlight } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isInFlight',
    args: [requestId || BigInt(0)],
  });

  const callbackGasLimit = 700_000;

  // Handle direct funding randomness request
  const handleDirectFunding = async () => {
    try {
      setIsRequestPending(true);
      
      // Calculate request price using randomness-js
      const jsonProvider = new ethers.JsonRpcProvider(`https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`);
      const randomness = Randomness.createBaseSepolia(jsonProvider);
      console.log("randomness from Info:", randomness);
      const [requestCallBackPrice] = await randomness.calculateRequestPriceNative(BigInt(callbackGasLimit));

      writeDirectFunding({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'rollDiceWithDirectFunding',
        args: [callbackGasLimit],
        value: requestCallBackPrice,
      });
    } catch (error) {
      console.error('Direct funding failed:', error);
      setIsRequestPending(false);
    }
  };

  // Handle subscription randomness request
  const handleSubscription = async () => {
    try {
      setIsRequestPending(true);
      writeSubscription({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'rollDiceWithSubscription',
        args: [callbackGasLimit],
      });
    } catch (error) {
      console.error('Subscription request failed:', error);
      setIsRequestPending(false);
    }
  };

  // Update request ID when transaction succeeds
  useEffect(() => {
    if (isDirectFundingSuccess || isSubscriptionSuccess) {
      setIsRequestPending(false);
      setTimeout(() => {
        refetchRequestId();
        refetchRandomness();
      }, 5000);
    }
  }, [isDirectFundingSuccess, isSubscriptionSuccess, refetchRequestId, refetchRandomness]);

  // Update subscription when created
  useEffect(() => {
    if (isSubscriptionSuccess) {
      refetchSubscriptionId();
    }
  }, [isSubscriptionSuccess, refetchSubscriptionId]);

  const isLoading = isDirectFundingPending || isSubscriptionPending;
  const isTransactionLoading = isDirectFundingLoading || isSubscriptionLoading;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Randomness Demo</h2>
        <p className="text-gray-600">
          Experience verifiable randomness from the dcipher threshold network
        </p>
      </div>

      {/* Contract Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Dice1 className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Randomness</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-2">
            {randomness ? ethers?.formatEther(randomness).slice(0, 10) + '...' : 'None'}
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900">Request ID</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-2">
            {requestId ? requestId.toString() : 'None'}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900">Subscription ID</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-2">
            {subscriptionId ? subscriptionId.toString().slice(0, 10) + '...' : 'None'}
          </p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-orange-900">Owner</span>
          </div>
          <p className="text-sm font-mono text-orange-900 mt-2">
            {owner ? `${owner.toString().slice(0, 6)}...${owner.toString().slice(-4)}` : 'None'}
          </p>
        </div>
      </div>

      {/* Request Status */}
      {isRequestPending && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
            <span className="font-medium text-yellow-900">Request Pending</span>
          </div>
          <p className="text-yellow-700 mt-2">
            Your randomness request is being processed by the oracle. This may take a few minutes.
          </p>
        </div>
      )}

      {/* Direct Funding Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Dice1 className="w-5 h-5 text-blue-600" />
          <span>Direct Funding Randomness</span>
        </h3>
        <p className="text-gray-600 mb-4">
          Request randomness by paying directly for each request. No subscription required.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={handleDirectFunding}
            disabled={isLoading || isTransactionLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isDirectFundingPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Dice1 className="w-5 h-5" />
                <span>Request Randomness (Direct Funding)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Subscription Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Wallet className="w-5 h-5 text-purple-600" />
          <span>Subscription Management</span>
        </h3>
        <p className="text-gray-600 mb-4">
          Request randomness by paying once via subscription.
        </p>
        
        {subscriptionId && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-4">Request Randomness (Subscription)</h4>
            <button
              onClick={handleSubscription}
              disabled={isLoading || isTransactionLoading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubscriptionPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5" />
                  <span>Request Randomness with Subscription</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Transaction Status */}
      {(isDirectFundingSuccess || isSubscriptionSuccess) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900">Transaction Successful!</span>
          </div>
          <p className="text-green-700 mt-2">
            {isDirectFundingSuccess && "Randomness request submitted successfully!"}
            {isSubscriptionSuccess && "Subscription randomness request submitted successfully!"}
          </p>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={() => {
            refetchRandomness();
            refetchRequestId();
            refetchSubscriptionId();
            refetchOwner();
          }}
          className="bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 flex items-center space-x-2 mx-auto"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Refresh Contract State</span>
        </button>
      </div>
    </div>
  );
}
