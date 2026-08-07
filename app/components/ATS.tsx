interface AtsProps {
    feedback: number;
    suggestions: { type: "good" | "improve"; tip: string }[];
}

const Ats = ({ feedback, suggestions }: AtsProps) => {
    return (
        <div>
            ATS: {feedback}
        </div>
    )
}

export default Ats