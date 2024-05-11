import moment from 'moment-timezone';

export const dateUtil = {
    getCurrentLocalTimeByTimeZone: (timezone: string): string => {
        return moment().tz(timezone).format('YYYY-MM-DD');
    },
    getListOfTimezoneByTimeRange: (
        startTime: number,
        endTime: number,
    ): string[] => {
        const timezoneList = moment.tz.names().filter((tz) => {
            const time = moment.tz(tz);

            return time.hour() >= startTime && time.hour() < endTime;
        });

        return timezoneList;
    },
    addDays: (amount: number, value: string): string => {
        return moment(value).add(amount, 'days').format('YYYY-MM-DD');
    },

    getDate: (timestamp: string): string => {
        return timestamp.slice(0, 10);
    },
};
