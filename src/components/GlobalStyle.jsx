export const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
    :root {
      --color-text-primary: #000000;
      --color-text-secondary: #333333;
      --color-background-primary: #ffffff;
      --color-background-secondary: #f0f0f0;
      --color-border-tertiary: #000000;
      --border-radius-lg: 0px;
      --border-radius-md: 0px;
      --font-body: 'Space Grotesk', system-ui, sans-serif;
      --font-mono: 'Space Mono', monospace;
      --brutal-shadow: 4px 4px 0px 0px #000000;
      --brutal-shadow-hover: 6px 6px 0px 0px #000000;
    }
    body {
      font-family: var(--font-body);
      background-color: var(--color-background-secondary);
      background-image: radial-gradient(circle, #000 1px, transparent 1px);
      background-size: 20px 20px;
      color: var(--color-text-primary);
    }
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }
    textarea { resize: vertical; font-family: var(--font-mono); }
    select, input, textarea { 
      outline: none; 
      border-radius: 0; 
      border: 2px solid #000; 
      box-shadow: 2px 2px 0px 0px #000;
    }
    select:focus, input:focus, textarea:focus { 
      box-shadow: 4px 4px 0px 0px #000; 
      transform: translate(-2px, -2px);
    }
    .score-bar-fill { transition: width 0.2s linear; }
    .tab-btn { 
      background: #fff; 
      border: 3px solid #000; 
      cursor: pointer; 
      font-family: var(--font-body); 
      font-weight: 700;
      text-transform: uppercase;
      box-shadow: var(--brutal-shadow);
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .tab-btn:hover {
      transform: translate(-2px, -2px);
      box-shadow: var(--brutal-shadow-hover);
    }
    .tab-btn.active {
      background: #e2ff00; /* Neon Yellow */
      color: #000;
    }
    .chip-btn { 
      cursor: pointer; border: 2px solid #000; background: #fff; font-family: var(--font-mono); 
      box-shadow: 2px 2px 0px 0px #000;
      font-size: 12px; font-weight: 700;
      transition: all 0.1s;
    }
    .chip-btn:hover { background: #000; color: #fff; box-shadow: 0 0 0 0 #000; transform: translate(2px, 2px); }
    .row-clickable { cursor: pointer; border-bottom: 2px solid #000 !important; }
    .row-clickable:hover td { background: #e2ff00 !important; color: #000; }
  `}</style>
);
