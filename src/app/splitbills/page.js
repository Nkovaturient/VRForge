'use client';
import React, { useState, useEffect, useRef } from "react";
import { useAccount } from 'wagmi';
import { Randomness } from 'randomness-js';
import { ethers } from 'ethers';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../../config';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, User, Zap, Shield, Heart, Star, HomeIcon, Plus, X, DollarSign, Users, RotateCcw } from 'lucide-react';
import { lensTestnet } from "viem/chains";
import Link from "next/link";

export default function splitBillsFairly() {

    const { isConnected, address } = useAccount();

    // Contract interaction states
    const { data: readData, refetch: refetchReadData } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'randomness',
    });

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isTransactionLoading, isSuccess: isTransactionSuccess } = useWaitForTransactionReceipt({ hash });

    // Component states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSplitBill, setShowSplitBill] = useState(false);
    const [animationPhase, setAnimationPhase] = useState('idle'); // idle, spinning, revealing, complete
    const [numParticipants, setNumParticipants] = useState(2);
    const [participants, setParticipants] = useState(['Person 1', 'Person 2']);
    const [totalAmount, setTotalAmount] = useState('');
    const [randomnessValue, setRandomnessValue] = useState(null);
    const [transactionHash, setTransactionHash] = useState(null);
    const [splitResults, setSplitResults] = useState([]);
    const [spinnerRotation, setSpinnerRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);

    const handleBillSplitting = async () => {
        if (!isConnected) {
            setError('Please connect your wallet first');
            return;
        }

        if (!totalAmount || isNaN(parseFloat(totalAmount)) || parseFloat(totalAmount) <= 0) {
            setError('Please enter a valid total amount');
            return;
        }

        if (participants.length < 2) {
            setError('Please add at least 2 participants');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setAnimationPhase('spinning');
            setIsSpinning(true);

            const callbackGasLimit = 700_000;
            const jsonProvider = new ethers.JsonRpcProvider(
                `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`
            );

            console.log("Setting up randomness...");
            const randomness = Randomness.createBaseSepolia(jsonProvider);
            const [requestCallbackPrice] = await randomness.calculateRequestPriceNative(BigInt(callbackGasLimit));

            writeContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'rollDiceWithDirectFunding',
                args: [callbackGasLimit],
                value: requestCallbackPrice,
            });

        } catch (err) {
            console.error('Error generating random number:', err);
            setError(`Failed to generate randomness: ${err.message}`);
            setLoading(false);
            setAnimationPhase('idle');
            setIsSpinning(false);
        }
    };

    const genFairSplit = async (randomness) => {
        const total = parseFloat(totalAmount);
        const numPeople = participants.length;

        // Use randomness to create fair splits
        const seed = parseInt(randomness.replace('.', ''), 10);
        const splits = [];

        // Generate random weights for each participant
        let remainingAmount = total;
        const weights = [];

        for (let i = 0; i < numPeople - 1; i++) {
            const randomWeight = (seed * (i + 1)) % 100 + 1;
            weights.push(randomWeight);
        }

        // Calculate proportional splits
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) + 50; // Add base weight for last person
        weights.push(50); // Base weight for last person

        for (let i = 0; i < numPeople; i++) {
            const amount = (weights[i] / totalWeight) * total;
            splits.push({
                name: participants[i],
                amount: Math.round(amount * 100) / 100,
                percentage: Math.round((weights[i] / totalWeight) * 100)
            });
        }

        // Adjust for rounding errors
        const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);
        const difference = total - totalSplit;
        if (Math.abs(difference) > 0.01) {
            splits[splits.length - 1].amount += difference;
        }

        return splits;
    };

    const addParticipant = () => {
        if (participants.length < 10) {
            setParticipants([...participants, `Person ${participants.length + 1}`]);
        }
    };

    const removeParticipant = (index) => {
        if (participants.length > 2) {
            const newParticipants = participants.filter((_, i) => i !== index);
            setParticipants(newParticipants);
        }
    };

    const updateParticipantName = (index, newName) => {
        const newParticipants = [...participants];
        newParticipants[index] = newName;
        setParticipants(newParticipants);
    };

    const resetForm = () => {
        setParticipants(['Person 1', 'Person 2']);
        setTotalAmount('');
        setAnimationPhase('idle');
        setShowSplitBill(false);
        setSplitResults([]);
        setSpinnerRotation(0);
        setIsSpinning(false);
        setError(null);
    };

    // Handle transaction success and fetch character
    useEffect(() => {
        if (isTransactionSuccess && readData) {
            const randomnVal = readData;
            const getRandomness = ethers?.formatEther(randomnVal).slice(0, 6);
            setRandomnessValue(getRandomness);

            // Split the bills randomly in a fair, verifiable way
            const fetchSplitBill = async () => {
                setAnimationPhase('revealing');
                const splitBill = await genFairSplit(getRandomness);

                if (splitBill) {
                    setSplitResults(splitBill);
                    setTimeout(() => {
                        setShowSplitBill(true);
                        setAnimationPhase('complete');
                        setLoading(false);
                        setIsSpinning(false);
                    }, 2000);
                } else {
                    setError('Failed to provide Split Bill. Please try again.');
                    setAnimationPhase('idle');
                    setLoading(false);
                    setIsSpinning(false);
                }
            };

            fetchSplitBill();
        }
    }, [isTransactionSuccess, readData]);

    useEffect(() => {
        if (hash) {
            setTransactionHash(hash);
        }
    }, [hash, isPending, isTransactionLoading, isTransactionSuccess]);

    useEffect(() => {
        if (transactionHash && !isTransactionLoading && !isTransactionSuccess) {
            setError('Transaction failed or was dropped. Please try again.');
            setLoading(false);
            setAnimationPhase('idle');
        }
    }, [transactionHash, isTransactionLoading, isTransactionSuccess]);


    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-4"
                    >
                        🎯 Fair Bill Splitter
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-purple-200"
                    >
                        Split bills fairly using blockchain randomness
                    </motion.p>
                </div>
                <div className="flex items-center space-x-4 m-4">
                    <HomeIcon className="w-8 h-8" />
                    <Link href="/"><span>Home!</span></Link>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Users className="w-6 h-6" />
                            Setup Your Bill Split
                        </h2>

                        {/* Total Amount Input */}
                        <div className="mb-6">
                            <label className="block text-white font-medium mb-2">Total Amount ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="number"
                                    value={totalAmount}
                                    onChange={(e) => setTotalAmount(e.target.value)}
                                    placeholder="Enter total bill amount"
                                    className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Participants */}
                        <div className="mb-6">
                            <label className="block text-white font-medium mb-2">Participants</label>
                            <div className="space-y-3">
                                {participants.map((participant, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center gap-2"
                                    >
                                        <input
                                            type="text"
                                            value={participant}
                                            onChange={(e) => updateParticipantName(index, e.target.value)}
                                            className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder={`Person ${index + 1}`}
                                        />
                                        {participants.length > 2 && (
                                            <button
                                                onClick={() => removeParticipant(index)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                                {participants.length < 10 && (
                                    <button
                                        onClick={addParticipant}
                                        className="flex items-center gap-2 px-4 py-2 text-purple-300 hover:text-purple-200 hover:bg-purple-500/20 rounded-lg transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Participant
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleBillSplitting}
                                disabled={loading || !isConnected}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        {animationPhase === 'spinning' ? 'Spinning...' : 'Processing...'}
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5" />
                                        Spin & Split
                                    </>
                                )}
                            </button>
                            <button
                                onClick={resetForm}
                                className="px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <RotateCcw className="w-5 h-5" />
                                Reset
                            </button>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200"
                            >
                                {error}
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Spinner and Results */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Sparkles className="w-6 h-6" />
                            {animationPhase === 'idle' ? 'Ready to Spin' :
                                animationPhase === 'spinning' ? 'Spinning...' :
                                    animationPhase === 'revealing' ? 'Revealing Results' : 'Results'}
                        </h2>

                        {/* 3D Spinner */}
                        <div className="relative flex justify-center items-center mb-8">
                            <div className="relative w-80 h-80">
                                {/* Spinner Wheel */}
                                <motion.div
                                    className="w-full h-full rounded-full border-8 border-white/30 relative overflow-hidden"
                                    style={{
                                        background: 'conic-gradient(from 0deg, #8b5cf6, #ec4899, #06b6d4, #10b981, #f59e0b, #ef4444, #8b5cf6)',
                                        transform: `rotate(${spinnerRotation}deg)`,
                                        transformStyle: 'preserve-3d',
                                        boxShadow: '0 0 50px rgba(139, 92, 246, 0.5), inset 0 0 50px rgba(255, 255, 255, 0.1)'
                                    }}
                                    animate={isSpinning ? {
                                        rotate: [0, 360 * 5 + (Math.random() * 360)]
                                    } : {}}
                                    transition={isSpinning ? {
                                        duration: 3,
                                        ease: "easeOut"
                                    } : {}}
                                >
                                    {/* Participant Labels */}
                                    {participants.map((participant, index) => {
                                        const angle = (360 / participants.length) * index;
                                        const labelAngle = angle + (360 / participants.length) / 2;
                                        return (
                                            <div
                                                key={index}
                                                className="absolute inset-0 flex items-center justify-center"
                                                style={{
                                                    transform: `rotate(${labelAngle}deg) translateY(-120px)`,
                                                    transformOrigin: 'center'
                                                }}
                                            >
                                                <div className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                                                    {participant}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </motion.div>

                                {/* Center Circle */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                                        <Sparkles className="w-8 h-8 text-purple-600" />
                                    </div>
                                </div>

                                {/* Pointer */}
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                                    <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
                                </div>
                            </div>
                        </div>

                        {/* Results Display */}
                        <AnimatePresence>
                            {showSplitBill && splitResults.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-4"
                                >
                                    <h3 className="text-xl font-bold text-white mb-4">No 'One' to Blame! Just Split & Pay!</h3>
                                    {splitResults.map((result, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-white/20 rounded-lg p-4 flex justify-between items-center"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{result.name}</div>
                                                    <div className="text-purple-200 text-sm">{result.percentage}%</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-white">${result.amount.toFixed(2)}</div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* Total Verification */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4 border border-green-500/30"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-white font-medium">Total:</span>
                                            <span className="text-2xl font-bold text-white">
                                                ${splitResults.reduce((sum, result) => sum + result.amount, 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Randomness Display */}
                        {randomnessValue && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 p-3 bg-purple-500/20 border border-purple-500/50 rounded-lg"
                            >
                                <div className="text-purple-200 text-sm">
                                    <span className="font-medium">Randomness Seed:</span> {randomnessValue}
                                </div>
                                {typeof window !== 'undefined' && (() => {
                                    try {
                                        if (!transactionHash) return null;
                                        const href = `https://sepolia.basescan.org/tx/${transactionHash}`;
                                        return (
                                            <p className="mt-1">
                                                <span className="font-medium">Transaction:</span> <a href={href} target="_blank" rel="noreferrer" className="underline text-emerald-600">View on BaseScan</a>
                                            </p>
                                        );
                                    } catch { return null; }
                                })()}
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center mt-8 text-purple-200"
                >
                    <p>Powered by drand randomness for fair, verifiable bill splitting.</p>
                </motion.div>
            </div>
        </div>
    )
}
