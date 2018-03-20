import { Servico } from "./servico";
import { Http } from '@angular/http';
import { Injectable } from "@angular/core";
import { StatusMovimentacao } from "./status-movimentacao";
import { ServicoDao } from "./servico-dao";

@Injectable()
export class ServicoService {

    constructor(
        private _http: Http,
        private servicoDao: ServicoDao
    ) {

    }

    // Coloquei lá , agora o wscheckin ficou estes parametros
    // $IdUsuario = 
    // $idOs = 
    // $iditem = 
    // $checkin = [checkin]; // 1 - Entrada 2 - Saida
    // $latitude = 
    // $longitude = 
    // $data = 
    // $hora = 
    // $inicio = ; // 1 - Inicio/aquisição da OS

    registrarServico(servico: Servico, idMotoboy: number, checkin: StatusMovimentacao) { // 1 - Entrada 2 - Saida
        // enviar ao servidor
        let data = (checkin == StatusMovimentacao.CHECKIN) ? servico.timestampCheckin : servico.timestampCheckout;
        //let url = `http://cortex-sc-dsv.dyndns.org/scriptcase/app/MotoBoy/wscheckin/wscheckin.php?IdUsuario=${idMotoboy}&idOs=${servico.id_os}&iditem=${servico.id_item}&checkin=${checkin}&data=${data}&latitude=${servico.latitude}&longitude=${servico.longitude}`;
        let url = `http://cortex-sc-dsv.dyndns.org/scriptcase/app/MotoBoy/wscheckin/wscheckin.php?IdUsuario=${idMotoboy}&idOs=${servico.id_os}&iditem=${servico.id_item}&checkin=${checkin}&data=${data}&latitude=${servico.latitude}&longitude=${servico.longitude}&assinatura=${servico.assinatura}`;

        return this._http.post(url, {})
            // .map(res => res.json())
            .toPromise()
            .then(response => {
                console.log(response);
                if (response.status == 200) {
                    servico.avisado = true;
                    this.servicoDao.salvar(servico);
                    return true;
                } else {
                    // salvar como não avisado
                    servico.avisado = false;
                    this.servicoDao.salvar(servico);
                    return false;
                }
            }).catch(err => {
                // salvar como não avisado
                servico.avisado = false;
                this.servicoDao.salvar(servico);
            })
    }
}