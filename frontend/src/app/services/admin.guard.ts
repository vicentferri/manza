import { Injectable } from '@angular/core';
import { HaruService } from './haru.service';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class AdminGuard implements CanActivate {


	constructor(private router: Router, private service: HaruService) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

		if (localStorage.getItem('currentUser')) {

			const user = localStorage.getItem('currentUser');
			if (!user) {
				this.router.navigate(['/pages/login']);
				return false;
			}
			const juser = JSON.parse(user);
			const token = juser.token;

			this.service.HTTP_Post('/role_get', '').subscribe(
				data => {
					if (data.role == 1) {
						return true;
					} else {
						this.router.navigate(['/pages/verboten']);
						return false;
					}
				},
				error => {
					console.log(error);
					return false;
				}
			);
		}
		else {
			this.router.navigate(['/pages/login']);
			return false;
		}

		return false;
	}

}