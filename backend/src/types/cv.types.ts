export interface CV {
    id: number;
    user_id: number;
    name: string;
    file_url: string;
    file_key: string;
    date_uploaded: Date;
    tags: string[];
    is_primary: boolean;
  }
  
  export interface CreateCVDTO {
    name: string;
    file_url: string;
    file_key: string;
    tags?: string[];
    is_primary?: boolean;
  }
  
  export interface UpdateCVDTO {
    name?: string;
    tags?: string[];
    is_primary?: boolean;
  }