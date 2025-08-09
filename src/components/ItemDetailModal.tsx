import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Share2, Shield, Clock, User, ShoppingCart, Lock } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import toast from 'react-hot-toast';

interface ItemDetailModalProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, isOpen, onClose }) => {
  const [isLiked, setIsLiked] = useState(false);
  const { currentUserAddress } = useSession();

  // Check if current user can buy this escrow item
  const canBuyEscrowItem = (): boolean => {
    if (item.listingType !== 'escrow') return true; // Standard listings can be bought by anyone
    if (!item.escrowBuyerAddress) return true; // If no specific buyer, anyone can buy
    if (!currentUserAddress) return false; // User must be connected to buy escrow items
    
    // Check if current user's address matches the designated buyer address
    return currentUserAddress.toLowerCase() === item.escrowBuyerAddress.toLowerCase();
  };

  // Check if item is reserved for current user
  const isReservedForCurrentUser = (): boolean => {
    return item.listingType === 'escrow' && 
           item.escrowBuyerAddress && 
           currentUserAddress &&
           currentUserAddress.toLowerCase() === item.escrowBuyerAddress.toLowerCase();
  };

  const handlePurchase = () => {
    if (!canBuyEscrowItem()) {
      toast.error('This item is reserved for a specific buyer');
      return;
    }
    
    toast.success('Purchase initiated! Funds moved to escrow.');
    onClose();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass relative max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 glass p-2 rounded-full glass-hover z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="grid md:grid-cols-2 gap-8 p-8">
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-96 object-cover"
                  />
                  {item.inEscrow && (
                    <div className="absolute top-4 left-4 glass px-4 py-2 rounded-full flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-yellow-300" />
                      <span className="text-sm text-yellow-300 font-medium">Escrow Protected</span>
                    </div>
                  )}
                  {isReservedForCurrentUser() && (
                    <div className="absolute top-4 right-4 glass px-4 py-2 rounded-full flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-300" />
                      <span className="text-sm text-green-300 font-medium">Reserved for You</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="flex-1 glass py-3 rounded-xl flex items-center justify-center space-x-2 glass-hover transition-all"
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'text-pink-400 fill-pink-400' : 'text-white'}`} />
                    <span className="text-white">{isLiked ? 'Liked' : 'Like'}</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 glass py-3 rounded-xl flex items-center justify-center space-x-2 glass-hover transition-all"
                  >
                    <Share2 className="w-5 h-5 text-white" />
                    <span className="text-white">Share</span>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{item.title}</h2>
                  <div className="flex items-center space-x-4 text-white/70">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{item.seller}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Listed 2 days ago</span>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/70">Current Price</span>
                    <span className="text-3xl font-bold text-white">{item.price} SUI</span>
                  </div>
                  
                  {/* Conditional Buy Button */}
                  {canBuyEscrowItem() ? (
                    <button
                      onClick={handlePurchase}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 py-4 rounded-xl text-white font-semibold flex items-center justify-center space-x-2 hover:from-purple-600 hover:to-blue-600 transition-all"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>
                        {item.listingType === 'escrow' ? 'Buy Now with Escrow' : 'Buy Now'}
                      </span>
                    </button>
                  ) : (
                    <div className="w-full bg-white/10 py-4 rounded-xl text-white/50 font-semibold flex items-center justify-center space-x-2 cursor-not-allowed">
                      <Lock className="w-5 h-5" />
                      <span>Reserved for Specific Buyer</span>
                    </div>
                  )}
                  
                  <p className="text-xs text-white/50 mt-3 text-center">
                    {item.listingType === 'escrow' 
                      ? 'Transaction protected by smart contract escrow'
                      : 'Standard marketplace transaction'
                    }
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Description</h3>
                  <p className="text-white/70 leading-relaxed">{item.description}</p>
                </div>

                {item.listingType === 'escrow' && (
                  <div className="glass rounded-2xl p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-white">Escrow Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Protection Period</span>
                        <span className="text-white">{item.escrowDuration} days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Dispute Resolution</span>
                        <span className="text-white">Available</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Seller Rating</span>
                        <span className="text-white">4.8/5.0 ⭐</span>
                      </div>
                      {item.escrowBuyerAddress && (
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Buyer Status</span>
                          <span className={`text-sm ${isReservedForCurrentUser() ? 'text-green-400' : 'text-blue-400'}`}>
                            {isReservedForCurrentUser() ? 'You are the designated buyer' : 'Reserved for specific buyer'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ItemDetailModal;
