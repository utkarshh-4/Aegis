import React, { useState } from 'react';
import { 
  Network, 
  Server, 
  Database, 
  Code2, 
  Monitor, 
  Box,
  ChevronRight,
  ChevronDown,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

interface SurfaceNode {
  id: string;
  label: string;
  type: 'root' | 'category' | 'component' | 'endpoint';
  icon?: React.ReactNode;
  children?: SurfaceNode[];
  details?: {
    component: string;
    endpoint?: string;
    technology: string;
    securityChecks: string[];
    relatedFindings: string[];
  };
}

const attackSurfaceData: SurfaceNode = {
  id: 'root',
  label: 'World Monitor',
  type: 'root',
  icon: <Network className="w-4 h-4" />,
  children: [
    {
      id: 'web',
      label: 'Web Application',
      type: 'category',
      icon: <Monitor className="w-4 h-4" />,
      children: [
        {
          id: 'web-routes',
          label: 'Client Routes',
          type: 'component',
          details: {
            component: 'React Router',
            technology: 'React 18',
            securityChecks: ['Authorization Guards', 'XSS Defenses'],
            relatedFindings: []
          }
        },
        {
          id: 'web-forms',
          label: 'Authentication Forms',
          type: 'component',
          details: {
            component: 'Login & Registration',
            technology: 'HTML5 / React',
            securityChecks: ['CSRF Protection', 'Rate Limiting'],
            relatedFindings: []
          }
        },
        {
          id: 'web-modules',
          label: 'Client Modules',
          type: 'component',
          details: {
            component: 'Core UI & State',
            technology: 'Zustand',
            securityChecks: ['State Tampering Analysis'],
            relatedFindings: []
          }
        }
      ]
    },
    {
      id: 'api',
      label: 'REST API',
      type: 'category',
      icon: <Server className="w-4 h-4" />,
      children: [
        {
          id: 'api-auth',
          label: 'Authentication Endpoints',
          type: 'endpoint',
          details: {
            component: 'Auth Controller',
            endpoint: '/api/v1/auth/*',
            technology: 'Express / JWT',
            securityChecks: ['Token Validation', 'Brute Force Prevention'],
            relatedFindings: ['WM-API-002']
          }
        },
        {
          id: 'api-data',
          label: 'Data Interfaces',
          type: 'endpoint',
          details: {
            component: 'Data Controllers',
            endpoint: '/api/v1/data/*',
            technology: 'Express',
            securityChecks: ['IDOR Checks', 'Input Validation'],
            relatedFindings: []
          }
        }
      ]
    },
    {
      id: 'mcp',
      label: 'Model Context Protocol (MCP)',
      type: 'category',
      icon: <Code2 className="w-4 h-4" />,
      children: [
        {
          id: 'mcp-tools',
          label: 'Available Tools',
          type: 'component',
          details: {
            component: 'Tool Registry',
            technology: 'MCP SDK',
            securityChecks: ['Parameter Injection', 'Privilege Escalation'],
            relatedFindings: []
          }
        },
        {
          id: 'mcp-proxy',
          label: 'Proxy Endpoints',
          type: 'endpoint',
          details: {
            component: 'Outbound Proxy',
            endpoint: '/api/mcp-proxy',
            technology: 'Vercel Edge Functions',
            securityChecks: ['SSRF Prevention', 'DNS Rebinding', 'Allowlisting'],
            relatedFindings: ['WM-API-001']
          }
        }
      ]
    },
    {
      id: 'desktop',
      label: 'Desktop Environment',
      type: 'category',
      icon: <Box className="w-4 h-4" />,
      children: [
        {
          id: 'desktop-ipc',
          label: 'IPC Surface',
          type: 'component',
          details: {
            component: 'Tauri IPC Bridge',
            technology: 'Tauri / Rust',
            securityChecks: ['Command Injection', 'Event Spoofing'],
            relatedFindings: []
          }
        },
        {
          id: 'desktop-sidecar',
          label: 'Native Sidecars',
          type: 'component',
          details: {
            component: 'Local Executables',
            technology: 'C++',
            securityChecks: ['Binary Signing', 'Path Traversal'],
            relatedFindings: []
          }
        }
      ]
    },
    {
      id: 'storage',
      label: 'Data Storage',
      type: 'category',
      icon: <Database className="w-4 h-4" />,
      children: [
        {
          id: 'storage-convex',
          label: 'Convex Database',
          type: 'component',
          details: {
            component: 'Primary Datastore',
            technology: 'Convex',
            securityChecks: ['Row-Level Security', 'Injection Defense'],
            relatedFindings: []
          }
        },
        {
          id: 'storage-redis',
          label: 'Redis Cache',
          type: 'component',
          details: {
            component: 'Session & Rate Limit Store',
            technology: 'Upstash Redis',
            securityChecks: ['Access Control', 'Data Leakage'],
            relatedFindings: []
          }
        },
        {
          id: 'storage-local',
          label: 'Client Storage',
          type: 'component',
          details: {
            component: 'localStorage / IndexedDB',
            technology: 'Browser API',
            securityChecks: ['Sensitive Data Exposure', 'XSS Extraction'],
            relatedFindings: []
          }
        }
      ]
    }
  ]
};

export default function AttackSurfaceView() {
  const [selectedNode, setSelectedNode] = useState<SurfaceNode | null>(null);

  // Auto-select root on mount
  React.useEffect(() => {
    setSelectedNode(attackSurfaceData);
  }, []);

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-md p-5 shadow-sm shrink-0">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-1">Attack Surface</h1>
        <p className="text-sm text-[#64748B]">Discovered application components, endpoints, interfaces, and trust boundaries.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left: Tree Visualization */}
        <div className="lg:w-1/3 bg-[#FFFFFF] border border-[#E2E8F0] rounded-md shadow-sm overflow-y-auto flex flex-col">
          <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#F1F5F9]/30 shrink-0">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Architecture Hierarchy</h3>
          </div>
          <div className="p-4 flex-1">
            <div className="font-mono text-sm text-[#0F172A]">
              <TreeNode node={attackSurfaceData} selectedNode={selectedNode} onSelect={setSelectedNode} />
            </div>
          </div>
        </div>

        {/* Right: Selected Node Details */}
        <div className="flex-1 bg-[#FFFFFF] border border-[#E2E8F0] rounded-md shadow-sm flex flex-col overflow-y-auto">
          <div className="px-5 py-4 border-b border-[#E2E8F0] shrink-0">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Component Analysis</h3>
            <div className="flex items-center space-x-3">
              <span className="text-[#1D4ED8]">{selectedNode?.icon || <Box className="w-5 h-5" />}</span>
              <h2 className="text-lg font-semibold text-[#0F172A]">{selectedNode?.label || 'Select a component'}</h2>
            </div>
          </div>
          
          <div className="p-6 flex-1">
            {!selectedNode?.details ? (
              <div className="flex flex-col items-center justify-center h-full text-[#64748B] space-y-3 opacity-60">
                <Info className="w-8 h-8" />
                <p className="text-sm">Select a specific leaf component to view detailed architecture mapping.</p>
              </div>
            ) : (
              <div className="space-y-8">
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-bold">Component</span>
                    <div className="text-sm text-[#0F172A] font-mono p-2.5 bg-[#F7F8FA] border border-[#E2E8F0] rounded">
                      {selectedNode.details.component}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-bold">Technology</span>
                    <div className="text-sm text-[#0F172A] font-mono p-2.5 bg-[#F7F8FA] border border-[#E2E8F0] rounded">
                      {selectedNode.details.technology}
                    </div>
                  </div>
                </div>

                {selectedNode.details.endpoint && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-bold">Exposed Endpoint</span>
                    <div className="text-sm text-[#0F172A] font-mono p-2.5 bg-[#F7F8FA] border border-[#E2E8F0] rounded flex items-center text-[#1D4ED8]">
                      <Server className="w-3.5 h-3.5 mr-2" />
                      {selectedNode.details.endpoint}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-bold">Security Checks Executed</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedNode.details.securityChecks.map((check, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm text-[#0F172A] p-2 bg-[#F7F8FA] border border-[#E2E8F0] rounded">
                        <Lock className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>{check}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-bold">Related Findings</span>
                  {selectedNode.details.relatedFindings.length > 0 ? (
                    <div className="space-y-2">
                      {selectedNode.details.relatedFindings.map((findingId, idx) => (
                        <div key={idx} className="flex items-center space-x-3 text-sm p-3 bg-[#F7F8FA] border border-[#E2E8F0] rounded border-l-2 border-l-[#F59E0B]">
                          <AlertTriangle className="w-4 h-4 text-[#B45309]" />
                          <span className="font-mono text-[#0F172A]">{findingId}</span>
                          <span className="text-[#64748B] text-xs">Vulnerability confirmed during assessment.</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-[#64748B] p-3 bg-[#F7F8FA] border border-[#E2E8F0] rounded border-l-2 border-l-[#22C55E]">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-[#15803D]" />
                      No verified vulnerabilities found in this component.
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Recursive Tree Component
function TreeNode({ 
  node, 
  selectedNode, 
  onSelect,
  level = 0
}: { 
  node: SurfaceNode, 
  selectedNode: SurfaceNode | null, 
  onSelect: (n: SurfaceNode) => void,
  level?: number 
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  
  const isSelected = selectedNode?.id === node.id;
  const isRoot = node.type === 'root';

  return (
    <div className="relative">
      <div 
        className={`flex items-center py-1.5 px-2 cursor-pointer transition-colors rounded group ${
          isSelected ? 'bg-[#F1F5F9] text-[#1D4ED8]' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]/50'
        }`}
        style={{ paddingLeft: `${level * 24 + 8}px` }}
        onClick={() => {
          onSelect(node);
          if (hasChildren && !isRoot) {
            setIsExpanded(!isExpanded);
          }
        }}
      >
        {/* Expand/Collapse Caret */}
        <div className="w-4 flex justify-center mr-1">
          {hasChildren && (
            isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
          )}
        </div>
        
        {/* Node Label & Icon */}
        <div className="flex items-center space-x-2">
          {node.icon && <span className={isSelected ? 'text-[#1D4ED8]' : 'text-[#64748B]'}>{node.icon}</span>}
          <span className={`${isRoot ? 'font-bold' : ''} ${isSelected ? 'font-semibold' : ''}`}>{node.label}</span>
          
          {/* Related Findings Indicator */}
          {node.details?.relatedFindings && node.details.relatedFindings.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#B45309] ml-2" aria-hidden="true" title="Contains findings" />
          )}
        </div>
      </div>
      
      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {/* Subtle vertical line for hierarchy */}
          {level > 0 && (
             <div 
               className="absolute top-7 bottom-2 border-l border-[#E2E8F0]" 
               style={{ left: `${level * 24 + 13}px` }} 
             />
          )}
          {node.children!.map((child) => (
            <TreeNode 
              key={child.id} 
              node={child} 
              selectedNode={selectedNode} 
              onSelect={onSelect} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
