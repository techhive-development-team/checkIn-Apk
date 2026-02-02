import { LoginFormData, LoginSchema,  } from "../components/LoginValidation";
import { API_URLS } from "../enums/urls";
import { client } from "./client";

const login = async (data: LoginFormData) => {
  await LoginSchema.validate(data);

  return await client.exec(API_URLS.LOGIN, {
    method: 'post',
    data, //body: JSON.stringify(data),
  });
};

export const authRepository = {
  login,
};
