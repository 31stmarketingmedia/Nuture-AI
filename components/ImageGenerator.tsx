import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';

const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const imageB64 = await generateImage(prompt, aspectRatio);
            setGeneratedImage(imageB64);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred while generating the image.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border-2 border-gray-200">
            <div className="text-center mb-6">
                 <h2 className="text-2xl font-extrabold text-brand-primary mb-2">Create a Visual Aid</h2>
                <p className="text-text-medium max-w-2xl mx-auto">
                    Generate a simple, child-friendly image to help with schedules, instructions, or flashcards.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="image-prompt" className="block text-sm font-bold text-text-dark mb-2">Image Description</label>
                    <textarea
                        id="image-prompt"
                        rows={2}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A happy red apple"
                        className="w-full px-4 py-3 bg-white text-text-dark placeholder:text-gray-400 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-accent-yellow transition duration-150 ease-in-out"
                        required
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label htmlFor="aspect-ratio" className="block text-sm font-bold text-text-dark mb-2">Shape</label>
                        <select
                            id="aspect-ratio"
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value)}
                            className="w-full px-4 py-3 bg-white text-text-dark border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-accent-yellow transition duration-150 ease-in-out"
                        >
                            <option value="1:1">Square (1:1)</option>
                            <option value="16:9">Landscape (16:9)</option>
                            <option value="9:16">Portrait (9:16)</option>
                            <option value="4:3">Standard (4:3)</option>
                            <option value="3:4">Tall (3:4)</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                         <button
                            type="submit"
                            disabled={isLoading || !prompt}
                            className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-bold rounded-lg shadow-sm text-white bg-brand-secondary hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform duration-150 ease-in-out hover:scale-105"
                        >
                             {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Image...
                                </>
                            ) : 'Generate Image'}
                        </button>
                    </div>
                </div>
            </form>

            <div className="mt-6 min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-4">
                {isLoading && (
                    <div className="text-center text-text-medium">
                        <p className="font-bold">Drawing your idea...</p>
                        <p className="text-sm">This can take a moment.</p>
                    </div>
                )}
                {error && (
                    <div className="text-center text-red-600">
                        <p className="font-bold">Oh no, an error!</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                {!isLoading && !error && generatedImage && (
                    <div className="text-center">
                        <img
                            src={`data:image/jpeg;base64,${generatedImage}`}
                            alt={prompt}
                            className="max-w-full max-h-64 rounded-lg shadow-md mx-auto"
                        />
                         <a
                            href={`data:image/jpeg;base64,${generatedImage}`}
                            download={`${prompt.replace(/\s+/g, '_')}.jpeg`}
                            className="mt-4 inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Download Image
                        </a>
                    </div>
                )}
                {!isLoading && !error && !generatedImage && (
                     <div className="text-center text-text-medium">
                        <p className="font-bold">Your generated image will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageGenerator;
