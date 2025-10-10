import svgPaths from "./svg-xs9osb8pr4";

interface WordMarkRedProps {
  className?: string;
}

export default function WordMarkRed({ className = "h-6" }: WordMarkRedProps) {
  return (
    <div className={`relative ${className}`} data-name="WordMark-Red">
      <svg className="block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2821 720">
        <g id="WordMark-Red">
          <path clipRule="evenodd" d={svgPaths.p3db92000} fill="var(--fill-0, #FF2929)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}