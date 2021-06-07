import { createState } from '@hookstate/core';

export const authToken = createState(window.localStorage.getItem('authToken'));
