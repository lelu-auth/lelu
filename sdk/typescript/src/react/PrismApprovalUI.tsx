import React, { useState, useEffect, useMemo } from 'react';

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

// Simple SVG Icons to avoid external dependencies
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);

const ChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
);

export const PrismApprovalUI: React.FC<PrismApprovalUIProps> = ({
  apiBaseUrl = 'http://localhost:8080',
  onApprove,
  onDeny,
  pollIntervalMs = 5000,
}) => {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
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
    setProcessingId(request.id);
    try {
      const response = await fetch(`${apiBaseUrl}/v1/reviews/${request.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });
      
      if (!response.ok) throw new Error('Failed to resolve review');
      
      setRequests(prev => prev.filter(r => r.id !== request.id));
      if (approved && onApprove) onApprove(request);
      if (!approved && onDeny) onDeny(request);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = useMemo(() => {
    if (!searchQuery) return requests;
    const lowerQuery = searchQuery.toLowerCase();
    return requests.filter(req => 
      req.agentId.toLowerCase().includes(lowerQuery) || 
      req.action.toLowerCase().includes(lowerQuery)
    );
  }, [requests, searchQuery]);

  if (loading && requests.length === 0) {
    return (
      <div className="animate-pulse space-y-4 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-32 bg-gray-100 rounded-lg border border-gray-200"></div>
        <div className="h-32 bg-gray-100 rounded-lg border border-gray-200"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-[800px] font-sans">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            Human-in-the-Loop Review
            {requests.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {requests.length} Pending
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Review and authorize agent actions that fell below confidence thresholds.
          </p>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search agents or actions..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 transition-shadow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <XIcon /> {error}
        </div>
      )}

      {/* Content */}
      <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-600">
              <CheckIcon />
            </div>
            <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
            <p className="text-gray-500 mt-1 max-w-sm">
              {searchQuery 
                ? "No requests match your search criteria." 
                : "There are no pending agent actions requiring human approval at this time."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => {
              const isExpanded = expandedId === req.id;
              const isProcessing = processingId === req.id;
              const confidenceColor = req.confidence < 0.5 ? 'text-red-700 bg-red-50 border-red-200' : 
                                      req.confidence < 0.8 ? 'text-yellow-700 bg-yellow-50 border-yellow-200' : 
                                      'text-green-700 bg-green-50 border-green-200';

              return (
                <div 
                  key={req.id} 
                  className={`bg-white border rounded-xl shadow-sm transition-all duration-200 ${isProcessing ? 'opacity-50 pointer-events-none' : 'hover:shadow-md border-gray-200'}`}
                >
                  <div className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      
                      {/* Left side: Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="font-semibold text-gray-900 text-base">{req.agentId}</span>
                          <span className="text-gray-400 text-sm">requested</span>
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-mono font-medium rounded-md border border-gray-200">
                            {req.action}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 leading-relaxed">
                          <span className="font-medium text-gray-700">Reason:</span> {req.reason}
                        </p>
                        
                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {new Date(req.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Right side: Confidence & Actions */}
                      <div className="flex flex-col items-end gap-3 min-w-[140px]">
                        <div className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 ${confidenceColor}`}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                          {(req.confidence * 100).toFixed(1)}% Confidence
                        </div>
                        
                        <div className="flex gap-2 w-full">
                          <button
                            onClick={() => handleAction(req, false)}
                            disabled={isProcessing}
                            className="flex-1 flex justify-center items-center gap-1 bg-white border border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            <XIcon /> Deny
                          </button>
                          <button
                            onClick={() => handleAction(req, true)}
                            disabled={isProcessing}
                            className="flex-1 flex justify-center items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                          >
                            <CheckIcon /> Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Payload Section */}
                  <div className="border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                    <button 
                      onClick={() => setExpandedId(isExpanded ? null : req.id)}
                      className="w-full px-5 py-2.5 flex items-center justify-between text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <span>View Resource Payload</span>
                      {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </button>
                    
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1">
                        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto shadow-inner">
                          <pre className="text-xs text-green-400 font-mono leading-relaxed">
                            {JSON.stringify(req.resource, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
