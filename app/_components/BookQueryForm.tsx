"use client";
import React, { useActionState } from "react";
import { searchBooksAction } from "../actions/book";
import { FiSearch, FiBookOpen } from "react-icons/fi";

const BookQueryForm = () => {
    const [state, formAction, isPending] = useActionState(searchBooksAction, null);

    return (
        <form action={formAction} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <FiSearch size={22} />
                </div>
                <input
                    type="text"
                    id="query"
                    name="query"
                    required
                    className="w-full pl-14 pr-6 py-5 bg-white border-2 border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-lg shadow-sm hover:border-gray-200"
                    placeholder="What are you interested in reading about?"
                />
            </div>

            <div className="flex flex-col gap-4">
                {state?.error && (
                    <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-semibold flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {state.error}
                    </div>
                )}
                {state?.success && (
                    <div className="p-4 rounded-2xl bg-green-50 text-green-600 text-sm font-semibold flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        {state.success}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-5 px-8 rounded-[2rem] hover:shadow-2xl hover:shadow-blue-500/20 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:grayscale"
                >
                    {isPending ? (
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Generating Recommendations...</span>
                        </div>
                    ) : (
                        <>
                            <FiBookOpen size={20} />
                            <span>Get AI Recommendations</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default BookQueryForm;