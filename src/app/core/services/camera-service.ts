import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, GalleryPhoto, Photo } from '@capacitor/camera';
import { max } from 'rxjs';
import { Foto } from '../models/foto';


@Injectable({
  providedIn: 'root',
})
export class CameraService {

  //-- Metodos para captura de imagens a partir da camera --//
  public isMobile = (): boolean => /android|iphone|ipad|ipod/i.test(navigator.userAgent);
  
  //-- verifica o tamanho da imagem convertida em base64
  private base64Size = (base64: string): number => (base64.length * 3) / 4 - (base64.match(/=/g) || []).length;

  //-- Metodo para compressao da imagem
  private compressBase64 = async (base64: string): Promise<string> => {

    //-- cria uma nova imagem
    const img = new Image();
    img.src = `data:image/jpeg;base64,${base64}`;

    //-- aguarda o carregamento da imagem
    await new Promise(res => img.onload = res);

    //-- cria um canvas para compressao da imagem
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    //-- recupera as dimensoes originais da imagem
    let width = img.width;
    let height = img.height;

    //-- tamanho maxino que a nova imagem deve ter
    const maxSize = 1280;

    //-- calcula as novas medidas da imagem em formato paisagem até o limite
    if(width > height && width > maxSize){
      height *= maxSize / width;
      width = maxSize;

    //-- calcula as novas medidas da imagem em formato retrato até o limite
    }else if(height > maxSize) {
      width *= maxSize / height;
      height = maxSize;
    }

    //-- aplicamos as novas medidas da imagem
    canvas.width = width;
    canvas.height = height;

    //-- executa o redezenho da imagem
    ctx.drawImage(img, 0, 0, width, height);

    let quality = 0.8;
    let compressed = canvas.toDataURL('image/jpeg', quality);

    while(this.base64Size(compressed) > 1_000_000 && quality > 0.3) {
      quality -= 0.1;
      compressed = canvas.toDataURL('image/jpeg', quality);
    }

    return compressed.split(',')[1];
  }

  public takeFoto = async (): Promise<string | null> => {

    if(!this.isMobile()) return null;

    //-- documentacao: https://capacitorjs.com/docs/apis/camera
    const foto = await Camera.getPhoto({
      quality: 70,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      saveToGallery: true
    });

    if(!foto.base64String) return null;

    return await this.compressBase64(foto.base64String);

  };

  //-- metodos para captura de imagens a partir da galeria --//
  private blobToBase64 = (blob: Blob): Promise<string> => new Promise((res, _) => {
    const reader = new FileReader();
    reader.onloadend = () => res((reader.result as string).split(',')[1]);
    reader.readAsDataURL(blob);
  });

  private photoToBase64 = async (foto: Photo | GalleryPhoto): Promise<string | null> => {
    
    if('base64String' in foto && foto.base64String) return foto.base64String;

    if(foto.webPath) {
      const resp = await fetch(foto.webPath);
      const blob = await resp.blob();
      return await this.blobToBase64(blob);
    }

    return null;
  } 

  public pickFromGallery = async (): Promise<string[]> => {

    const select = await Camera.pickImages({quality: 70, limit: 0});
    const result: string[] = [];
    const fotos = select.photos;

    for(const f of fotos) {
      
      const base64 = await this.photoToBase64(f);
      
      if(base64){
        result.push(await this.compressBase64(base64));
      }

    }

    return result;
  } 
  
}
