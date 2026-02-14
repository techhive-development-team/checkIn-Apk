import { API_URLS } from "../enums/urls";
import { LoginFormData } from "../features/Login/Login.form";
import { LoginSchema } from "../features/Login/Login.schema";
import { client } from "./client";

const login = async (data: LoginFormData) => {
  await LoginSchema.validate(data);

  return await client.exec(API_URLS.LOGIN, {
    method: 'post',
    data,
  });
};

export const authRepository = {
  login,
};
