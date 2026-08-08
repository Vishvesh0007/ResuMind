import React from "react";
import { cn } from "~/lib/utils";
import { Accordion, AccordionItem, AccordionHeader, AccordionContent } from "../Accordion";

// --- Helper Components ---

interface ScoreBadgeProps {
    score: number;
    className?: string;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, className }) => {
    const isGreen = score > 69;
    const isYellow = score > 39;

    const bgClass = isGreen
        ? "bg-green-50 text-green-700 border-green-200"
        : isYellow
        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
        : "bg-red-50 text-red-700 border-red-200";

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors duration-200",
                bgClass,
                className
            )}
        >
            {isGreen && (
                <svg
                    className="w-3.5 h-3.5 flex-shrink-0 text-green-600 animate-in fade-in zoom-in duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                    />
                </svg>
            )}
            <span>{score}/100</span>
        </span>
    );
};

interface CategoryHeaderProps {
    title: string;
    categoryScore: number;
    className?: string;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
    title,
    categoryScore,
    className,
}) => {
    return (
        <div className={cn("flex items-center gap-3", className)}>
            <span className="font-bold text-gray-900 text-base md:text-lg">{title}</span>
            <ScoreBadge score={categoryScore} />
        </div>
    );
};

interface Tip {
    type: "good" | "improve";
    tip: string;
    explanation: string;
}

interface CategoryContentProps {
    tips: Tip[];
    className?: string;
}

export const CategoryContent: React.FC<CategoryContentProps> = ({
    tips,
    className,
}) => {
    return (
        <div className={cn("flex flex-col gap-6", className)}>
            {/* Two-column grid showing each tip with an icon and text */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {tips.map((item, idx) => {
                    const isGood = item.type === "good";
                    return (
                        <div
                            key={idx}
                            className={cn(
                                "flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-300 hover:shadow-sm",
                                isGood
                                    ? "bg-green-50/30 border-green-100 text-green-900"
                                    : "bg-red-50/30 border-red-100 text-red-900"
                            )}
                        >
                            {isGood ? (
                                <svg
                                    className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            )}
                            <span className="text-sm font-medium leading-relaxed">
                                {item.tip}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* A list of explanation boxes, styled differently for "good" vs "improve" tips */}
            <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider select-none">
                    Detailed Suggestions
                </h4>
                <div className="flex flex-col gap-3">
                    {tips.map((item, idx) => {
                        const isGood = item.type === "good";
                        return (
                            <div
                                key={idx}
                                className={cn(
                                    "p-4 rounded-xl border-l-4 shadow-sm transition-all duration-300 hover:shadow-md",
                                    isGood
                                        ? "bg-green-50/20 border-green-500 border-y border-r border-green-100"
                                        : "bg-red-50/20 border-red-500 border-y border-r border-red-100"
                                )}
                            >
                                <div className="flex items-center gap-2.5 mb-1.5">
                                    <span
                                        className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide",
                                            isGood
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                        )}
                                    >
                                        {isGood ? "Strength" : "Improvement"}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {item.tip}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed pl-1">
                                    {item.explanation}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

interface DetailsProps {
    feedback: Feedback;
    className?: string;
}

const Details: React.FC<DetailsProps> = ({ feedback, className }) => {
    return (
        <div className={cn("w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-6 hover:shadow-md transition-shadow duration-300", className)}>
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Detailed Analysis</h3>
                <p className="text-sm text-gray-500">
                    Review detailed recommendations across core grading dimensions.
                </p>
            </div>

            <Accordion allowMultiple className="space-y-3">
                {/* Tone & Style Section */}
                <AccordionItem id="tone-style" className="border-none">
                    <AccordionHeader itemId="tone-style" className="bg-gray-50 hover:bg-gray-100/70 rounded-xl px-4 py-3.5 border border-gray-200/50">
                        <CategoryHeader title="Tone & Style" categoryScore={feedback.toneAndStyle.score} />
                    </AccordionHeader>
                    <AccordionContent itemId="tone-style" className="border-x border-b border-gray-50 rounded-b-xl -mt-1 bg-white">
                        <div className="pt-4">
                            <CategoryContent tips={feedback.toneAndStyle.tips} />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Content Section */}
                <AccordionItem id="content" className="border-none">
                    <AccordionHeader itemId="content" className="bg-gray-50 hover:bg-gray-100/70 rounded-xl px-4 py-3.5 border border-gray-200/50">
                        <CategoryHeader title="Content" categoryScore={feedback.content.score} />
                    </AccordionHeader>
                    <AccordionContent itemId="content" className="border-x border-b border-gray-50 rounded-b-xl -mt-1 bg-white">
                        <div className="pt-4">
                            <CategoryContent tips={feedback.content.tips} />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Structure Section */}
                <AccordionItem id="structure" className="border-none">
                    <AccordionHeader itemId="structure" className="bg-gray-50 hover:bg-gray-100/70 rounded-xl px-4 py-3.5 border border-gray-200/50">
                        <CategoryHeader title="Structure" categoryScore={feedback.structure.score} />
                    </AccordionHeader>
                    <AccordionContent itemId="structure" className="border-x border-b border-gray-50 rounded-b-xl -mt-1 bg-white">
                        <div className="pt-4">
                            <CategoryContent tips={feedback.structure.tips} />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Skills Section */}
                <AccordionItem id="skills" className="border-none">
                    <AccordionHeader itemId="skills" className="bg-gray-50 hover:bg-gray-100/70 rounded-xl px-4 py-3.5 border border-gray-200/50">
                        <CategoryHeader title="Skills" categoryScore={feedback.skills.score} />
                    </AccordionHeader>
                    <AccordionContent itemId="skills" className="border-x border-b border-gray-50 rounded-b-xl -mt-1 bg-white">
                        <div className="pt-4">
                            <CategoryContent tips={feedback.skills.tips} />
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default Details;