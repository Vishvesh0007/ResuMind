import { type FormEvent, useState } from "react";
import Navbar from "~/components/Navbar";

const Upload = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsProcessing(true);
        setStatusText("Uploading resume...");
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading">
                    <h1>Smart feedback for your dream job</h1>

                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img
                                src="/images/resume-scan.gif"
                                alt="Scanning resume"
                                className="w-full"
                            />
                        </>
                    ) : (
                        <>
                            <h2>Drop your resume for an ATS score and improvement tips</h2>

                            <form id="upload-form" onSubmit={handleSubmit}>
                                {/* Add your file input and submit button here */}
                            </form>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Upload;