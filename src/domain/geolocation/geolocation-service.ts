import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';

@Injectable()
export class GeolocationService {

    constructor(
        // private _geolocation: Geolocation,
        private _http: Http,
        private geolocation: Geolocation
    ) {

    }

    getCoordenadas() {
        return this.geolocation.getCurrentPosition()
            .then((position: Geoposition) => { return position })
    }

    enviarCoordenadas(motoboy: number, posicao: Position) {
        // return this._http.post(`http://cortex-sc-dsv.dyndns.org/scriptcase/app/MotoBoy/wslocalizacao/wslocalizacao.php?usuario=${motoboy}&latitude=${posicao.coords.latitude}&longitude=${posicao.coords.longitude}`, {}).toPromise();
        // return this._http.post(`http://192.168.100.130:3000/rastreamento?usuario=${motoboy}&latitude=${posicao.coords.latitude}&longitude=${posicao.coords.longitude}`, {}).toPromise();
        return this._http.post('http://192.168.100.130:3000/loc',
            {
                usuario: motoboy,
                latitude: posicao.coords.latitude,
                longitude: posicao.coords.longitude
            }).toPromise();
    }
}