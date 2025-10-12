import moment from 'moment';

export const formatDate = (date: Date | string): string => {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

export const isOlderThanDays = (date: Date | string, days: number): boolean => {
  return moment().diff(moment(date), 'days') > days;
};