
import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { FEATURES, CATEGORIES } from '../constants';
import { ArrowRight, CheckCircle, Star, ShieldCheck, MapPin } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { loginAs, setCurrentUser } = useApp();

  const handleGetStarted = (role: UserRole) => {
    loginAs(role);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-8">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">India's Most Trusted Network</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight mb-6">
            Hire the best <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Experts locally.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-slate-500 mb-10 leading-relaxed">
            From plumbing to electrical work, TaskFlow connects you with verified service partners at fixed or bid-based prices. Transparent, reliable, and fast.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => handleGetStarted(UserRole.CUSTOMER)}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center group"
            >
              I need help
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => handleGetStarted(UserRole.WORKER)}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 font-bold border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center"
            >
              I want to work
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Partners', value: '5k+' },
              { label: 'Completed Jobs', value: '25k+' },
              { label: 'Average Rating', value: '4.8/5' },
              { label: 'Cities Covered', value: '12+' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div className="max-w-xl">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">What do you need done?</h2>
            <p className="text-slate-500">Choose from our most popular service categories.</p>
          </div>
          <button className="hidden sm:flex items-center text-indigo-600 font-bold text-sm hover:underline">
            View all categories <ArrowRight className="ml-1 w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="group p-6 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all text-center cursor-pointer">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors text-slate-400">
                {cat.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-800">{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Designed for confidence.</h2>
            <p className="text-slate-400 max-w-xl mx-auto">We've built a platform where trust is the primary currency. Quality and safety are never compromised.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <div key={i} className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
                <div className="bg-indigo-600/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-12 text-center text-white shadow-2xl shadow-indigo-200">
          <h2 className="text-4xl font-black mb-6">Ready to find your expert?</h2>
          <p className="text-indigo-100 mb-10 max-w-lg mx-auto">Join thousands of customers who have already found their perfect service partner on TaskFlow.</p>
          <button 
             onClick={() => handleGetStarted(UserRole.CUSTOMER)}
             className="px-10 py-5 bg-white text-indigo-600 font-bold rounded-2xl hover:scale-105 transition-all shadow-xl"
          >
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
