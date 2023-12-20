import crypto from "crypto";

const FOUR_DIGITS_OTP_LENGTH = 4;

// TODO: подумать над слиянием в единую функцию generateDynamicOtp
/**
 * Функция для генерации случайного четырехзначного числа
 * @description Находит случайное число из массива 16-битных случайных чисел без знака с длиной 4. Если в итерации такого числа не найдено, функция выполняется далее рекурсивно
 */
export const generateFourDigitsOtp = () => {
  const array = new Uint16Array(20);
  // eslint-disable-next-line no-undef
  crypto.randomFillSync(array);
  for (let i = 0; i < array.length; i++) {
    const randomInt = array[i];
    const intLength = Math.floor(Math.log10(randomInt)) + 1;
    if (intLength === FOUR_DIGITS_OTP_LENGTH) {
      return randomInt;
    }
  }

  return generateFourDigitsOtp();
};
