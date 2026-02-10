export class QuizQuestion {
    id: string;
    text: string;
    options: string[];
    correctOptionIndex: number;
}

export class Quiz {
    id: string;
    questions: QuizQuestion[];
    passingScore: number; // Percentage, e.g., 70
}
