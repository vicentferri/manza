import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from '../../environments/environment';
import { User } from '../models/User';
import { map, tap } from "rxjs/operators";

@Injectable()
export class UserService {

    private host_ip = "192.168.10.99";
    private urlServer = "https://" + this.host_ip + "/haru_server";

    constructor(private http: HttpClient) {
        this.host_ip = environment.host_ip;
        this.urlServer = "https://" + this.host_ip + "/haru_server";
    }

    getAll() {
        return this.http.get('/api/users', this.jwt()).pipe(map((response: any) => response));
    }

    getById(id: number) {
        return this.http.get('/api/users/' + id, this.jwt()).pipe(map((response: any) => response));
    }

    create(user: User) {
        return this.http.post('/api/users', user, this.jwt()).pipe(map((response: any) => response));
    }

    update(user: User) {
        return this.http.put('/api/users/' + user.id, user, this.jwt()).pipe(map((response: any) => response));
    }

    delete(id: number) {
        return this.http.delete('/api/users/' + id, this.jwt()).pipe(map((response: any) => response));
    }

    private jwt() {
        let currentUser = JSON.parse(localStorage.getItem('currentuser') || '{}');
        if (currentUser && currentUser.token) {
            const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + currentUser.token });
            return { headers: headers };
        }
        return {};
    }
}
