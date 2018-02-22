import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { OrdemServico } from './ordem-servico';

@Injectable()
export class OrdemServicoDao {

    private PREFIX: string = 'os_';

    constructor(
        private _storage: Storage
    ) {

    }

    salvar(os: OrdemServico) {
        this._storage.set(this.PREFIX + os.id_os, os);
    }
    salvarVarios(oss: Array<OrdemServico>) {
        oss.forEach(os => {
            this._storage.set(this.PREFIX + os.id_os, oss);
        });
    }
    listar() {
        let oss = [];
        return this._storage.forEach((os: OrdemServico) => {
            oss.push(os);
        })
            .then(() => oss);
    }
}