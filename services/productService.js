import axios from 'axios';
import {productUrl, productUpdateUrl} from './uris';

const http = (headers) => {
	return axios.create({ baseURL: productUrl, headers, timeout: 25000 });
};

class ProductService {
	getAll() {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		};
		const https = http(headers);
        return axios.get(productUrl);
	}
	
	updateIsSold(id) {
		const uri = productUpdateUrl;
        return axios.put(uri + id);
    }
}
export const productService = new ProductService();
