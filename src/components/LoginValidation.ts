import * as yup from 'yup';

export const LoginSchema = yup.object({
  email: yup.string().email('Invalid email address').defined(),
  password: yup.string().min(6, 'Password must be at least 6 characters').defined(),
});

export interface LoginFormData extends yup.InferType<typeof LoginSchema> {}