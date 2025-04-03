import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Wallet } from '../types';

const Settings: React.FC = () => {
  const { state, dispatch } = useApp();
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [error, setError] = useState('');

  const validateEthereumAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleAddWallet = () => {
    setError('');

    if (!newWalletName.trim()) {
      setError('Wallet name cannot be empty');
      return;
    }

    if (!validateEthereumAddress(newWalletAddress)) {
      setError('Invalid Ethereum address format');
      return;
    }

    // Check if the address already exists
    if (state.wallets.some(wallet => wallet.address.toLowerCase() === newWalletAddress.toLowerCase())) {
      setError('This wallet address already exists');
      return;
    }

    const newWallet: Wallet = {
      name: newWalletName.trim(),
      address: newWalletAddress,
    };

    dispatch({ type: 'ADD_WALLET', payload: newWallet });
    setNewWalletName('');
    setNewWalletAddress('');
  };

  const handleRemoveWallet = (index: number) => {
    dispatch({ type: 'REMOVE_WALLET', payload: index });
  };

  const resetToDefaults = () => {
    const DEFAULT_WALLETS: Wallet[] = [
      { address: '0x37a42e78a25539006ab038f17019f833b79516f9', name: 'foot-01' },
      { address: '0x2d2b91e478ea9f02f953779bdb2f52d18b589523', name: 'foot-02' },
      { address: '0xf7d4aee315cbc90ce8f8ee71adbc50806878f972', name: 'foot-03' },
      { address: '0xf791eea26f5addc07e434177f0e563712920715e', name: 'foot-04' },
      { address: '0x7e9eab5e9d38b3345f57326c96d0bd65a12b6994', name: 'Foot-05' },
      { address: '0x0A032289552D817C15C185dBfdf43B812423Ba82', name: 'debug' },
    ];
    
    dispatch({ type: 'SET_WALLETS', payload: DEFAULT_WALLETS });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Wallet Management</h2>
        
        {/* Add new wallet form */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Add New Wallet</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Wallet Name</label>
              <input
                type="text"
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                placeholder="e.g., My Primary Wallet"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-300 mb-2">Wallet Address</label>
              <input
                type="text"
                value={newWalletAddress}
                onChange={(e) => setNewWalletAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
              />
            </div>
          </div>
          {error && (
            <p className="text-red-400 mt-2">{error}</p>
          )}
          <button
            onClick={handleAddWallet}
            className="mt-4 bg-footium-orange text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
          >
            Add Wallet
          </button>
        </div>

        {/* Wallet list */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Your Wallets</h3>
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <table className="w-full text-white">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Address</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.wallets.map((wallet, index) => (
                  <tr key={wallet.address} className="border-t border-gray-800">
                    <td className="px-4 py-3">{wallet.name}</td>
                    <td className="px-4 py-3 font-mono text-sm truncate">
                      {wallet.address}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleRemoveWallet(index)}
                        className="text-red-400 hover:text-red-300"
                        aria-label={`Remove ${wallet.name}`}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {state.wallets.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-center text-gray-400">
                      No wallets added. Add a wallet to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reset to defaults */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-medium text-white mb-3">Reset Settings</h3>
          <button
            onClick={resetToDefaults}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Reset to Default Wallets
          </button>
          <p className="mt-2 text-gray-400 text-sm">
            This will restore the original wallet list and remove any custom wallets you've added.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
