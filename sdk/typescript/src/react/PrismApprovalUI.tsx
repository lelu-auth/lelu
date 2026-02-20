import React, { useState, useEffect } from 'react';

interface ApprovalRequest {
  id: string;
  agentId: string;
  action: string;
  resource: Record<string, any>;
  confidence: number;
  reason: string;
  timestamp: string;
}

interface PrismApprovalUIProps {
  apiBaseUrl?: string;
  onApprove?: (request: ApprovalRequest) => void;
  onDeny?: (request: ApprovalRequest) => void;
  pollIntervalMs?: number;
}

export const PrismApprovalUI: React.FC<PrismApprovalUIProps> = ({
  apiBaseUrl = 'http://localhost:8080',
  onApprove,
  onDeny,
  pollIntervalMs = 5000,
}) => {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      // In a real implementation, this would hit the Prism Engine's review queue API
      const response = await fetch(`${apiBaseUrl}/v1/reviews/pending`);
      if (!response.ok) throw new Error('Failed to fetch pending reviews');
      const data = await response.json();
      setRequests(data.requests || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, pollIntervalMs);
    return () => clearInterval(interval);
  }, [apiBaseUrl, pollIntervalMs]);

  const handleAction = async (request: ApprovalRequest, approved: boolean) => {
    try {
      // In a real implementation, this would hit the Prism Engine's review resolution API
      const response = await fetch(`${apiBaseUrl}/v1/reviews/${request.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });
      
      if (!response.ok) throw new Error('Failed to resolve review');
      
      // Remove from local state
      setRequests(prev => prev.filter(r => r.id !== request.id));
      
      // Call callbacks
      if (approved && onApprove) onApprove(request);
      if (!approved && onDeny) onDeny(request);
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading && requests.length === 0) {
    return <div className="p-4 text-gray-500">Loading pending approvals...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="p-6 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
        No pending agent actions require human approval.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900">
        Pending Agent Actions ({requests.length})
      </h3>
      
      <div className="space-y-3">
        {requests.map((req) => (
          <div key={req.id} className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{req.agentId}</span>
                  <span className="text-sm text-gray-500">wants to</span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                    {req.action}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Reason: {req.reason}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${req.confidence < 0.7 ? 'text-red-600' : 'text-yellow-600'}`}>
                  Confidence: {(req.confidence * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(req.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded text-sm font-mono text-gray-700 mb-4 overflow-x-auto">
              {JSON.stringify(req.resource, null, 2)}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleAction(req, true)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Approve Action
              </button>
              <button
                onClick={() => handleAction(req, false)}
                className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Deny
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
