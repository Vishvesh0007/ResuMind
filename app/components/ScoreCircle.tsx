import { useId } from "react";

const ScoreCircle = ({ score = 75 }: { score: number }) => {
    const gradientId = useId();
    const radius = 40;
    const stroke = 8;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const safeScore = typeof score === "number" ? score : 0;
    const progress = Math.min(Math.max(safeScore, 0), 100) / 100;
    const strokeDashoffset = circumference * (1 - progress);

    // Dynamic gradient colors based on the score
    const getColors = (scoreVal: number) => {
        if (scoreVal >= 80) {
            return { start: "#10B981", end: "#059669" }; // Green (good)
        }
        if (scoreVal >= 50) {
            return { start: "#FF97AD", end: "#5171FF" }; // Pink/Blue (medium/default)
        }
        return { start: "#FCA5A5", end: "#EF4444" }; // Red (needs improvement)
    };

    const colors = getColors(safeScore);

    return (
        <div className="relative w-[100px] h-[100px]">
            <svg
                height="100%"
                width="100%"
                viewBox="0 0 100 100"
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx="50"
                    cy="50"
                    r={normalizedRadius}
                    stroke="#e5e7eb"
                    strokeWidth={stroke}
                    fill="transparent"
                />
                {/* Partial circle with gradient */}
                <defs>
                    <linearGradient id={gradientId} x1="1" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors.start} />
                        <stop offset="100%" stopColor={colors.end} />
                    </linearGradient>
                </defs>
                <circle
                    cx="50"
                    cy="50"
                    r={normalizedRadius}
                    stroke={`url(#${gradientId})`}
                    strokeWidth={stroke}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                />
            </svg>

            {/* Score and issues */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-semibold text-sm">{`${safeScore}/100`}</span>
            </div>
        </div>
    );
};

export default ScoreCircle;