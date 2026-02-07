import { useForm } from "react-hook-form"
import { LoginSchema } from "./Login.schema"
import { yupResolver } from "@hookform/resolvers/yup"

export type LoginFormData = {
    email: string,
    password: string
}

export const useLoginForm = () => {
    return useForm<LoginFormData>({
        resolver: yupResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })
}