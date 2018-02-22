import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { OrdemServico } from '../../domain/ordem-servico/ordem-servico';
import { NavParams } from 'ionic-angular/navigation/nav-params';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { Servico } from '../../domain/servico/servico';
import { ServicoDao } from '../../domain/servico/servico-dao';

@Component({
  selector: 'page-signature',
  templateUrl: 'signature.html',
})
export class SignaturePage {

  @ViewChild(SignaturePad) public signaturePad: SignaturePad;

  public os: OrdemServico;
  public servico: Servico;

  public signaturePadOptions = {


  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loaderCtrl: LoadingController,
    private servicoDao: ServicoDao
  ) {
    this.os = this.navParams.get('os');
    this.servico = this.navParams.get('servico');
  }

  canvasResize() {
    let canvas = document.querySelector('canvas');
    this
      .signaturePad
      .set('minWidth', 1);
    console.log(canvas.offsetWidth);
    this
      .signaturePad
      .set('canvasWidth', canvas.offsetWidth);

    this
      .signaturePad
      .set('canvasHeight', canvas.offsetHeight);
  }

  ngAfterViewInit() {
    console.log("Reset Model Screen");
    this.signaturePad.clear();
    this.canvasResize();
  }

  drawCancel() {
    this.navCtrl.pop();
  }

  drawComplete() {
    // registrar a assinatura no banco para ser enviada no checkout
    this.servico.assinatura = this.signaturePad.toDataURL();
    console.log('Registrando assinatura serviço ' + this.servico.id_item);
    this.servicoDao.salvar(this.servico);
    this.navCtrl.pop();
  }

  drawClear() {
    this.signaturePad.clear();
  }
}
