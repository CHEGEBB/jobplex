export interface CultureValue {
    title: string;
    description: string;
  }
  
  export interface Benefit {
    icon: string;
    title: string;
    description: string;
  }
  
  export interface SocialResponsibility {
    title: string;
    description: string;
  }
  
  export interface EmployerProfile {
    id?: number;
    user_id: number;
    name: string;
    logo: string;
    coverImage: string;
    description: string;
    industry: string;
    founded: string;
    size: string;
    headquarters: string;
    website: string;
    phone: string;
    email: string;
    mission: string;
    vision: string;
    culture: {
      values: CultureValue[];
      workEnvironment: string;
    };
    benefits: Benefit[];
    socialResponsibility: SocialResponsibility[];
    created_at?: Date;
    updated_at?: Date;
  }
  
  export interface CreateEmployerProfileDto {
    name: string;
    logo: string;
    coverImage: string;
    description: string;
    industry: string;
    founded: string;
    size: string;
    headquarters: string;
    website: string;
    phone: string;
    email: string;
    mission: string;
    vision: string;
    culture: {
      values: CultureValue[];
      workEnvironment: string;
    };
    benefits: Benefit[];
    socialResponsibility: SocialResponsibility[];
  }
  
  export interface UpdateEmployerProfileDto extends CreateEmployerProfileDto {}