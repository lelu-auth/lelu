import React, { useState, useEffect } from 'react';

interface AgentStats {
  agentId: string;
  totalActions: number;
  allowedActions: number;
  deniedActions: number;
  humanReviews: number;
  averageConfidence: number;
  hallucinationScore: number; // 0-100, higher means more denied actions
}

interface AgentReputationDashboardProps {
  apiBaseUrl?: string;
  refreshIntervalMs?: number;
}

export const AgentReputationDashboard: React.FC<AgentReputationDashboardProps> = ({
  apiBaseUrl = 'http://localhost:8080',
  refreshIntervalMs = 10000,
}) => {
  const [stats, setStats] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      // In a real implementation, this would hit the Prism Engine's audit analytics API
      const response = await fetch(`${apiBaseUrl}/v1/analytics/agents`);
      if (!response.ok) throw new Error('Failed to fetch agent analytics');
      const data = await response.json();
      setStats(data.stats || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [apiBaseUrl, refreshIntervalMs]);

  if (loading && stats.length === 0) {
    return <div className="p-4 text-gray-500">Loading agent reputation data...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Agent Reputation & Hallucination Index</h2>
        <p className="text-sm text-gray-500 mt-1">
          Real-time monitoring of autonomous agent behavior and policy compliance.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm border-b border-red-100">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Actions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allowed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Denied</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Confidence</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hallucination Risk</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stats.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                  No agent activity recorded yet.
                </td>
              </tr>
            ) : (
              stats.map((agent) => (
                <tr key={agent.agentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {agent.agentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {agent.totalActions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {agent.allowedActions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    {agent.deniedActions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(agent.averageConfidence * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                        <div 
                          className={`h-2.5 rounded-full ${
                            agent.hallucinationScore > 50 ? 'bg-red-600' : 
                            agent.hallucinationScore > 20 ? 'bg-yellow-400' : 'bg-green-500'
                          }`}
                          style={{ width: `${agent.hallucinationScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{agent.hallucinationScore.toFixed(0)}</span>
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
