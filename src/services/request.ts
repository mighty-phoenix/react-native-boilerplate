import ky from 'ky';

const prefixUrl = `${process.env.API_URL ? process.env.API_URL : ''}/`;

export const request = ky.extend({
  headers: {
    Accept: 'application/json',
  },
  prefixUrl,
});
