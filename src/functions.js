import axios from 'axios';
import { API } from './constants';

export const getAppointments = async () => {
  const response = await axios.get(API);
  if(response.status === 200){
    return response.data;
  };
};