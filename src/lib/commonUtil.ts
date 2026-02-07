import RNFS from 'react-native-fs';

export const fileToBase64 = async (filePath: string): Promise<string> => {
  const cleanPath = filePath.replace('file://', '');
  const base64 = await RNFS.readFile(cleanPath, 'base64');
  return `data:image/jpeg;base64,${base64}`;
};
