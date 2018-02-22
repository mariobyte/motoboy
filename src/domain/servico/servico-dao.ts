import { Storage } from "@ionic/storage/dist/storage";
import { Servico } from "./servico";
import { Injectable } from "@angular/core";

@Injectable()
export class ServicoDao {

    private PREFIX: string = 'service_';

    constructor(
        private _storage: Storage
    ) {

    }

    salvar(servico: Servico) {
        this._storage.set(this.PREFIX + servico.id_item, servico);
    }

    listar(id: number) {
        return this._storage.get(this.PREFIX + id)
            .then((servico: Servico) => {
                return servico;
            })
    }

    listarPorOrdemServico(idOs: Number) {
        let servicos: Array<Servico> = [];
        return this._storage.forEach((servico: Servico) => {
            if (servico.id_os == (idOs + '')) {
                // mesma ordem de serico
                servicos.push(servico);
            }
        })
            .then(() => servicos);
    }
}