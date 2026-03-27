import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'message-invalid-field',
  imports: [
    CommonModule,
    MessageModule
  ],
  template: `
    <p-message
    *ngIf="
      (formField?.invalid && (formField?.touched || formField?.dirty)) ||
      conditionToShow
    "
    severity="error"
    variant="simple"
    size="small"
    styleClass="mt-1 float-right">
      {{getErrorMessage}}
    </p-message>
  `
})
export class MessageInvalidField {

  @Input() formField!: AbstractControl<any> | null;
  @Input() conditionToShow!: boolean;

  @Input() customText: string | null = null;

  protected get getErrorMessage(): string | null {
    if (this.customText) {
      return this.customText;
    }

    if (
      (this.formField !== null && this.formField.errors?.['required']) ||
      this.conditionToShow
    ) {
      return 'Campo Obrigatório!';
    }
    else if (this.formField !== null && this.formField.errors?.['minlength']) {
      return `Mínimo de caracteres é ${this.formField.errors?.['minlength'].requiredLength}!`;
    }
    else if (this.formField !== null && this.formField.errors?.['maxlength']) {
      return `Máximo de caracteres é ${this.formField.errors?.['maxlength'].requiredLength}!`;
    }

    return null;
  }

}

