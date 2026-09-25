import React, { useState } from 'react';
import { MindMapNode } from '../types/study';
import { BookOpen, ChevronRight, ChevronDown, Circle, Info } from 'lucide-react';

interface MindMapViewProps {
  mindMap: MindMapNode;
  noteTitle: string;
}

export const MindMapView: React.FC<MindMapViewProps> = ({ mindMap, noteTitle }) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    [mindMap.id]: true
  });
  const [selectedNode, setSelectedNode] = useState<MindMapNode>(mindMap);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const renderNode = (node: MindMapNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[node.id] ?? true;
    const isSelected = selectedNode?.id === node.id;

    return (
      <div key={node.id} className="space-y-2">
        <div
          onClick={() => {
            setSelectedNode(node);
            if (hasChildren) toggleNode(node.id);
          }}
          style={{ marginLeft: `${level * 20}px` }}
          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
            isSelected
              ? 'bg-indigo-950/80 border-indigo-500 shadow-lg text-white'
              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="mt-0.5 text-indigo-400 hover:text-indigo-300"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <Circle className="w-2.5 h-2.5 text-indigo-400 shrink-0 mt-1.5" />
          )}

          <div className="space-y-0.5 flex-1">
            <span className="text-sm font-bold font-display block">
              {node.label}
            </span>
            {node.description && (
              <p className="text-xs text-slate-400 line-clamp-1">
                {node.description}
              </p>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-2 border-l-2 border-slate-800 ml-3 pl-2">
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold block">
            Interactive Node Diagram
          </span>
          <h2 className="text-2xl font-bold text-white font-display">
            Concept Mind Map: {noteTitle}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Tree Explorer */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4 max-h-[600px] overflow-y-auto">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Topic Hierarchy (Click nodes to inspect)
          </h3>
          {renderNode(mindMap)}
        </div>

        {/* Right Detail Card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4 h-fit">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase font-bold">
            <Info className="w-4 h-4" />
            <span>Node Detail</span>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-white font-display">
              {selectedNode.label}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              {selectedNode.description || 'No detailed sub-description provided for this concept node.'}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
