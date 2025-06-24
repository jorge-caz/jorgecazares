import React from 'react';

interface ErrorDialogProps {
  title: string;
  message: string;
  onClose: () => void;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({ title, message, onClose }) => {
  return (
    <div style={{
      padding: '24px',
      fontFamily: 'var(--font-ui)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      minHeight: '150px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '18px',
        fontWeight: '600',
        color: '#dc2626',
        marginBottom: '8px'
      }}>
        <span style={{ fontSize: '32px' }}>⚠️</span>
        {title}
      </div>
      
      <div style={{ 
        color: '#555', 
        lineHeight: '1.5',
        fontSize: '14px',
        background: 'rgba(239, 68, 68, 0.05)',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid rgba(239, 68, 68, 0.1)'
      }}>
        {message}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '16px'
      }}>
        <button
          onClick={onClose}
          style={{
            padding: '10px 24px',
            border: 'none',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(102, 126, 234, 0.7) 100%)',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default ErrorDialog; 