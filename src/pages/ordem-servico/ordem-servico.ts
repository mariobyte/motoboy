import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, LoadingController, ModalController } from 'ionic-angular';
import { OrdemServico } from '../../domain/ordem-servico/ordem-servico';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { Servico } from '../../domain/servico/servico';
import { OrdemServicoService } from '../../domain/ordem-servico/ordem-servico-service';
import { UsuarioDao } from '../../domain/usuario/usuario-dao';
import { Usuario } from '../../domain/usuario/usuario';
import { LoginPage } from '../login/login';
import { GeolocationService } from '../../domain/geolocation/geolocation-service';
import { StatusServico } from '../../domain/servico/status-servico';
import { StatusMovimentacao } from '../../domain/servico/status-movimentacao';
import { ServicoService } from '../../domain/servico/serico-service';
import { SignaturePage } from '../signature/signature';
import { ServicoDao } from '../../domain/servico/servico-dao';
import { HomePage } from '../..//pages/home/home';

/**
 * Generated class for the OrdemservicoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-ordemservico',
  templateUrl: 'ordem-servico.html',
})
export class OrdemservicoPage implements OnInit {

  public os: OrdemServico;
  public servicos: Array<Servico>;

  private usuario: Usuario;
  private editar = false;

  public signatureImage: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private _loaderCrtl: LoadingController,
    private _alertCrtl: AlertController,
    private _service: OrdemServicoService,
    private _servicoService: ServicoService,
    private usuarioDao: UsuarioDao,
    private _geolocationService: GeolocationService,
    private servicoDao: ServicoDao,
    public modalController: ModalController
  ) {

    this.os = this.navParams.get('os');
    this.editar = this.navParams.get('editar');
    this.signatureImage = navParams.get('signatureImage');;
  }

  ngOnInit(): void {
    let loader = this._loaderCrtl.create({
      content: 'Carregando dados da OS...',
    });
    loader.present()
      .then(() => {
        this.servicoDao.listarPorOrdemServico(Number(this.os.id_os)).then(servicos => this.servicos = servicos);

        if (this.editar) {
          this.usuarioDao.carregar()
            .then(usuario => {
              // resgatou o id do motoboy
              this.usuario = usuario;
              // validando status da os selecionada
              this._service.validarStatus(this.usuario.id, Number(this.os.id_os))
                .then(os => {
                  if (os.os_status != 1 && os.id_transportador != this.usuario.id) {
                    // os não livre
                    loader.dismiss();
                    this._alertCrtl.create({
                      title: 'OS indisponível!',
                      subTitle: 'A OS selecionada não se encontra disponível',
                      buttons: [{ text: 'Ok' }]
                    }).present()
                      .then(() => {
                        // os nao esta disponivel
                        this.editar = false;
                        this.navCtrl.setRoot(HomePage);
                      })
                  } else {
                    loader.dismiss();
                  }
                })
                // erro ao validar o status da os
                .catch(err => {
                  console.log(err);
                  this._alertCrtl.create({
                    title: 'Alerta!',
                    subTitle: 'Não foi possível validar a OS',
                    buttons: [{ text: 'Lista de OS' }]
                  }).present()
                    .then(() => {
                      loader.dismiss();
                      // não achou o usuario no banco local, voltando para tela de login
                      this.navCtrl.popToRoot();
                    })
                })
            })
            // erro ao pegar o usuario no banco
            .catch(err => {
              loader.dismiss();
              console.log(err);
              this._alertCrtl.create({
                title: 'Alerta!',
                subTitle: 'Não foi identificado o usuário no banco local',
                buttons: [{ text: 'Efetuar Login' }]
              }).present()
                .then(() => {
                  loader.dismiss();
                  // não achou o usuario no banco local, voltando para tela de login
                  this.navCtrl.setRoot(LoginPage);
                })

            })
        } else {
          loader.dismiss();
        }
      }).catch(err => {
        loader.dismiss()
        alert(err);
      })
  }

  efetuarCheckin(servico: Servico) {
    return this.efetuarCheck(servico, StatusMovimentacao.CHECKIN);
  }
  efetuarCheckout(servico: Servico) {
    return this.efetuarCheck(servico, StatusMovimentacao.CHECKOUT);
  }
  efetuarCheck(servico: Servico, checkin: StatusMovimentacao) {
    let loader;
    if (checkin == StatusMovimentacao.CHECKIN) {
      loader = this._loaderCrtl.create({
        content: 'Efetuando check-in...',
      });
    } else {
      loader = this._loaderCrtl.create({
        content: 'Efetuando check-out...',
      });
    }
    loader.present().then(() => {
      this._geolocationService.getCoordenadas().then((resp: Position) => {
        servico.latitude = resp.coords.latitude;
        servico.longitude = resp.coords.longitude;
        let alert;
        if (checkin == StatusMovimentacao.CHECKIN) {
          servico.timestampCheckin = new Date().getTime();
          servico.status = StatusServico.EXECUTANDO;
          alert = this._alertCrtl.create({
            title: 'Registrado!',
            subTitle: 'Check-in realizado!',
            buttons: [{ text: 'Ok' }]
          });
        } else {
          servico.timestampCheckout = new Date().getTime();
          servico.status = StatusServico.FINALIZADO;
          alert = this._alertCrtl.create({
            title: 'Registrado!',
            subTitle: 'Check-out realizado!',
            buttons: [{ text: 'Ok' }]
          });
        }
        // enviar ao webserices e salvar no banco
        this._servicoService.registrarServico(servico, this.usuario.id, checkin).then(() => {
          loader.dismiss();
          alert.present()
        })
          .catch(err => {
            loader.dismiss();
            console.log(err);
            this._alertCrtl.create({
              title: 'Falha na conexão',
              subTitle: 'Não foi possível conectar ao servidor',
              buttons: [{ text: 'Ok' }]
            }).present();
          })

      }).catch((error) => {
        loader.dismiss();
        console.log(error);
        this._alertCrtl.create({
          title: 'Não foi possível obter a localização',
          subTitle: 'Verifique se o GPS está ativado',
          buttons: [{ text: 'Ok' }]
        }).present();
      });
    })

  }

  finalizarOs(os: OrdemServico) {

    if (!this._service.validarServicos(Number(os.id_os))) {
      this._alertCrtl.create({
        title: 'Serviços em aberto',
        subTitle: 'Existem serviços ainda não realizados',
        buttons: [{ text: 'Entendido!' }]
      }).present();
      return;
    }

    let loader = this._loaderCrtl.create({
      content: 'Processando...'
    });
    loader.present().then(() => {

      // finalizando a OS
      if (this._service.finalizarOs(this.usuario.id, os)) {
        loader.dismiss();
        // os finalizada
        this._alertCrtl.create({
          title: 'Operação realizada !',
          subTitle: 'O.S. Finalizada !',
          buttons: [{ text: 'Ok' }]
        }).present();
      } else {
        // nao os finalizada
        this._alertCrtl.create({
          title: 'Operação não realizada !',
          subTitle: 'Não foi possível finalizar a O.S.',
          buttons: [{ text: 'Ok' }]
        }).present();
      }
      // voltando para a tela de listagem
      this.navCtrl.pop();
    })

  }

  openSignatureModel(servico: Servico) {
    setTimeout(() => {
      let modal = this.modalController.create(SignaturePage, { 'os': this.os, 'servico': servico });
      modal.present();
    }, 300);

  }
}
