import { Subject } from "rxjs";
export default class ErrorService {
    private static instance: ErrorService;

    /*
    * Cette ligne crée une nouvelle instance de Subject qui ne pourra émettre que des chaînes de caractères (string).
    * C'est un "canal de communication" pour les messages d'erreur.
    */
    errorSubject = new Subject<string>();

    private constructor() {}

    /**
     *
     * @returns ErrorService
     */
    static getInstance(): ErrorService {
        if (!ErrorService.instance) {
            ErrorService.instance = new ErrorService();
        }
        return ErrorService.instance;
    }

    /**
     *
     * @param errorMessage
     */
    emitError(errorMessage: string) {
        this.errorSubject.next(errorMessage);
    }

    /**
     * Récupère le sujet en tant qu'observable pour s'y abonner
     * @returns
     */
    getErrorSubject() {
        return this.errorSubject.asObservable();
    }
}
