import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertCircle, Heart, BarChart } from 'lucide-react';
import { 
  sendChatMessage, 
  clearConversation, 
  generateStressAnalysis, 
  getStressAssessmentQuestions,
  getProgress 
} from '../src/api/chat.js';

// Crisis Alert Component
const CrisisAlert = ({ onClose }) => {
  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 mb-4 relative">
      <h3 className="text-neutral-200 font-semibold mb-2">Har du brug for akut hjælp?</h3>
      <p className="text-neutral-300 mb-2">Hvis du har det meget svært lige nu, er der hjælp at få:</p>
      <ul className="text-neutral-300 list-disc pl-5">
        <li>Livslinien: 70 201 201 (Åbent hele døgnet)</li>
        <li>Akut psykiatrisk hjælp: 1813</li>
        <li>Din egen læge eller lægevagten</li>
      </ul>
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        ✕
      </button>
    </div>
  );
};

// Message Component
const Message = ({ content, isUser, isQuestion }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`rounded-2xl px-4 py-3 max-w-[80%] ${
          isUser 
            ? 'bg-neutral-700 text-white' 
            : isQuestion
              ? 'bg-neutral-800 text-neutral-200 border border-neutral-600'
              : 'bg-neutral-800 text-neutral-200'
        }`}
      >
        {content}
      </div>
    </div>
  );
};

// Analysis Component
const Analysis = ({ analysisText, score }) => {
  const renderFormattedText = (text) => {
    if (typeof text !== 'string') return null;

    const sections = text.split('\n\n').map((section, idx) => {
      const hasHeader = section.match(/^##?\s+(.+)/);
      if (hasHeader) {
        const [, title] = hasHeader;
        const content = section.replace(/^##?\s+.+\n/, '');
        return (
          <div key={idx} className="mb-6">
            <h3 className="text-lg font-semibold text-neutral-200 mb-2">{title}</h3>
            <p className="text-neutral-300">{content}</p>
          </div>
        );
      }
      return <p key={idx} className="text-neutral-300 mb-4">{section}</p>;
    });

    return <div className="space-y-4">{sections}</div>;
  };

  return (
    <div className="bg-neutral-800 rounded-lg p-6 text-neutral-200">
      <div className="flex items-center gap-3 mb-6">
        <BarChart className="w-6 h-6" />
        <h2 className="text-xl font-semibold">Din Stressanalyse</h2>
        {score !== undefined && (
          <span className="ml-auto text-sm bg-neutral-700 px-3 py-1 rounded-full">
            Score: {score}
          </span>
        )}
      </div>
      <div className="space-y-4">
        {renderFormattedText(analysisText)}
      </div>
    </div>
  );
};

// Input Area Component
const InputArea = ({ onSend, loading }) => {
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        placeholder="Skriv dit svar her..."
        className="flex-1 p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 placeholder-neutral-500 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 focus:outline-none min-h-[80px] resize-none font-sans"
        disabled={loading}
      />
      <button 
        type="submit"
        className="px-6 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!message.trim() || loading}
      >
        <Send className="h-5 w-5" />
      </button>
    </form>
  );
};

// Main SindRo Component
const SindRo = () => {
  const chatContainerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Velkommen! Jeg er her for at tale om, hvordan stress måske påvirker dig. Lad os starte med at tale om, hvordan du har det for tiden?",
      isInitial: true
    }
  ]);
  const [stressQuestions] = useState(getStressAssessmentQuestions());
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisText, setAnalysisText] = useState(null);
  const [analysisScore, setAnalysisScore] = useState(null);
  const [error, setError] = useState(null);
  const [showVigtigInfo, setShowVigtigInfo] = useState(true);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // In SindRo component, update the handleMessage function:

