import { Component, Input } from '@angular/core';

@Component({
  selector: 'loading-animation',
  imports: [],
  template: `
    <div class="flex flex-col items-center my-3">
      <span class="loader"></span>
      <p class="mt-5 text-gray-500 font-bold text-base">{{message}}</p>
    </div>
  `,
})
export class LoadingAnimation {

  @Input() message: string = 'Carregando recurso...'

}
