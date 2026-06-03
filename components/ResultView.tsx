
import React from 'react';
import { Question } from '../types';

interface ResultViewProps {
  questions: Question[];
  score: number;
  onReset: () => void;
  onRetake: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ questions, score, onReset, onRetake }) => {
  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border-t-8 border-indigo-700 p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Results</h1>
        <div className="mb-6">
          <p className="text-gray-500 mb-1">Final Score</p>
          <span className="text-6xl font-extrabold text-indigo-700">{score}</span>
          <span className="text-2xl text-gray-400"> / {questions.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-8 overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${percentage > 70 ? 'bg-green-500' : percentage > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRetake}
            className="bg-indigo-700 text-white font-bold py-2 px-8 rounded-lg hover:bg-indigo-800 transition-all shadow-md"
          >
            Retake Quiz
          </button>
          <button
            onClick={onReset}
            className="bg-white text-indigo-700 border border-indigo-700 font-bold py-2 px-8 rounded-lg hover:bg-indigo-50 transition-all shadow-sm"
          >
            Create New Quiz
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 ml-2">Review Questions:</h2>
        {questions.map((q, idx) => {
          const isCorrect = q.userAnswer === q.correctAnswer;
          return (
            <div key={q.id} className={`bg-white rounded-xl shadow-sm p-6 border-l-8 ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
              <div className="flex items-start justify-between mb-4">
                <p className="text-gray-800 font-bold leading-relaxed flex-1">
                  {idx + 1}. {q.text}
                </p>
                {isCorrect ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2">Correct</span>
                ) : (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2">Incorrect</span>
                )}
              </div>

              {q.type === 'multiple' && q.options && (
                <div className="mb-4 space-y-1">
                  {q.options.map(opt => {
                    const optKey = opt[0];
                    const isUserChoice = q.userAnswer === optKey;
                    const isCorrectChoice = q.correctAnswer === optKey;
                    
                    let bgClass = "bg-transparent";
                    if (isCorrectChoice) bgClass = "bg-green-50 border border-green-200 font-semibold text-green-800";
                    else if (isUserChoice && !isCorrect) bgClass = "bg-red-50 border border-red-200 text-red-800";

                    return (
                      <div key={opt} className={`p-2 rounded text-sm ${bgClass}`}>
                        {opt} {isCorrectChoice && " ✓"} {isUserChoice && !isCorrect && " ✗"}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-2 pt-3 border-t border-gray-100 text-sm flex flex-wrap gap-4">
                <p className="text-gray-600">
                  Your choice: <span className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>{q.userAnswer}</span>
                </p>
                {!isCorrect && (
                  <p className="text-gray-600">
                    Correct Answer: <span className="font-bold text-indigo-700">{q.correctAnswer}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultView;
