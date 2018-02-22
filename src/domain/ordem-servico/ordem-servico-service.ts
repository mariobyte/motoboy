import { Http } from '@angular/http';
import { OrdemServico } from "./ordem-servico";
import { Injectable } from '@angular/core';
import { Servico } from '../servico/servico';
import { StatusServico } from '../servico/status-servico';
import { OrdemServicoDao } from './ordem-servico-dao';
import { ServicoDao } from '../servico/servico-dao';

@Injectable()
export class OrdemServicoService {

    constructor(
        private _http: Http,
        private _daoOS: OrdemServicoDao,
        private servicoDao: ServicoDao
    ) {

    }

    listar(usuarioId: number) {
        return this._http.get(`http://cortex-sc-dsv.dyndns.org/scriptcase/app/MotoBoy/wsordemservico/wsordemservico.php?usuario=${usuarioId}`)
            .map(res => res.json())
            .toPromise()
            .then(retorno => {
                // resgatando os
                let ordemServicos: Array<OrdemServico> = [];
                retorno.ordem_servico.forEach((os) => {
                    let ordemServico = new OrdemServico(
                        os.id_os,
                        os.os_nome_cliente,
                        os.os_data,
                        os.os_hora,
                        // servicos,
                        os.os_status,
                        os.os_valor_frete,
                        os.os_km,
                        os.os_data_agendada,
                        os.os_hora_agendada,
                        os.os_solicitante_cliente
                    );
                    ordemServicos.push(ordemServico);
                });
                this._daoOS.salvarVarios(ordemServicos);

                retorno.servicos.forEach((s) => {

                    let servico = new Servico(
                        s.id_os,
                        s.id_item,
                        s.item_endereco_origem,
                        s.item_servico_origem,
                        s.item_endereco_destino,
                        s.item_servico_destino,
                        s.item_assinatura,
                        s.item_status
                    );
                    // registrando o serviço no banco
                    this.servicoDao.salvar(servico);
                });

                // exibindo a notificação
                if (ordemServicos.length > 0) {
                    let data = new Date();
                    data.setSeconds(data.getSeconds() + 5);
                    // this.localNotifications.schedule({
                    //     id: 1,
                    //     text: ordemServicos.length + ' novas O.S. estão disponiveis',
                    //     title: 'Novas ordens de serviço',
                    //     data: data,
                    //     at: data,
                    //     sound: 'file://beep.caf',
                    //     icon: 'assets/icon/favicon.ico',
                    //     priority: 4
                    // });
                } else {
                    // cancelando as notificações que tiver no app
                    // this.localNotifications.cancelAll();
                }


                return ordemServicos;

            })
    }

    validarStatus(usuarioId: number, osId: number) {
        return this._http.get(`http://cortex-sc-dsv.dyndns.org/scriptcase/app/MotoBoy/wsstatusos/wsstatusos.php?usuario=${usuarioId}&ordem=${osId}`)
            .map(res => res.json())
            .toPromise()
            .then(retorno => {
                return retorno.status_os[0];
            })
    }
    // verificando se todos os serviços foram finalizados
    validarServicos(os_id: Number) {
        let terminado: boolean = true;

        this.servicoDao.listarPorOrdemServico(os_id).then((servicos: Array<Servico>) => {
            servicos.forEach(servico => {
                if (servico.status == StatusServico.LIVRE || servico.status == StatusServico.EXECUTANDO) {
                    // existem servicos nao exacutados ou livres, não permitir finalizar a OS
                    terminado = false;
                }
            });
            return terminado;
        }).catch(err => {
            console.log(err);
            return terminado;
        })
    }

    pegarOrdemServico(idMotoboy: number, os: OrdemServico) {
        return this.alterarOs(idMotoboy, os, 1);
    }

    finalizarOs(idMotoboy: number, os: OrdemServico) {
        return this.alterarOs(idMotoboy, os, 2);
    }
    alterarOs(idMotoboy: number, os: OrdemServico, inicio: number) {
        let data = new Date().getTime();
        let url = `http://cortex-sc-dsv.dyndns.org/scriptcase/app/MotoBoy/wscheckin/wscheckin.php?IdUsuario=${idMotoboy}&idOs=${os.id_os}&data=${data}&inicio=${inicio}`;
        return this._http.post(url, {})
            .toPromise()
            .then(response => {
                console.log(response);
                if (response.status == 200) {
                    if (inicio == 1) {
                        os.os_status = StatusServico.EXECUTANDO;
                    } else if (inicio == 2) {
                        os.os_status = StatusServico.FINALIZADO;
                    }
                    this._daoOS.salvar(os);
                    return true;
                } else {
                    return false;
                }
            })
    }
}