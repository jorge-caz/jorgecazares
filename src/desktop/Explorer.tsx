import React, { useState, useRef, useEffect } from 'react';
import { useFS } from '../context/FSContext';
import IconGrid from '../components/IconGrid';
import type { FSNode } from '../data/fs';
import { findNode, thisPcStructure } from '../data/fs';
import './Explorer.css';

interface ExplorerProps {
  initialNodeId: string;
  onNavigate?: (nodeId: string) => void;
  onOpen: (node: FSNode) => void;
}

const Explorer: React.FC<ExplorerProps> = ({ initialNodeId, onNavigate, onOpen }) => {
  const { fs, add, remove, update } = useFS();
  const [currentNodeId, setCurrentNodeId] = useState(initialNodeId);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    targetNode: FSNode | null;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal state with prop changes
  useEffect(() => {
    setCurrentNodeId(initialNodeId);
  }, [initialNodeId]);

  // Get current node from either main FS or This PC structure
  const getCurrentNode = (nodeId: string): FSNode | null => {
    // First try main file system
    const mainNode = findNode(fs, nodeId);
    if (mainNode) return mainNode;
    
    // If not found, try This PC structure
    return findNode(thisPcStructure, nodeId);
  };

  const currentNode = getCurrentNode(currentNodeId);
  const thisPcNode = thisPcStructure;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Don't close if clicking on the context menu itself
      if ((e.target as Element)?.closest('.context-menu')) {
        return;
      }
      setContextMenu(null);
    };

    // Use capture phase to ensure we can properly handle the event
    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, []);

  const handleSidebarClick = (nodeId: string) => {
    setCurrentNodeId(nodeId);
    onNavigate?.(nodeId);
  };

  const handleContextMenu = (e: React.MouseEvent, node: FSNode) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close any existing menu first
    setContextMenu(null);
    
    // Small delay to prevent immediate closure by click handler
    setTimeout(() => {
      // Get the Explorer container's position to calculate relative coordinates
      const containerRect = containerRef.current?.getBoundingClientRect();
      const x = containerRect ? e.clientX - containerRect.left : e.clientX;
      const y = containerRect ? e.clientY - containerRect.top : e.clientY;
      
      setContextMenu({
        x,
        y,
        targetNode: node,
      });
    }, 10);
  };

  const handleDelete = (node: FSNode) => {
    // Check if the node is marked as protected
    if (node.protected) {
      // For system executables and critical applications, show specific error messages
      if (node.id.includes('exe') || ['internet-explorer', 'windows-defender', 'adobe-reader'].includes(node.id)) {
        let errorMessage = 'Cannot delete system file.';
        
        if (node.id.includes('exe')) {
          errorMessage = `Cannot delete "${node.name}". This file is required for system operation.`;
        } else if (node.id === 'internet-explorer') {
          errorMessage = 'Internet Explorer cannot be deleted. It is integrated into Windows. (Unfortunately 😔)';
        } else if (node.id === 'windows-defender') {
          errorMessage = 'Windows Defender is protecting your system and cannot be removed. (It\'s doing its best!)';
        } else if (node.id === 'adobe-reader') {
          errorMessage = 'Adobe Reader cannot be deleted. It will find another way to exist on your computer anyway.';
        }

        onOpen({
          id: 'system-error-' + node.id,
          name: 'System Protection',
          type: 'file',
          payload: { content: 'system-error', message: errorMessage }
        });
      } else {
        // For protected folders, require admin authentication
        onOpen({
          id: 'password-dialog',
          name: 'Administrator Authentication Required',
          type: 'file',
          payload: { content: 'password-dialog' }
        });
      }
      setContextMenu(null);
      return;
    }

    // Only allow deletion of unprotected nodes in the main file system (user files)
    if (isInMainFS(node.id)) {
      remove(node.id);
    }
    setContextMenu(null);
  };

  const handleRename = (node: FSNode) => {
    // Only allow renaming of nodes in the main file system
    if (!isInMainFS(node.id)) {
      alert('Cannot rename system files.');
      setContextMenu(null);
      return;
    }

    const newName = prompt('Enter new name:', node.name);
    if (newName && newName !== node.name) {
      update({ ...node, name: newName });
    }
    setContextMenu(null);
  };

  const handleNewFolder = () => {
    // Only allow creating folders in the main file system
    if (!isInMainFS(currentNodeId)) {
      alert('Cannot create folders in system directories.');
      setContextMenu(null);
      return;
    }

    const name = prompt('Enter folder name:');
    if (name) {
      const newFolder: FSNode = {
        id: crypto.randomUUID(),
        name,
        type: 'folder',
        children: []
      };
      add(currentNodeId, newFolder);
    }
    setContextMenu(null);
  };

  const handleFileOpen = (node: FSNode) => {
    // If it's a folder and we have navigation capability, navigate instead of opening new window
    if (node.type === 'folder' && onNavigate) {
      handleSidebarClick(node.id);
    } else {
      // For non-folders (files, executables), use the original open behavior
      onOpen(node);
    }
  };

  // Helper function to check if node exists in main FS only (not This PC)
  const isInMainFS = (nodeId: string): boolean => {
    const stack: FSNode[] = [fs];
    while (stack.length) {
      const node = stack.pop()!;
      if (node.id === nodeId) return true;
      if (node.type === 'folder') {
        stack.push(...node.children);
      }
    }
    return false;
  };

  // Helper function to check if a node is a protected system item
  const isSystemItem = (nodeId: string): boolean => {
    // Find the node and check if it's marked as protected
    const node = getCurrentNode(nodeId);
    return node?.protected === true;
  };

  // ---------------- Terminal ----------------
  const handleOpenTerminal = (node: FSNode) => {
    const targetFolder = node.type === 'folder' ? node : getCurrentNode(currentNodeId)
    if (!targetFolder || targetFolder.type !== 'folder') {
      setContextMenu(null)
      return
    }
    onOpen({
      id: 'terminal-' + targetFolder.id + '-' + Date.now(),
      name: 'Terminal',
      type: 'file',
      payload: { content: 'terminal', cwd: targetFolder.id }
    })
    setContextMenu(null)
  }

  if (!currentNode || currentNode.type !== 'folder') {
    return <div>Invalid folder</div>;
  }

  return (
    <div className="explorer-container" ref={containerRef}>
      <div className="explorer-layout">
        <div className="explorer-system">
          <div className="explorer-header">
            <span>System</span>
          </div>
          <div className="system-panel">
            <div 
              className="system-item clickable"
              onClick={() => handleSidebarClick('this-pc')}
              onContextMenu={(e) => thisPcNode && handleContextMenu(e, thisPcNode)}
            >
              <span className="system-emoji">💻</span>
              <span>This PC</span>
            </div>
            <div className="system-separator"></div>
            <div 
              className="system-item clickable"
              onClick={() => handleSidebarClick('desktop-folder')}
              onContextMenu={(e) => handleContextMenu(e, { id: 'desktop-folder', name: 'Desktop', type: 'folder', children: [], protected: true })}
            >
              <span className="system-emoji">🖥️</span>
              <span>Desktop</span>
            </div>
          </div>
        </div>
        
        <div className="explorer-files">
          <div className="explorer-header">
            <span>Files</span>
          </div>
          <div className="explorer-content">
            <IconGrid 
              folderId={currentNodeId} 
              onOpen={handleFileOpen}
              unbounded 
              mode="list"
              nodes={isInMainFS(currentNodeId) ? undefined : currentNode.children}
            />
          </div>
        </div>
      </div>

      {contextMenu && (
        <div
          className="context-menu"
          style={{
            position: 'absolute',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 9999,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Check if it's a system item */}
          {contextMenu.targetNode && isSystemItem(contextMenu.targetNode.id) ? (
            // System items: only show Delete (will trigger protection)
            <div 
              className="context-menu-item system-item" 
              onClick={() => contextMenu.targetNode && handleDelete(contextMenu.targetNode)}
              title="Protected system item - requires admin privileges"
              style={{ 
                color: '#dc2626', 
                fontWeight: '500',
                background: 'rgba(239, 68, 68, 0.05)'
              }}
            >
              Delete
            </div>
          ) : (
            // Regular items: show full menu
            <>
              {isInMainFS(currentNodeId) && (
                <>
                  <div className="context-menu-item" onClick={() => contextMenu.targetNode && handleOpenTerminal(contextMenu.targetNode)}>
                    Open in Terminal
                  </div>
                  <div className="context-menu-separator"></div>
                  <div className="context-menu-item" onClick={handleNewFolder}>
                    New Folder
                  </div>
                  <div className="context-menu-separator"></div>
                </>
              )}
              <div 
                className="context-menu-item" 
                onClick={() => contextMenu.targetNode && handleRename(contextMenu.targetNode)}
              >
                Rename
              </div>
              <div 
                className="context-menu-item" 
                onClick={() => contextMenu.targetNode && handleDelete(contextMenu.targetNode)}
              >
                Delete
              </div>
            </>
          )}
        </div>
      )}


    </div>
  );
};

export default Explorer; 