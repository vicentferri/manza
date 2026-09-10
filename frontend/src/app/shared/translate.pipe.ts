import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../services/translation.service';
@Pipe({
  name: 'translate',
  pure: false
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription: Subscription;
  private lastKey: string;
  private lastParams: any;
  private lastValue: string;

  constructor(
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {
    // Suscribirse a cambios de idioma
    this.subscription = this.translationService.langChange$.subscribe(() => {
      this.updateValue();
    });
  }

  transform(key: string, params?: any): string {
    if (!key) return '';

    // Optimización: solo actualizar si cambia la clave o parámetros
    if (key !== this.lastKey || JSON.stringify(params) !== JSON.stringify(this.lastParams)) {
      this.lastKey = key;
      this.lastParams = params;
      this.updateValue();
    }

    return this.lastValue || key;
  }

  private updateValue(): void {
    if (this.lastKey) {
      this.lastValue = this.translationService.get(this.lastKey, this.lastParams);
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}