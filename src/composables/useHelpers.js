import moment from 'moment';
import { ability } from '@/plugins/ability';

export const useHelpers = () => {
    function formatDate(date, format = 'dd-mm-yy') {
        if (date === 'Invalid date' || !date) return '-';
        const momentFormat =
            format === 'dd-mm-yy' ? 'DD-MM-YYYY' : 'MM/DD/YYYY';
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

    function filterByPermission(items) {
        return items.filter((item) => {
            if (!item.permission) return true;
            return ability.can(item.permission);
        });
    }

    return {
        formatDate,
        moneyFormat,
        filterByPermission
    };
};
