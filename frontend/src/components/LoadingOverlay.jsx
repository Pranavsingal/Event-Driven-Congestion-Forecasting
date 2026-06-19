import React, { useState, useEffect } from 'react';

const LOADING_STEPS = [
  { label: 'Connecting to Sensor Grid...', icon: '📡' },
  { label: 'Bootstrapping ML Inference Engine...', icon: '🧠' },
  { label: 'Loading XGBoost Severity Model...', icon: '⚡' },
  { label: 'Syncing Junction Database...', icon: '🗺️' },
  { label: 'Querying OSRM Road Network...', icon: '🛣️' },
  { label: 'Running Congestion Forecast...', icon: '📊' },
  { label: 'Generating Diversion Routes...', icon: '🔀' },
  { label: 'Rendering Live Map Layers...', icon: '🌐' },
];

export default function LoadingOverlay({ isVisible }) {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setActiveStep(0);
      setProgress(0);
      return;
    }

    const stepInterval = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= LOADING_STEPS.length - 1) return prev;
        return prev + 1;
      });
    }, 600);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 8 + 2;
      });
    }, 300);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(244, 247, 250, 0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <style>{`
        @keyframes lo-radar-sweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes lo-ring-pulse {
          0% { transform: scale(0.85); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 0.3; }
          100% { transform: scale(0.85); opacity: 0.7; }
        }
        @keyframes lo-ring-pulse-2 {
          0% { transform: scale(0.9); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.15; }
          100% { transform: scale(0.9); opacity: 0.5; }
        }
        @keyframes lo-dot-blink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes lo-step-enter {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes lo-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes lo-progress-glow {
          0% { box-shadow: 0 0 4px rgba(15, 76, 129, 0.3); }
          50% { box-shadow: 0 0 16px rgba(15, 76, 129, 0.6); }
          100% { box-shadow: 0 0 4px rgba(15, 76, 129, 0.3); }
        }
        @keyframes lo-grid-pulse {
          0%, 100% { opacity: 0.04; }
          50% { opacity: 0.12; }
        }
        @keyframes lo-scanner-line {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>

      {/* Background grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={`h-${i}`} style={{
            position: 'absolute', left: 0, right: 0,
            top: `${i * 5}%`, height: '1px',
            background: 'var(--primary)',
            opacity: 0.04,
            animation: `lo-grid-pulse 3s ease-in-out ${i * 0.15}s infinite`,
          }} />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={`v-${i}`} style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${i * 5}%`, width: '1px',
            background: 'var(--primary)',
            opacity: 0.04,
            animation: `lo-grid-pulse 3s ease-in-out ${i * 0.15 + 0.5}s infinite`,
          }} />
        ))}
      </div>

      {/* Main card */}
      <div style={{
        position: 'relative',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(15,76,129,0.08)',
        padding: '48px 56px',
        minWidth: '520px',
        maxWidth: '580px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
        overflow: 'hidden',
      }}>

        {/* Scanner line effect */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
          animation: 'lo-scanner-line 2.5s ease-in-out infinite',
          zIndex: 1,
        }} />

        {/* Radar/ring animation group */}
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
          {/* Outer ring 1 */}
          <div style={{
            position: 'absolute', inset: '-10px',
            borderRadius: '50%',
            border: '2px solid var(--primary)',
            opacity: 0.15,
            animation: 'lo-ring-pulse-2 3s ease-in-out infinite',
          }} />
          {/* Outer ring 2 */}
          <div style={{
            position: 'absolute', inset: '-4px',
            borderRadius: '50%',
            border: '1.5px dashed var(--primary-light)',
            opacity: 0.25,
            animation: 'lo-ring-pulse 2.5s ease-in-out 0.3s infinite',
          }} />
          {/* Core ring */}
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '3px solid var(--border-color)',
            background: 'radial-gradient(circle at center, rgba(15,76,129,0.04), transparent 70%)',
          }} />
          {/* Radar sweep arm */}
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            animation: 'lo-radar-sweep 2s linear infinite',
          }}>
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: '50%', height: '2px',
              background: 'linear-gradient(90deg, var(--primary), transparent)',
              transformOrigin: '0% 50%',
            }} />
            {/* Sweep glow cone */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: '50%', height: '0',
              borderTop: '12px solid transparent',
              borderBottom: '12px solid transparent',
              borderLeft: '50px solid rgba(15,76,129,0.08)',
              transformOrigin: '0% 50%',
              marginTop: '-12px',
            }} />
          </div>
          {/* Center core dot */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '12px', height: '12px',
            borderRadius: '50%',
            background: 'var(--primary)',
            boxShadow: '0 0 12px rgba(15,76,129,0.5)',
          }} />
          {/* Blip dots around the radar */}
          {[0, 72, 144, 216, 288].map((angle, i) => {
            const r = 42;
            const rad = (angle * Math.PI) / 180;
            const x = 60 + r * Math.cos(rad);
            const y = 60 + r * Math.sin(rad);
            return (
              <div key={i} style={{
                position: 'absolute',
                left: `${x}px`, top: `${y}px`,
                width: '5px', height: '5px',
                borderRadius: '50%',
                background: i % 2 === 0 ? 'var(--success)' : 'var(--warning)',
                animation: `lo-dot-blink 1.5s ease-in-out ${i * 0.3}s infinite`,
              }} />
            );
          })}
        </div>

        {/* Title + subtitle */}
        <div style={{ textAlign: 'center' }}>
          <h3 style={{
            fontSize: '18px', fontWeight: '800', color: 'var(--primary)',
            letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0,
          }}>
            GRIDLOCK COMMAND
          </h3>
          <p style={{
            fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px',
            fontWeight: '500', letterSpacing: '0.02em',
          }}>
            Initializing Traffic Intelligence Platform
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginBottom: '8px',
            fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            <span>System Boot</span>
            <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
              {Math.min(Math.round(progress), 100)}%
            </span>
          </div>
          <div style={{
            width: '100%', height: '6px',
            background: 'var(--bg-secondary)',
            borderRadius: '3px', overflow: 'hidden',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{
              width: `${Math.min(progress, 100)}%`,
              height: '100%',
              borderRadius: '3px',
              background: 'linear-gradient(90deg, var(--primary-dark), var(--primary), var(--primary-light))',
              backgroundSize: '200% 100%',
              animation: 'lo-shimmer 1.5s linear infinite, lo-progress-glow 2s ease-in-out infinite',
              transition: 'width 0.3s ease-out',
            }} />
          </div>
        </div>

        {/* Step feed */}
        <div style={{
          width: '100%',
          background: 'var(--bg-secondary)',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          padding: '14px 18px',
          maxHeight: '200px',
          overflow: 'hidden',
        }}>
          <div style={{
            fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px',
          }}>
            SYSTEM LOG
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {LOADING_STEPS.slice(0, activeStep + 1).map((step, i) => {
              const isDone = i < activeStep;
              const isActive = i === activeStep;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    fontSize: '12px', fontWeight: '600',
                    animation: 'lo-step-enter 0.3s ease-out forwards',
                    color: isDone ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--text-muted)',
                  }}
                >
                  <span style={{ fontSize: '13px', width: '18px', textAlign: 'center' }}>
                    {isDone ? '✓' : step.icon}
                  </span>
                  <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                    {step.label}
                  </span>
                  {isDone && (
                    <span style={{
                      fontSize: '9px', padding: '1px 6px',
                      background: 'rgba(46,125,50,0.1)', color: 'var(--success)',
                      borderRadius: '4px', fontWeight: '700',
                    }}>OK</span>
                  )}
                  {isActive && (
                    <span style={{
                      display: 'inline-flex', gap: '3px', alignItems: 'center',
                    }}>
                      {[0, 1, 2].map(d => (
                        <span key={d} style={{
                          width: '4px', height: '4px', borderRadius: '50%',
                          background: 'var(--primary)',
                          animation: `lo-dot-blink 1s ease-in-out ${d * 0.2}s infinite`,
                        }} />
                      ))}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom tagline */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600',
          letterSpacing: '0.02em',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--success)',
            animation: 'lo-dot-blink 1.2s ease-in-out infinite',
          }} />
          <span>Secure Connection Established • Bengaluru Traffic Command</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact inline skeleton loader for individual card sections.
 * Use as a drop-in replacement for plain "Loading..." text.
 */
export function CardSkeleton({ lines = 3, title = '', height }) {
  return (
    <div className="glass" style={{
      padding: '24px',
      background: 'var(--card-bg)',
      display: 'flex', flexDirection: 'column', gap: '14px',
      minHeight: height || 'auto',
    }}>
      <style>{`
        @keyframes skel-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* Title bar with animated scan dot */}
      {title && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          paddingBottom: '12px', borderBottom: '1px solid var(--border-color)',
        }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--primary)',
            animation: 'lo-dot-blink 1.2s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>{title}</span>
        </div>
      )}

      {/* Skeleton bars */}
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{
          height: i === 0 ? '18px' : '12px',
          width: `${85 - i * 15}%`,
          borderRadius: '6px',
          background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%)',
          backgroundSize: '200% 100%',
          animation: `skel-shimmer 1.5s linear ${i * 0.15}s infinite`,
        }} />
      ))}

      {/* Bottom mini metric skeletons */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
        {[60, 80, 50].map((w, i) => (
          <div key={i} style={{
            height: '28px', width: `${w}px`,
            borderRadius: '6px',
            background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%)',
            backgroundSize: '200% 100%',
            animation: `skel-shimmer 1.5s linear ${(i + lines) * 0.15}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}
