export const showBlueScreen = (htmlMessage: string) => {
  const overlay = document.createElement('div')
  overlay.innerHTML = `
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
      z-index: 10000;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      line-height: 1.5;
      cursor: default;
    ">
      ${htmlMessage}
    </div>
  `
  document.body.appendChild(overlay)
} 