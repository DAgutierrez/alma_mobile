import axios from 'axios';
import {salesUrl} from './uris';

class SalesService {
	
	create(sale) {
        const uri = salesUrl;
        console.log(uri)
        console.log(sale)
        return axios.post(uri, sale);
    }
}
export const salesService = new SalesService();
