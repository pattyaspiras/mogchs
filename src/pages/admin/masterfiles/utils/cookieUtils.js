import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

const COOKIE_KEY = "mogchs_user";
const SECRET_KEY = "mogchs_secret_key";

export function getUserIdFromCookie() {
	try {
		const encrypted = Cookies.get(COOKIE_KEY);
		if (encrypted) {
			const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
			const user = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
			return user?.id || null;
		}
	} catch (error) {
		console.error("Error decrypting cookie:", error);
	}
	return null;
}

export function getUserFromCookie() {
	try {
		const encrypted = Cookies.get(COOKIE_KEY);
		if (encrypted) {
			const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
			return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
		}
	} catch (error) {
		console.error("Error decrypting cookie:", error);
	}
	return null;
}
