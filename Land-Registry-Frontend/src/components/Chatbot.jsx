import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const RESPONSE_DELAY_MS = 1000;

const pickDeterministicResponse = (query, choices) => {
    const index = Array.from(query.toLowerCase()).reduce((sum, char) => sum + char.charCodeAt(0), 0) % choices.length;
    return choices[index];
};

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hi! I'm the Land Registry Bot. I'm here to help with registration, transfers, and history.",
            sender: 'bot'
        }
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const nextMessageIdRef = useRef(2);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const isSimilar = (value, target) => {
        const cleanInput = value.toLowerCase();
        const cleanTarget = target.toLowerCase();

        if (cleanInput.includes(cleanTarget) || cleanTarget.includes(cleanInput)) {
            return true;
        }

        let matches = 0;
        for (const char of cleanTarget) {
            if (cleanInput.includes(char)) {
                matches += 1;
            }
        }

        return (matches / cleanTarget.length) > 0.7;
    };

    const generateResponse = (query) => {
        const normalizedQuery = query.toLowerCase();

        if (normalizedQuery.match(/\b(hi|hello|hey|yo|sup|morning)\b/)) {
            return pickDeterministicResponse(query, [
                "Hello! Need help registering land or checking a record?",
                "Welcome back. We can look at ownership, verification, or transfers.",
                "Hi there. Tell me what part of the land workflow you want to explore.",
                "Hey! I can help with registration, verification, analytics, and history."
            ]);
        }

        if (isSimilar(normalizedQuery, 'registration') || isSimilar(normalizedQuery, 'register') || normalizedQuery.includes('add') || normalizedQuery.includes('new land')) {
            return "To register land, open 'Add Land', enter the property details, upload the required proof, and submit it for admin verification.";
        }

        if (isSimilar(normalizedQuery, 'verification') || isSimilar(normalizedQuery, 'verify') || normalizedQuery.includes('status') || normalizedQuery.includes('approve')) {
            return "Admins can review pending land records in 'Verify Lands'. Owners can track whether a record is still pending or already verified.";
        }

        if (isSimilar(normalizedQuery, 'transfer') || isSimilar(normalizedQuery, 'sell') || isSimilar(normalizedQuery, 'buy')) {
            return "To transfer a property, open one of your verified lands, choose 'Transfer', enter buyer details, and submit the request for approval.";
        }

        if (isSimilar(normalizedQuery, 'history') || normalizedQuery.includes('track') || normalizedQuery.includes('record')) {
            return "Open the history view for a land record to see the ownership trail and transfer activity connected to that property.";
        }

        if (normalizedQuery.includes('price') || normalizedQuery.includes('money') || normalizedQuery.includes('worth') || normalizedQuery.includes('analytics')) {
            return "The analytics section shows total value, average pricing trends, and verification breakdowns for the available land records.";
        }

        if (normalizedQuery.includes('who') || normalizedQuery.includes('name') || normalizedQuery.includes('bot')) {
            return "I'm the Land Registry Bot. I help explain the main workflows in this demo.";
        }

        return pickDeterministicResponse(query, [
            "Try asking about registration, transfer approval, ownership history, or analytics.",
            "I can help with land registration, verification, transfer flow, and record history.",
            "Ask me about the main demo flows and I'll point you to the right section.",
            "That one is outside my scope, but I can still help with the land registry workflow."
        ]);
    };

    const handleSend = () => {
        const trimmedInput = input.trim();
        if (!trimmedInput) {
            return;
        }

        const userMessage = {
            id: nextMessageIdRef.current++,
            text: trimmedInput,
            sender: 'user'
        };

        setMessages((previous) => [...previous, userMessage]);
        setInput("");

        setTimeout(() => {
            const botResponse = generateResponse(trimmedInput);
            setMessages((previous) => [
                ...previous,
                { id: nextMessageIdRef.current++, text: botResponse, sender: 'bot' }
            ]);
        }, RESPONSE_DELAY_MS);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <div
                        className="pointer-events-auto bg-white dark:bg-gray-800 rounded-tr-2xl rounded-tl-2xl rounded-bl-2xl shadow-2xl border-2 border-blue-500 w-80 md:w-96 mb-4 overflow-hidden flex flex-col h-[500px]"
                    >
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <div className="bg-white p-1 rounded-full">
                                    <Bot className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Land Registry Bot</h3>
                                    <p className="text-xs text-blue-100 italic">Workflow assistant</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                                            msg.sender === 'user'
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                                        }`}
                                    >
                                        {msg.text.split('\n').map((line, index) => (
                                            <p key={index} className={index > 0 ? 'mt-2' : ''}>{line}</p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                autoFocus
                                onChange={(event) => setInput(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        handleSend();
                                    }
                                }}
                                placeholder="Type something..."
                                className="flex-1 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            />
                            <button
                                onClick={handleSend}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors shadow-lg transform active:scale-95"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg transition-all flex items-center justify-center border-4 border-white dark:border-gray-800 z-50"
            >
                {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
            </button>
        </div>
    );
};

export default Chatbot;
