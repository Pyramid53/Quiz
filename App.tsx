
import React, { useState } from 'react';
import { parseRawText } from './services/parserService';
import { Question, AppState } from './types';
import ParserView from './components/ParserView';
import QuizView from './components/QuizView';
import ResultView from './components/ResultView';

const App: React.FC = () => {
  const [view, setView] = useState<AppState>('input');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(0);

  const handleGenerateFromText = (text: string) => {
    const parsed = parseRawText(text);
    if (parsed.length > 0) {
      setQuestions(parsed);
      setView('quiz');
    } else {
      alert("Could not find any valid questions in the text. Make sure to write 'Answer:' followed by (True/False) or the choice character.");
    }
  };

  const handleQuestionsFound = (foundQuestions: Question[]) => {
    setQuestions(foundQuestions);
    setView('quiz');
  };

  const handleSubmitQuiz = (updatedQuestions: Question[]) => {
    setQuestions(updatedQuestions);
    const correctCount = updatedQuestions.filter(q => q.userAnswer === q.correctAnswer).length;
    setScore(correctCount);
    setView('result');
  };

  const handleReset = () => {
    setQuestions([]);
    setScore(0);
    setView('input');
  };

  const handleRetake = () => {
    const resetQuestions = questions.map(q => ({ ...q, userAnswer: undefined }));
    setQuestions(resetQuestions);
    setScore(0);
    setView('quiz');
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="h-4 bg-indigo-700 w-full mb-8 shadow-md"></div>

      <main className="max-w-4xl mx-auto px-4">
        {view === 'input' && (
          <ParserView 
            onGenerate={handleGenerateFromText} 
            onQuestionsFound={handleQuestionsFound} 
          />
        )}

        {view === 'quiz' && (
          <QuizView 
            questions={questions} 
            onSubmit={handleSubmitQuiz} 
            onBack={handleReset} 
          />
        )}

        {view === 'result' && (
          <ResultView 
            questions={questions} 
            score={score} 
            onReset={handleReset} 
            onRetake={handleRetake} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
