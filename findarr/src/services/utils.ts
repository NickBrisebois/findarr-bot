import { Observable } from 'rxjs';

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
}

export function numberToEmojiNumber(num: number): string {
	const emojiMapping = {
		1: '1️⃣',
		2: '2️⃣',
		3: '3️⃣',
		4: '4️⃣',
		5: '5️⃣',
		6: '6️⃣',
		7: '7️⃣',
		8: '8️⃣',
		9: '9️⃣',
	};
	return emojiMapping[num];
}
