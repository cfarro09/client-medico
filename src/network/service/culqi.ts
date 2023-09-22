import { apiUrls } from '../../common/constants';
import { APIManager } from '../manager';

export function charge(request: unknown) {
    const uri = `${apiUrls.CULQI}/charge`;
    return APIManager.post(uri, { data: request }, true);
}
export function subscribe(request: unknown) {
    const uri = `${apiUrls.CULQI}/subscribe`;
    return APIManager.post(uri, { data: request }, true);
}
export function unsubscribe(request: unknown) {
    const uri = `${apiUrls.CULQI}/unsubscribe`;
    return APIManager.post(uri, { data: request }, true);
}
