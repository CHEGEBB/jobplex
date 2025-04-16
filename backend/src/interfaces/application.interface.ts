export interface IApplication {
    id?: number;
    jobId: number;
    userId: number;
    status: 'pending' | 'reviewing' | 'rejected' | 'accepted' | 'interview';
    coverLetter?: string;
    resumeUrl?: string;
    matchScore?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }