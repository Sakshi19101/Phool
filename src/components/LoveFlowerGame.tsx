import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Heart, Flower, Sun, RotateCcw, Gift, Star } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

interface GameCard {
  id: number;
  flower: string;
  emoji: string;
  isGolden: boolean;
  isFlipped: boolean;
  isRevealed: boolean;
}

interface GameResult {
  won: boolean;
  attempts: number;
  reward: string;
  couponCode?: string;
}

const LoveFlowerGame = () => {
  const [cards, setCards] = useState<GameCard[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastPlayDate, setLastPlayDate] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isFlipping, setIsFlipping] = useState<number | null>(null);

  // Initialize cards
  const initializeCards = (): GameCard[] => {
    const flowers = [
      { name: 'Rose', emoji: '🌹' },
      { name: 'Tulip', emoji: '🌷' },
      { name: 'Lily', emoji: '🌺' },
      { name: 'Daisy', emoji: '🌼' },
      { name: 'Orchid', emoji: '🌸' },
      { name: 'Peony', emoji: '🌸' },
      { name: 'Lotus', emoji: '🪷' },
      { name: 'Sunflower', emoji: '🌻', isGolden: true }
    ];

    return flowers.map((flower, index) => ({
      id: index,
      flower: flower.name,
      emoji: flower.emoji,
      isGolden: flower.isGolden || false,
      isFlipped: false,
      isRevealed: false
    }));
  };

  // Check if user can play today
  const canPlayToday = (): boolean => {
    const today = new Date().toDateString();
    const lastPlay = localStorage.getItem('loveFlowerGameLastPlay');
    return lastPlay !== today;
  };

  // Initialize game
  useEffect(() => {
    const today = new Date().toDateString();
    const savedLastPlay = localStorage.getItem('loveFlowerGameLastPlay');
    
    if (savedLastPlay === today) {
      setLastPlayDate(today);
      const savedResult = localStorage.getItem('loveFlowerGameResult');
      if (savedResult) {
        setGameResult(JSON.parse(savedResult));
        setGameState('won');
        setShowResult(true);
      }
    } else {
      resetGame();
    }
  }, []);

  // Reset game
  const resetGame = () => {
    const shuffled = [...initializeCards()].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setAttempts(0);
    setGameState('playing');
    setGameResult(null);
    setShowResult(false);
    setIsPlaying(false);
    localStorage.removeItem('loveFlowerGameResult');
    localStorage.removeItem('loveFlowerGameLastPlay');
  };

  // Handle card flip
  const handleCardFlip = (cardId: number) => {
    if (!isPlaying) {
      setIsPlaying(true);
      const today = new Date().toDateString();
      setLastPlayDate(today);
    }

    if (gameState !== 'playing' || attempts >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped) return;

    // Flip animation
    setIsFlipping(cardId);
    setTimeout(() => {
      setCards(prev => prev.map(c => 
        c.id === cardId ? { ...c, isFlipped: true } : c
      ));
      setIsFlipping(null);
      
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (card.isGolden) {
        // Won the game!
        handleWin(newAttempts);
      } else if (newAttempts >= 2) {
        // Lost the game
        handleLose();
      }
    }, 600);
  };

  // Handle win
  const handleWin = (attemptsUsed: number) => {
    let reward: string;
    let couponCode: string;

    if (attemptsUsed === 1) {
      reward = '₹100 off';
      couponCode = 'TRUELOVE100';
    } else {
      reward = '₹50 off';
      couponCode = 'TRUELOVE50';
    }

    const result: GameResult = {
      won: true,
      attempts: attemptsUsed,
      reward,
      couponCode
    };

    setGameResult(result);
    setGameState('won');
    setShowResult(true);
    
    // Save to localStorage
    const today = new Date().toDateString();
    localStorage.setItem('loveFlowerGameResult', JSON.stringify(result));
    localStorage.setItem('loveFlowerGameLastPlay', today);
    
    // Reveal all cards
    setTimeout(() => {
      setCards(prev => prev.map(c => ({ ...c, isRevealed: true })));
    }, 1000);

    showSuccess(`🎉 Congratulations! You won ${reward}! Coupon: ${couponCode}`);
  };

  // Handle lose
  const handleLose = () => {
    const result: GameResult = {
      won: false,
      attempts: 2,
      reward: '5% off',
      couponCode: 'ALMOSTLOVE5'
    };

    setGameResult(result);
    setGameState('lost');
    setShowResult(true);
    
    // Save to localStorage
    const today = new Date().toDateString();
    localStorage.setItem('loveFlowerGameResult', JSON.stringify(result));
    localStorage.setItem('loveFlowerGameLastPlay', today);
    
    // Reveal all cards
    setTimeout(() => {
      setCards(prev => prev.map(c => ({ ...c, isRevealed: true })));
    }, 1000);

    showSuccess('💔 Almost! You got 5% off coupon: ALMOSTLOVE5');
  };

  // Copy coupon code
  const copyCouponCode = () => {
    if (gameResult?.couponCode) {
      navigator.clipboard.writeText(gameResult.couponCode);
      showSuccess('🎫 Coupon code copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-pink-500 mr-2" />
            <h1 className="text-4xl font-serif text-purple-900 italic">Find the True Love Flower</h1>
            <Heart className="h-8 w-8 text-pink-500 ml-2" />
          </div>
          <p className="text-gray-600 text-lg">
            Flip the cards to find the hidden Golden Sunflower! 🌻
          </p>
          <div className="flex items-center justify-center mt-2 space-x-4">
            <Badge className="bg-purple-100 text-purple-800">
              <Sparkles className="h-3 w-3 mr-1" />
              2 Attempts Only
            </Badge>
            <Badge className="bg-pink-100 text-pink-800">
              <Gift className="h-3 w-3 mr-1" />
              Everyone Wins!
            </Badge>
          </div>
        </div>

        {/* Game Stats */}
        <div className="flex justify-center mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Attempts</p>
                  <p className="text-2xl font-bold text-purple-900">{attempts}/2</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-lg font-semibold text-purple-900 capitalize">
                    {gameState === 'playing' ? '🎮 Playing' : gameState === 'won' ? '🎉 Won!' : '💔 Try Again'}
                  </p>
                </div>
                {lastPlayDate && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Last Play</p>
                    <p className="text-sm font-medium text-purple-900">{lastPlayDate}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
          {cards.map((card) => (
            <div key={card.id} className="relative">
              <Card
                className={`aspect-square cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  card.isFlipped || card.isRevealed
                    ? card.isGolden
                      ? 'bg-gradient-to-br from-yellow-200 to-amber-300 border-yellow-400 shadow-lg'
                      : 'bg-gradient-to-br from-pink-100 to-purple-100 border-purple-200'
                    : 'bg-gradient-to-br from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 border-purple-300'
                } ${gameState !== 'playing' || card.isFlipped ? 'cursor-not-allowed opacity-75' : ''}`}
                onClick={() => handleCardFlip(card.id)}
              >
                <CardContent className="p-4 h-full flex items-center justify-center">
                  <div className={`transition-all duration-600 ${isFlipping === card.id ? 'animate-pulse' : ''}`}>
                    {card.isFlipped || card.isRevealed ? (
                      <div className="text-center">
                        <div className="text-4xl mb-2">{card.emoji}</div>
                        {card.isGolden && (
                          <div className="flex items-center justify-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-xs font-bold text-yellow-700 ml-1">GOLDEN</span>
                          </div>
                        )}
                        <p className="text-xs text-gray-600 mt-1">{card.flower}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Heart className="h-8 w-8 text-white mb-2" />
                        <p className="text-white text-xs font-medium">?</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Result Display */}
        {showResult && gameResult && (
          <Card className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                {gameResult.won ? (
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sun className="h-8 w-8 text-yellow-500" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-pink-500" />
                  </div>
                )}
              </div>
              
              <h3 className="text-2xl font-serif text-purple-900 mb-2">
                {gameResult.won ? '🎉 You Found It!' : '💔 Almost There!'}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {gameResult.won 
                  ? `You found the Golden Sunflower in ${gameResult.attempts} ${gameResult.attempts === 1 ? 'try' : 'tries'}!`
                  : 'Better luck tomorrow! The Golden Sunflower was hiding.'
                }
              </p>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Your Reward:</p>
                <p className="text-2xl font-bold text-purple-900 mb-2">{gameResult.reward}</p>
                <div className="flex items-center justify-center space-x-2">
                  <Badge className="bg-purple-100 text-purple-800">
                    Coupon: {gameResult.couponCode}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyCouponCode}
                    className="border-purple-300 text-purple-900 hover:bg-purple-50"
                  >
                    Copy
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                Come back tomorrow to play again! 🌸
              </p>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!isPlaying && gameState === 'playing' && (
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200 max-w-md mx-auto">
            <CardContent className="p-4">
              <h3 className="font-semibold text-purple-900 mb-2 text-center">How to Play:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Click any card to flip it</li>
                <li>• Find the Golden Sunflower 🌻</li>
                <li>• You have only 2 attempts</li>
                <li>• Everyone wins a prize!</li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Play Again Button */}
        {lastPlayDate && lastPlayDate !== new Date().toDateString() && (
          <div className="text-center mt-6">
            <Button
              onClick={resetGame}
              className="bg-gradient-to-r from-purple-800 to-pink-600 hover:from-purple-900 hover:to-pink-700 text-white font-bold px-6 py-3 shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Play Today's Game
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoveFlowerGame;
