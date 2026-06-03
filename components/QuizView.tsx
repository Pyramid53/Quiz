
import React, { useState } from 'react';
import { Question } from '../types';

interface QuizViewProps {
  questions: Question[];
  onSubmit: (questions: Question[]) => void;
  onBack: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, onSubmit, onBack }) => {
  const [answers, setAnswers] = useState<{ [key: string]: string }>(
    Object.fromEntries(questions.filter(q => q.userAnswer !== undefined).map(q => [q.id, q.userAnswer!]))
  );

  const handleSelect = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const isComplete = Object.keys(answers).length === questions.length;

  const handleSubmit = () => {
    const finalQuestions = questions.map(q => ({
      ...q,
      userAnswer: answers[q.id]
    }));
    onSubmit(finalQuestions);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border-t-8 border-indigo-700 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interactive Quiz</h1>
        <p className="text-gray-600 mb-4 text-sm">* Required</p>
        <button 
          onClick={onBack}
          className="text-indigo-700 text-sm font-semibold hover:underline"
        >
          &larr; Back to edit questions
        </button>
      </div>

      {questions.map((q, idx) => (
        <div key={q.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 transition-all hover:shadow-md">
          <p className="text-lg font-medium text-gray-900 mb-6 leading-relaxed">
            {idx + 1}. {q.text} <span className="text-red-500">*</span>
          </p>
          
          <div className="space-y-3">
            {q.type === 'boolean' ? (
              <>
                {['True', 'False'].map((option) => (
                  <label key={option} className="flex items-center group cursor-pointer p-3 rounded-lg hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100">
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      checked={answers[q.id] === option}
                      onChange={() => handleSelect(q.id, option)}
                      className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-gray-700 font-medium">{option}</span>
                  </label>
                ))}
              </>
            ) : (
              <>
                {q.options?.map((optionText) => {
                  const optionKey = optionText[0]; // Gets A, B, C, D
                  return (
                    <label key={optionText} className="flex items-center group cursor-pointer p-3 rounded-lg hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100">
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        checked={answers[q.id] === optionKey}
                        onChange={() => handleSelect(q.id, optionKey)}
                        className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="ml-3 text-gray-700">{optionText}</span>
                    </label>
                  );
                })}
              </>
            )}
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center pt-6 pb-10">
        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          className="bg-indigo-700 text-white font-bold py-3 px-12 rounded-lg hover:bg-indigo-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          Submit Answers
        </button>
        <div className="text-gray-500 text-sm font-semibold">
           Answered {Object.keys(answers).length} out of {questions.length}
        </div>
      </div>
    </div>
  );
};

export default QuizView;
