import api from './api';
import { Exercise } from '../types';

export const catalogService = {
  getExercises: async () => {
    const response = await api.get('/exercises');
    return response.data as Exercise[];
  },
};
