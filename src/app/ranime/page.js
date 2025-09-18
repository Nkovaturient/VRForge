'use client';
import React, { useState, useEffect, useRef } from "react";
import { useAccount } from 'wagmi';
import { Randomness } from 'randomness-js';
import { ethers } from 'ethers';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../../config';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, User, Zap, Shield, Heart, Star, HomeIcon } from 'lucide-react';
import { lensTestnet } from "viem/chains";
import Link from "next/link";
import Image from "next/image";


export default function Ranime() {
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
    const [animeCharacter, setAnimeCharacter] = useState(null);
    const [error, setError] = useState(null);
    const [showCharacter, setShowCharacter] = useState(false);
    const [animationPhase, setAnimationPhase] = useState('idle');
    const [randomnessValue, setRandomnessValue] = useState(null);
    const [transactionHash, setTransactionHash] = useState(null);

    // Animation refs
    const characterRef = useRef(null);
    const containerRef = useRef(null);

    // Anime character data structure
    const [characterStats, setCharacterStats] = useState({
        name: '',
        anime: '',
        image: '',
        power: 0,
        role: '',
        intelligence: 0,
        speed: 0,
        charisma: 0
    });

    const fetchAnimeCharacter = async (randomness) => {
        try {
            setError(null);

            // Use randomness to determine which anime to fetch
            console.log("animeID:", randomness);
            const animeId = randomness;

            // Fetch characters from this anime using the correct endpoint
            const charactersResponse = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/characters`);
            if (!charactersResponse.ok) throw new Error('Failed to fetch anime characters');

            const charactersData = await charactersResponse.json();
            console.log("charactersData:", charactersData);
            // Use randomness to select character from the fetched array


            if (charactersData.data && charactersData.data.length > 0) {
                // Use randomness to select character index from the array
                const characterIndex = parseInt(randomness.slice(2, 10), 16) % charactersData.data.length;
                const character = charactersData.data[characterIndex];
                console.log("Selected character index:", characterIndex, "Character:", character);

                // Generate character stats based on randomness
                const stats = generateCharacterStats(randomness);

                setCharacterStats({
                    name: character.character.name || 'AlienX',
                    anime: character.anime?.title || 'xyz',
                    image: character?.character.images?.webp?.image_url || character?.character.images?.jpg?.image_url,
                    role: character?.role,
                    power: stats.power,
                    intelligence: stats.intelligence,
                    speed: stats.speed,
                    charisma: stats.charisma
                });

                setAnimeCharacter(character);
                return character;
            } else {
                throw new Error('No characters found for this anime');
            }
        } catch (err) {
            console.error('Error fetching anime character:', err);
            setError(err.message);
            return null;
        }
    };

    // Generate character stats based on randomness
    const generateCharacterStats = (randomness) => {
        const seed = parseInt(randomness.slice(2, 10), 16);
        return {
            power: (seed % 100) + 1,
            intelligence: ((seed >> 8) % 100) + 1,
            speed: ((seed >> 16) % 100) + 1,
            charisma: ((seed >> 24) % 100) + 1
        };
    };


    const handleGenerateAnimeChar = async () => {

        if (!isConnected) {
            setError('Please connect your wallet first');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setAnimationPhase('generating');
            setShowCharacter(false);

            setAnimeCharacter(null);
            setCharacterStats({
                name: '',
                anime: '',
                image: '',
                power: 0,
                role: '',
                intelligence: 0,
                speed: 0,
                charisma: 0
            });

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
            setLoading(false);
            setRandomnessValue(randomness);

        } catch (err) {
            console.error('Error generating random number:', err);
            setError(`Failed to generate randomness: ${err.message}`);
            setLoading(false);
            setAnimationPhase('idle');
        }
    };

    // Handle transaction success and fetch character
    useEffect(() => {
        if (isTransactionSuccess && readData) {
            const randomn = readData;
            // console.log("randomn:", ethers?.formatEther(randomn));
            const randomness = ethers?.formatEther(randomn).slice(0, 3);
            setRandomnessValue(randomness);

            // Fetch anime character based on randomness
            const fetchCharacter = async () => {
                setAnimationPhase('revealing');
                const character = await fetchAnimeCharacter(randomness);

                if (character) {
                    setTimeout(() => {
                        setShowCharacter(true);
                        setAnimationPhase('complete');
                        setLoading(false);
                    }, 2000); // Delay for dramatic effect
                } else {
                    setError('Failed to generate character. Please try again.');
                    setAnimationPhase('idle');
                    setLoading(false);
                }
            };

            fetchCharacter();
        }
    }, [isTransactionSuccess, readData, fetchAnimeCharacter]);

    // Monitor transaction hash for debugging
    useEffect(() => {
        if (hash) {
            setTransactionHash(hash);
        }
    }, [hash, isPending, isTransactionLoading, isTransactionSuccess]);

    // Handle transaction errors and failures
    useEffect(() => {
        if (transactionHash && !isTransactionLoading && !isTransactionSuccess) {
            // Transaction failed or was dropped
            setError('Transaction failed or was dropped. Please try again.');
            setLoading(false);
            setAnimationPhase('idle');
        }
    }, [transactionHash, isTransactionLoading, isTransactionSuccess]);

    // Reset function
    const handleReset = () => {
        setShowCharacter(false);
        setAnimeCharacter(null);
        setCharacterStats({
            name: '',
            anime: '',
            image: '',
            power: 0,
            role: '',
            intelligence: 0,
            speed: 0,
            charisma: 0
        });
        setAnimationPhase('idle');
        setError(null);
    };

    // Loading animation phases
    const renderLoadingAnimation = () => {
        switch (animationPhase) {
            case 'generating':
                return (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center space-y-6"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-24 h-24 border-4 border-purple-500 border-t-transparent rounded-full"
                        />
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-2xl font-bold text-purple-600"
                        >
                            Generating Randomness...
                        </motion.div>
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="text-lg text-gray-600"
                        >
                            fetching your anime character
                        </motion.div>
                    </motion.div>
                );

            case 'revealing':
                return (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center space-y-6"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 180, 360]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center"
                        >
                            <Sparkles className="w-12 h-12 text-white" />
                        </motion.div>
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="text-2xl font-bold text-purple-600"
                        >
                            Revealing Character...
                        </motion.div>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    // Character display component
    const renderCharacter = () => {
        if (!animeCharacter || !showCharacter) return null;

        return (
            <motion.div
                ref={characterRef}
                initial={{ scale: 0, opacity: 0, rotateY: -180 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{
                    duration: 1.5,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                }}
                className="w-full max-w-4xl mx-auto"
            >
                <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-3xl p-8 shadow-2xl border border-purple-400/30">
                    {/* Character Header */}
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-center mb-8"
                    >
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                            {characterStats.name}
                        </h1>
                    </motion.div>

                    {/* Character Content */}
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        {/* Character Image */}
                        <motion.div
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex justify-center"
                        >
                            <div className="relative group">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotateY: 5 }}
                                    className="w-64 h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-purple-400/50"
                                >
                                    <Image
                                        src={characterStats.image}
                                        alt={characterStats.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/256x320/4C1D95/FFFFFF?text=Character';
                                        }}
                                    />
                                </motion.div>

                                {/* Floating stats badges */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -top-4 -right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold"
                                >
                                    ROLE: {characterStats.role}
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Character Stats */}
                        <motion.div
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="space-y-6"
                        >
                            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                                <Star className="w-8 h-8 text-yellow-400 mr-3" />
                                Character Stats
                            </h2>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-purple-800/50 rounded-xl p-4 border border-purple-400/30"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Zap className="w-6 h-6 text-yellow-400" />
                                        <div>
                                            <p className="text-purple-200 text-sm">Power</p>
                                            <p className="text-2xl font-bold text-white">{characterStats.power}</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-blue-800/50 rounded-xl p-4 border border-blue-400/30"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Shield className="w-6 h-6 text-blue-400" />
                                        <div>
                                            <p className="text-blue-200 text-sm">Intelligence</p>
                                            <p className="text-2xl font-bold text-white">{characterStats.intelligence}</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-green-800/50 rounded-xl p-4 border border-green-400/30"
                                >
                                    <div className="flex items-center space-x-3">
                                        <User className="w-6 h-6 text-green-400" />
                                        <div>
                                            <p className="text-green-200 text-sm">Speed</p>
                                            <p className="text-2xl font-bold text-white">{characterStats.speed}</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-pink-800/50 rounded-xl p-4 border border-pink-400/30"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Heart className="w-6 h-6 text-pink-400" />
                                        <div>
                                            <p className="text-pink-200 text-sm">Charisma</p>
                                            <p className="text-2xl font-bold text-white">{characterStats.charisma}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Randomness Display */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="bg-gray-800/50 rounded-xl p-4 border border-gray-400/30"
                            >
                                <p className="text-gray-300 text-sm mb-2">Verifiable Randomness:</p>
                                <p className="text-xs text-gray-400 font-mono break-all">
                                    {randomnessValue ? randomnessValue.slice(0, 20) + '...' : 'Generating...'}
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleGenerateAnimeChar}
                            disabled={loading || isPending || isTransactionLoading}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
                            <span>Generate New Character</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleReset}
                            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300"
                        >
                            Reset
                        </motion.button>
                    </motion.div>
                </div>
            </motion.div>
        );
    };

    // Error display
    const renderError = () => {
        if (!error) return null;

        return (
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-red-500/20 border border-red-500/50 rounded-2xl p-6 text-center"
            >
                <p className="text-red-400 text-lg font-semibold mb-4">Oops! Something went wrong</p>
                <p className="text-red-300 mb-4">{error}</p>
                <button
                    onClick={() => setError(null)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl transition-colors"
                >
                    Dismiss
                </button>
            </motion.div>
        );
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 py-12 px-4">
            <div className="container mx-auto max-w-6xl">
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                        🎭 Anime Character Generator
                    </h1>
                    <p className="text-xl text-purple-200 max-w-3xl mx-auto">
                        Discover your unique anime character through verifiable blockchain randomness.
                        Each character is generated using cryptographically secure randomness from the blockchain.
                    </p>
                </motion.div>

                {/* Wallet Connection Check */}
                {!isConnected ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-purple-800/30 border border-purple-400/50 rounded-3xl p-8 text-center"
                    >
                        <User className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
                        <p className="text-purple-200 mb-6">
                            Please connect your wallet to start generating random anime characters
                        </p>
                    </motion.div>
                ) : (
                    /* Main Content */
                    <div className="space-y-8">
                        {/* Generate Button */}
                        {!showCharacter && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleGenerateAnimeChar}
                                    disabled={loading || isPending || isTransactionLoading}
                                    className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-bold py-6 px-12 rounded-3xl text-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl"
                                >
                                    <div className="flex items-center space-x-4">
                                        <Sparkles className="w-8 h-8" />
                                        <span>Get My Anime Character!</span>
                                    </div>
                                </motion.button>

                                {loading && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-purple-300 mt-4 text-lg"
                                    >
                                        Generating verifiable randomness...
                                    </motion.p>
                                )}
                            </motion.div>
                        )}

                        {/* Loading Animation */}
                        {loading && !showCharacter && (
                            <div className="flex justify-center">
                                {renderLoadingAnimation()}
                            </div>
                        )}

                        {/* Error Display */}
                        {renderError()}

                        {/* Character Display */}
                        <AnimatePresence>
                            {renderCharacter()}
                        </AnimatePresence>

                        <div className="flex items-center space-x-4">
                                        <HomeIcon className="w-8 h-8" />
                                        <Link href="/"><span>Home!</span></Link>
                                </div>
                        {/* Debug Panel for Troubleshooting */}
                        {isConnected && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-gray-800/50 border border-gray-400/30 rounded-2xl p-6"
                            >
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <span className="mr-2">🔧</span>
                                    Debug Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-2">
                                        <p className="text-gray-300">
                                            <span className="font-semibold">Contract Address:</span>
                                            <span className="ml-2 text-gray-400 font-mono text-xs break-all">
                                            {CONTRACT_ADDRESS.toString().slice(0, 6)}...{CONTRACT_ADDRESS.toString().slice(-4)}
                                            </span>
                                        </p>
                                        <p className="text-gray-300">
                                            <span className="font-semibold">Wallet Address:</span>
                                            <span className="ml-2 text-gray-400 font-mono text-xs break-all">
                                                {address.toString().slice(0, 4)}...{address.toString().slice(-4)}
                                            </span>
                                        </p>
                                        <p className="text-gray-300">
                                            <span className="font-semibold">Current Randomness:</span>
                                            <span className="ml-2 text-gray-400 font-mono text-xs break-all">
                                                {readData ? readData.slice(0, 10) + '...' : 'None'}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-gray-300">
                                            <span className="font-semibold">Transaction Status:</span>
                                            <span className={`ml-2 ${isPending ? 'text-yellow-400' : isTransactionLoading ? 'text-blue-400' : isTransactionSuccess ? 'text-green-400' : 'text-gray-400'}`}>
                                                {isPending ? 'Pending' : isTransactionLoading ? 'Processing' : isTransactionSuccess ? 'Success' : 'Idle'}
                                            </span>
                                        </p>
                                        <p className="text-gray-300">
                                            <span className="font-semibold">Loading State:</span>
                                            <span className={`ml-2 ${loading ? 'text-yellow-400' : 'text-gray-400'}`}>
                                                {loading ? 'Active' : 'Inactive'}
                                            </span>
                                        </p>
                                        <p className="text-gray-300">
                                            <span className="font-semibold">Animation Phase:</span>
                                            <span className="ml-2 text-purple-400 capitalize">
                                                {animationPhase}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                {error && (
                                    <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                                        <p className="text-red-300 text-sm">
                                            <span className="font-semibold">Error:</span> {error}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Transaction Status */}
                        {(isPending || isTransactionLoading) && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-blue-500/20 border border-blue-500/50 rounded-2xl p-6 text-center"
                            >
                                <div className="flex items-center justify-center space-x-3">
                                    <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-blue-300 text-lg">
                                        {isPending ? 'Confirming transaction...' : 'Processing randomness...'}
                                    </span>
                                </div>
                                {hash && (
                                    <div className="mt-4 text-sm text-blue-200">
                                        <p>Transaction Hash: {hash.slice(0, 10)}...{hash.slice(-8)}</p>
                                        <p className="text-xs mt-2">
                                            {isPending ? 'Waiting for wallet confirmation' : 'Randomness being generated on-chain'}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Transaction Error Status */}
                        {transactionHash && !isTransactionLoading && !isTransactionSuccess && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-red-500/20 border border-red-500/50 rounded-2xl p-6 text-center"
                            >
                                <div className="flex items-center justify-center space-x-3 mb-4">
                                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm">!</span>
                                    </div>
                                    <span className="text-red-300 text-lg font-semibold">
                                        Transaction Failed
                                    </span>
                                </div>
                                <p className="text-red-200 mb-4">
                                    The transaction was dropped or failed. This usually happens due to:
                                </p>
                                <ul className="text-red-200 text-sm text-left max-w-md mx-auto space-y-1">
                                    <li>• Insufficient gas or incorrect gas configuration</li>
                                    <li>• Network congestion or high gas prices</li>
                                    <li>• Contract state issues</li>
                                    <li>• User rejection or wallet issues</li>
                                </ul>
                                <div className="mt-4">
                                    <button
                                        onClick={handleGenerateAnimeChar}
                                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl transition-colors mr-3"
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={() => {
                                            setError(null);
                                            setTransactionHash(null);
                                        }}
                                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-xl transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}