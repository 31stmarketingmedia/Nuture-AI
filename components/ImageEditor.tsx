import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

interface SourceImage {
    previewUrl: string;
    base64: string;
    mimeType: string;
}

const ImageEditor: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [sourceImage, setSourceImage] = useState<SourceImage | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError("Please upload a valid image file (e.g., JPEG, PNG).");
                return;
            }
            setError(null);
            setEditedImage(null); // Clear previous edit
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setSourceImage({
                    previewUrl: URL.createObjectURL(file),
                    base64: base64String,
                    mimeType: file.type,
                });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sourceImage || !prompt) {
            setError("Please upload an image and provide edit instructions.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImage(null);

        try {
            const imageB64 = await editImage(sourceImage.base64, sourceImage.mimeType, prompt);
            setEditedImage(imageB64);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred while editing the image.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border-2 border-gray-200">
            <div className="text-center mb-6">
                 <h2 className="text-2xl font-extrabold text-brand-primary mb-2">Edit an Image with AI</h2>
                <p className="text-text-medium max-w-2xl mx-auto">
                    Upload a photo and tell the AI what you want to change.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                 <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-4 min-h-[250px]">
                    <h3 className="text-lg font-bold text-text-dark mb-2">Original</h3>
                    {sourceImage ? (
                        <img src={sourceImage.previewUrl} alt="Source for editing" className="max-w-full max-h-64 rounded-lg shadow-md" />
                    ) : (
                        <button onClick={handleUploadClick} className="text-center cursor-pointer p-6 rounded-lg hover:bg-gray-100 transition-colors">
                           <UploadIcon />
                           <p className="mt-2 font-semibold text-brand-primary">Click to upload an image</p>
                        </button>
                    )}
                </div>
                 <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-4 min-h-[250px]">
                    <h3 className="text-lg font-bold text-text-dark mb-2">Edited</h3>
                    {isLoading && (
                        <div className="text-center text-text-medium">
                            <svg className="animate-spin h-8 w-8 text-brand-secondary mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="font-bold">AI is working its magic...</p>
                        </div>
                    )}
                    {!isLoading && editedImage && (
                         <img src={`data:image/png;base64,${editedImage}`} alt={prompt} className="max-w-full max-h-64 rounded-lg shadow-md" />
                    )}
                    {!isLoading && !editedImage && (
                        <div className="text-center text-text-medium">
                            <p className="font-bold">Your edited image will appear here.</p>
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                />
                 <div>
                    <label htmlFor="edit-prompt" className="block text-sm font-bold text-text-dark mb-2">Edit Instructions</label>
                    <textarea
                        id="edit-prompt"
                        rows={2}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Add a retro filter, or remove the person in the background"
                        className="w-full px-4 py-3 bg-white text-text-dark placeholder:text-gray-400 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-accent-yellow transition duration-150 ease-in-out"
                        required
                        disabled={!sourceImage}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !prompt || !sourceImage}
                    className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-bold rounded-lg shadow-sm text-white bg-accent-pink hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-pink disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform duration-150 ease-in-out hover:scale-105"
                >
                    {isLoading ? 'Applying Edit...' : 'Apply Edit'}
                </button>
            </form>
            {error && (
                <div className="mt-4 text-center text-red-600">
                    <p className="font-bold">Error: {error}</p>
                </div>
            )}
             {editedImage && !isLoading && (
                 <div className="mt-4 text-center">
                    <a
                        href={`data:image/png;base64,${editedImage}`}
                        download={`edited_${prompt.replace(/\s+/g, '_')}.png`}
                        className="inline-block px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Download Edited Image
                    </a>
                </div>
            )}

        </div>
    );
};

export default ImageEditor;
