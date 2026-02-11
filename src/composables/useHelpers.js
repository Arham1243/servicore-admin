import moment from 'moment';


export const useHelpers = () => {
    function formatDate(date, format = 'dd-mm-yy') {
        if (date === 'Invalid date' || !date) return '-';
        const momentFormat = format === 'dd-mm-yy' ? 'DD-MM-YYYY' : 'MM/DD/YYYY';
        return moment.utc(date).format(momentFormat);
    }

    function moneyFormat(number, showTrailingZeros = true) {
        const currency = 'USD';
        if (isNaN(number)) return '';

        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            minimumFractionDigits: showTrailingZeros ? 2 : 0,
            maximumFractionDigits: 2
        });

        return formatter.format(number);
    }

    return {
        formatDate,
        moneyFormat
    };
};
