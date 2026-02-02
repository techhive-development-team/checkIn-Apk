import { client } from './client';
import { API_URLS, baseURL } from '../enums/urls';

const createAttendance = (data: {
  checkInLocation?: string;
  checkOutLocation?: string;
  image?: string;
}) =>
  client.exec(API_URLS.ATTENDANCE, {
    method: 'POST',
    data,
  });

  const getStatus = () =>
  client.exec(`${API_URLS.ATTENDANCE}/status`, {
    method: 'GET',
    baseURL
  });

export const attendanceRepository = {
  createAttendance,
  getStatus,
};
