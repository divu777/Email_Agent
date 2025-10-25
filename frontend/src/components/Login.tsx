import axios from 'axios';
import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, LogIn } from 'lucide-react';
import { config } from '../config';

const Login = () => {
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const getAuthUrl = async () => {
    try {
      setError(null);
      const response = await axios.get(
        `${config.BACKEND_URL}/api/v1/google/authorizationUrl`,
        { withCredentials: true }
      );
      if(!response.data.success && response.data.redirectUrl){
      window.location.href=response.data.redirectUrl
    }
    console.log(JSON.stringify(response.data)+"-----response")
      setAuthUrl(response.data.authUrl);
    } catch (err) {
      setError('Failed to connect to authentication service. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    getAuthUrl();
  }, []);

  const handleLogin = () => {
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    setLoading(true);
    await getAuthUrl();
  };

  if (loading && !retrying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl rounded-3xl p-12 flex flex-col items-center gap-8 max-w-md w-full">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-300 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-slate-700">Preparing your login</h2>
            <p className="text-slate-500">Setting up secure authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl rounded-3xl p-12 max-w-md w-full">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-800">Connection Error</h2>
              <p className="text-slate-600 leading-relaxed">{error}</p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-medium"
              >
                <RefreshCw className={`w-5 h-5 ${retrying ? 'animate-spin' : ''}`} />
                {retrying ? 'Retrying...' : 'Try Again'}
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 text-slate-600 hover:text-slate-800 transition-colors font-medium"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl rounded-3xl p-12 flex flex-col items-center gap-8 max-w-md w-full">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
            <LogIn className="w-8 h-8 text-blue-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-800">Welcome Back</h1>
            <p className="text-slate-600">Sign in with your Google account to continue</p>
          </div>
        </div>

        {/* Login Button */}
        <div className="w-full space-y-4">
          <button
            onClick={handleLogin}
            className="group w-full flex items-center justify-center gap-4 px-8 py-4 bg-white border-2 border-slate-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-6 h-6"
            />
            <span className="text-slate-700 font-semibold group-hover:text-blue-600 transition-colors">
              Continue with Google
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-slate-500">
            Secure authentication powered by Google OAuth 2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;