interface ScoreBadgeProps {
    score: number;
}

const ScoreBadge = ({ score }: ScoreBadgeProps) => {
    let badgeClass = "";
    let labelText = "";

    if (score > 70) {
        badgeClass = "bg-badge-green text-badge-green-text";
        labelText = "Strong";
    } else if (score > 49) {
        badgeClass = "bg-badge-yellow text-badge-yellow-text";
        labelText = "Good Start";
    } else {
        badgeClass = "bg-badge-red text-badge-red-text";
        labelText = "Needs Work";
    }

    return (
        <div className={`score-badge ${badgeClass} text-xs font-semibold px-3 py-1`}>
            <p>{labelText}</p>
        </div>
    );
};

export default ScoreBadge;
