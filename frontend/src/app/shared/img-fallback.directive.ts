import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { PLACEHOLDER_IMG } from '../core/config';

/** Remplace une image cassée par un placeholder. */
@Directive({ selector: 'img[appImgFallback]' })
export class ImgFallbackDirective {
  private el = inject<ElementRef<HTMLImageElement>>(ElementRef);

  @HostListener('error')
  onError() {
    const img = this.el.nativeElement;
    if (!img.src.endsWith(PLACEHOLDER_IMG)) img.src = PLACEHOLDER_IMG;
  }
}
