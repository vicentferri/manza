import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TranslationService {
    private translations: any = {};
    private currentLang = '';
    private langChange = new BehaviorSubject<string>('es');

    // Observable para escuchar cambios de idioma
    public langChange$ = this.langChange.asObservable();

    constructor(private http: HttpClient) {
        this.loadSavedLanguage();
    }

    // Cargar idioma guardado
    private loadSavedLanguage(): void {
        const savedLang = localStorage.getItem('currentLanguage') || 'es';
        this.setLanguage(savedLang);
    }

    // Establecer idioma
    setLanguage(lang: string): void {
        this.currentLang = lang;
        this.loadTranslations(lang).subscribe(() => {
            this.langChange.next(lang);
            localStorage.setItem('currentLanguage', lang);
        });
    }

    // Cargar traducciones desde archivo
    private loadTranslations(lang: string): Observable<any> {
        const url = `${environment.assetsBase}/assets/i18n/${lang}.json`;
        //let url = "/customers/assets/i18n/" + lang + ".json";
        //let url = "/assets/i18n/" + lang + ".json";
        return this.http.get(url).pipe(
            tap(translations => {
                this.translations = translations;
                // Cache en localStorage
                localStorage.setItem(`translations_${lang}`, JSON.stringify(translations));
            }),
            catchError(() => {
                // Fallback a cache local
                const cached = localStorage.getItem(`translations_${lang}`);
                if (cached) {
                    this.translations = JSON.parse(cached);
                }
                return [];
            })
        );
    }

    // Cargar traducciones desde API/BD
    private loadTranslationsFromAPI(lang: string): Observable<any> {
        return this.http.get(`/api/translations/${lang}`).pipe(
            map((response: any) => {
                // Transformar respuesta de API
                const translations = {};
                if (Array.isArray(response)) {
                    response.forEach(item => {
                        translations[item.key] = item.value;
                    });
                } else {
                    return response;
                }
                return translations;
            }),
            tap(translations => {
                this.translations = translations;
                localStorage.setItem(`translations_${lang}`, JSON.stringify(translations));
            }),
            catchError(() => this.loadTranslations(lang)) // Fallback a archivos
        );
    }

    // Obtener traducción
    get(key: string, params?: any): string {
        let translation = this.getNestedValue(this.translations, key) || key;

        // Reemplazar parámetros
        if (params) {
            Object.keys(params).forEach(param => {
                translation = translation.replace(`{{${param}}}`, params[param]);
            });
        }

        return translation;
    }

    // Obtener traducción asíncrona
    getAsync(key: string, params?: any): Observable<string> {
        return new Observable(observer => {
            observer.next(this.get(key, params));
            observer.complete();
        });
    }

    // Obtener valor anidado del objeto
    private getNestedValue(obj: any, key: string): string {
        return key.split('.').reduce((o, k) => (o || {})[k], obj);
    }

    // Obtener idioma actual
    getCurrentLanguage(): string {
        return this.currentLang;
    }

    // Obtener idiomas disponibles
    getAvailableLanguages(): string[] {
        return ['es', 'en', 'fr']; // Configurable
    }
}