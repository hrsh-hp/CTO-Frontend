
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, TrainFront } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.toLowerCase() === 'admin' && password === 'admin') {
      onLogin();
      navigate('/admin');
    } else {
      setError('Invalid credentials.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in font-sans">
      <div className="bg-white rounded-lg shadow-xl border border-slate-300 max-w-md w-full overflow-hidden">
        
        <div className="bg-[#005d8f] p-6 text-center text-white border-b-4 border-orange-500">
             <div className="mx-auto bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mb-3">
                 <TrainFront className="w-10 h-10" />
             </div>
             <h2 className="text-xl font-bold uppercase tracking-wide">Office of Sr.DSTE</h2>
             <p className="text-sm opacity-80 mt-1">Authorized Personnel Only</p>
        </div>

        <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Username</label>
                <div className="relative">
                <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-[#005d8f] focus:border-[#005d8f] outline-none text-slate-800"
                    placeholder="Enter ID"
                    required
                />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Password</label>
                <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-[#005d8f] focus:border-[#005d8f] outline-none text-slate-800"
                    placeholder="Enter Password"
                    required
                />
                </div>
            </div>

            {error && <p className="text-red-600 text-sm text-center font-medium bg-red-50 p-2 rounded border border-red-100">{error}</p>}

            <button 
                type="submit" 
                className="w-full bg-[#005d8f] hover:bg-[#004a73] text-white font-bold py-3 rounded shadow transition-colors uppercase text-sm tracking-wide"
            >
                Secure Login
            </button>
            </form>
        </div>
        <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t border-slate-200">
            &copy; S&T Department - Ahmedabad Division
        </div>
      </div>
    </div>
  );
};

export default Login;
