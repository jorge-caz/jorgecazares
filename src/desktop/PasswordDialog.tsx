import React, { useState } from 'react';

interface PasswordDialogProps {
  onClose: () => void;
}

const PasswordDialog: React.FC<PasswordDialogProps> = ({ onClose }) => {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordSubmit = () => {
    const validPasswords = ['amongusXD', 'admin', 'password', 'delete_everything'];
    
    if (validPasswords.includes(password)) {
      // Different blue screens for different passwords
      let blueScreenContent = '';
      
      if (password.toLowerCase() === 'amongusXD'.toLowerCase()) {
        blueScreenContent = `
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">JorgeOS</div>
            <div>A fatal exception 0E has occurred at 0028:C0034B23 in VXD VMM(01) +</div>
            <div>00034B23. The current application will be terminated.</div>
            <br>
            <div style="color: #ff6b6b;">REASON: Too sus! 📮</div>
            <br>
            <div>* Reboot your computer to continue</div>
            <br>
          </div>
        `;
      } else if (password.toLowerCase() === 'delete_everything') {
        blueScreenContent = `
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">SYSTEM FAILURE</div>
            <div>ERROR: User attempted to delete everything</div>
            <div>SYSTEM RESPONSE: No. Just... no. 😤</div>
            <br>
            <div style="color: #ff6b6b;">CRITICAL ERROR: Excessive deletion detected</div>
            <div>Initiating protective shutdown...</div>
            <br>
            <div>* Reboot your computer to continue</div>
          </div>
        `;
      } else {
        blueScreenContent = `
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">JorgeOS</div>
            <div>Congratulations! You successfully broke the system! 🎉</div>
            <div>ERROR: Admin privileges granted to chaos agent</div>
            <br>
            <div style="color: #4ade80;">STATUS: System corrupted successfully</div>
            <div>All your files are belong to us now</div>
            <br>
            <div>* Reboot your computer to continue</div>
          </div>
        `;
      }
      
      // Trigger blue screen
      const blueScreen = document.createElement('div');
      blueScreen.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #0000AA;
          color: white;
          font-family: 'Courier New', monospace;
          font-size: 18px;
          padding: 0;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          line-height: 1.5;
          cursor: default;
        ">
          ${blueScreenContent}
        </div>
      `;
      
      // Disable click-to-close so the blue screen remains visible
      // blueScreen.addEventListener('click', () => {
      //   document.body.removeChild(blueScreen);
      //   onClose();
      // });
      
      document.body.appendChild(blueScreen);
      
      // Auto-remove blue screen after 8 seconds
      // setTimeout(() => {
      //   if (document.body.contains(blueScreen)) {
      //     document.body.removeChild(blueScreen);
      //     onClose();
      //   }
      // }, 8000);
    } else {
      const funnyErrors = [
        'Access Denied!',
        'Wrong password! Hint: It might be sus... 📮',
        'Nope! Maybe try something more administrative? 🤔',
        'Access Denied! Have you tried turning it off and on again?',
        'Wrong!'
      ];
      
      const randomError = funnyErrors[Math.floor(Math.random() * funnyErrors.length)];
      setPasswordError(randomError);
      setTimeout(() => setPasswordError(''), 3000);
    }
    
    setPassword('');
  };

  return (
    <div style={{
      padding: '24px',
      fontFamily: 'var(--font-ui)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      minHeight: '200px'
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
        <span style={{ fontSize: '24px' }}>🔒</span>
        Protected System Folder
      </div>
      
      <div style={{ color: '#555', lineHeight: '1.5' }}>
        <p style={{ margin: '0 0 12px 0' }}>This folder is protected by the system.</p>
        <p style={{ margin: '0 0 12px 0' }}>Enter administrator password to continue:</p>
      </div>

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
        placeholder="Enter password..."
        autoFocus
        style={{
          width: '100%',
          padding: '12px 16px',
          border: '2px solid rgba(200, 200, 200, 0.5)',
          borderRadius: '8px',
          fontSize: '14px',
          background: 'rgba(255, 255, 255, 0.8)',
          color: '#000',
          transition: 'border-color 0.2s ease',
          outline: 'none'
        }}
        onFocus={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.8)'}
        onBlur={(e) => e.target.style.borderColor = 'rgba(200, 200, 200, 0.5)'}
      />

      {passwordError && (
        <div style={{
          color: '#dc2626',
          fontSize: '13px',
          padding: '8px 12px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '6px',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          {passwordError}
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        marginTop: '16px'
      }}>
        <button
          onClick={handlePasswordSubmit}
          style={{
            padding: '8px 20px',
            border: 'none',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(102, 126, 234, 0.7) 100%)',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          OK
        </button>
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
      </div>
    </div>
  );
};

export default PasswordDialog; 