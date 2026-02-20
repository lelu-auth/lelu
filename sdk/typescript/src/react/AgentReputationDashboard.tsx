import React, { useState, useEffect, useMemo } from 'react';

interface AgentStats {
  agentId: string;
  totalActions: number;
  allowedActions: number;
  deniedActions: number;
  humanReviews: number;
  averageConfidence: number;
  hallucinationScore: number; // 0-100, higher means more denied actions
  lastActive: string;
}

interface AgentReputationDashboardProps {
  apiBaseUrl?: string;
  refreshIntervalMs?: number;
}

// Simple SVG Icons
const RefreshIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l5.25 4.24"/></svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

const AlertTriangleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

export const AgentReputationDashboard: React.FC<AgentReputationDashboardProps> = ({
  apiBaseUrl = 'http://localhost:8080',
  refreshIntervalMs = 10000,
}) => {
  const [stats, setStats] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof AgentStats; direction: 'asc' | 'desc' }>({
    key: 'hallucinationScore',
    direction: 'desc'
  });

  const fetchStats = async (showRefreshState = false) => {
    if (showRefreshState) setIsRefreshing(true);
    try {
      const response = await fetch(`${apiBaseUrl}/v1/analytics/agents`);
      if (!response.ok) throw new Error('Failed to fetch agent analytics');
      const data = await response.json();
      setStats(data.stats || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(false), refreshIntervalMs);
    return () => clearInterval(interval);
  }, [apiBaseUrl, refreshIntervalMs]);

  const handleSort = (key: keyof AgentStats) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const processedStats = useMemo(() => {
    let result = [...stats];

    // Filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(agent => agent.agentId.toLowerCase().includes(lowerQuery));
    }

    // Sort
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [stats, searchQuery, sortConfig]);

  // Calculate aggregates
  const totalAgents = stats.length;
  const totalActions = stats.reduce((sum, a) => sum + a.totalActions, 0);
  const avgHallucination = stats.length ? stats.reduce((sum, a) => sum + a.hallucinationScore, 0) / stats.length : 0;
  const highRiskAgents = stats.filter(a => a.hallucinationScore > 50).length;

  if (loading && stats.length === 0) {
    return (
      <div className="animate-pulse space-y-4 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>)}
        </div>
        <div className="h-64 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden font-sans">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-blue-600"><ShieldIcon /></span>
            Agent Reputation & Hallucination Index
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Real-time monitoring of autonomous agent behavior and policy compliance.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search agents..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-48 transition-shadow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => fetchStats(true)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-white"
            title="Refresh data"
          >
            <RefreshIcon className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangleIcon /> {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gray-50/30 border-b border-gray-200">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Active Agents</div>
          <div className="text-2xl font-bold text-gray-900">{totalAgents}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Actions Evaluated</div>
          <div className="text-2xl font-bold text-gray-900">{totalActions.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Avg Hallucination Score</div>
          <div className="text-2xl font-bold text-gray-900 flex items-baseline gap-2">
            {avgHallucination.toFixed(1)}
            <span className="text-xs font-normal text-gray-500">/ 100</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">High Risk Agents</div>
          <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
            {highRiskAgents}
            {highRiskAgents > 0 && <AlertTriangleIcon />}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: 'agentId', label: 'Agent ID' },
                { key: 'totalActions', label: 'Total Actions' },
                { key: 'allowedActions', label: 'Allowed' },
                { key: 'deniedActions', label: 'Denied' },
                { key: 'averageConfidence', label: 'Avg Confidence' },
                { key: 'hallucinationScore', label: 'Hallucination Risk' }
              ].map((col) => (
                <th 
                  key={col.key}
                  onClick={() => handleSort(col.key as keyof AgentStats)}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none group"
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <span className={`text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${sortConfig.key === col.key ? 'opacity-100 text-blue-600' : ''}`}>
                      {sortConfig.key === col.key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processedStats.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                    <ShieldIcon />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">No agents found</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {searchQuery ? "Try adjusting your search query." : "No agent activity has been recorded yet."}
                  </p>
                </td>
              </tr>
            ) : (
              processedStats.map((agent) => (
                <tr key={agent.agentId} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mr-3">
                        {agent.agentId.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{agent.agentId}</div>
                        <div className="text-xs text-gray-500">Last active: {new Date(agent.lastActive || Date.now()).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {agent.totalActions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {agent.allowedActions.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${agent.deniedActions > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {agent.deniedActions.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full" 
                          style={{ width: `${agent.averageConfidence * 100}%` }}
                        ></div>
                      </div>
                      {(agent.averageConfidence * 100).toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            agent.hallucinationScore > 50 ? 'bg-red-500' : 
                            agent.hallucinationScore > 20 ? 'bg-yellow-400' : 'bg-green-500'
                          }`}
                          style={{ width: `${agent.hallucinationScore}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-bold ${
                        agent.hallucinationScore > 50 ? 'text-red-600' : 
                        agent.hallucinationScore > 20 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {agent.hallucinationScore.toFixed(0)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
