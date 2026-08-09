import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { convertPdfToImage, extractPdfText } from "~/lib/pdf2img";
import { usePuterStore, cleanAndParseJson } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (selectedFile: File | null) => {
        setFile(selectedFile);
        setErrorMessage(null);
    };

    const handleAnalyze = async ({
        companyName,
        jobTitle,
        jobDescription,
        file,
    }: {
        companyName: string;
        jobTitle: string;
        jobDescription: string;
        file: File;
    }) => {
        if (isProcessing) return;
        setIsProcessing(true);
        setErrorMessage(null);

        try {
            // Step 1: Extract text client-side for fast & reliable AI analysis
            setStatusText("Extracting text from PDF...");
            const pdfTextResult = await extractPdfText(file);

            if (pdfTextResult.error) {
                console.warn("PDF text extraction warning:", pdfTextResult.error);
            }

            // Step 2: Generate preview image (with reduced resolution & timeout guard)
            setStatusText("Generating resume preview...");
            const imageResult = await convertPdfToImage(file);

            // Step 3: Upload original PDF to Puter file system
            setStatusText("Uploading original resume...");
            const uploadedFile = await fs.upload([file]);
            if (!uploadedFile) {
                throw new Error("Failed to upload PDF file. Please check your network connection.");
            }

            // Step 4: Upload preview image (if generated)
            setStatusText("Uploading preview image...");
            let imagePath = "";
            if (imageResult?.file) {
                const uploadedImage = await fs.upload([imageResult.file]);
                if (uploadedImage) {
                    imagePath = uploadedImage.path;
                }
            }

            // Step 5: Save draft metadata
            setStatusText("Preparing data for analysis...");
            const uuid = generateUUID();
            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: imagePath || uploadedFile.path,
                companyName,
                jobTitle,
                jobDescription,
                feedback: null as any,
            };
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            // Step 6: Send extracted text + prompt to AI
            setStatusText("Analyzing resume with AI...");
            const instructions = prepareInstructions({ jobTitle, jobDescription });

            const feedbackResponse = await ai.feedback(
                uploadedFile.path,
                instructions,
                pdfTextResult.text || undefined
            );

            if (!feedbackResponse || !feedbackResponse.message?.content) {
                throw new Error("No analysis returned from AI service.");
            }

            const rawFeedbackText = typeof feedbackResponse.message.content === "string"
                ? feedbackResponse.message.content
                : Array.isArray(feedbackResponse.message.content)
                ? feedbackResponse.message.content.map((c: any) => c.text || "").join("\n")
                : String(feedbackResponse.message.content);

            // Step 7: Clean markdown codeblocks and parse JSON safely
            setStatusText("Processing feedback...");
            const parsedFeedback = cleanAndParseJson(rawFeedbackText);

            data.feedback = parsedFeedback;
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            // Step 8: Redirection
            setStatusText("Analysis complete, redirecting...");
            navigate(`/resume/${uuid}`);
        } catch (err: any) {
            console.error("Resume analysis failed:", err);
            setErrorMessage(err?.message || "An unexpected error occurred during resume analysis. Please try again.");
        } finally {
            setIsProcessing(false);
            setStatusText("");
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isProcessing || !file) return;

        const form = e.currentTarget.closest("form");
        if (!form) return;

        const formData = new FormData(form);

        const companyName = formData.get("company-name") as string;
        const jobTitle = formData.get("job-title") as string;
        const jobDescription = formData.get("job-description") as string;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>

                    {isProcessing ? (
                        <div className="flex flex-col items-center gap-4 my-6">
                            <h2 className="text-xl font-semibold text-gray-800 animate-pulse">{statusText}</h2>
                            <img
                                src="/images/resume-scan.gif"
                                alt="Scanning resume"
                                className="w-full max-w-md rounded-xl shadow-lg"
                            />
                        </div>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}

                    {errorMessage && !isProcessing && (
                        <div className="my-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex flex-col gap-2">
                            <div className="font-semibold flex items-center gap-2">
                                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                Analysis Failed
                            </div>
                            <p className="text-sm">{errorMessage}</p>
                        </div>
                    )}

                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" disabled={isProcessing} />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" disabled={isProcessing} />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" disabled={isProcessing} />
                            </div>
                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} disabled={isProcessing} />
                            </div>
                            <button
                                type="submit"
                                className="primary-button disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isProcessing || !file}
                            >
                                {isProcessing ? "Processing..." : "Analyze Resume"}
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Upload;