interface ATSProps {
    score: number;
    suggestions: { type: "good" | "improve"; tip: string }[];
}

const ATS = ({ score, suggestions }: ATSProps) => {
    let gradientClass = "";
    let iconPath = "";
    let statusSubtitle = "";
    let explanationText = "";
    let closingText = "";

    if (score > 69) {
        gradientClass = "from-green-100";
        iconPath = "/icons/ats-good.svg";
        statusSubtitle = "Strong ATS Compatibility";
        explanationText = "Your resume is highly optimized for Applicant Tracking Systems (ATS). It uses a clean structure, appropriate formatting, and key sections that automated scanners can index without errors.";
        closingText = "Excellent job! Keep refining your resume for specific job descriptions to maximize match accuracy.";
    } else if (score > 49) {
        gradientClass = "from-yellow-100";
        iconPath = "/icons/ats-warning.svg";
        statusSubtitle = "Moderate ATS Compatibility";
        explanationText = "Your resume is mostly readable by ATS scanners, but there are still issues or missing sections that could prevent it from ranking highly or being processed correctly.";
        closingText = "Implementing the suggestions below will help improve your formatting and increase success rate.";
    } else {
        gradientClass = "from-red-100";
        iconPath = "/icons/ats-bad.svg";
        statusSubtitle = "Requires Optimization";
        explanationText = "Your resume has critical formatting, structural, or layout choices that make it difficult for ATS scanners to parse. It is highly likely to be rejected or incorrectly read by automated filters.";
        closingText = "We strongly suggest addressing the warnings below to ensure your resume is fully machine-readable.";
    }

    return (
        <div className={`bg-gradient-to-b ${gradientClass} to-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-5 w-full hover:shadow-md transition-all duration-300`}>
            {/* Top section */}
            <div className="flex items-center gap-4">
                <img src={iconPath} alt="ATS Score Icon" className="w-12 h-12" />
                <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900">ATS Score - {score}/100</h3>
                </div>
            </div>

            {/* Description Section */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <h4 className="text-base font-semibold text-gray-800">{statusSubtitle}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{explanationText}</p>
                </div>

                {/* Suggestions List */}
                {suggestions && suggestions.length > 0 && (
                    <ul className="flex flex-col gap-2.5 my-1">
                        {suggestions.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700 bg-white/40 backdrop-blur-sm p-3 rounded-xl border border-gray-50">
                                <img
                                    src={item.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                                    alt={item.type}
                                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                                />
                                <span className="leading-relaxed">{item.tip}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Closing Line */}
                <p className="text-sm font-medium text-gray-700 italic border-t border-gray-100/50 pt-3">
                    {closingText}
                </p>
            </div>
        </div>
    );
};

export default ATS;