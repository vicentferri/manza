import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map, tap } from "rxjs/operators";
//import { Observable } from 'rxjs/Observable';


@Injectable()
export class UploadService {

    public url: string = "";

    constructor(private http: HttpClient) {
    }

    makeFileRequest(url: string, params: Array<string>, files: Array<File>, token: string, name: string, fields?: { [key: string]: any }) {

        return new Promise(function (resolve, reject) {

            const formData: any = new FormData();
            const xhr = new XMLHttpRequest();

            for (let i = 0; i < files.length; i++) {
                formData.append(name, files[i], files[i].name);
            }

            if (fields) {
                Object.keys(fields).forEach(key => {
                    if (fields[key] !== null && fields[key] !== undefined) {
                        formData.append(key, fields[key]);
                    }
                });
            }

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            resolve(JSON.parse(xhr.response));
                        } catch (e) {
                            reject('Respuesta inesperada del servidor (no es JSON)');
                        }
                    } else {
                        reject(xhr.response);
                    }
                }
            };

            xhr.open('POST', url, true);
            xhr.setRequestHeader('Authorization', token);
            xhr.send(formData);
        });
    }
}

