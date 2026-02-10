export class User {
  id: string;
  name: string;
  role: 'admin' | 'student';
  title: string; // Cargo
  xp: number;
}

export const MOCK_USERS: User[] = [
  { id: '1', name: 'JÚPITER TELECOM ADM', role: 'admin', title: 'Training Manager', xp: 45 },
  { id: '2', name: 'Bob Builder', role: 'student', title: 'Software Engineer', xp: 35 },
  { id: '3', name: 'Carol Coder', role: 'student', title: 'Frontend Dev', xp: 40 },
  { id: '4', name: 'Dave DevOps', role: 'student', title: 'SRE', xp: 25 },
];
