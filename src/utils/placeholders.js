// Create a simple placeholder image using HTML Canvas
const createPlaceholderImage = (width, height, text, bgColor, textColor) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  
  // Text
  ctx.fillStyle = textColor;
  ctx.font = `${Math.floor(width/10)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width/2, height/2);
  
  return canvas.toDataURL('image/png');
};

// Create profile placeholder
export const profilePlaceholder = createPlaceholderImage(400, 400, 'Profile', '#f0f0f0', '#333333');

// Create project placeholders
export const projectPlaceholder = createPlaceholderImage(800, 400, 'Project', '#e0e0e0', '#333333');

// Export placeholders for use in components
export default {
  profilePlaceholder,
  projectPlaceholder
};
