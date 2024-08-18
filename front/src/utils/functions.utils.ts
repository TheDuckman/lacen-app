export const getImgUrl = (imgName: string | null): string | null => {
  if (!imgName) {
    return null;
  }
  return `${import.meta.env.VITE_STATIC_URL}${imgName}`;
};

export const cleanRString = (rString: string): string => {
  return rString
    .replaceAll(/\[\d+\]/g, '')
    .replaceAll('"', '')
    .trim();
};
