import React from 'react';

interface ConfirmDeleteDialogProps {
  targetName: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({ targetName, onConfirm, onClose }) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div style={{
      padding: '24px',
      fontFamily: 'var(--font-ui)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      minHeight: '120px',
      maxWidth: '400px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '18px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '8px'
      }}>
        <span style={{ fontSize: '24px' }}>🗑️</span>
        Confirm Delete
      </div>
      
      <div style={{ 
        color: '#555', 
        lineHeight: '1.5',
        fontSize: '14px'
      }}>
        Are you sure you want to delete <strong>"{targetName}"</strong>?
        <br />
        <br />
        This item will be moved to the Recycle Bin.
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        marginTop: '16px'
      }}>
        <button
          onClick={onClose}
          style={{
            padding: '8px 20px',
            border: '1px solid rgba(200, 200, 200, 0.5)',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.8)',
            color: '#555',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(200, 200, 200, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          style={{
            padding: '8px 20px',
            border: 'none',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(239, 68, 68, 0.7) 100%)',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ConfirmDeleteDialog; 