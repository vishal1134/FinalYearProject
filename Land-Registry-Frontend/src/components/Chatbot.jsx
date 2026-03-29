import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Yo! 👋 I'm the Land Registry Bot. I'm here to help you rule your real estate empire! What's up?", sender: 'bot' }
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        // Simulate AI Response with a "thinking" delay
        setTimeout(() => {
            const botResponse = generateResponse(input);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
        }, 800 + Math.random() * 500); // Random delay for realism
    };

    // Simple Levenshtein-like distance for fuzzy matching
    // Returns true if 'input' is similar to 'target' (allows 1-2 typos)
    const isSimilar = (input, target) => {
        const cleanInput = input.toLowerCase();
        const cleanTarget = target.toLowerCase();

        // Direct match or substring
        if (cleanInput.includes(cleanTarget) || cleanTarget.includes(cleanInput)) return true;

        // Check for "most letters match" (simple approximation)
        let matches = 0;
        for (let char of cleanTarget) {
            if (cleanInput.includes(char)) matches++;
        }
        return (matches / cleanTarget.length) > 0.7; // 70% letter match
    };

    const generateResponse = (query) => {
        const q = query.toLowerCase();

        // 1. GREETINGS
        if (q.match(/\b(hi|hello|hey|yo|sup|morning)\b/)) {
            const jokes = [
                "Hola! ready to buy some castles? 🏰",
                "Beep boop! Only good land vibes here. ✨",
                "Greetings, human! Let's get that paperwork sorted. 📄",
                "High five! ✋ What's the plan? Buying? Selling? Verifying?"
            ];
            return jokes[Math.floor(Math.random() * jokes.length)];
        }

        // 2. REGISTRATION (Fuzzy: register, add, new, create)
        if (isSimilar(q, 'registration') || isSimilar(q, 'register') || q.includes('add') || q.includes('new land')) {
            return "🏰 **Wanna expand the empire?**\n\nTo claim new territory:\n1. Hit 'Add Land' in the sidebar.\n2. Enter the details (Don't lie about the price! 😉).\n3. Upload a pic.\n4. Wait for an Admin to verify it (They can be slow sometimes 🐢).";
        }

        // 3. VERIFICATION (Fuzzy: verify, check, status, approve)
        if (isSimilar(q, 'verification') || isSimilar(q, 'verify') || q.includes('status') || q.includes('approve')) {
            return "🕵️ **Sherlock Mode Activated!**\n\nVerification is how we keep things legit.\n- **Admins**: Go to 'Verify Lands' and use your mighty gavel 🔨.\n- **Owners**: If your land is 'Pending', sit tight. The bureaucrats are working on it. ☕";
        }

        // 4. TRANSFER (Fuzzy: transfer, sell, buy, ownership)
        if (isSimilar(q, 'transfer') || isSimilar(q, 'sell') || isSimilar(q, 'buy')) {
            return "💸 **Cha-ching! Time to cash out?**\n\nTo sell your land:\n1. Go to 'My Lands'.\n2. Click 'Transfer' (It must be Verified first!).\n3. Pick a lucky buyer.\n4. Boom! 💥 It's theirs now.";
        }

        // 5. HISTORY (Fuzzy: history, past, audit)
        if (isSimilar(q, 'history') || q.includes('track') || q.includes('record')) {
            return "📜 **The Ancient Scrolls**\n\nWe never forget.\nClick the 'History' button on any land card to see every owner since the dawn of time (or at least since this app started). No secrets here! 🔍";
        }

        // 6. PRICE / ANALYTICS
        if (q.includes('price') || q.includes('money') || q.includes('worth') || q.includes('analytics')) {
            return "📈 **Stonks!**\n\nCheck the 'Analytics' tab to see if the market is going 🚀 to the moon or crashing. We got pie charts (sadly not edible). 🥧";
        }

        // 7. WHO ARE YOU
        if (q.includes('who') || q.includes('name') || q.includes('bot')) {
            return "I'm the **Block-Bot 3000**. 🤖\nI live on the blockchain and eat electricity for breakfast. ⚡";
        }

        // FALLBACK
        const confused = [
            "Wait... explain that like I'm 5. 👶",
            "I'm smart, but not THAT smart. Try 'Register' or 'Sell'. 🤯",
            "404: Answer not found. Ask me about Land stuff! 🏗️",
            "My programmer didn't teach me that word yet! 🤐"
        ];
        return confused[Math.floor(Math.random() * confused.length)];
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="pointer-events-auto bg-white dark:bg-gray-800 rounded-tr-2xl rounded-tl-2xl rounded-bl-2xl shadow-2xl border-2 border-blue-500 w-80 md:w-96 mb-4 overflow-hidden flex flex-col h-[500px]"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <div className="bg-white p-1 rounded-full">
                                    <Bot className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Block-Bot 3000 🤖</h3>
                                    <p className="text-xs text-blue-100 italic">Here to serve!</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                                        }`}>
                                        {msg.text.split('\n').map((line, i) => (
                                            <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                autoFocus
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
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
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg transition-all flex items-center justify-center border-4 border-white dark:border-gray-800 z-50"
            >
                {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
            </motion.button>
        </div>
    );
};

export default Chatbot;
