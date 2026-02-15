import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

// Import ring images
import authRing1 from '@/assets/auth-ring-1.jpg';
import authRing2 from '@/assets/auth-ring-2.jpg';
import authRing3 from '@/assets/auth-ring-3.jpg';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  action?: string;
}

const ringImages = [
  { src: authRing1, title: 'Emerald Elegance', subtitle: 'Handcrafted Perfection' },
  { src: authRing2, title: 'Sapphire Dreams', subtitle: 'Timeless Beauty' },
  { src: authRing3, title: 'Ruby Radiance', subtitle: 'Exquisite Craftsmanship' },
];

export function AuthPromptModal({ isOpen, onClose, action = 'add items to cart' }: AuthPromptModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  // Form states
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  // Auto-slide effect
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ringImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % ringImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + ringImages.length) % ringImages.length);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(signInEmail, signInPassword);
      onClose();
    } catch (error) {
      // Error handled in useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpPassword !== signUpConfirmPassword) return;
    setIsLoading(true);
    try {
      await signUp(signUpEmail, signUpPassword, signUpName);
      onClose();
    } catch (error) {
      // Error handled in useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  const resetForms = () => {
    setSignInEmail('');
    setSignInPassword('');
    setSignUpName('');
    setSignUpEmail('');
    setSignUpPassword('');
    setSignUpConfirmPassword('');
    setShowPassword(false);
  };

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    resetForms();
    setMode(newMode);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden border-0 bg-transparent">
        <div className="grid md:grid-cols-2 min-h-[520px] bg-background rounded-lg overflow-hidden shadow-2xl">
          {/* Left Side - Image Slider */}
          <div className="relative hidden md:block bg-rich-black overflow-hidden">
            {/* Sliding Images */}
            <div className="absolute inset-0">
              {ringImages.map((ring, index) => (
                <div
                  key={index}
                  className={cn(
                    "absolute inset-0 transition-all duration-700 ease-in-out",
                    index === currentSlide
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-105"
                  )}
                >
                  <img
                    src={ring.src}
                    alt={ring.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-rich-black via-rich-black/30 to-transparent" />
                </div>
              ))}
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-8 z-10">
              {/* Logo */}
              <div>
                <h2 className="font-serif text-2xl font-bold text-white">
                  <span className="text-primary">KRT</span> Jewels
                </h2>
                <p className="text-xs text-white/70 tracking-widest uppercase mt-1">
                  Since 30+ Years
                </p>
              </div>

              {/* Ring Info */}
              <div className="space-y-4">
                <div className="transform transition-all duration-500">
                  <h3 className="font-serif text-2xl text-white mb-1">
                    {ringImages[currentSlide].title}
                  </h3>
                  <p className="text-primary text-sm tracking-wide">
                    {ringImages[currentSlide].subtitle}
                  </p>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={prevSlide}
                    className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex gap-2">
                    {ringImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-300",
                          index === currentSlide
                            ? "bg-primary w-6"
                            : "bg-white/40 hover:bg-white/60"
                        )}
                      />
                    ))}
                  </div>
                  <button
                    onClick={nextSlide}
                    className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-6 sm:p-8 flex flex-col justify-center bg-background">
            {/* Mobile Logo */}
            <div className="md:hidden text-center mb-6">
              <h2 className="font-serif text-2xl font-bold">
                <span className="text-primary">KRT</span> Jewels
              </h2>
            </div>

            {/* Mode Tabs */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6">
              <button
                onClick={() => handleModeSwitch('login')}
                className={cn(
                  "flex-1 py-2.5 text-sm font-medium rounded-md transition-all",
                  mode === 'login'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Sign In
              </button>
              <button
                onClick={() => handleModeSwitch('register')}
                className={cn(
                  "flex-1 py-2.5 text-sm font-medium rounded-md transition-all",
                  mode === 'register'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Create Account
              </button>
            </div>

            {/* Sign In Form */}
            {mode === 'login' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="modal-signin-email">Email</Label>
                  <Input
                    id="modal-signin-email"
                    type="email"
                    placeholder="name@example.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                    className="input-luxury"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modal-signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="modal-signin-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                      className="input-luxury pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full btn-premium py-5" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            )}

            {/* Sign Up Form */}
            {mode === 'register' && (
              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="modal-signup-name" className="text-sm">Full Name</Label>
                  <Input
                    id="modal-signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    required
                    className="input-luxury h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="modal-signup-email" className="text-sm">Email</Label>
                  <Input
                    id="modal-signup-email"
                    type="email"
                    placeholder="name@example.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                    className="input-luxury h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="modal-signup-password" className="text-sm">Password</Label>
                  <Input
                    id="modal-signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                    minLength={8}
                    className="input-luxury h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="modal-signup-confirm" className="text-sm">Confirm Password</Label>
                  <Input
                    id="modal-signup-confirm"
                    type="password"
                    placeholder="Confirm your password"
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    required
                    className="input-luxury h-10"
                  />
                  {signUpPassword !== signUpConfirmPassword && signUpConfirmPassword && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full btn-premium py-5 mt-2" 
                  disabled={isLoading || signUpPassword !== signUpConfirmPassword}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            )}

            <p className="text-center text-xs text-muted-foreground mt-4">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline" onClick={onClose}>Terms</Link>
              {' '}&{' '}
              <Link to="/privacy" className="text-primary hover:underline" onClick={onClose}>Privacy Policy</Link>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
