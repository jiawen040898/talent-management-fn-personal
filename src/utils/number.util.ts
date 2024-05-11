const DECIMAL_PLACES = 7;

export const numberUtil = {
    parseDecimal: (inputValue: number): number => {
        return +parseFloat(`${inputValue}`).toFixed(DECIMAL_PLACES);
    },
};
