import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseUrl } from "../enums/urls";

const exec = async (endPoint: RequestInfo, config?: RequestInit) => {
    const token = await AsyncStorage.getItem("token");
    const headers = {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    const response = await fetch(`${baseUrl}${endPoint}`, {
        ...config,
        headers: {
            ...headers,
            ...config?.headers,
        },
    });

    const data = await response.json();
    if (!response.ok) {
        throw data;
    }
    return data;
};

export const client = { exec };
