import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Usuario } from './usuario';

@Injectable()
export class UsuarioDao {
    constructor(private _storage: Storage) {

    }

    private usuarioKey: string = 'USUARIO_KEY';

    salvar(usuario: Usuario) {
        this._storage.set(this.usuarioKey, usuario);
    }

    carregar() {
        return this._storage.get(this.usuarioKey)
            .then((usuario: Usuario) => {
                return usuario;
            })
    }
}