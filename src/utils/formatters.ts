export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
};

/**
 * Formata um valor para exibição no formato de moeda à medida que o usuário digita
 * Os últimos dois dígitos sempre representam os centavos
 * @param value O valor a ser formatado 
 * @returns O valor formatado como string no formato de moeda
 */
export const formatCurrencyInput = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  let inputValue = value.toString().replace(/\D/g, '');
  
  if (inputValue === '') {
    return '';
  }
  
  const numericValue = parseInt(inputValue, 10);
  
  inputValue = numericValue.toString();
  
  while (inputValue.length < 3) {
    inputValue = '0' + inputValue;
  }
  
  const decimalPart = inputValue.slice(-2);
  let integerPart = inputValue.slice(0, -2);
  
  if (integerPart === '') {
    integerPart = '0';
  }
  
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  return integerPart + ',' + decimalPart;
};

/**
 * Converte um valor formatado para string (para armazenamento)
 * @param formattedValue O valor formatado como string
 * @returns O valor como string no formato "0.00"
 */
export const parseCurrencyInput = (formattedValue: string): string => {
  const numericString = formattedValue.replace(/\D/g, "");
  
  if (!numericString) {
    return '';
  }
  
  const value = parseInt(numericString, 10) / 100;
  
  return value.toFixed(2).replace(',', '.');
}; 