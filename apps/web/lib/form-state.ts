export interface FormState {
  readonly error?: string;
  readonly success: boolean;
}

export const initialFormState: FormState = { success: false };
