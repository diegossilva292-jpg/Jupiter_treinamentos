export enum ProgressStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
}

export class Progress {
    userId: string;
    lessonId: string;
    status: ProgressStatus;
    completedAt?: Date;
    attempts?: number;
    score?: number;
}
