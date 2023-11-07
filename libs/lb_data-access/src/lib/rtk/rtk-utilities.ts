import { useSelector } from 'react-redux';

export const useSelectorWrap = (key) => {
  return useSelector((state: any) =>{
    return state[key]});
};
