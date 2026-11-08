// Money helpers: canonical storage is integer fils (1 JOD = 1000 fils).
export const JOD_TO_FILS = 1000;

export const toFils = (jod: number): number => Math.round(jod * JOD_TO_FILS);

export const fromFils = (fils: number): number => fils / JOD_TO_FILS;

export const formatJOD = (filsOrJod: number, asFils = false): string => {
  const jod = asFils ? filsOrJod / JOD_TO_FILS : filsOrJod;
  return `${jod.toFixed(2)} د.أ`;
};

export const formatJODNum = (fils: number): string => (fils / JOD_TO_FILS).toFixed(2);
