export type CreateFamilyResponsibleRequest = {
    name: string;
    cpf: string;
    birth_date: string;
    mother_name: string;
    relationship: string;
    age: number;
    registration_status: string;
    registration_date: string;
    personal_income: number;
};

export type CreateFamilyMemberRequest = {
    name: string;
    cpf: string;
    birth_date: string;
    mother_name: string;
    relationship: string;
    age: number;
    registration_status: string;
    registration_date: string;
    personal_income: number;
}

export type CreateFamilyRequest = {
    parish_id: number;
    address: string | null;
    observations: string | null;
    responsible: CreateFamilyResponsibleRequest;
};

export type UpdateAssistedFamilyMemberRequest = {
    cpf: string;
    birth_date: string;
    relationship: string;
    age: number;
    registration_status: string;
    personal_income: number;
};