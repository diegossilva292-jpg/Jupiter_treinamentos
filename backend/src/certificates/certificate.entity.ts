export class Certificate {
    id: string;
    userId: string;
    courseId: string;
    issuedAt: Date;
    courseTitle: string; // Denormalized for simpler display
    userName: string;
}
