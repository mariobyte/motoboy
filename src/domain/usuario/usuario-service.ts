import { Injectable } from '@angular/core'
import { Http } from '@angular/http';
import { Md5 } from 'ts-md5/dist/md5';
import { UsuarioDao } from './usuario-dao';
import { Usuario } from './usuario';

@Injectable()
export class UsuarioService {
    constructor
        (
        private _http: Http,
        private _dao: UsuarioDao
        ) {

    }

    public efetuarLogin(usuario: Usuario) {
        let senhaMd5: string = Md5.hashStr(usuario.senha).toString();

        return this._http.post(`http://cortex-sc-dsv.dyndns.org/scriptcase/app/MotoBoy/webretornausuario/webretornausuario.php?usuario=${usuario.usuario}&senha=${senhaMd5}`, {})
            .map(res => res.json().usuarios)
            .toPromise()
            .then(ret => {
                if (ret[0].retorno != 0) {
                    // 307425
                    let senhaOld = usuario.senha;
                    usuario.timestamp = new Date().getTime();
                    usuario.id = Number(ret[0].retorno);
                    usuario.senha = senhaMd5;
                    this._dao.salvar(usuario);
                    usuario.senha = senhaOld;
                    return (true);
                } else {
                    // usuario ou senha inválidos
                    return false;
                }
            })

    }
}