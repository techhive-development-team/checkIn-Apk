import RNFS from 'react-native-fs';

export const fileToBase64 = async (filePath: string): Promise<string> => {
    const fileContent = await RNFS.readFile(filePath, 'base64');
    return fileContent;
};