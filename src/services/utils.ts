import { Observable } from "rxjs";

// turns a superagent request into an rxjs observable
export function observify(req): Observable<any> {
	return Observable.create((o) => {
		req.end((err, res) => {
			if (err) {
				o.error(err);
			} else {
				o.next(res);
			}

			o.complete();
		});
	});
};