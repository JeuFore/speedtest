export const convertBandwidth = (bytes: number) => {
  return (bytes * 8) / 1000000;
};

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
