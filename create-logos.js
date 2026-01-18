// Simple script to create Food-AI logos
// Run this in a browser console or use canvas library

const createLogo = (size) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Scale factor
  const scale = size / 512;
  
  // Background circle
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath();
  ctx.arc(size/2, size/2, 240 * scale, 0, 2 * Math.PI);
  ctx.fill();
  
  // Border
  ctx.strokeStyle = '#2E7D32';
  ctx.lineWidth = 8 * scale;
  ctx.stroke();
  
  // Food plate
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(size/2, 280 * scale, 120 * scale, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.strokeStyle = '#E0E0E0';
  ctx.lineWidth = 4 * scale;
  ctx.stroke();
  
  // AI Brain (simplified)
  ctx.fillStyle = '#2196F3';
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.ellipse(size/2, 180 * scale, 50 * scale, 30 * scale, 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.globalAlpha = 1;
  
  // Circuit lines
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.moveTo((256-30) * scale, 180 * scale);
  ctx.lineTo((256+30) * scale, 180 * scale);
  ctx.stroke();
  
  // Text (if size is large enough)
  if (size >= 64) {
    ctx.fillStyle = '#2E7D32';
    ctx.font = `bold ${Math.max(12, 48 * scale)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('Food-AI', size/2, 420 * scale);
  }
  
  return canvas;
};

// Usage instructions
console.log('To create logos:');
console.log('1. Open browser console');
console.log('2. Paste this script');
console.log('3. Run: createLogo(512).toDataURL() for each size');
console.log('4. Save the data URLs as PNG files');