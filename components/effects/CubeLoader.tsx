/**
 * 3D 立方体加载动画
 */

'use client';

export function CubeLoader() {
  return (
    <div className="flex items-center justify-center">
      <div className="perspective-1000">
        <div className="cube-container">
          {/* 立方体的 6 个面 */}
          <div className="cube">
            <div className="cube-face cube-front"></div>
            <div className="cube-face cube-back"></div>
            <div className="cube-face cube-right"></div>
            <div className="cube-face cube-left"></div>
            <div className="cube-face cube-top"></div>
            <div className="cube-face cube-bottom"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }

        .cube-container {
          width: 120px;
          height: 120px;
          position: relative;
        }

        .cube {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          animation: rotateCube 3s infinite linear;
        }

        .cube-face {
          position: absolute;
          width: 120px;
          height: 120px;
          border: 2px solid rgba(102, 126, 234, 0.5);
          background: linear-gradient(
            135deg,
            rgba(102, 126, 234, 0.1),
            rgba(237, 100, 166, 0.1)
          );
          backdrop-filter: blur(10px);
          box-shadow: 0 0 30px rgba(102, 126, 234, 0.3);
        }

        .cube-front {
          transform: translateZ(60px);
        }

        .cube-back {
          transform: translateZ(-60px) rotateY(180deg);
        }

        .cube-right {
          transform: rotateY(90deg) translateZ(60px);
        }

        .cube-left {
          transform: rotateY(-90deg) translateZ(60px);
        }

        .cube-top {
          transform: rotateX(90deg) translateZ(60px);
        }

        .cube-bottom {
          transform: rotateX(-90deg) translateZ(60px);
        }

        @keyframes rotateCube {
          0% {
            transform: rotateX(0deg) rotateY(0deg);
          }
          100% {
            transform: rotateX(360deg) rotateY(360deg);
          }
        }
      `}</style>
    </div>
  );
}


