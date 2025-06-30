import React, { useState } from 'react';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';

interface AuthModalProps {
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  return (
    <div className="fixed inset-0 z-50">
      {mode === 'login' ? (
        <LoginPage 
          onBack={onClose}
          onSwitchToSignup={() => setMode('signup')}
        />
      ) : (
        <SignupPage 
          onBack={onClose}
          onSwitchToLogin={() => setMode('login')}
        />
      )}
    </div>
  );
};

export default AuthModal;