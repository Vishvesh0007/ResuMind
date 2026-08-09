export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

export interface PdfTextResult {
    text: string;
    numPages: number;
    error?: string;
    isScannedOrEmpty?: boolean;
}

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
    loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        pdfjsLib = lib;
        return lib;
    }).catch((err) => {
        loadPromise = null;
        throw new Error(`Failed to load PDF processing engine: ${err?.message || err}`);
    });

    return loadPromise;
}

function timeoutPromise<T>(promise: Promise<T>, ms: number, timeoutMsg: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(timeoutMsg)), ms);
        promise
            .then((res) => {
                clearTimeout(timer);
                resolve(res);
            })
            .catch((err) => {
                clearTimeout(timer);
                reject(err);
            });
    });
}

/**
 * Extracts plain text from all pages of a PDF file.
 */
export async function extractPdfText(file: File, timeoutMs = 20000): Promise<PdfTextResult> {
    try {
        const lib = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        
        const loadingTask = lib.getDocument({ data: arrayBuffer });
        const pdf: any = await timeoutPromise(
            loadingTask.promise as Promise<any>,
            timeoutMs,
            "PDF loading timed out. The file may be corrupt or too large."
        );

        const numPages = pdf.numPages || 0;
        if (numPages === 0) {
            return { text: "", numPages: 0, isScannedOrEmpty: true };
        }

        const pagePromises = [];
        // Limit page extraction to first 25 pages to protect context & performance
        const maxPagesToRead = Math.min(numPages, 25);

        for (let i = 1; i <= maxPagesToRead; i++) {
            pagePromises.push(
                (async () => {
                    try {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items
                            .map((item: any) => item.str || "")
                            .join(" ");
                        return `--- Page ${i} ---\n` + pageText.trim();
                    } catch {
                        return `--- Page ${i} --- [Could not extract page text]`;
                    }
                })()
            );
        }

        const pagesText = await timeoutPromise(
            Promise.all(pagePromises),
            timeoutMs,
            "Text extraction timed out."
        );

        const fullText = pagesText.join("\n\n").replace(/\s+/g, " ").trim();
        const isScannedOrEmpty = fullText.replace(/--- Page \d+ ---/g, "").trim().length < 30;

        return {
            text: fullText,
            numPages,
            isScannedOrEmpty,
        };
    } catch (err: any) {
        return {
            text: "",
            numPages: 0,
            error: err?.message || "Failed to extract text from PDF",
            isScannedOrEmpty: true,
        };
    }
}

/**
 * Splits text into chunks of maximum character length for large documents.
 */
export function chunkText(text: string, maxChunkLength = 12000): string[] {
    if (!text || text.length <= maxChunkLength) return [text || ""];

    const paragraphs = text.split("\n\n");
    const chunks: string[] = [];
    let currentChunk = "";

    for (const paragraph of paragraphs) {
        if ((currentChunk + "\n\n" + paragraph).length > maxChunkLength) {
            if (currentChunk.trim()) {
                chunks.push(currentChunk.trim());
            }
            // If a single paragraph is longer than maxChunkLength, split by length
            if (paragraph.length > maxChunkLength) {
                let remaining = paragraph;
                while (remaining.length > 0) {
                    chunks.push(remaining.slice(0, maxChunkLength));
                    remaining = remaining.slice(maxChunkLength);
                }
                currentChunk = "";
            } else {
                currentChunk = paragraph;
            }
        } else {
            currentChunk = currentChunk ? currentChunk + "\n\n" + paragraph : paragraph;
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

/**
 * Converts the first page of a PDF file to a PNG image for preview.
 * Scaled at 2.0 for balanced resolution and performance.
 */
export async function convertPdfToImage(
    file: File,
    timeoutMs = 15000
): Promise<PdfConversionResult> {
    try {
        const lib = await loadPdfJs();

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = lib.getDocument({ data: arrayBuffer });
        const pdf: any = await timeoutPromise(
            loadingTask.promise as Promise<any>,
            timeoutMs,
            "PDF preview loading timed out."
        );

        const page = await pdf.getPage(1);
        // Reduced scale from 4 to 2 for optimal performance and crisp preview
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (context) {
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = "high";
        }

        const renderTask = page.render({ canvasContext: context!, viewport });
        await timeoutPromise(renderTask.promise, timeoutMs, "Canvas rendering timed out.");

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const originalName = file.name.replace(/\.pdf$/i, "");
                        const imageFile = new File([blob], `${originalName}.png`, {
                            type: "image/png",
                        });

                        resolve({
                            imageUrl: URL.createObjectURL(blob),
                            file: imageFile,
                        });
                    } else {
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Failed to create preview image blob",
                        });
                    }
                },
                "image/png",
                0.9
            );
        });
    } catch (err: any) {
        return {
            imageUrl: "",
            file: null,
            error: `Failed to convert PDF preview: ${err?.message || err}`,
        };
    }
}