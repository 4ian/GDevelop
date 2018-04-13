// @flow
import axios from 'axios';

export const listAllTutorials = (): Promise<any> => {
  return axios
    .get('http://wiki.compilgames.net/doku.php/gdevelop5/tutorials')
    .then(response => response.data);
};
