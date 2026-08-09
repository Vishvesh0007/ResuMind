import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { convertPdfToImage } from "~/lib/pdf2img";

interface ResumeCardProps {
    resume: Resume;
    onDelete?: (id: string) => void;
}

const ResumeCard = ({ resume, onDelete }: ResumeCardProps) => {
    const { id, companyName, jobTitle, feedback, imagePath, resumePath } = resume;
    const { fs, kv } = usePuterStore();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(true);
    const [isPreviewError, setIsPreviewError] = useState<boolean>(false);

    // Delete state
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        let createdObjectUrl: string | null = null;

        const loadPreview = async () => {
            setIsLoadingPreview(true);
            setIsPreviewError(false);

            try {
                // Primary: Attempt reading converted preview image from Puter FS
                if (imagePath) {
                    const imageBlob = await fs.read(imagePath);
                    if (imageBlob && imageBlob.size > 0 && isMounted) {
                        createdObjectUrl = URL.createObjectURL(imageBlob);
                        setPreviewUrl(createdObjectUrl);
                        setIsLoadingPreview(false);
                        return;
                    }
                }

                // Fallback: Attempt converting raw PDF file on-the-fly if preview image was missed
                if (resumePath) {
                    const pdfBlob = await fs.read(resumePath);
                    if (pdfBlob && isMounted) {
                        const pdfFile = new File([pdfBlob], "resume.pdf", { type: "application/pdf" });
                        const conversionResult = await convertPdfToImage(pdfFile);
                        if (conversionResult?.imageUrl && isMounted) {
                            setPreviewUrl(conversionResult.imageUrl);
                            setIsLoadingPreview(false);
                            return;
                        }
                    }
                }

                if (isMounted) {
                    setIsPreviewError(true);
                    setIsLoadingPreview(false);
                }
            } catch (err) {
                console.warn("Failed to load resume preview:", err);
                if (isMounted) {
                    setIsPreviewError(true);
                    setIsLoadingPreview(false);
                }
            }
        };

        loadPreview();

        return () => {
            isMounted = false;
            if (createdObjectUrl) {
                URL.revokeObjectURL(createdObjectUrl);
            }
        };
    }, [imagePath, resumePath, fs]);

    const handleConfirmDelete = async () => {
        if (isDeleting) return;
        setIsDeleting(true);
        setDeleteError(null);

        try {
            // Delete key from Puter KV store
            const deleted = await kv.delete(`resume:${id}`);
            if (deleted === false) {
                throw new Error("Could not remove resume from database.");
            }

            // Clean up files in Puter storage asynchronously
            if (resumePath) {
                fs.delete(resumePath).catch(() => {});
            }
            if (imagePath && imagePath !== resumePath) {
                fs.delete(imagePath).catch(() => {});
            }

            setShowDeleteModal(false);
            onDelete?.(id);
        } catch (err: any) {
            console.error("Failed to delete resume:", err);
            setDeleteError(err?.message || "Failed to remove resume. Please try again.");
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="relative group">
                <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-700 block">
                    <div className="resume-card-header">
                        <div className="flex flex-col gap-1 max-w-[240px]">
                            {companyName && <h2 className="text-black font-bold break-words line-clamp-1">{companyName}</h2>}
                            {jobTitle && <h3 className="text-sm break-words text-gray-500 line-clamp-1">{jobTitle}</h3>}
                            {!companyName && !jobTitle && <h2 className="text-black font-bold">Resume</h2>}
                        </div>
                        <div className="flex items-center gap-2">
                            <ScoreCircle score={feedback?.overallScore || 0} />
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowDeleteModal(true);
                                }}
                                title="Remove resume"
                                aria-label="Remove resume"
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {isLoadingPreview && (
                        <div className="gradient-border h-[350px] max-sm:h-[200px] flex items-center justify-center animate-pulse bg-gray-50/50 rounded-2xl">
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                <svg className="w-7 h-7 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <span className="text-xs font-medium">Loading preview...</span>
                            </div>
                        </div>
                    )}

                    {!isLoadingPreview && (isPreviewError || !previewUrl) && (
                        <div className="gradient-border h-[350px] max-sm:h-[200px] flex items-center justify-center bg-gray-50/80 rounded-2xl border border-gray-100">
                            <div className="flex flex-col items-center gap-2 text-center p-4">
                                <img src="/images/pdf.png" alt="Document" className="w-12 h-12 opacity-60" />
                                <p className="text-sm font-semibold text-gray-600">Preview unavailable</p>
                                <p className="text-xs text-gray-400">Click card to view feedback</p>
                            </div>
                        </div>
                    )}

                    {!isLoadingPreview && previewUrl && !isPreviewError && (
                        <div className="gradient-border animate-in fade-in duration-500">
                            <div className="w-full h-[350px] max-sm:h-[200px] overflow-hidden rounded-xl bg-gray-100">
                                <img
                                    src={previewUrl}
                                    alt={companyName ? `${companyName} resume preview` : "Resume preview"}
                                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                                    onError={() => setIsPreviewError(true)}
                                />
                            </div>
                        </div>
                    )}
                </Link>
            </div>

            {/* Remove Resume Confirmation Modal */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <div
                        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col gap-4 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-100 text-red-600 rounded-2xl shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 className="text-xl font-bold text-gray-900">Remove this resume?</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    This will remove the uploaded resume and its analysis from your application tracker.
                                </p>
                            </div>
                        </div>

                        {deleteError && (
                            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                                {deleteError}
                            </p>
                        )}

                        <div className="flex justify-end gap-3 mt-2">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowDeleteModal(false);
                                    setDeleteError(null);
                                }}
                                className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleConfirmDelete();
                                }}
                                className="px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <span>Removing...</span>
                                    </>
                                ) : (
                                    "Remove"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ResumeCard;