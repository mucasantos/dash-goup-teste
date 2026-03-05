export const regexPatterns = {
  name: /^[a-zA-Z\s]+$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^[0-9]{9,14}$/,
  licensePlate: /^[A-Z]{2}-[0-9]{2}-[A-Z]{2}$/,
  iban: /^[A-Z]{2}[0-9]{23}$/,
  cartaoCidadao: /^[0-9]{8}$/,
  licencaIMT: /^[0-9]{6}$/,
  cartaConducao: /^[A-Z]{2}-[0-9]{6}$/,
};

export const validateYear = (value: string) => {
  const year = parseInt(value, 10);
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear;
};

export const validateDate = (value: string) => {
  const date = new Date(value);
  return !isNaN(date.getTime());
};
