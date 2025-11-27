import React, { useState, useEffect } from "react";
import LoginPage from "./LoginPage";
import { Camera, Brain, Zap, Shield, CheckCircle, ChevronDown, Sparkles } from "lucide-react";

function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToLogin = () => {
    document.getElementById('login-section').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white overflow-x-hidden">
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-700"></div>
        <div className="absolute -bottom-32 left-1/3 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      {/* Floating Navigation Dots */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 space-y-4">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-3 h-3 rounded-full bg-white bg-opacity-30 hover:bg-opacity-100 transition-all duration-300 block"
        ></button>
        <button 
          onClick={scrollToLogin}
          className="w-3 h-3 rounded-full bg-white bg-opacity-30 hover:bg-opacity-100 transition-all duration-300 block"
        ></button>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-32">
        <div className="relative z-10 w-full max-w-6xl mx-auto text-center space-y-8">
          
          {/* Animated Logo */}
          <div className="relative inline-block mb-6 animate-float">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-2xl opacity-50"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl shadow-lg flex items-center justify-center animate-bounce">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                SmartAttendance
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Next-generation, AI-powered attendance system using 
              <span className="text-cyan-400 font-semibold"> real-time face recognition</span> for smart classrooms.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
  <button 
    onClick={scrollToLogin}
    className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold shadow-lg hover:shadow-cyan-500/50 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
  >
    Get Started
    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
  </button>
  
  <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/50 transform hover:-translate-y-1 transition-all duration-300">
    Learn More
  </button>
</div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto pt-12">
            <div className="bg-white bg-opacity-5 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-10 hover:bg-opacity-10 transition-all duration-300">
              <div className="text-4xl font-bold text-cyan-400 mb-2">99.8%</div>
              <div className="text-sm text-slate-400">Accuracy Rate</div>
            </div>
            <div className="bg-white bg-opacity-5 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-10 hover:bg-opacity-10 transition-all duration-300">
              <div className="text-4xl font-bold text-purple-400 mb-2">&lt;2s</div>
              <div className="text-sm text-slate-400">Recognition Time</div>
            </div>
            <div className="bg-white bg-opacity-5 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-10 hover:bg-opacity-10 transition-all duration-300">
              <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
              <div className="text-sm text-slate-400">Active System</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button 
          onClick={scrollToLogin}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
        >
          <ChevronDown className="w-8 h-8 text-slate-400" />
        </button>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful AI Features
            </h2>
            <p className="text-xl text-slate-400">
              Built for modern classrooms with cutting-edge technology
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {/* Feature 1 */}
            <div className="group bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-md p-6 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Live Camera Feed</h3>
              <p className="text-slate-400 text-sm">Real-time video processing from classroom cameras with HD quality</p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Recognition</h3>
              <p className="text-slate-400 text-sm">Advanced neural networks for accurate face detection and recognition</p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-md p-6 rounded-2xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Auto Logging</h3>
              <p className="text-slate-400 text-sm">Automatic attendance marking with instant database updates</p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-md p-6 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Access</h3>
              <p className="text-slate-400 text-sm">End-to-end encryption with GDPR compliant data protection</p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/20 shadow-2xl">
            <h3 className="text-3xl font-bold mb-8 text-center">How It Works</h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h4 className="text-xl font-semibold">Camera Capture</h4>
                <p className="text-slate-400">Live video feed captures student faces in the classroom</p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h4 className="text-xl font-semibold">AI Processing</h4>
                <p className="text-slate-400">Neural network identifies and verifies student identities</p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h4 className="text-xl font-semibold">Auto Mark</h4>
                <p className="text-slate-400">Attendance is automatically logged in real-time database</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section id="login-section" className="relative py-20 px-4">
        <div className="max-w-2xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-cyan-500/20 px-4 py-2 rounded-full mb-4">
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">SECURE ACCESS</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Access Your Dashboard</h2>
            <p className="text-slate-400 text-lg">
              Log in to manage attendance, view analytics, and control system settings
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            
            {/* Card Header */}
            <div className="relative bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 px-8 py-12 text-center overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              
              {/* Active Indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-white/80">SYSTEM ONLINE</span>
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Administrator Login</h3>
                <p className="text-blue-100">Enter your credentials to continue</p>
              </div>
            </div>

            {/* Login Form */}
            <div className="p-8 md:p-10">
              <LoginPage />
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 px-8 py-6 text-center border-t border-white/10">
              <p className="text-sm text-slate-400 mb-3">
                Need access? <a href="#" className="text-cyan-400 hover:text-cyan-300 font-semibold">Contact Administrator</a>
              </p>
              {/* <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Shield className="w-3 h-3" />
                <span>Protected by end-to-end encryption</span>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-400 mb-4">
            © {new Date().getFullYear()} SmartAttendance — AI-Powered Attendance System
          </p>
          <div className="flex justify-center gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Support</a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .delay-700 {
          animation-delay: 700ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}

export default HomePage;