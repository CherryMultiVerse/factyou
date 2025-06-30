import React, { useRef, useEffect, useState } from 'react';
import { X, Download, CheckCircle, Copy, Instagram, Share2 } from 'lucide-react';

interface VisualExportModalProps {
  onClose: () => void;
  verdict: string;
  claim: string;
  confidence: number;
}

const VisualExportModal: React.FC<VisualExportModalProps> = ({ 
  onClose, 
  verdict, 
  claim, 
  confidence 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageGenerated, setImageGenerated] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);

  const getVerdictEmoji = (verdict: string) => {
    switch (verdict.toUpperCase()) {
      case 'VERIFIED': 
      case 'MOSTLY VERIFIED': 
        return '✅';
      case 'FALSE': 
      case 'MOSTLY FALSE': 
        return '❌';
      case 'MIXED': 
      case 'MISLEADING': 
        return '⚠️';
      case 'UNVERIFIED': 
        return '🤔';
      case 'SATIRICAL': 
        return '😂';
      default: 
        return '🔍';
    }
  };

  // Generate sarcastic summary as the main headline
  const generateSarcasticSummary = () => {
    const rating = verdict.toLowerCase();
    
    const commentaries = {
      'verified': [
        `Well, well, well... someone actually told the truth.`,
        `Plot twist: this claim is actually accurate.`,
        `*Surprised Pikachu face* This claim checks out.`
      ],
      'mostly verified': [
        `Close enough for government work.`,
        `This claim gets a B+ for accuracy.`
      ],
      'mixed': [
        `It's complicated (shocking, I know).`,
        `This claim has more layers than an onion.`,
        `Welcome to the gray area, where certainty goes to die.`
      ],
      'mostly false': [
        `This claim has more holes than Swiss cheese.`,
        `Facts don't care about your feelings.`
      ],
      'false': [
        `Nope, nope, and more nope.`,
        `This claim is more fictional than my dating profile.`,
        `Reality called, it wants its facts back.`
      ],
      'satirical': [
        `It's a joke, folks. Literally.`,
        `The Onion strikes again.`
      ],
      'unverified': [
        `The evidence is playing hard to get.`,
        `This claim is giving us "citation needed" vibes.`
      ]
    };

    const options = commentaries[rating as keyof typeof commentaries] || commentaries['unverified'];
    return options[Math.floor(Math.random() * options.length)];
  };

  const generateInstagramCaption = () => {
    const emoji = getVerdictEmoji(verdict);
    const shortClaim = claim.length > 100 ? claim.substring(0, 97) + '...' : claim;
    
    return `${emoji} FACT-CHECKED: "${shortClaim}"

VERDICT: ${verdict.toUpperCase()}
CONFIDENCE: ${confidence}%

${generateSarcasticSummary()}

Cut through the BS with AI-powered fact-checking across the political spectrum. 

Visit factyou.co for more independent analysis!

#FactCheck #FactYou #TruthMatters #CriticalThinking #MediaLiteracy #FactsMatter #CutThroughTheBS #AIFactCheck #CrossSpectrum #IndependentMedia`;
  };

  const generateImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for vertical format (1080x1920) - perfect for Stories and portrait
    canvas.width = 1080;
    canvas.height = 1920;

    // Create the trademark blue-to-red gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#3b82f6'); // Blue
    gradient.addColorStop(0.5, '#8b5cf6'); // Purple
    gradient.addColorStop(1, '#ef4444'); // Red

    // Fill background with trademark gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle overlay pattern
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let i = 0; i < canvas.width; i += 100) {
      for (let j = 0; j < canvas.height; j += 100) {
        ctx.fillRect(i, j, 2, 2);
      }
    }

    // Set text properties - ALL TEXT CENTERED
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;

    // CALCULATE PERFECT VERTICAL CENTERING WITH MORE SPACING
    const totalContentHeight = 1300; // Reduced slightly to allow more spacing
    const startY = (canvas.height - totalContentHeight) / 2; // Center vertically
    let y = startY;

    // Draw FactYou! branding at top - PROMINENT
    ctx.font = 'bold 72px Inter, Arial, sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText('FactYou!', canvas.width / 2, y);
    y += 60;
    
    // Draw tagline - PROMINENT
    ctx.font = 'bold 36px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillText('Cut through the BS', canvas.width / 2, y);
    y += 140; // INCREASED SPACING HERE - was 100, now 140

    // Draw emoji - LARGE
    ctx.font = 'bold 140px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(getVerdictEmoji(verdict), canvas.width / 2, y);
    y += 140; // INCREASED SPACING HERE - was 120, now 140

    // Draw verdict - PROMINENT
    ctx.font = 'bold 84px Inter, Arial, sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText(verdict.toUpperCase(), canvas.width / 2, y);
    y += 80;

    // Draw confidence - PROMINENT
    ctx.font = 'bold 48px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillText(`${confidence}% CONFIDENCE`, canvas.width / 2, y);
    y += 100;

    // Draw claim (wrapped text) - CENTERED
    ctx.font = 'bold 36px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    
    const maxWidth = canvas.width - 120; // 60px padding on each side
    const lineHeight = 50;
    const words = claim.split(' ');
    let line = '';
    
    // Limit to 5 lines maximum for claim
    let lineCount = 0;
    const maxLines = 5;
    
    for (let n = 0; n < words.length && lineCount < maxLines; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), canvas.width / 2, y);
        line = words[n] + ' ';
        y += lineHeight;
        lineCount++;
      } else {
        line = testLine;
      }
    }
    
    // Draw the last line if we haven't exceeded max lines
    if (lineCount < maxLines && line.trim()) {
      // If this is the last line and we're truncating, add ellipsis
      if (lineCount === maxLines - 1 && line.length > 40) {
        line = line.substring(0, 37) + '...';
      }
      ctx.fillText(line.trim(), canvas.width / 2, y);
      y += lineHeight;
    }

    y += 80; // Add space before headline

    // MAIN HEADLINE: Sarcastic Summary - SUPER PROMINENT
    ctx.font = 'bold 56px Inter, Arial, sans-serif';
    ctx.fillStyle = '#FFD700'; // Bright gold for maximum visibility
    ctx.shadowBlur = 25; // Extra glow for the headline
    
    const sarcasticSummary = generateSarcasticSummary();
    const summaryMaxWidth = canvas.width - 100;
    const summaryWords = sarcasticSummary.split(' ');
    let summaryLine = '';
    let summaryLineCount = 0;
    const maxSummaryLines = 4;
    const summaryLineHeight = 70;
    
    for (let n = 0; n < summaryWords.length && summaryLineCount < maxSummaryLines; n++) {
      const testLine = summaryLine + summaryWords[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > summaryMaxWidth && n > 0) {
        ctx.fillText(summaryLine.trim(), canvas.width / 2, y);
        summaryLine = summaryWords[n] + ' ';
        y += summaryLineHeight;
        summaryLineCount++;
      } else {
        summaryLine = testLine;
      }
    }
    
    if (summaryLineCount < maxSummaryLines && summaryLine.trim()) {
      ctx.fillText(summaryLine.trim(), canvas.width / 2, y);
      y += summaryLineHeight;
    }

    // Reset shadow for other elements
    ctx.shadowBlur = 15;
    y += 80;

    // Draw cross-spectrum analysis indicator
    ctx.font = 'bold 32px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('CROSS-SPECTRUM ANALYSIS', canvas.width / 2, y);
    y += 60;

    // Draw spectrum bar - CENTERED
    const barWidth = 600;
    const barHeight = 30;
    const barX = (canvas.width - barWidth) / 2;
    
    // Background bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(barX, y, barWidth, barHeight);
    
    // Spectrum gradient bar - using trademark colors
    const spectrumGradient = ctx.createLinearGradient(barX, y, barX + barWidth, y);
    spectrumGradient.addColorStop(0, '#3b82f6'); // Blue (Left)
    spectrumGradient.addColorStop(0.25, '#8b5cf6'); // Purple (Center)
    spectrumGradient.addColorStop(0.5, '#10b981'); // Green (International)
    spectrumGradient.addColorStop(0.75, '#f59e0b'); // Amber (Fact-check)
    spectrumGradient.addColorStop(1, '#ef4444'); // Red (Right)
    
    ctx.fillStyle = spectrumGradient;
    ctx.fillRect(barX, y, barWidth, barHeight);

    // Spectrum labels - CENTERED
    y += 60;
    ctx.font = 'bold 24px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // Left label
    ctx.textAlign = 'left';
    ctx.fillText('🟦 LEFT', barX, y);
    
    // Center label
    ctx.textAlign = 'center';
    ctx.fillText('⚪ CENTER', canvas.width / 2, y);
    
    // Right label
    ctx.textAlign = 'right';
    ctx.fillText('🟥 RIGHT', barX + barWidth, y);

    // Reset text alignment to center
    ctx.textAlign = 'center';
    y += 100;

    // Draw "INDEPENDENT FACT-CHECKING" text - PROMINENT
    ctx.font = 'bold 32px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('INDEPENDENT FACT-CHECKING', canvas.width / 2, y);
    y += 80;

    // Draw website - SUPER PROMINENT AND HIGHLIGHTED
    ctx.font = 'bold 64px Inter, Arial, sans-serif';
    ctx.fillStyle = '#FFD700'; // Gold to match headline
    ctx.shadowBlur = 25;
    ctx.fillText('factyou.co', canvas.width / 2, y);
    y += 80;

    // Draw social handle - PROMINENT
    ctx.font = 'bold 42px Inter, Arial, sans-serif';
    ctx.fillStyle = '#FFD700'; // Gold to match
    ctx.shadowBlur = 20;
    ctx.fillText('@FactYou', canvas.width / 2, y);
    y += 60;

    // Add call to action
    ctx.font = 'bold 28px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur = 15;
    ctx.fillText('Follow for more BS-cutting analysis', canvas.width / 2, y);

    // Add decorative border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Add inner glow effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 4;
    ctx.strokeRect(35, 35, canvas.width - 70, canvas.height - 70);

    setImageGenerated(true);
  };

  useEffect(() => {
    // Small delay to ensure canvas is ready
    setTimeout(generateImage, 100);
  }, [verdict, claim, confidence]);

  const downloadImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    
    try {
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `factyou-verdict-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setDownloading(false);
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloading(false);
    }
  };

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(generateInstagramCaption());
      setCaptionCopied(true);
      setTimeout(() => setCaptionCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy caption:', error);
    }
  };

  const shareToInstagramStories = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to blob and create a shareable URL
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      
      // Try Instagram Stories sharing (mobile only)
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
      
      if (isMobile) {
        // Create a temporary link to trigger download, then guide user
        const link = document.createElement('a');
        link.href = url;
        link.download = `factyou-story-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show instructions
        setTimeout(() => {
          alert('Image downloaded! Open Instagram app → Stories → Camera → Gallery to select the image and share to your story.');
        }, 500);
      } else {
        alert('Instagram Stories sharing works best on mobile devices. Download the image and share from your phone!');
      }
      
      URL.revokeObjectURL(url);
    }, 'image/png', 1.0);
  };

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50">
      <div className="modal-content rounded-3xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Share2 className="w-6 h-6 text-purple-400" />
            <h3 className="text-2xl font-bold text-white">FactYou! Visual Export</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-700/50 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Canvas Preview */}
        <div className="mb-8">
          <div className="bg-neutral-700/30 rounded-2xl p-6 border border-neutral-600/30">
            <h4 className="text-lg font-semibold text-white mb-4 text-center">
              FactYou! Visual (1080x1920)
            </h4>
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto rounded-xl shadow-lg border border-neutral-600/30"
                style={{ maxHeight: '600px', maxWidth: '300px' }}
              />
            </div>
            <p className="text-center text-gray-400 text-sm mt-4">
              Perfect for Instagram Stories, TikTok, and portrait sharing
            </p>
          </div>
        </div>

        {/* Instagram Caption */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">Ready-to-Use Caption</h4>
              <button
                onClick={copyCaption}
                className="flex items-center space-x-2 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 text-sm transition-colors"
              >
                {captionCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{captionCopied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="bg-neutral-800/40 rounded-xl p-4 border border-neutral-700/30">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {generateInstagramCaption()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Primary actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={downloadImage}
              disabled={!imageGenerated || downloading}
              className="flex items-center justify-center space-x-3 px-6 py-4 cta-button rounded-xl text-white font-semibold disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Download Visual</span>
                </>
              )}
            </button>

            <button
              onClick={shareToInstagramStories}
              disabled={!imageGenerated}
              className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-semibold disabled:opacity-50 transition-all"
            >
              <Instagram className="w-5 h-5" />
              <span>Share to Stories</span>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 space-y-4">
          <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-300 font-medium text-sm">Perfect for Social Sharing</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Content is perfectly centered with <strong>factyou.co</strong> prominently displayed. 
              The sarcastic headline and your website get maximum visibility for brand recognition and traffic.
            </p>
          </div>

          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
            <h5 className="text-blue-300 font-medium mb-2">🎨 Visual Highlights</h5>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• <strong>Perfect centering:</strong> Content balanced from top to bottom</li>
              <li>• <strong>factyou.co prominent:</strong> Website in large gold text</li>
              <li>• <strong>Trademark gradient:</strong> Blue-to-red FactYou! brand colors</li>
              <li>• <strong>Gold highlights:</strong> Website, handle, and headline pop</li>
              <li>• <strong>Vertical format:</strong> 1080x1920 for Stories and portrait</li>
              <li>• <strong>Cross-spectrum bar:</strong> Shows balanced approach</li>
            </ul>
          </div>

          <div className="bg-neutral-700/30 rounded-xl p-4 border border-neutral-600/30">
            <p className="text-gray-400 text-xs text-center">
              This visual drives traffic to factyou.co while showcasing your signature 
              wit and analysis. Perfect for all social platforms! 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualExportModal;