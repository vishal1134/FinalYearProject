import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Lock, ArrowRight, Loader } from 'lucide-react';
import { toast } from 'react-toastify';

const Login = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const [role, setRole] = useState('PUBLIC');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isRegistering) {
                // Registration Logic
                if (role === 'ADMIN' && email !== 'admin@landregistry.com') {
                    throw new Error("Only 'admin@landregistry.com' can register as ADMIN.");
                }

                await register({
                    name: name || 'New User',
                    email,
                    password,
                    role,
                    nationalId: "123456789" // Dummy ID
                });

                toast.success("Registration successful. Please log in.");
                setIsRegistering(false);
            } else {
                // Login Logic
                await login(role, email, password);
                navigate('/dashboard');
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Authentication failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center relative overflow-hidden">
            {/* Animated Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md z-10">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        LandRegistry
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">
                        {isRegistering ? "Create your account" : "Secure Blockchain-Powered Land Records"}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm text-center mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Role Selector */}
                    <div className="flex bg-gray-800/50 p-1 rounded-lg">
                        {['PUBLIC', 'OWNER', 'ADMIN'].map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setRole(r)}
                                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${role === r
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {isRegistering && (
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-gray-800/50 border border-gray-700 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-all placeholder-gray-500"
                                />
                            </div>
                        )}
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-800/50 border border-gray-700 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-all placeholder-gray-500"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-800/50 border border-gray-700 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-all placeholder-gray-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <>{isRegistering ? "Register Account" : "Access System"} <ArrowRight className="w-5 h-5" /></>}
                    </button>
                </form>

                <div className="mt-6 flex flex-col items-center gap-2 text-sm text-gray-400">
                    <button
                        onClick={() => {
                            if (!email) {
                                setError("Please enter your email first to reset password.");
                                return;
                            }
                            if (window.confirm("Do you want to reset your password to 'admin123' for this account?")) {
                                // Demo Reset Trigger
                                fetch('http://localhost:8080/api/auth/reset-password', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ email, password: 'admin123' })
                                }).then(res => {
                                    if (res.ok) toast.success("Password reset to 'admin123'. Please log in now.");
                                    else toast.error("Failed to reset password. User not found.");
                                }).catch(() => toast.error("Connection error while resetting password."));
                            }
                        }}
                        className="text-gray-500 hover:text-white transition-colors text-xs"
                    >
                        Forgot Password?
                    </button>

                    <button
                        onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                        className="text-blue-400 hover:text-blue-300 font-semibold hover:underline"
                    >
                        {isRegistering ? "Already have an account? Login" : "New User? Register here"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
