import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { UserData } from '../types';
import { Zap, TrendingUp, AlertTriangle, Briefcase, FileText } from 'lucide-react';

interface DashboardProps {
  data: UserData;
  onExport: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onExport }) => {
  return (
    <div className="animate-fade-in space-y-8">
      <h2 className="text-3xl md:text-4xl font-black text-white font-mono uppercase">
        Dashboard – Unfair Advantage Unlocked
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Credit Score */}
        <div className="bg-dark-700 rounded-2xl p-6 shadow-xl border border-green-500/30 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-900/20 transition-all duration-300">
          <p className="text-gray-400 text-sm">Credit Score</p>
          <p className="text-5xl font-black text-green-400 font-mono my-2">{data.creditScore}</p>
          <p className="text-green-400 font-bold text-sm">+87 in 47 days</p>
        </div>

        {/* Tax Savings */}
        <div className="bg-dark-700 rounded-2xl p-6 shadow-xl border border-monkey/30 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-monkey/20 transition-all duration-300">
          <p className="text-gray-400 text-sm">Tax Savings Found</p>
          <p className="text-5xl font-black text-monkey font-mono my-2">${data.taxSavings.toLocaleString()}</p>
          <p className="text-monkey text-sm font-bold">S-Corp Election Pending</p>
        </div>

        {/* Active Disputes */}
        <div className="bg-dark-700 rounded-2xl p-6 shadow-xl border border-red-500/30 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-900/20 transition-all duration-300">
          <p className="text-gray-400 text-sm">Active Disputes</p>
          <p className="text-5xl font-black text-red-400 font-mono my-2">{data.activeDisputes}</p>
          <p className="text-gray-400 text-sm">Expected +124 pts</p>
        </div>

        {/* PayDex */}
        <div className="bg-dark-700 rounded-2xl p-6 shadow-xl border border-blue-500/30 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300">
          <p className="text-gray-400 text-sm">Business PayDex</p>
          <p className="text-5xl font-black text-blue-400 font-mono my-2">{data.businessPaydex}</p>
          <p className="text-green-400 text-sm">↑12 Points</p>
        </div>
      </div>

      {/* Chart & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart Section */}
        <div className="bg-dark-700 rounded-2xl p-6 shadow-xl border border-monkey/20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-monkey">Credit Score History</h3>
            <button 
              onClick={onExport}
              className="bg-monkey hover:bg-monkey-dark text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <FileText size={16} />
              EXPORT REPORT
            </button>
          </div>
          <div className="h-[300px] w-full bg-gradient-to-b from-monkey/10 to-transparent rounded-xl p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.creditHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#9ca3af" 
                  tick={{fontFamily: 'Space Mono', fontSize: 12}} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  domain={[550, 750]} 
                  tick={{fontFamily: 'Space Mono', fontSize: 12}}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f1629', borderColor: '#ff6b35', color: '#fff' }}
                  itemStyle={{ color: '#ff6b35' }}
                />
                <ReferenceLine y={700} label="Goal" stroke="#10b981" strokeDasharray="3 3" />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#ff6b35" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#ff6b35', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Kills Section */}
        <div className="bg-dark-700 rounded-2xl p-6 shadow-xl border border-monkey/20">
            <h3 className="text-xl font-bold text-monkey mb-6">Monkey's Top 3 Kills Right Now</h3>
            <ul className="space-y-4">
                <li className="flex items-start gap-4 p-4 bg-dark-800 rounded-xl hover:bg-dark-900 transition-colors">
                    <Zap className="text-monkey shrink-0 mt-1" />
                    <div>
                        <p className="font-bold text-white text-lg">Capital One collection (2022)</p>
                        <p className="text-gray-400">Medical + past statute = 92% deletion chance</p>
                    </div>
                </li>
                <li className="flex items-start gap-4 p-4 bg-dark-800 rounded-xl hover:bg-dark-900 transition-colors">
                    <TrendingUp className="text-monkey shrink-0 mt-1" />
                    <div>
                        <p className="font-bold text-white text-lg">Discover It Secured Strategy</p>
                        <p className="text-gray-400">Graduate → Chase Freedom Unlimited path active</p>
                    </div>
                </li>
                <li className="flex items-start gap-4 p-4 bg-dark-800 rounded-xl hover:bg-dark-900 transition-colors">
                    <Briefcase className="text-monkey shrink-0 mt-1" />
                    <div>
                        <p className="font-bold text-white text-lg">S-Corp Election by Mar 15</p>
                        <p className="text-gray-400">Projected savings: $9,400 immediately</p>
                    </div>
                </li>
            </ul>
        </div>
      </div>
    </div>
  );
};