const handleMessage = async (userInput) => {
    setLoading(true);
    setError(null);
  
    // Check for crisis keywords
    const crisisKeywords = ['selvmord', 'selvmordstanker', 'dø', 'ende det hele'];
    if (crisisKeywords.some(keyword => userInput.toLowerCase().includes(keyword))) {
      setShowCrisisAlert(true);
    }
  
    // Add user message
    const newMessages = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
  
    try {
      // Get AI response
      const aiMessage = await sendChatMessage(newMessages);
      
      // Get current progress
      const progress = getProgress();
      
      // Add AI response to messages
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiMessage.content,
        isQuestion: progress.currentQuestion !== -1
      }]);
  
      // Check if analysis should be triggered
      if (progress.isComplete || aiMessage.shouldAnalyze) {
        try {
          const analysis = await generateStressAnalysis();
          if (analysis && analysis.analysis) {  // Make sure we have valid analysis data
            setAnalysisText(analysis.analysis);
            setAnalysisScore(analysis.score);
            setShowAnalysis(true);
          }
        } catch (analysisError) {
          console.error('Analysis generation failed:', analysisError);
          setError("Der opstod en fejl ved generering af analysen. Prøv venligst igen.");
        }
      }
  
    } catch (error) {
      console.error('Error in message handling:', error);
      setError("Der opstod en fejl. Prøv venligst igen.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    clearConversation();
    setMessages([{ 
      role: 'assistant', 
      content: "Velkommen tilbage! Hvordan har du det i dag?",
      isInitial: true
    }]);
    setShowAnalysis(false);
    setAnalysisText(null);
    setAnalysisScore(null);
    setShowCrisisAlert(false);
    setError(null);
    setShowVigtigInfo(true);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200 flex flex-col items-center justify-center p-4 font-sans antialiased">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <Heart className="w-8 h-8 text-neutral-200 mr-2" />
            <h1 className="text-4xl font-bold text-neutral-200">SindRo</h1>
          </div>
          <p className="text-neutral-400">Din digitale støtte til mental balance</p>
        </div>

        {/* Main Chat Container */}
        <div className="w-full bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800">
          {/* Important Information Banner */}
          {showVigtigInfo && (
            <div className="bg-neutral-800 p-4 relative">
              <div className="flex items-center text-neutral-200 mb-2">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="font-semibold">Vigtig information</span>
                <button 
                  onClick={() => setShowVigtigInfo(false)}
                  className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-neutral-400 text-sm">
                Denne samtale er vejledende og kan hjælpe dig med at forstå dit stressniveau. 
                For professionel rådgivning, kontakt venligst sundhedsfagligt personale.
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/50 border border-red-700 p-4 m-4 rounded-lg">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Crisis Alert */}
          {showCrisisAlert && (
            <div className="p-4">
              <CrisisAlert onClose={() => setShowCrisisAlert(false)} />
            </div>
          )}

          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="h-96 overflow-y-auto p-4 scroll-smooth"
          >
            {messages.map((message, index) => (
              <Message 
                key={index}
                content={message.content}
                isUser={message.role === 'user'}
                isQuestion={message.isQuestion}
              />
            ))}
            
            {/* Analysis Display */}
            {showAnalysis && analysisText && (
              <div className="mt-6">
                <Analysis 
                  analysisText={analysisText}
                  score={analysisScore}
                />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-neutral-800">
            {!showAnalysis && (
              <InputArea 
                onSend={handleMessage} 
                loading={loading}
              />
            )}
            {showAnalysis && (
              <div className="text-center">
                <button 
                  onClick={handleReset}
                  className="bg-neutral-700 hover:bg-neutral-600 text-white px-6 py-3 rounded-lg transition-colors focus:ring-1 focus:ring-neutral-600 focus:outline-none"
                >
                  Start ny samtale
                </button>
              </div>
            )}
            <p className="text-sm text-neutral-500 mt-2 text-center">
              Tryk Enter for at sende, Shift + Enter for ny linje
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-neutral-500 text-sm mt-6">
          © 2024 SindRo - Et værktøj til mental sundhed
        </footer>
      </div>
    </div>
  );
};

export default SindRo;