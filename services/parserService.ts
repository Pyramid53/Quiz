
import { Question, QuestionType } from '../types';

export const parseRawText = (text: string): Question[] => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const questions: Question[] = [];
  
  let currentText = "";
  let currentOptions: string[] = [];
  
  // Prefixes for multiple choice options
  const optionPrefixes = [
    'أ.', 'ب.', 'ج.', 'د.', 
    'أ)', 'ب)', 'ج)', 'د)',
    'a.', 'b.', 'c.', 'd.',
    'A.', 'B.', 'C.', 'D.',
    'a)', 'b)', 'c)', 'd)',
    'A)', 'B)', 'C)', 'D)',
    'A:', 'B:', 'C:', 'D:',
    'a:', 'b:', 'c:', 'd:'
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Ignore lines that are just dashes or empty
    if (/^[-_]+$/.test(line)) continue;
    
    // Check if line is an answer line
    const answerMatch = line.match(/^(?:\()? *(?:الإجاب[ةه]|answer) *:(.*)$/i);
    if (answerMatch) {
      let answerPart = answerMatch[1].replace(/\)+$/, "").trim();
      
      let finalAnswer = answerPart;
      const firstChar = answerPart.charAt(0).toLowerCase();
      
      if (['أ', 'ب', 'ج', 'د', 'a', 'b', 'c', 'd'].includes(firstChar)) {
        const matchingOption = currentOptions.find(opt => opt.charAt(0).toLowerCase() === firstChar);
        if (matchingOption) {
          finalAnswer = matchingOption.charAt(0);
        } else {
          finalAnswer = answerPart.charAt(0).toUpperCase();
        }
      } else if (answerPart.startsWith('صح') || answerPart.toLowerCase().startsWith('true')) {
        finalAnswer = 'True';
      } else if (answerPart.startsWith('غلط') || answerPart.toLowerCase().startsWith('false')) {
        finalAnswer = 'False';
      } else {
        finalAnswer = answerPart.charAt(0).toUpperCase(); // Fallback to first char
      }

      if (currentText) {
        const type: QuestionType = currentOptions.length > 0 ? 'multiple' : 'boolean';
        questions.push({
          id: Math.random().toString(36).substr(2, 9),
          text: currentText.trim(),
          type: type,
          options: currentOptions.length > 0 ? [...currentOptions] : undefined,
          correctAnswer: finalAnswer
        });
        
        // Reset for next question
        currentText = "";
        currentOptions = [];
      }
    } 
    // Check if line is an option
    else if (optionPrefixes.some(prefix => line.startsWith(prefix))) {
      currentOptions.push(line);
    } 
    // Otherwise, it's part of the question text
    else {
      if (currentOptions.length > 0) {
        currentOptions[currentOptions.length - 1] += " " + line;
      } else {
        currentText += (currentText ? " " : "") + line;
      }
    }
  }

  return questions;
};
